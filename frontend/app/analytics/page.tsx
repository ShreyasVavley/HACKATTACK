"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  Mail,
  Briefcase,
  Flame,
  Zap,
  Download
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

import { API_BASE } from "../../lib/api";

export default function AnalyticsDirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    async function loadDirectory() {
      try {
        const res = await fetch(`${API_BASE}/api/employees`);
        if (res.ok) setEmployees(await res.json());
      } catch (err) {
        console.error("Failed to load employee directory:", err);
      }
    }
    loadDirectory();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "All" || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = "ID,Name,Email,Role,Experience (Yrs),Workload (Hrs),Capacity (Hrs),Utilization %,Status\n";
    const rows = employees
      .map(
        (e) =>
          `"${e.id}","${e.name}","${e.email}","${e.role}","${e.experience_years}","${e.current_workload_hours}","${e.max_hours}","${e.utilization_pct}%","${e.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "WorkforceIQ_Talent_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-scarlet/10 text-scarlet font-bold text-xs shadow-clay-pill mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Organizational Intelligence</span>
          </div>
          <h1 className="text-3xl font-black text-charcoal tracking-tight">
            Talent Directory & Workforce Analytics
          </h1>
          <p className="text-xs md:text-sm font-medium text-charcoal-muted mt-1">
            Complete inventory of technical competencies, weekly capacity benchmarks, and talent profiles.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="clay-btn-secondary px-5 py-2.5 text-xs font-bold flex items-center gap-2 self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-scarlet" />
          <span>Export Roster CSV</span>
        </button>
      </div>

      {/* Directory Filter & Search */}
      <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="clay-inset p-1.5 px-3 flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-muted" />
          <input
            type="text"
            placeholder="Search candidate by name, role, or technical skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-charcoal-muted uppercase">Status:</span>
          <div className="clay-inset p-1.5 px-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-charcoal focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available (Bench)</option>
              <option value="Partially Allocated">Partially Allocated</option>
              <option value="Busy">Busy (High Load)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Talent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => {
          const isBurnout = emp.utilization_pct > 85;
          const isBench = emp.utilization_pct < 40;

          return (
            <motion.div
              key={emp.id}
              whileHover={{ y: -3 }}
              className="clay-card p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-charcoal">{emp.name}</h3>
                    <p className="text-xs text-charcoal-muted font-medium mt-0.5">{emp.role}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      emp.status === "Available"
                        ? "bg-emerald-100 text-emerald-700"
                        : emp.status === "Partially Allocated"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                {/* Utilization gauge */}
                <div className="mt-4 clay-inset p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal-muted">Weekly Commitment:</span>
                    <span className="font-bold text-charcoal">
                      {emp.current_workload_hours}h / {emp.max_hours}h ({emp.utilization_pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white shadow-clay-inset overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isBurnout
                          ? "bg-rose-500"
                          : isBench
                          ? "bg-emerald-500"
                          : "bg-scarlet"
                      }`}
                      style={{ width: `${Math.min(emp.utilization_pct, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Skills tags with fixed minimum height for card baseline alignment */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-charcoal-muted block">
                    Verified Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1 min-h-[52px] content-start">
                    {emp.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white text-charcoal font-medium shadow-xs border border-charcoal/5 h-fit"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact info footer with mailto icon button and tooltip */}
              <div className="pt-3 border-t border-charcoal/10 flex items-center justify-between text-xs text-charcoal-muted">
                <a
                  href={`mailto:${emp.email}`}
                  className="flex items-center gap-1.5 hover:text-scarlet transition-colors group/mail text-xs font-semibold"
                  title={`Email ${emp.name} (${emp.email})`}
                >
                  <span className="w-6 h-6 rounded-md bg-ivory-200 group-hover/mail:bg-scarlet/10 flex items-center justify-center transition-colors">
                    <Mail className="w-3.5 h-3.5 text-charcoal-muted group-hover/mail:text-scarlet" />
                  </span>
                  <span className="hidden sm:inline-block max-w-[140px] truncate">{emp.email.split('@')[0]}</span>
                </a>
                <span className="font-bold text-charcoal bg-ivory-200 px-2 py-0.5 rounded text-[11px]">
                  {emp.experience_years}y Exp
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
