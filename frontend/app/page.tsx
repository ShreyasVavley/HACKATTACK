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
  RefreshCw,
  Sliders,
  Check
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
      `✓ WORKLOAD SHIFT APPLIED: Transferred ${item.suggested_hours_to_shift}h from ${item.from_employee_name} to ${item.to_employee_name}!`
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
    <div className="min-h-screen bg-ivory text-charcoal font-sans antialiased selection:bg-scarlet selection:text-white flex flex-col">
      {/* Top Header Navigation - Neo Brutalism */}
      <header className="border-b-neo-thick border-charcoal bg-ivory-100 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-scarlet border-2 border-charcoal shadow-neo-sm flex items-center justify-center text-white font-black text-xl">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-charcoal uppercase">
                  Workforce Intelligence
                </h1>
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 bg-neo-yellow border-2 border-charcoal shadow-neo-sm text-charcoal">
                  WorkforceIQ
                </span>
              </div>
              <p className="text-xs font-bold text-charcoal-muted tracking-wide">
                AI-Powered Talent Optimization & Workforce Planning Platform
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar - Neo Brutalism Pills */}
          {workloadStats && (
            <div className="hidden lg:flex items-center gap-3 text-xs">
              <div className="bg-white border-2 border-charcoal shadow-neo-sm px-3.5 py-1.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-scarlet border border-charcoal"></span>
                <span className="font-bold text-charcoal-muted">AVG UTILIZATION:</span>
                <span className="font-black text-charcoal">{workloadStats.average_utilization}%</span>
              </div>
              <div className="bg-white border-2 border-charcoal shadow-neo-sm px-3.5 py-1.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-neo-coral border border-charcoal"></span>
                <span className="font-bold text-charcoal-muted">BURNOUT RISK:</span>
                <span className="font-black text-neo-coral">{workloadStats.overloaded_count} STAFF</span>
              </div>
              <div className="bg-white border-2 border-charcoal shadow-neo-sm px-3.5 py-1.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-neo-green border border-charcoal"></span>
                <span className="font-bold text-charcoal-muted">BENCH TALENT:</span>
                <span className="font-black text-emerald-600">{workloadStats.underutilized_count} STAFF</span>
              </div>
            </div>
          )}

          {/* Tab Button Switcher - Hard Neo-Brutalist Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("formation")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide border-2 border-charcoal transition-all ${
                activeTab === "formation"
                  ? "bg-scarlet text-white shadow-neo translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-charcoal hover:bg-ivory-200 shadow-neo-sm"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Smart Team (Scenario A)</span>
            </button>
            <button
              onClick={() => setActiveTab("heatmap")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide border-2 border-charcoal transition-all ${
                activeTab === "heatmap"
                  ? "bg-scarlet text-white shadow-neo translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-charcoal hover:bg-ivory-200 shadow-neo-sm"
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Workload (Scenario B)</span>
            </button>
            <button
              onClick={() => setActiveTab("skillgap")}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide border-2 border-charcoal transition-all ${
                activeTab === "skillgap"
                  ? "bg-scarlet text-white shadow-neo translate-x-[-1px] translate-y-[-1px]"
                  : "bg-white text-charcoal hover:bg-ivory-200 shadow-neo-sm"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Skill Gap & Training</span>
            </button>
          </div>
        </div>
      </header>

      {/* Action Notification Toast */}
      {reallocatedNotice && (
        <div className="bg-neo-yellow border-b-2 border-charcoal text-charcoal px-4 py-2.5 text-center text-xs font-black tracking-wider uppercase sticky top-[77px] z-40 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-charcoal" />
          <span>{reallocatedNotice}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: SMART TEAM FORMATION (SCENARIO A)                  */}
        {/* ========================================================= */}
        {activeTab === "formation" && (
          <div className="space-y-6">
            
            {/* Control Panel / Project Selection */}
            <div className="neo-box p-6 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div>
                  <div className="inline-block px-2.5 py-0.5 bg-scarlet text-white text-[10px] font-black uppercase tracking-wider mb-2 border border-charcoal">
                    Scenario A • Autonomous Matching
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-charcoal flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-scarlet" />
                    Talent & Squad Formation Engine
                  </h2>
                  <p className="text-xs font-semibold text-charcoal-muted mt-1">
                    Evaluates multi-dimensional skill vectors (50%), domain experience (25%), and real-time weekly capacity (25%).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-ivory-100 border-2 border-charcoal p-1.5 px-3">
                    <span className="text-xs font-extrabold text-charcoal uppercase">Target Project:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => handleProjectSelect(Number(e.target.value))}
                      className="bg-white border-2 border-charcoal px-2.5 py-1 text-xs font-bold text-charcoal focus:outline-none"
                    >
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.name} ({proj.required_experience}y+ exp)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-ivory-100 border-2 border-charcoal p-1.5 px-3">
                    <span className="text-xs font-extrabold text-charcoal uppercase">Squad Size:</span>
                    <select
                      value={teamSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTeamSize(val);
                        handleGenerateTeam(selectedProjectId, val);
                      }}
                      className="bg-white border-2 border-charcoal px-2.5 py-1 text-xs font-bold text-charcoal focus:outline-none"
                    >
                      <option value={2}>2 Members</option>
                      <option value={3}>3 Members</option>
                      <option value={4}>4 Members</option>
                      <option value={5}>5 Members</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleGenerateTeam(selectedProjectId, teamSize)}
                    disabled={isLoadingFormation}
                    className="neo-btn px-5 py-2 text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFormation ? "animate-spin" : ""}`} />
                    <span>{isLoadingFormation ? "Matching..." : "Generate Team"}</span>
                  </button>
                </div>
              </div>

              {/* Mandatory Skills Badges */}
              {projects.find((p) => p.id === selectedProjectId) && (
                <div className="mt-5 pt-4 border-t-2 border-charcoal flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase text-charcoal">Required Competencies:</span>
                  {projects
                    .find((p) => p.id === selectedProjectId)
                    ?.required_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 font-mono font-bold bg-ivory-200 text-charcoal border-2 border-charcoal shadow-neo-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  <div className="ml-auto text-xs font-bold text-charcoal-muted">
                    Min Required Experience:{" "}
                    <span className="text-charcoal font-black">
                      {projects.find((p) => p.id === selectedProjectId)?.required_experience} Years
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendation Top Summary Stats */}
            {teamRecommendation && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="neo-box p-5 bg-white border-l-8 border-l-scarlet flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-black text-charcoal-muted tracking-wider">
                      Overall Team Readiness
                    </span>
                    <div className="text-3xl font-black text-scarlet mt-1">
                      {teamRecommendation.overall_team_readiness}%
                    </div>
                    <span className="text-[11px] font-bold text-charcoal-muted">Composite capability & availability</span>
                  </div>
                  <div className="h-12 w-12 bg-ivory-200 border-2 border-charcoal flex items-center justify-center font-black text-scarlet">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="neo-box p-5 bg-white border-l-8 border-l-charcoal flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-black text-charcoal-muted tracking-wider">
                      Selected Team Size
                    </span>
                    <div className="text-3xl font-black text-charcoal mt-1">
                      {teamRecommendation.selected_team.length} Members
                    </div>
                    <span className="text-[11px] font-bold text-charcoal-muted">AI-optimized talent roster</span>
                  </div>
                  <div className="h-12 w-12 bg-ivory-200 border-2 border-charcoal flex items-center justify-center text-charcoal">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="neo-box p-5 bg-white border-l-8 border-l-neo-coral flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-black text-charcoal-muted tracking-wider">
                      Missing Competencies
                    </span>
                    <div className="text-xl font-black mt-1">
                      {teamRecommendation.missing_team_competencies.length === 0 ? (
                        <span className="text-emerald-600 flex items-center gap-1 text-sm font-black uppercase">
                          <CheckCircle2 className="w-4 h-4" /> 100% Skill Coverage
                        </span>
                      ) : (
                        <span className="text-neo-coral text-base font-extrabold">
                          {teamRecommendation.missing_team_competencies.join(", ")}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-charcoal-muted">Gaps across candidate composition</span>
                  </div>
                  <div className="h-12 w-12 bg-ivory-200 border-2 border-charcoal flex items-center justify-center text-neo-coral">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}

            {/* Candidate Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black uppercase tracking-tight text-charcoal flex items-center gap-2">
                  <Award className="w-4 h-4 text-scarlet" />
                  Ranked Candidate Roster (Top AI Recommendation)
                </h3>
                <span className="text-xs font-bold text-charcoal-muted uppercase">
                  Top {teamRecommendation?.selected_team.length || 0} Candidates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {teamRecommendation?.selected_team.map((cand, idx) => (
                  <div
                    key={cand.employee_id}
                    className="neo-box-interactive p-5 bg-white flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Rank & Match Score */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-charcoal text-white font-black text-sm flex items-center justify-center border border-charcoal shadow-neo-sm">
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="font-black text-charcoal text-sm leading-tight">{cand.name}</h4>
                            <p className="text-xs font-bold text-charcoal-muted">{cand.role}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-black text-scarlet">
                            {cand.match_score}%
                          </div>
                          <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-ivory-200 border border-charcoal text-charcoal">
                            {cand.fit_assessment}
                          </span>
                        </div>
                      </div>

                      {/* Burnout / Workload Warning */}
                      {cand.warning && (
                        <div className="mt-3 py-1.5 px-2.5 bg-rose-100 border-2 border-charcoal text-charcoal text-[11px] font-black uppercase flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-neo-coral flex-shrink-0" />
                          <span>{cand.warning}</span>
                        </div>
                      )}

                      {/* Breakdown Stats */}
                      <div className="mt-4 grid grid-cols-3 gap-1.5 bg-ivory-100 border-2 border-charcoal p-2 text-center text-[11px]">
                        <div>
                          <span className="font-extrabold text-charcoal-muted block text-[9px] uppercase">Skill Fit</span>
                          <span className="font-black text-scarlet">{cand.skill_match_score}%</span>
                        </div>
                        <div>
                          <span className="font-extrabold text-charcoal-muted block text-[9px] uppercase">Exp</span>
                          <span className="font-black text-charcoal">{cand.experience_years}y</span>
                        </div>
                        <div>
                          <span className="font-extrabold text-charcoal-muted block text-[9px] uppercase">Load</span>
                          <span
                            className={`font-black ${
                              cand.utilization_pct > 85
                                ? "text-neo-coral"
                                : cand.utilization_pct < 40
                                ? "text-emerald-600"
                                : "text-charcoal"
                            }`}
                          >
                            {cand.utilization_pct}%
                          </span>
                        </div>
                      </div>

                      {/* Skills Intersections */}
                      <div className="mt-4 space-y-2">
                        <span className="text-[10px] font-black uppercase text-charcoal block">Matched Competencies:</span>
                        <div className="flex flex-wrap gap-1">
                          {cand.matched_skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] px-2 py-0.5 font-bold font-mono bg-emerald-100 text-charcoal border border-charcoal flex items-center gap-1"
                            >
                              <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                              {skill}
                            </span>
                          ))}
                        </div>

                        {cand.missing_skills.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[9px] font-extrabold text-charcoal-muted uppercase block">Missing Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {cand.missing_skills.map((mSkill, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[9px] px-1.5 py-0.2 font-bold font-mono bg-ivory-200 text-charcoal-muted border border-charcoal"
                                >
                                  {mSkill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Status & Email */}
                    <div className="mt-5 pt-3 border-t-2 border-charcoal flex items-center justify-between text-xs">
                      <span className="font-bold text-charcoal-muted truncate max-w-[160px] text-[11px]">{cand.email}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 border border-charcoal ${
                          cand.status === "Available"
                            ? "bg-emerald-200 text-charcoal"
                            : cand.status === "Partially Allocated"
                            ? "bg-neo-yellow text-charcoal"
                            : "bg-rose-200 text-charcoal"
                        }`}
                      >
                        {cand.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Complete Talent Matrix Table */}
              <div className="mt-8 neo-box p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black uppercase tracking-tight text-charcoal flex items-center gap-2">
                    <Layers className="w-4 h-4 text-scarlet" />
                    Complete Talent Matching Matrix
                  </h3>
                  <span className="text-xs font-bold text-charcoal-muted uppercase">Ranked Employee Pool</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-2 border-charcoal">
                    <thead className="bg-ivory-200 text-charcoal font-black uppercase text-[10px] tracking-wider border-b-2 border-charcoal">
                      <tr>
                        <th className="py-2.5 px-3 border-r-2 border-charcoal">Candidate</th>
                        <th className="py-2.5 px-3 border-r-2 border-charcoal">Role</th>
                        <th className="py-2.5 px-3 border-r-2 border-charcoal">Experience</th>
                        <th className="py-2.5 px-3 border-r-2 border-charcoal">Match Score</th>
                        <th className="py-2.5 px-3 border-r-2 border-charcoal">Weekly Load</th>
                        <th className="py-2.5 px-3 border-r-2 border-charcoal">Overlap Skills</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-charcoal font-bold text-charcoal bg-white">
                      {teamRecommendation?.all_ranked_candidates.map((cand) => (
                        <tr key={cand.employee_id} className="hover:bg-ivory-100 transition-colors">
                          <td className="py-2.5 px-3 border-r-2 border-charcoal font-black text-charcoal">
                            {cand.name}
                          </td>
                          <td className="py-2.5 px-3 border-r-2 border-charcoal text-charcoal-muted">{cand.role}</td>
                          <td className="py-2.5 px-3 border-r-2 border-charcoal">{cand.experience_years} Years</td>
                          <td className="py-2.5 px-3 border-r-2 border-charcoal font-black text-scarlet">{cand.match_score}%</td>
                          <td className="py-2.5 px-3 border-r-2 border-charcoal">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-ivory-300 border border-charcoal overflow-hidden">
                                <div
                                  className={`h-full ${
                                    cand.utilization_pct > 85
                                      ? "bg-neo-coral"
                                      : cand.utilization_pct < 40
                                      ? "bg-emerald-500"
                                      : "bg-scarlet"
                                  }`}
                                  style={{ width: `${Math.min(cand.utilization_pct, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-[11px] font-black">{cand.utilization_pct}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 border-r-2 border-charcoal">
                            <div className="flex flex-wrap gap-1">
                              {cand.matched_skills.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] px-1.5 py-0.5 bg-ivory-200 border border-charcoal text-charcoal font-mono"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 border border-charcoal ${
                                cand.status === "Available"
                                  ? "bg-emerald-200 text-charcoal"
                                  : cand.status === "Partially Allocated"
                                  ? "bg-neo-yellow text-charcoal"
                                  : "bg-rose-200 text-charcoal"
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
                <div className="neo-box p-5 bg-white border-b-8 border-b-charcoal">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-charcoal-muted">
                    <span>Workforce Size</span>
                    <Users className="w-4 h-4 text-charcoal" />
                  </div>
                  <div className="text-2xl font-black text-charcoal mt-2">{workloadStats.total_employees} ACTIVE</div>
                  <span className="text-[11px] font-bold text-charcoal-muted">Engineers & Specialists</span>
                </div>

                <div className="neo-box p-5 bg-white border-b-8 border-b-scarlet">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-charcoal-muted">
                    <span>Average Capacity</span>
                    <BarChart3 className="w-4 h-4 text-scarlet" />
                  </div>
                  <div className="text-2xl font-black text-scarlet mt-2">{workloadStats.average_utilization}%</div>
                  <span className="text-[11px] font-bold text-charcoal-muted">Target Range: 65% – 80%</span>
                </div>

                <div className="neo-box p-5 bg-rose-50 border-b-8 border-b-neo-coral">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-neo-coral">
                    <span>Burnout Risk (&gt;85%)</span>
                    <Flame className="w-4 h-4 text-neo-coral" />
                  </div>
                  <div className="text-2xl font-black text-neo-coral mt-2">
                    {workloadStats.overloaded_count} STAFF
                  </div>
                  <span className="text-[11px] font-bold text-charcoal-muted">Overloaded talent requiring task shifts</span>
                </div>

                <div className="neo-box p-5 bg-emerald-50 border-b-8 border-b-emerald-600">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-emerald-700">
                    <span>Bench Talent (&lt;40%)</span>
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    {workloadStats.underutilized_count} STAFF
                  </div>
                  <span className="text-[11px] font-bold text-charcoal-muted">Underutilized bench resources available</span>
                </div>
              </div>
            )}

            {/* Scenario B Task Redistribution Engine */}
            <div className="neo-box p-6 bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-block px-2.5 py-0.5 bg-scarlet text-white text-[10px] font-black uppercase tracking-wider mb-2 border border-charcoal">
                    Scenario B • Workload Balancing
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-charcoal flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-scarlet" />
                    Automated Workload Balancing & Task Redistribution
                  </h3>
                  <p className="text-xs font-semibold text-charcoal-muted mt-1">
                    Heuristic engine pairs overloaded personnel with compatible underutilized bench staff to balance organizational load.
                  </p>
                </div>
                <button
                  onClick={handleTriggerReallocate}
                  disabled={isLoadingReallocate}
                  className="neo-btn px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReallocate ? "animate-spin" : ""}`} />
                  <span>{isLoadingReallocate ? "Optimizing..." : "Generate Shift Proposals"}</span>
                </button>
              </div>

              {/* Reallocation Suggestions List */}
              {reallocations.length > 0 && (
                <div className="mt-6 space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-scarlet block">
                    Recommended Task Shift Directives:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reallocations.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-ivory-100 border-2 border-charcoal p-4 shadow-neo-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs font-black">
                            <span className="text-neo-coral flex items-center gap-1.5 uppercase">
                              <span className="w-2.5 h-2.5 bg-neo-coral border border-charcoal"></span>
                              {item.from_employee_name} ({item.from_utilization_pct}%)
                            </span>
                            <ArrowRight className="w-4 h-4 text-charcoal stroke-[3]" />
                            <span className="text-emerald-700 flex items-center gap-1.5 uppercase">
                              <span className="w-2.5 h-2.5 bg-emerald-500 border border-charcoal"></span>
                              {item.to_employee_name} ({item.to_utilization_pct}%)
                            </span>
                          </div>

                          <p className="text-xs font-bold text-charcoal mt-3 bg-white p-3 border-2 border-charcoal leading-relaxed">
                            {item.impact_rationale}
                          </p>

                          <div className="mt-3 flex items-center gap-2 text-[11px] font-bold">
                            <span className="text-charcoal-muted uppercase">Shared Skill Set:</span>
                            <span className="bg-white px-2 py-0.5 border border-charcoal font-mono text-scarlet font-black">
                              {item.shared_skills.join(", ")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t-2 border-charcoal flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-scarlet">
                            Shift {item.suggested_hours_to_shift} Hours / Week
                          </span>
                          <button
                            onClick={() => handleApplyShift(item)}
                            className="neo-btn-secondary px-3.5 py-1 text-xs uppercase"
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

            {/* Individual Employee Capacity Bars */}
            <div className="neo-box p-6 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-charcoal flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-scarlet" />
                    Individual Employee Capacity & Utilization Heatmap
                  </h3>
                  <p className="text-xs font-semibold text-charcoal-muted mt-0.5">
                    Live weekly commitment vs. maximum contractual capacity
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search talent or skill..."
                      value={searchEmployeeQuery}
                      onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                      className="bg-ivory-100 border-2 border-charcoal pl-8 pr-3 py-1 text-xs font-bold text-charcoal focus:outline-none w-48"
                    />
                  </div>

                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-ivory-100 border-2 border-charcoal px-3 py-1 text-xs font-bold text-charcoal focus:outline-none"
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
              <div className="space-y-3.5">
                {filteredEmployees.map((emp) => {
                  const isBurnout = emp.utilization_pct > 85;
                  const isBench = emp.utilization_pct < 40;
                  
                  return (
                    <div
                      key={emp.id}
                      className="bg-ivory-100 border-2 border-charcoal p-3.5 shadow-neo-sm hover:shadow-neo transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-3.5 h-3.5 border border-charcoal ${
                              isBurnout ? "bg-neo-coral" : isBench ? "bg-emerald-500" : "bg-scarlet"
                            }`}
                          ></span>
                          <div>
                            <span className="font-black text-sm text-charcoal">{emp.name}</span>
                            <span className="text-xs font-bold text-charcoal-muted ml-2">({emp.role})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-extrabold text-charcoal">
                            {emp.current_workload_hours}h / {emp.max_hours}h weekly
                          </span>
                          <span
                            className={`font-black uppercase px-2 py-0.5 border border-charcoal text-[10px] ${
                              isBurnout
                                ? "bg-rose-200 text-charcoal"
                                : isBench
                                ? "bg-emerald-200 text-charcoal"
                                : "bg-white text-charcoal"
                            }`}
                          >
                            {emp.utilization_pct}% {isBurnout ? "• Burnout Risk" : isBench ? "• Bench" : "• Optimal"}
                          </span>
                        </div>
                      </div>

                      {/* Hard Progress Bar */}
                      <div className="w-full h-3.5 bg-white border-2 border-charcoal overflow-hidden">
                        <div
                          className={`h-full border-r border-charcoal transition-all duration-300 ${
                            isBurnout
                              ? "bg-neo-coral"
                              : isBench
                              ? "bg-emerald-500"
                              : "bg-scarlet"
                          }`}
                          style={{ width: `${Math.min(emp.utilization_pct, 100)}%` }}
                        ></div>
                      </div>

                      {/* Skills Tags */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-black uppercase text-charcoal-muted">Skills:</span>
                        {emp.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-white text-charcoal border border-charcoal"
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
            <div className="neo-box p-6 bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-block px-2.5 py-0.5 bg-scarlet text-white text-[10px] font-black uppercase tracking-wider mb-2 border border-charcoal">
                    Module 3 • Upskilling Engine
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-charcoal flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-scarlet" />
                    Automated Skill-Gap Analysis & Training Advisor
                  </h2>
                  <p className="text-xs font-semibold text-charcoal-muted mt-1">
                    Compares project technical specifications against the organizational skill inventory and provides targeted learning pathways.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-ivory-100 border-2 border-charcoal p-1.5 px-3">
                  <span className="text-xs font-black uppercase text-charcoal">Analyze Project:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => handleProjectSelect(Number(e.target.value))}
                    className="bg-white border-2 border-charcoal px-2.5 py-1 text-xs font-bold text-charcoal focus:outline-none"
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
                <div className="neo-box p-5 bg-white border-l-8 border-l-scarlet">
                  <span className="text-xs font-black uppercase text-charcoal-muted tracking-wider">
                    Competency Coverage
                  </span>
                  <div className="text-3xl font-black text-scarlet mt-2">
                    {skillGapReport.coverage_percentage}%
                  </div>
                  <div className="w-full h-3 bg-ivory-200 border-2 border-charcoal mt-3 overflow-hidden">
                    <div
                      className="h-full bg-scarlet border-r border-charcoal"
                      style={{ width: `${skillGapReport.coverage_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-bold text-charcoal-muted mt-2 block">
                    {skillGapReport.covered_skills.length} of {skillGapReport.required_skills.length} required competencies verified
                  </span>
                </div>

                <div className="neo-box p-5 bg-white border-l-8 border-l-emerald-600">
                  <span className="text-xs font-black uppercase text-charcoal-muted tracking-wider">
                    Covered Skills in Pool
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skillGapReport.covered_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 font-bold font-mono bg-emerald-100 text-charcoal border-2 border-charcoal shadow-neo-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="neo-box p-5 bg-white border-l-8 border-l-neo-coral">
                  <span className="text-xs font-black uppercase text-charcoal-muted tracking-wider">
                    Competency Gaps
                  </span>
                  <div className="mt-3">
                    {skillGapReport.missing_skills.length === 0 ? (
                      <span className="text-xs font-black uppercase text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        No organizational gaps detected!
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {skillGapReport.missing_skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 font-bold font-mono bg-rose-100 text-charcoal border-2 border-charcoal shadow-neo-sm flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3 text-neo-coral" />
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Targeted Training Modules */}
            <div className="neo-box p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-charcoal flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-scarlet" />
                    Targeted Training & Certification Tracks
                  </h3>
                  <p className="text-xs font-semibold text-charcoal-muted mt-0.5">
                    Recommended internal & external bootcamps to elevate team capability
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillGapReport?.recommended_training.map((module, idx) => (
                  <div
                    key={idx}
                    className="bg-ivory-100 border-2 border-charcoal p-5 shadow-neo-sm hover:shadow-neo transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase px-2.5 py-0.5 bg-scarlet text-white border border-charcoal">
                          {module.skill}
                        </span>
                        <span className="text-[11px] font-extrabold text-charcoal flex items-center gap-1">
                          <Clock className="w-3 h-3 text-scarlet" /> 4-6 Weeks
                        </span>
                      </div>

                      <h4 className="font-black text-charcoal text-base mt-3 leading-snug">
                        {module.course}
                      </h4>

                      <div className="flex items-center gap-2 text-xs font-bold text-charcoal-muted mt-2">
                        <span className="uppercase">Provider:</span>
                        <span className="text-charcoal font-black">{module.provider}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t-2 border-charcoal flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-scarlet">Verified Curriculum</span>
                      <button className="neo-btn px-3 py-1 text-xs uppercase flex items-center gap-1">
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

      {/* Neo-Brutalist Footer */}
      <footer className="border-t-neo-thick border-charcoal bg-ivory-100 py-6 px-6 text-xs font-bold text-charcoal mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-scarlet border border-charcoal"></span>
            <span className="font-black uppercase">Workforce Intelligence Platform (WorkforceIQ)</span>
          </div>
          <span className="font-extrabold uppercase text-charcoal-muted">
            Neo-Brutalist Design • Ivory • Charcoal Black • Scarlet Blue
          </span>
        </div>
      </footer>
    </div>
  );
}
