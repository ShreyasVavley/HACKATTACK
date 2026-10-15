"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  ArrowRightLeft,
  Search,
  BarChart3,
  Layers,
  Zap,
  Clock,
  ShieldAlert,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sliders,
  Check,
  Building,
  Target
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

interface Project {
  id: number;
  name: string;
  description: string;
  required_skills: string[];
  required_experience: number;
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

import { API_BASE } from "../lib/api";

export default function OverviewHubPage() {
  const [stats, setStats] = useState<WorkloadStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadHubData() {
      try {
        const [workRes, projRes] = await Promise.all([
          fetch(`${API_BASE}/api/workload-stats`),
          fetch(`${API_BASE}/api/projects`),
        ]);
        if (workRes.ok) setStats(await workRes.json());
        if (projRes.ok) setProjects(await projRes.json());
      } catch (err) {
        console.error("Failed to load hub data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHubData();
  }, []);

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Hero Claymorphic Banner with Motion */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="clay-card p-8 md:p-10 relative overflow-hidden bg-gradient-to-br from-white via-ivory-card to-ivory-200"
      >
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-scarlet/10 text-scarlet font-bold text-xs shadow-clay-pill border border-scarlet/20">
            <Sparkles className="w-3.5 h-3.5 text-scarlet" />
            <span>Autonomous Intelligence & Talent Optimization</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-charcoal leading-tight">
            Workforce Intelligence Platform
          </h1>

          <p className="text-sm md:text-base font-medium text-charcoal-muted leading-relaxed">
            Eliminate project bottlenecks by intelligently matching high-fit engineers, balancing weekly team workloads, and prescribing automated skill-gap learning journeys.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/team-formation"
              className="clay-btn-primary px-6 py-3 text-xs md:text-sm font-bold flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Launch Team Formation</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/workload-balancing"
              className="clay-btn-secondary px-6 py-3 text-xs md:text-sm font-bold flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Balance Workloads</span>
            </Link>
          </div>
        </div>

        {/* Decorative Floating Clay Shapes */}
        <div className="hidden lg:block absolute -right-6 -bottom-8 w-64 h-64 rounded-full bg-gradient-to-tr from-scarlet/20 to-scarlet-light/10 blur-2xl pointer-events-none"></div>
      </motion.div>

      {/* Real-Time Pulse Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ y: -4 }}
          className="clay-card p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider">
              Workforce Capacity
            </span>
            <div className="w-10 h-10 rounded-2xl bg-scarlet/10 flex items-center justify-center text-scarlet shadow-clay-pill">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-charcoal">
              {stats?.total_employees || 12}
            </div>
            <p className="text-xs text-charcoal-muted font-medium mt-1">
              Active engineering specialists
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="clay-card p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-muted uppercase tracking-wider">
              Avg Utilization
            </span>
            <div className="w-10 h-10 rounded-2xl bg-scarlet/10 flex items-center justify-center text-scarlet shadow-clay-pill">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-scarlet">
              {stats?.average_utilization || 58.8}%
            </div>
            <p className="text-xs text-charcoal-muted font-medium mt-1">
              Healthy benchmark: 65% – 80%
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="clay-card p-6 flex flex-col justify-between border-l-4 border-l-rose-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
              Burnout Risk (&gt;85%)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-clay-pill">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-rose-600">
              {stats?.overloaded_count || 4} Staff
            </div>
            <p className="text-xs text-rose-500/80 font-medium mt-1">
              Immediate task offloading suggested
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="clay-card p-6 flex flex-col justify-between border-l-4 border-l-emerald-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Bench Talent (&lt;40%)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-clay-pill">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-600">
              {stats?.underutilized_count || 5} Staff
            </div>
            <p className="text-xs text-emerald-600/80 font-medium mt-1">
              Ready for immediate allocation
            </p>
          </div>
        </motion.div>
      </div>

      {/* Feature Navigation Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1 */}
        <motion.div
          whileHover={{ y: -5 }}
          className="clay-card p-7 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-scarlet/10 flex items-center justify-center text-scarlet shadow-clay-pill mb-4">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-scarlet/10 text-scarlet">
              Scenario A
            </span>
            <h3 className="text-lg font-black text-charcoal mt-2">
              Smart Team Formation
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-medium">
              Autonomous matching algorithm blending cosine skill similarity, experience tenure, and real-time weekly availability.
            </p>
          </div>
          <Link
            href="/team-formation"
            className="clay-btn-secondary px-4 py-2.5 text-xs font-bold flex items-center justify-between group"
          >
            <span>Configure Squad</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Module 2 */}
        <motion.div
          whileHover={{ y: -5 }}
          className="clay-card p-7 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-clay-pill mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
              Scenario B
            </span>
            <h3 className="text-lg font-black text-charcoal mt-2">
              Workload Balancing & Heatmaps
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-medium">
              Detect burnout spikes, visualize individual weekly capacity bars, and generate one-click task reallocation shifts.
            </p>
          </div>
          <Link
            href="/workload-balancing"
            className="clay-btn-secondary px-4 py-2.5 text-xs font-bold flex items-center justify-between group"
          >
            <span>Analyze Workload</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Module 3 */}
        <motion.div
          whileHover={{ y: -5 }}
          className="clay-card p-7 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-clay-pill mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Upskilling Advisor
            </span>
            <h3 className="text-lg font-black text-charcoal mt-2">
              Skill Gap & Training
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-medium">
              Analyze organizational missing skills for upcoming projects and enroll staff into certified corporate bootcamps.
            </p>
          </div>
          <Link
            href="/skill-gap"
            className="clay-btn-secondary px-4 py-2.5 text-xs font-bold flex items-center justify-between group"
          >
            <span>View Training Paths</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Active Pipeline Projects List */}
      <div className="clay-card p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-charcoal flex items-center gap-2">
              <Target className="w-5 h-5 text-scarlet" />
              Active Projects in Pipeline
            </h3>
            <p className="text-xs text-charcoal-muted font-medium mt-0.5">
              Target requirements ready for talent matching and gap assessment
            </p>
          </div>
          <Link
            href="/team-formation"
            className="clay-btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <span>Match Candidates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="clay-inset p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-charcoal">{proj.name}</h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-charcoal shadow-clay-pill">
                    {proj.status}
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted mt-2 font-medium leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="pt-2 border-t border-charcoal/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap gap-1">
                  {proj.required_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white text-charcoal font-semibold shadow-clay-pill"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <span className="font-bold text-charcoal text-[11px]">
                  {proj.required_experience}y+ Exp Req
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
