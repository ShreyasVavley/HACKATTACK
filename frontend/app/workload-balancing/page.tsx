"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  BarChart3,
  Users,
  Zap,
  ArrowRightLeft,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  skills: string[];
  experience_years: number;
  max_hours: number;
  current_workload_hours: number;
  utilization_pct: number;
  status: string;
}

interface WorkloadStats {
  total_employees: number;
  average_utilization: number;
  overloaded_count: number;
  underutilized_count: number;
  optimal_count: number;
  employees: Employee[];
  overloaded_employees: Employee[];
  underutilized_employees: Employee[];
}

interface ReallocationItem {
  from_employee_id: number;
  from_employee_name: string;
  from_employee_role: string;
  from_workload: number;
  from_utilization_pct: number;
  to_employee_id: number;
  to_employee_name: string;
  to_employee_role: string;
  to_workload: number;
  to_utilization_pct: number;
  suggested_hours_to_shift: number;
  shared_skills: string[];
  projected_from_utilization: number;
  projected_to_utilization: number;
  impact_rationale: string;
}

import { API_BASE } from "../../lib/api";

export default function WorkloadBalancingPage() {
  const [stats, setStats] = useState<WorkloadStats | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reallocations, setReallocations] = useState<ReallocationItem[]>([]);
  const [loadingShifts, setLoadingShifts] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [lastShift, setLastShift] = useState<{
    fromId: number;
    toId: number;
    hours: number;
    fromName: string;
    toName: string;
  } | null>(null);

  useEffect(() => {
    fetchWorkloadData();

    // Live WebSocket Sync Listener
    const handleLiveSync = () => {
      fetchWorkloadData();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("workforce_iq_live_sync", handleLiveSync);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("workforce_iq_live_sync", handleLiveSync);
      }
    };
  }, []);

  const fetchWorkloadData = async () => {
    try {
      const [statsRes, empRes] = await Promise.all([
        fetch(`${API_BASE}/api/workload-stats`),
        fetch(`${API_BASE}/api/employees`),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
    } catch (err) {
      console.error("Failed to load workload stats:", err);
    }
  };

  const handleGenerateShifts = async () => {
    setLoadingShifts(true);
    try {
      const res = await fetch(`${API_BASE}/api/reallocate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setReallocations(data);
      }
    } catch (err) {
      console.error("Failed to generate task shifts:", err);
    } finally {
      setLoadingShifts(false);
    }
  };

  const handleExecuteShift = async (item: ReallocationItem) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/apply-shift?from_id=${item.from_employee_id}&to_id=${item.to_employee_id}&hours=${item.suggested_hours_to_shift}`,
        { method: "POST" }
      );
      if (res.ok) {
        setAppliedNotice(
          `✓ Shift executed: Transferred ${item.suggested_hours_to_shift}h from ${item.from_employee_name} to ${item.to_employee_name}.`
        );
        setLastShift({
          fromId: item.from_employee_id,
          toId: item.to_employee_id,
          hours: item.suggested_hours_to_shift,
          fromName: item.from_employee_name,
          toName: item.to_employee_name,
        });
        // Instantly refresh live workload stats and employee hours from SQLite
        await fetchWorkloadData();
        // Recalculate remaining shifts
        await handleGenerateShifts();
      }
    } catch (err) {
      console.error("Failed to execute shift in DB:", err);
    }
  };

  const handleQuickRebalanceStaff = async (overloadedEmp: Employee) => {
    // Find compatible available/bench talent (<50% utilization)
    const excessHours = Math.max(4, Math.round(overloadedEmp.current_workload_hours - (overloadedEmp.max_hours * 0.75)));
    const benchCandidates = employees.filter(
      (e) => e.id !== overloadedEmp.id && e.utilization_pct < 50
    );

    // Score bench candidates by skill overlap
    let target = benchCandidates.find((b) =>
      b.skills.some((s) => overloadedEmp.skills.includes(s))
    );
    if (!target && benchCandidates.length > 0) {
      target = benchCandidates[0];
    }

    if (!target) {
      alert("No available bench talent found to absorb excess workload.");
      return;
    }

    const shiftHours = Math.min(excessHours, Math.max(2, 40 - target.current_workload_hours));

    try {
      const res = await fetch(
        `${API_BASE}/api/apply-shift?from_id=${overloadedEmp.id}&to_id=${target.id}&hours=${shiftHours}`,
        { method: "POST" }
      );
      if (res.ok) {
        setAppliedNotice(
          `✓ Rebalanced! Offloaded ${shiftHours}h from ${overloadedEmp.name} to ${target.name} (${target.role}).`
        );
        setLastShift({
          fromId: overloadedEmp.id,
          toId: target.id,
          hours: shiftHours,
          fromName: overloadedEmp.name,
          toName: target.name,
        });
        await fetchWorkloadData();
        await handleGenerateShifts();
      }
    } catch (err) {
      console.error("Quick rebalance failed:", err);
    }
  };

  const handleUndoShift = async () => {
    if (!lastShift) return;
    try {
      // Reverse the shift: from toId back to fromId
      const res = await fetch(
        `${API_BASE}/api/apply-shift?from_id=${lastShift.toId}&to_id=${lastShift.fromId}&hours=${lastShift.hours}`,
        { method: "POST" }
      );
      if (res.ok) {
        setAppliedNotice(
          `↩ Undone! Returned ${lastShift.hours}h from ${lastShift.toName} back to ${lastShift.fromName}.`
        );
        setLastShift(null);
        await fetchWorkloadData();
        await handleGenerateShifts();
      }
    } catch (err) {
      console.error("Undo failed:", err);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "All" || emp.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Visual Feedback Toast & Undo Banner */}
      <AnimatePresence>
        {appliedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 px-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
              <span>{appliedNotice}</span>
            </div>

            <div className="flex items-center gap-2">
              {lastShift && (
                <button
                  onClick={handleUndoShift}
                  className="px-2.5 py-1 rounded bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[11px] shadow-xs transition-colors cursor-pointer"
                  title="Reverse this workload shift immediately"
                >
                  Undo Shift
                </button>
              )}
              <button
                onClick={() => setAppliedNotice(null)}
                className="text-emerald-700/60 hover:text-emerald-900 text-xs font-black px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-xs shadow-clay-pill mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Scenario B • Workload & Capacity Tracking</span>
          </div>
          <h1 className="text-3xl font-black text-charcoal tracking-tight">
            Workload & Capacity Tracking
          </h1>
          <p className="text-xs md:text-sm font-medium text-charcoal-muted mt-1">
            Monitor team capacity, prevent burnout, and redistribute workload across available talent.
          </p>
        </div>

        <button
          onClick={handleGenerateShifts}
          disabled={loadingShifts}
          className="clay-btn-primary px-6 py-3 text-xs md:text-sm font-bold flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loadingShifts ? "animate-spin" : ""}`} />
          <span>{loadingShifts ? "Calculating Shifts..." : "Generate Shift Proposals"}</span>
        </button>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div whileHover={{ y: -3 }} className="clay-card p-6">
            <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
              Total Workforce
            </span>
            <div className="text-3xl font-black text-charcoal mt-1">
              {stats.total_employees} Active
            </div>
            <p className="text-[11px] font-medium text-charcoal-muted mt-1">Contracted engineers</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="clay-card p-6 border-b-4 border-b-scarlet">
            <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
              Average Load
            </span>
            <div className="text-3xl font-black text-scarlet mt-1">
              {stats.average_utilization}%
            </div>
            <p className="text-[11px] font-medium text-charcoal-muted mt-1">Target range: 65% – 80%</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="clay-card p-6 border-b-4 border-b-rose-500 bg-rose-50/40">
            <span className="text-xs uppercase font-bold text-rose-500 tracking-wider">
              Burnout Risk (&gt;85%)
            </span>
            <div className="text-3xl font-black text-rose-600 mt-1">
              {stats.overloaded_count} Staff
            </div>
            <p className="text-[11px] font-medium text-rose-500/80 mt-1">Immediate offloading suggested</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="clay-card p-6 border-b-4 border-b-emerald-500 bg-emerald-50/40">
            <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
              Bench Resources (&lt;40%)
            </span>
            <div className="text-3xl font-black text-emerald-600 mt-1">
              {stats.underutilized_count} Staff
            </div>
            <p className="text-[11px] font-medium text-emerald-600/80 mt-1">Available for assignment</p>
          </motion.div>
        </div>
      )}

      {/* Reallocation Suggestions Module */}
      {reallocations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay-card p-6 md:p-8 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-charcoal flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-scarlet" />
                Redistribute Workload
              </h2>
              <p className="text-xs font-semibold text-charcoal-muted mt-0.5">
                Matches overloaded engineers with bench specialists with compatible domain skills.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reallocations.map((item, idx) => (
              <div
                key={idx}
                className="clay-inset p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-rose-600 flex items-center gap-1.5 uppercase">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      {item.from_employee_name} ({item.from_utilization_pct}%)
                    </span>
                    <ArrowRight className="w-4 h-4 text-charcoal-muted" />
                    <span className="text-emerald-600 flex items-center gap-1.5 uppercase">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      {item.to_employee_name} ({item.to_utilization_pct}%)
                    </span>
                  </div>

                  <p className="text-xs font-medium text-charcoal mt-3 p-3 rounded-xl bg-white border border-charcoal/5 shadow-xs leading-relaxed">
                    {item.impact_rationale}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="font-bold text-charcoal-muted">Compatible Skill:</span>
                    <span className="text-xs font-bold text-scarlet bg-scarlet/10 px-2.5 py-0.5 rounded-full">
                      {item.shared_skills.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-charcoal/10 flex items-center justify-between">
                  <span className="text-xs font-black text-scarlet">
                    Shift {item.suggested_hours_to_shift}h / Week
                  </span>
                  <button
                    onClick={() => handleExecuteShift(item)}
                    className="clay-btn-primary px-4 py-1.5 text-xs font-bold"
                  >
                    Execute Shift
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Heatmap Individual Utilization Bars */}
      <div className="clay-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-charcoal flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-scarlet" />
              Individual Staff Utilization Breakdown
            </h2>
            <p className="text-xs font-semibold text-charcoal-muted mt-0.5">
              Live weekly commitment vs. 40 hours standard capacity
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="clay-inset p-1 px-3 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-charcoal-muted" />
              <input
                type="text"
                placeholder="Search staff or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs font-semibold text-charcoal focus:outline-none w-40"
              />
            </div>

            <div className="clay-inset p-1 px-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-charcoal focus:outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Cloud">Cloud</option>
                <option value="Data">Data</option>
                <option value="Engineer">Engineer</option>
                <option value="Architect">Architect</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employee Bar List */}
        <div className="space-y-4">
          {filteredEmployees.map((emp) => {
            const isBurnout = emp.utilization_pct > 85;
            const isBench = emp.utilization_pct < 40;

            return (
              <motion.div
                key={emp.id}
                whileHover={{ scale: 1.005 }}
                className="clay-inset p-4.5 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${
                        isBurnout ? "bg-rose-500 shadow-clay-pill" : isBench ? "bg-emerald-500 shadow-clay-pill" : "bg-scarlet shadow-clay-pill"
                      }`}
                    ></span>
                    <div>
                      <span className="font-bold text-sm text-charcoal">{emp.name}</span>
                      <span className="text-xs font-medium text-charcoal-muted ml-2">({emp.role})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="font-bold text-charcoal">
                      {emp.current_workload_hours}h / {emp.max_hours}h weekly
                    </span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                        isBurnout
                          ? "bg-rose-100 text-rose-700"
                          : isBench
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-scarlet/10 text-scarlet"
                      }`}
                    >
                      {emp.utilization_pct}% {isBurnout ? "• Over capacity (>85% allocated)" : isBench ? "• Bench" : "• Optimal"}
                    </span>
                    {isBurnout && (
                      <button
                        onClick={() => handleQuickRebalanceStaff(emp)}
                        className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                        title="Automatically offload excess hours to compatible bench talent"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Rebalance Hours</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Soft Inflated Progress Track */}
                <div className="w-full h-3.5 bg-white/70 rounded-full p-0.5 shadow-clay-inset overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isBurnout
                        ? "bg-gradient-to-r from-amber-500 to-rose-600"
                        : isBench
                        ? "bg-gradient-to-r from-teal-400 to-emerald-500"
                        : "bg-gradient-to-r from-scarlet-light to-scarlet-dark"
                    }`}
                    style={{ width: `${Math.min(emp.utilization_pct, 100)}%` }}
                  ></div>
                </div>

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {emp.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white text-charcoal font-semibold shadow-clay-pill"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
