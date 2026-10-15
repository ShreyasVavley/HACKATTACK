"use client";

import React, { useState, useEffect } from "react";
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
  Filter,
  BarChart3,
  Layers,
  Zap,
  Clock,
  ShieldAlert,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  RefreshCw
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

interface CandidateMatch {
  employee_id: number;
  name: string;
  role: string;
  email: string;
  experience_years: number;
  utilization_pct: number;
  current_workload_hours: number;
  available_hours: number;
  status: string;
  match_score: number;
  skill_match_score: number;
  experience_score: number;
  availability_score: number;
  matched_skills: string[];
  missing_skills: string[];
  all_skills: string[];
  fit_assessment: string;
  warning?: string | null;
}

interface TeamRecommendation {
  project_id: number | null;
  project_name: string;
  required_skills: string[];
  required_experience: number;
  team_size: number;
  overall_team_readiness: number;
  missing_team_competencies: string[];
  selected_team: CandidateMatch[];
  all_ranked_candidates: CandidateMatch[];
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

interface SkillGapData {
  project_id: number;
  project_name: string;
  required_skills: string[];
  missing_skills: string[];
  covered_skills: string[];
  coverage_percentage: number;
  recommended_training: {
    skill: string;
    course: string;
    provider: string;
  }[];
}

const API_BASE = "http://127.0.0.1:8000";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"formation" | "heatmap" | "skillgap">("formation");
  
  // Data States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [teamSize, setTeamSize] = useState<number>(3);
  const [teamRecommendation, setTeamRecommendation] = useState<TeamRecommendation | null>(null);
  const [workloadStats, setWorkloadStats] = useState<WorkloadStats | null>(null);
  const [reallocations, setReallocations] = useState<ReallocationItem[]>([]);
  const [skillGapReport, setSkillGapReport] = useState<SkillGapData | null>(null);
  
  // UI states
  const [isLoadingFormation, setIsLoadingFormation] = useState<boolean>(false);
  const [isLoadingReallocate, setIsLoadingReallocate] = useState<boolean>(false);
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [reallocatedNotice, setReallocatedNotice] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch initial base data
  const fetchInitialData = async () => {
    try {
      const [empRes, projRes, workRes] = await Promise.all([
        fetch(`${API_BASE}/api/employees`),
        fetch(`${API_BASE}/api/projects`),
        fetch(`${API_BASE}/api/workload-stats`),
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      }
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
        if (projData.length > 0) {
          setSelectedProjectId(projData[0].id);
          // Initial trigger for team match and skill gaps
          handleGenerateTeam(projData[0].id, 3);
          fetchSkillGaps(projData[0].id);
        }
      }
      if (workRes.ok) {
        const workData = await workRes.json();
        setWorkloadStats(workData);
      }
    } catch (err) {
      console.error("Error fetching initial data from FastAPI backend:", err);
    }
  };

  const handleGenerateTeam = async (projId: number = selectedProjectId, size: number = teamSize) => {
    setIsLoadingFormation(true);
    try {
      const res = await fetch(`${API_BASE}/api/match-team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projId,
          team_size: size,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeamRecommendation(data);
      }
    } catch (err) {
      console.error("Failed to generate team match:", err);
    } finally {
      setIsLoadingFormation(false);
    }
  };

  const fetchSkillGaps = async (projId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/skill-gaps/${projId}`);
      if (res.ok) {
        const data = await res.json();
        setSkillGapReport(data);
      }
    } catch (err) {
      console.error("Failed to fetch skill gaps:", err);
    }
  };

  const handleTriggerReallocate = async () => {
    setIsLoadingReallocate(true);
    try {
      const res = await fetch(`${API_BASE}/api/reallocate`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setReallocations(data);
      }
    } catch (err) {
      console.error("Failed to fetch reallocation suggestions:", err);
    } finally {
      setIsLoadingReallocate(false);
    }
  };

  const handleProjectSelect = (id: number) => {
    setSelectedProjectId(id);
    handleGenerateTeam(id, teamSize);
    fetchSkillGaps(id);
  };

  const handleApplyShift = (item: ReallocationItem) => {
    setReallocatedNotice(
      `Shift Applied: Transferred ${item.suggested_hours_to_shift}h task package from ${item.from_employee_name} to ${item.to_employee_name}!`
    );
    setTimeout(() => setReallocatedNotice(null), 5000);
  };

  // Filtered employees for heatmap
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
      emp.skills.some((s) => s.toLowerCase().includes(searchEmployeeQuery.toLowerCase()));
    const matchesRole = filterRole === "All" || emp.role.toLowerCase().includes(filterRole.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-obsidian-950/80 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-obsidian-950 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  Workforce Intelligence
                </h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Platform
                </span>
              </div>
              <p className="text-xs text-slate-400">Workforce Intelligence Platform (Codename: WorkforceIQ)</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          {workloadStats && (
            <div className="hidden lg:flex items-center gap-6 text-xs bg-slate-900/60 border border-slate-800 rounded-full px-5 py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-slate-400">Avg Utilization:</span>
                <span className="font-semibold text-slate-200">{workloadStats.average_utilization}%</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-800"></div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-slate-400">Burnout Risks:</span>
                <span className="font-semibold text-rose-400">{workloadStats.overloaded_count}</span>
              </div>
              <div className="h-3 w-[1px] bg-slate-800"></div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-400">Bench Talent:</span>
                <span className="font-semibold text-emerald-400">{workloadStats.underutilized_count}</span>
              </div>
            </div>
          )}

          {/* Tab Pill Switcher */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab("formation")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "formation"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Smart Team Formation (Scenario A)</span>
            </button>
            <button
              onClick={() => setActiveTab("heatmap")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "heatmap"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Workload Balancing (Scenario B)</span>
            </button>
            <button
              onClick={() => setActiveTab("skillgap")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === "skillgap"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Skill Gap & Training</span>
            </button>
          </div>
        </div>
      </header>

      {/* Reallocation Toast Notice */}
      {reallocatedNotice && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 text-center text-sm font-medium sticky top-[73px] z-40 backdrop-blur shadow-lg flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{reallocatedNotice}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: SMART TEAM FORMATION                               */}
        {/* ========================================================= */}
        {activeTab === "formation" && (
          <div className="space-y-6">
            {/* Top Project Selector & Controls */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Autonomous Talent & Project Matching Engine
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Evaluates multi-dimensional skill vectors, experience thresholds, and live weekly availability.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Project Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Target Project:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => handleProjectSelect(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.name} ({proj.required_experience}y+ exp)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team Size Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Team Size:</span>
                    <select
                      value={teamSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTeamSize(val);
                        handleGenerateTeam(selectedProjectId, val);
                      }}
                      className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value={2}>2 Members</option>
                      <option value={3}>3 Members</option>
                      <option value={4}>4 Members</option>
                      <option value={5}>5 Members</option>
                    </select>
                  </div>

                  {/* Regenerate Button */}
                  <button
                    onClick={() => handleGenerateTeam(selectedProjectId, teamSize)}
                    disabled={isLoadingFormation}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFormation ? "animate-spin" : ""}`} />
                    <span>{isLoadingFormation ? "Matching..." : "Generate Team"}</span>
                  </button>
                </div>
              </div>

              {/* Active Project Spec Pill Box */}
              {projects.find((p) => p.id === selectedProjectId) && (
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">Mandatory Competencies:</span>
                  {projects
                    .find((p) => p.id === selectedProjectId)
                    ?.required_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-700/40 font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  <div className="text-xs text-slate-400 ml-auto flex items-center gap-2">
                    <span>Min Experience:</span>
                    <span className="text-slate-200 font-semibold">
                      {projects.find((p) => p.id === selectedProjectId)?.required_experience} Years
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Team Recommendation Summary Banner */}
            {teamRecommendation && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Overall Team Readiness
                    </span>
                    <div className="text-3xl font-extrabold text-cyan-400 mt-1">
                      {teamRecommendation.overall_team_readiness}%
                    </div>
                    <span className="text-[11px] text-slate-400">Blended skill depth & capacity score</span>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-cyan-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Selected Squad Size
                    </span>
                    <div className="text-3xl font-extrabold text-indigo-400 mt-1">
                      {teamRecommendation.selected_team.length} Members
                    </div>
                    <span className="text-[11px] text-slate-400">Primary recommended deployment</span>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-indigo-950/60 border border-indigo-800 flex items-center justify-center text-indigo-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Missing Competencies
                    </span>
                    <div className="text-2xl font-bold mt-1">
                      {teamRecommendation.missing_team_competencies.length === 0 ? (
                        <span className="text-emerald-400 flex items-center gap-1.5 text-base font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> 100% Skill Coverage
                        </span>
                      ) : (
                        <span className="text-rose-400 text-lg">
                          {teamRecommendation.missing_team_competencies.join(", ")}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">Gaps across assembled candidate set</span>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}

            {/* Ranked Candidate Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Optimal Squad Roster (Top Ranked Candidates)
                </h3>
                <span className="text-xs text-slate-400">
                  Showing top {teamRecommendation?.selected_team.length || 0} AI-optimized personnel
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {teamRecommendation?.selected_team.map((cand, idx) => (
                  <div
                    key={cand.employee_id}
                    className="glass-card rounded-2xl p-5 border border-slate-800/80 relative flex flex-col justify-between"
                  >
                    {/* Rank Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-800 border border-indigo-700/50 flex items-center justify-center font-bold text-indigo-300 text-sm">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm leading-snug">{cand.name}</h4>
                          <p className="text-xs text-slate-400">{cand.role}</p>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="text-right">
                        <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
                          {cand.match_score}%
                        </div>
                        <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider">
                          {cand.fit_assessment}
                        </span>
                      </div>
                    </div>

                    {/* Gap Warning Banner if overloaded */}
                    {cand.warning && (
                      <div className="mt-3 py-1.5 px-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[11px] flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{cand.warning}</span>
                      </div>
                    )}

                    {/* Breakdown Metrics */}
                    <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/50 text-center text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Skill Match</span>
                        <span className="font-bold text-cyan-400">{cand.skill_match_score}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Experience</span>
                        <span className="font-bold text-slate-200">{cand.experience_years}y</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Avail Load</span>
                        <span
                          className={`font-bold ${
                            cand.utilization_pct > 85
                              ? "text-rose-400"
                              : cand.utilization_pct < 40
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}
                        >
                          {cand.utilization_pct}%
                        </span>
                      </div>
                    </div>

                    {/* Matched Skill Pills */}
                    <div className="mt-4 space-y-2">
                      <span className="text-[11px] text-slate-400 font-medium block">Matched Core Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cand.matched_skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 font-mono flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Missing skills for this candidate */}
                      {cand.missing_skills.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] text-slate-500 block">Missing Project Reqs:</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {cand.missing_skills.map((mSkill, mIdx) => (
                              <span
                                key={mIdx}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                              >
                                {mSkill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Contact & Status */}
                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate max-w-[170px] text-[11px]">{cand.email}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          cand.status === "Available"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : cand.status === "Partially Allocated"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : "bg-rose-950 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {cand.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Talent Pool Table */}
              <div className="mt-10 glass-panel rounded-2xl p-6 border border-slate-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Complete Candidate Match Matrix
                  </h3>
                  <span className="text-xs text-slate-400">Ranked against active project parameters</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Experience</th>
                        <th className="py-3 px-4">Match Score</th>
                        <th className="py-3 px-4">Weekly Load</th>
                        <th className="py-3 px-4">Skill Overlap</th>
                        <th className="py-3 px-4">Availability Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {teamRecommendation?.all_ranked_candidates.map((cand) => (
                        <tr key={cand.employee_id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            {cand.name}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{cand.role}</td>
                          <td className="py-3 px-4">{cand.experience_years} Years</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-cyan-400">{cand.match_score}%</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    cand.utilization_pct > 85
                                      ? "bg-rose-500"
                                      : cand.utilization_pct < 40
                                      ? "bg-emerald-400"
                                      : "bg-amber-400"
                                  }`}
                                  style={{ width: `${Math.min(cand.utilization_pct, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-[11px] text-slate-400">{cand.utilization_pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {cand.matched_skills.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                cand.status === "Available"
                                  ? "bg-emerald-950 text-emerald-400"
                                  : cand.status === "Partially Allocated"
                                  ? "bg-amber-950 text-amber-400"
                                  : "bg-rose-950 text-rose-400"
                              }`}
                            >
                              {cand.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WORKLOAD BALANCING (SCENARIO B)                    */}
        {/* ========================================================= */}
        {activeTab === "heatmap" && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            {workloadStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Workforce</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 mt-2">{workloadStats.total_employees} Active</div>
                  <span className="text-[11px] text-slate-500">Cross-departmental engineering pool</span>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Average Capacity</span>
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 mt-2">{workloadStats.average_utilization}%</div>
                  <span className="text-[11px] text-slate-500">Target threshold: 65% – 80%</span>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-rose-900/40 bg-rose-950/20">
                  <div className="flex items-center justify-between text-rose-300 text-xs">
                    <span>Burnout Risk (&gt;85%)</span>
                    <Flame className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-bold text-rose-400 mt-2">
                    {workloadStats.overloaded_count} Staff
                  </div>
                  <span className="text-[11px] text-rose-300/70">Overloaded resources needing rebalancing</span>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-emerald-900/40 bg-emerald-950/20">
                  <div className="flex items-center justify-between text-emerald-300 text-xs">
                    <span>Bench Talent (&lt;40%)</span>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 mt-2">
                    {workloadStats.underutilized_count} Staff
                  </div>
                  <span className="text-[11px] text-emerald-300/70">Available immediately for assignment</span>
                </div>
              </div>
            )}

            {/* Workload Rebalancing Reallocation Engine Trigger */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                    Scenario B: Automated Workload Balancing & Task Redistribution
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    AI engine calculates task shift combinations from overloaded personnel to compatible bench talent.
                  </p>
                </div>
                <button
                  onClick={handleTriggerReallocate}
                  disabled={isLoadingReallocate}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReallocate ? "animate-spin" : ""}`} />
                  <span>{isLoadingReallocate ? "Calculating Shifts..." : "Generate Task Shifts"}</span>
                </button>
              </div>

              {/* Reallocation Suggestions List */}
              {reallocations.length > 0 && (
                <div className="mt-6 space-y-3">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider block">
                    Recommended Task Transfer Actions:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reallocations.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-rose-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                              {item.from_employee_name} ({item.from_utilization_pct}%)
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                            <span className="text-emerald-400 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              {item.to_employee_name} ({item.to_utilization_pct}%)
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mt-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                            {item.impact_rationale}
                          </p>

                          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                            <span>Compatible Domain:</span>
                            <span className="text-indigo-300 font-mono bg-indigo-950 px-2 py-0.5 rounded">
                              {item.shared_skills.join(", ")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-semibold text-cyan-400">
                            Shift {item.suggested_hours_to_shift} hrs/week
                          </span>
                          <button
                            onClick={() => handleApplyShift(item)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
                          >
                            Execute Shift
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Individual Employee Heatmap Grid */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    Individual Employee Capacity & Utilization Heatmap
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live weekly commitment vs. maximum contractual capacity
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search talent or skill..."
                      value={searchEmployeeQuery}
                      onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-48"
                    />
                  </div>

                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Roles</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Data">Data</option>
                    <option value="Engineer">Engineering</option>
                    <option value="Architect">Architect</option>
                  </select>
                </div>
              </div>

              {/* Heatmap Bars */}
              <div className="space-y-4">
                {filteredEmployees.map((emp) => {
                  const isBurnout = emp.utilization_pct > 85;
                  const isBench = emp.utilization_pct < 40;
                  
                  return (
                    <div
                      key={emp.id}
                      className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/70 rounded-xl p-4 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              isBurnout ? "bg-rose-500" : isBench ? "bg-emerald-400" : "bg-indigo-400"
                            }`}
                          ></span>
                          <div>
                            <span className="font-semibold text-sm text-slate-100">{emp.name}</span>
                            <span className="text-xs text-slate-400 ml-2">({emp.role})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-400">
                            {emp.current_workload_hours}h / {emp.max_hours}h weekly
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              isBurnout
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : isBench
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {emp.utilization_pct}% {isBurnout ? "• Burnout Risk" : isBench ? "• Bench" : "• Optimal"}
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-[1px] border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isBurnout
                              ? "bg-gradient-to-r from-amber-500 to-rose-600"
                              : isBench
                              ? "bg-gradient-to-r from-teal-500 to-emerald-500"
                              : "bg-gradient-to-r from-cyan-500 to-indigo-500"
                          }`}
                          style={{ width: `${Math.min(emp.utilization_pct, 100)}%` }}
                        ></div>
                      </div>

                      {/* Skills Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-slate-500">Skills:</span>
                        {emp.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/40"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SKILL GAP & TRAINING                               */}
        {/* ========================================================= */}
        {activeTab === "skillgap" && (
          <div className="space-y-6">
            {/* Top Project Selector for Skill Gap Analysis */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    Automated Skill-Gap Analysis & Upskilling Advisor
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Compares project technical specifications against the organizational skill inventory and provides targeted learning pathways.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Analyze Project:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleProjectSelect(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Gap Analysis Summary Cards */}
            {skillGapReport && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Competency Coverage
                  </span>
                  <div className="text-3xl font-extrabold text-cyan-400 mt-2">
                    {skillGapReport.coverage_percentage}%
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${skillGapReport.coverage_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block">
                    {skillGapReport.covered_skills.length} of {skillGapReport.required_skills.length} required competencies verified
                  </span>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Covered Skills in Pool
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skillGapReport.covered_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Uncovered Competency Gaps
                  </span>
                  <div className="mt-3">
                    {skillGapReport.missing_skills.length === 0 ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        No organizational competency gaps detected!
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {skillGapReport.missing_skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 rounded-md bg-rose-950 text-rose-300 border border-rose-800/80 font-mono flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Training Modules & Upskilling Paths */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Targeted Training & Certification Paths
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recommended internal & external bootcamps to elevate team capability
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillGapReport?.recommended_training.map((module, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {module.skill}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 4-6 Weeks
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-100 text-sm mt-3 leading-snug">
                        {module.course}
                      </h4>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                        <span>Provider:</span>
                        <span className="text-slate-200 font-medium">{module.provider}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-cyan-400 font-medium">Enterprise License Available</span>
                      <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                        <span>Enroll Talent</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-obsidian-950/60 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Workforce Intelligence Platform (WorkforceIQ) • AI-Powered Talent Optimization & Workforce Planning</span>
          <span className="text-slate-400">FastAPI • SQLite • Next.js • Obsidian Dark UI</span>
        </div>
      </footer>
    </div>
  );
}
