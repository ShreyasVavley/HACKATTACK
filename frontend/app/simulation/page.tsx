"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Flame,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Sliders
} from "lucide-react";
import { API_BASE } from "../../lib/api";

interface Project {
  id: number;
  name: string;
  required_skills: string[];
  required_experience: number;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  skills: string[];
  current_workload_hours: number;
  max_hours: number;
  utilization_pct: number;
  status: string;
}

interface SimulationResult {
  project_id: number;
  project_name: string;
  added_hours: number;
  current_avg_utilization: number;
  simulated_avg_utilization: number;
  current_burnout_count: number;
  simulated_burnout_count: number;
  burnout_risk_delta: number;
  impact_level: string;
  impact_summary: string;
  employee_deltas: {
    employee_id: number;
    name: string;
    role: string;
    current_hours: number;
    simulated_hours: number;
    current_utilization: number;
    simulated_utilization: number;
    status_shift: string;
  }[];
}

export default function SimulationPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [addedHours, setAddedHours] = useState<number>(15);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([4, 5, 9]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, empRes] = await Promise.all([
          fetch(`${API_BASE}/api/projects`),
          fetch(`${API_BASE}/api/employees`),
        ]);
        if (projRes.ok) setProjects(await projRes.json());
        if (empRes.ok) {
          const emps = await empRes.json();
          setEmployees(emps);
          // Pick top 3 available by default
          const defaultCandidates = emps
            .filter((e: Employee) => e.status === "Available")
            .slice(0, 3)
            .map((e: Employee) => e.id);
          if (defaultCandidates.length > 0) setSelectedCandidateIds(defaultCandidates);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/simulate-capacity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProjectId,
          added_hours_per_week: addedHours,
          candidate_ids: selectedCandidateIds,
        }),
      });
      if (res.ok) {
        setSimulationResult(await res.json());
      }
    } catch (err) {
      console.error("Failed to run simulation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCandidateIds.length > 0) {
      runSimulation();
    }
  }, [selectedProjectId, addedHours, selectedCandidateIds]);

  const toggleCandidate = (id: number) => {
    if (selectedCandidateIds.includes(id)) {
      if (selectedCandidateIds.length > 1) {
        setSelectedCandidateIds(selectedCandidateIds.filter((cid) => cid !== id));
      }
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-scarlet/10 text-scarlet font-bold text-xs shadow-clay-pill mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Feature • Predictive Workforce Planning</span>
          </div>
          <h1 className="text-3xl font-black text-charcoal tracking-tight">
            What-If Capacity & Burnout Simulation
          </h1>
          <p className="text-xs md:text-sm font-medium text-charcoal-muted mt-1">
            Simulate organizational strain, load spikes, and burnout risk thresholds before project deployment.
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading}
          className="clay-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Simulating..." : "Re-Run Scenario"}</span>
        </button>
      </div>

      {/* Simulator Inputs Card */}
      <div className="clay-card p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Project */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              1. Proposed Project Initiative
            </label>
            <div className="clay-inset p-2">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                className="w-full bg-transparent text-xs font-bold text-charcoal focus:outline-none cursor-pointer py-1 px-2"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.required_experience}y+ Exp)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Added Weekly Commitment Slider with Live Delta Feedback */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider">
                2. Simulated Weekly Demand per Specialist
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-scarlet px-2 py-0.5 rounded-md bg-scarlet/10 border border-scarlet/20">
                  +{addedHours}h / wk per dev
                </span>
              </div>
            </div>
            <div className="clay-inset p-3 space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={addedHours}
                  onChange={(e) => setAddedHours(Number(e.target.value))}
                  className="w-full accent-scarlet cursor-pointer"
                />
                <span className="text-xs font-bold text-charcoal-muted shrink-0">30h Max</span>
              </div>

              {/* Real-time Delta Feedback on Sliders */}
              <div className="pt-2 border-t border-charcoal/10 flex flex-wrap items-center justify-between text-[11px] font-bold">
                <span className="text-charcoal-muted">Real-Time Scenario Delta:</span>
                <div className="flex items-center gap-3">
                  <span className="text-charcoal flex items-center gap-1">
                    <span className="text-scarlet font-black">+{addedHours * selectedCandidateIds.length}h</span> total capacity load
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +${(addedHours * selectedCandidateIds.length * 65).toLocaleString()} / wk est. cost
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Selector Multi-Pill Bar */}
        <div className="space-y-2 pt-2 border-t border-charcoal/10">
          <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
            3. Select Target Specialists for Stress Test ({selectedCandidateIds.length} Selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {employees.map((emp) => {
              const isSelected = selectedCandidateIds.includes(emp.id);
              return (
                <button
                  key={emp.id}
                  onClick={() => toggleCandidate(emp.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-scarlet text-white shadow-clay-btn scale-[1.03]"
                      : "bg-white text-charcoal-muted hover:text-charcoal shadow-clay-pill border border-white"
                  }`}
                >
                  <span>{emp.name}</span>
                  <span className="text-[10px] opacity-80">({emp.current_workload_hours}h)</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Predictive Simulation Outcome Cards */}
      {simulationResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Impact Metric 1 */}
            <motion.div whileHover={{ y: -3 }} className="clay-card p-6 border-b-4 border-b-scarlet">
              <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
                Average Capacity Shift
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-charcoal-muted">
                  {simulationResult.current_avg_utilization}%
                </span>
                <ArrowRight className="w-4 h-4 text-scarlet" />
                <span className="text-3xl font-black text-scarlet">
                  {simulationResult.simulated_avg_utilization}%
                </span>
              </div>
              <p className="text-[11px] font-medium text-charcoal-muted mt-2">
                Projected organizational workforce load
              </p>
            </motion.div>

            {/* Impact Metric 2 */}
            <motion.div
              whileHover={{ y: -3 }}
              className={`clay-card p-6 border-b-4 ${
                simulationResult.burnout_risk_delta > 0
                  ? "border-b-rose-500 bg-rose-50/30"
                  : "border-b-emerald-500 bg-emerald-50/30"
              }`}
            >
              <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
                Burnout Escapes / Risk Delta
              </span>
              <div className="text-3xl font-black mt-2">
                {simulationResult.burnout_risk_delta > 0 ? (
                  <span className="text-rose-600 flex items-center gap-1.5">
                    +{simulationResult.burnout_risk_delta} New Burnout Staff
                  </span>
                ) : (
                  <span className="text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" /> 0 New Burnout Risks
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-charcoal-muted mt-2">
                {simulationResult.current_burnout_count} current &rarr; {simulationResult.simulated_burnout_count} simulated
              </p>
            </motion.div>

            {/* Impact Metric 3 */}
            <motion.div whileHover={{ y: -3 }} className="clay-card p-6 border-b-4 border-b-charcoal">
              <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
                Executive Feasibility Index
              </span>
              <div className="text-2xl font-black text-charcoal mt-2">
                {simulationResult.impact_level}
              </div>
              <p className="text-[11px] font-medium text-charcoal-muted mt-2 leading-relaxed">
                {simulationResult.impact_summary}
              </p>
            </motion.div>
          </div>

          {/* Individual Shift Preview Table */}
          <div className="clay-card p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-black text-charcoal flex items-center gap-2">
              <Users className="w-5 h-5 text-scarlet" />
              Simulated Personnel Load Deltas
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="clay-inset text-charcoal-muted font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Specialist</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Current Load</th>
                    <th className="py-3 px-4">Simulated Load</th>
                    <th className="py-3 px-4">Projected Utilization</th>
                    <th className="py-3 px-4">Trajectory Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5 font-medium text-charcoal">
                  {simulationResult.employee_deltas.map((d) => (
                    <tr key={d.employee_id} className="hover:bg-ivory-100/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-charcoal">{d.name}</td>
                      <td className="py-3 px-4 text-charcoal-muted">{d.role}</td>
                      <td className="py-3 px-4 font-semibold">{d.current_hours}h ({d.current_utilization}%)</td>
                      <td className="py-3 px-4 font-bold text-scarlet">{d.simulated_hours}h</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-charcoal/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                d.simulated_utilization > 85 ? "bg-rose-500" : "bg-scarlet"
                              }`}
                              style={{ width: `${Math.min(d.simulated_utilization, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-black text-xs">{d.simulated_utilization}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            d.simulated_utilization > 85
                              ? "bg-rose-100 text-rose-700 font-extrabold"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {d.simulated_utilization > 85 ? "High Burnout Threat" : "Safe Capacity Margin"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
