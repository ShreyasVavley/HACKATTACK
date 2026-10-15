"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Users,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Award,
  Layers,
  ShieldAlert,
  Check,
  CheckCheck,
  UserCheck,
  Plus,
  HelpCircle,
  Info,
  X,
  Lock,
  ArrowLeftRight,
  UserMinus,
  Filter,
  Zap,
  Clock
} from "lucide-react";
import CreateEntityModal from "../../components/CreateEntityModal";

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

import { API_BASE } from "../../lib/api";

export default function TeamFormationPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [teamSize, setTeamSize] = useState<number>(3);
  const [recommendation, setRecommendation] = useState<TeamRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [assigning, setAssigning] = useState<boolean>(false);
  const [assignedSuccessMsg, setAssignedSuccessMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [methodologyOpen, setMethodologyOpen] = useState<boolean>(false);
  const [hideOverallocated, setHideOverallocated] = useState<boolean>(false);
  const [hoveredCandidateId, setHoveredCandidateId] = useState<number | null>(null);

  // Helper: swap an existing squad member with an external candidate
  const handleSwapMember = (currentMemberId: number, targetCandidate: CandidateMatch) => {
    if (!recommendation) return;
    const updatedSquad = recommendation.selected_team.map((m) =>
      m.employee_id === currentMemberId ? targetCandidate : m
    );

    // Recompute competencies and readiness
    const combined = new Set<string>();
    updatedSquad.forEach((m) => m.all_skills.forEach((s) => combined.add(s.toLowerCase())));
    const missing = (currentProject?.required_skills || []).filter(
      (req) => !Array.from(combined).some((s) => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
    );
    const avgScore = updatedSquad.reduce((acc, m) => acc + m.match_score, 0) / Math.max(updatedSquad.length, 1);
    const coverageRatio = currentProject?.required_skills?.length
      ? (currentProject.required_skills.length - missing.length) / currentProject.required_skills.length
      : 1;
    const readiness = Math.round(((0.5 * avgScore) + (0.5 * (coverageRatio * 100))) * 10) / 10;

    setRecommendation({
      ...recommendation,
      selected_team: updatedSquad,
      missing_team_competencies: missing,
      overall_team_readiness: readiness
    });

    setAssignedSuccessMsg(`✓ Swapped specialist! Combined team now updated.`);
    setTimeout(() => setAssignedSuccessMsg(null), 3000);
  };

  // Helper: Auto-resolve gap for a specific skill (e.g. React) by swapping lowest match with best cover
  const handleAutoResolveGap = (gapSkill: string) => {
    if (!recommendation) return;
    const gapLower = gapSkill.toLowerCase();
    // Find candidate not in selected team who covers this skill and has highest match
    const currentIds = new Set(recommendation.selected_team.map((m) => m.employee_id));
    const candidate = recommendation.all_ranked_candidates
      .filter((c) => !currentIds.has(c.employee_id))
      .find((c) => c.all_skills.some((s) => s.toLowerCase().includes(gapLower)));

    if (!candidate) {
      alert(`No available specialist found with proficiency in ${gapSkill}.`);
      return;
    }

    // Replace candidate in squad with lowest match or lowest contribution
    const sortedSquad = [...recommendation.selected_team].sort((a, b) => a.match_score - b.match_score);
    const toReplace = sortedSquad[0];

    handleSwapMember(toReplace.employee_id, candidate);
  };

  useEffect(() => {
    loadProjects();

    // Live WebSocket Sync Listener
    const handleLiveSync = () => {
      if (selectedProjectId) {
        fetchTeam(selectedProjectId, teamSize);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("workforce_iq_live_sync", handleLiveSync);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("workforce_iq_live_sync", handleLiveSync);
      }
    };
  }, [selectedProjectId, teamSize]);

  const loadProjects = async (preferredProjId?: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (res.ok) {
        const projs = await res.json();
        setProjects(projs);
        if (projs.length > 0) {
          const targetId = preferredProjId || projs[0].id;
          setSelectedProjectId(targetId);
          fetchTeam(targetId, teamSize);
        }
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  };

  const fetchTeam = async (projId: number, size: number) => {
    setLoading(true);
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
        setRecommendation(data);
        
        if (data.overall_team_readiness >= 75) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#2563EB', '#60A5FA', '#F3EFE6']
          });
        }
      }
    } catch (err) {
      console.error("Failed to generate team match:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (id: number) => {
    setSelectedProjectId(id);
    fetchTeam(id, teamSize);
  };

  // Dynamic DB State Change: Assign recommended squad to project
  const handleAssignSquad = async () => {
    if (!recommendation || recommendation.selected_team.length === 0) return;

    setAssigning(true);
    try {
      const empIds = recommendation.selected_team.map((c) => c.employee_id);
      const res = await fetch(`${API_BASE}/api/assign-squad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProjectId,
          employee_ids: empIds,
          hours_per_member: 18,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAssignedSuccessMsg(data.message);

        // Multi-colored celebratory confetti
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10B981', '#2563EB', '#F59E0B']
        });

        // Re-fetch match to immediately show updated hours, status shifts, and availability scores
        setTimeout(() => {
          fetchTeam(selectedProjectId, teamSize);
        }, 600);

        setTimeout(() => {
          setAssignedSuccessMsg(null);
        }, 6000);
      }
    } catch (err) {
      console.error("Failed to assign squad:", err);
    } finally {
      setAssigning(false);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Toast Notification of Live SQLite State Change */}
      <AnimatePresence>
        {assignedSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 px-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs md:text-sm font-bold shadow-clay-card flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <CheckCheck className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <div className="font-black text-emerald-900 uppercase text-xs">Live SQLite State Shifted</div>
              <p className="font-medium">{assignedSuccessMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-scarlet/10 text-scarlet font-bold text-xs shadow-clay-pill mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scenario A • Squad-Level Optimization & Skill Synthesis</span>
          </div>
          <h1 className="text-3xl font-black text-charcoal tracking-tight">
            Smart Team Formation
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs md:text-sm font-medium text-charcoal-muted">
              Algorithmic squad solver optimizing team skill coverage and availability.
            </p>
            <button
              onClick={() => setMethodologyOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-scarlet hover:text-scarlet-dark transition-colors px-2 py-0.5 rounded bg-scarlet/5 border border-scarlet/20 hover:bg-scarlet/10 cursor-pointer"
              title="Click to view algorithmic scoring model details"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Scoring Methodology</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchTeam(selectedProjectId, teamSize)}
            disabled={loading}
            className="clay-btn-primary px-5 py-2.5 text-xs md:text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Optimizing Squad..." : "Recalculate Squad"}</span>
          </button>
        </div>
      </div>

      {/* Clay Configuration Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay-card p-6 md:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Project Dropdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
                1. Target Project
              </label>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-scarlet/10 text-scarlet">
                {currentProject?.status}
              </span>
            </div>
            <div className="clay-inset p-2">
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(Number(e.target.value))}
                className="w-full bg-transparent text-xs font-bold text-charcoal focus:outline-none cursor-pointer py-1 px-2"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name} ({proj.required_experience}y+ Exp)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Squad Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider">
                2. Target Squad Size
              </label>
              <span className="text-xs font-black text-scarlet px-2 py-0.5 rounded-full bg-scarlet/10">
                {teamSize} Members
              </span>
            </div>
            <div className="clay-inset p-3 flex items-center gap-3">
              <input
                type="range"
                min={2}
                max={5}
                value={teamSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTeamSize(val);
                  fetchTeam(selectedProjectId, val);
                }}
                className="w-full accent-scarlet cursor-pointer"
              />
              <span className="text-xs font-bold text-charcoal-muted">5 Max</span>
            </div>
          </div>

          {/* Experience Barometer */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              3. Experience Threshold
            </label>
            <div className="clay-inset p-3.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal-muted">Required Level:</span>
              <span className="text-xs font-black text-charcoal bg-white px-3 py-1 rounded-full shadow-clay-pill">
                {currentProject?.required_experience} Years Min
              </span>
            </div>
          </div>
        </div>

        {/* Project Technical Specifications Pill Bar */}
        {currentProject && (
          <div className="pt-4 border-t border-charcoal/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-charcoal">Required Competencies:</span>
              {currentProject.required_skills.map((s, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-full bg-white text-charcoal font-bold shadow-clay-pill border border-charcoal/5"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Deploy Squad Action Button with Invalid Deployment Enforcement */}
            <div className="flex items-center gap-3">
              {recommendation && recommendation.missing_team_competencies.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Resolve {recommendation.missing_team_competencies.length} critical skill gap{recommendation.missing_team_competencies.length > 1 ? "s" : ""} before deploying</span>
                  </span>
                  <button
                    disabled={true}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-charcoal/15 text-charcoal/40 border border-charcoal/10 cursor-not-allowed flex items-center gap-2"
                    title="All required competencies must be covered before deployment"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Deploy Squad</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAssignSquad}
                  disabled={assigning || !recommendation}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>{assigning ? "Updating Database..." : "Deploy Squad to Project"}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>


      {/* Key Metrics Banner */}
      {recommendation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <motion.div
            whileHover={{ y: -3 }}
            className="clay-card p-6 flex items-center justify-between border-b-4 border-b-scarlet"
          >
            <div>
              <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
                Overall Team Readiness
              </span>
              <div className="text-3xl font-black text-scarlet mt-1">
                {recommendation.overall_team_readiness}%
              </div>
              <p className="text-[11px] font-medium text-charcoal-muted mt-1">
                Blended skill depth, capacity & experience
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-scarlet/10 flex items-center justify-center text-scarlet shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Card 2: Average Experience & Bandwidth (Replacing redundant Selected Squad count) */}
          <motion.div
            whileHover={{ y: -3 }}
            className="clay-card p-6 flex items-center justify-between border-b-4 border-b-charcoal"
          >
            <div>
              <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
                Average Experience & Bandwidth
              </span>
              <div className="text-2xl font-black text-charcoal mt-1 flex items-baseline gap-2">
                <span>
                  {recommendation.selected_team.length > 0
                    ? (recommendation.selected_team.reduce((a, b) => a + b.experience_years, 0) / recommendation.selected_team.length).toFixed(1)
                    : "0.0"}y Exp
                </span>
                <span className="text-xs font-bold text-charcoal/60">
                  • {recommendation.selected_team.reduce((a, b) => a + b.available_hours, 0)}h Free
                </span>
              </div>
              <p className="text-[11px] font-medium text-charcoal-muted mt-1">
                Seniority baseline & collective weekly availability
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-charcoal/5 flex items-center justify-center text-charcoal shadow-clay-pill">
              <Clock className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Card 3: Skill Gap Warnings + Auto-Resolve Action */}
          <motion.div
            whileHover={{ y: -3 }}
            className="clay-card p-6 flex items-center justify-between border-b-4 border-b-rose-500"
          >
            <div>
              <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
                Skill Gap Warnings
              </span>
              <div className="text-base font-black mt-1 flex flex-wrap items-center gap-2">
                {recommendation.missing_team_competencies.length === 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" /> 100% Core Skill Match
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-rose-600 font-extrabold text-sm">
                      Missing: {recommendation.missing_team_competencies.join(", ")}
                    </span>
                    {/* Auto-Resolve Button */}
                    <button
                      onClick={() => handleAutoResolveGap(recommendation.missing_team_competencies[0])}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Auto-swap squad member to achieve 100% skill coverage"
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>Auto-swap to cover {recommendation.missing_team_competencies[0]}</span>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[11px] font-medium text-charcoal-muted mt-1">
                Competencies required by project scope
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-clay-pill">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Selected Squad Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-charcoal flex items-center gap-2">
            <Award className="w-5 h-5 text-scarlet" />
            Recommended Squad Roster
          </h2>
          <span className="text-xs font-bold text-charcoal-muted">
            Ranked by multi-factor composite heuristic
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {recommendation?.selected_team.map((cand, idx) => (
              <motion.div
                key={cand.employee_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="clay-card p-6 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Rank Badge & Fit Label */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-scarlet text-white font-black text-sm flex items-center justify-center shadow-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-charcoal leading-snug">{cand.name}</h3>
                        <p className="text-xs text-charcoal-muted font-medium">{cand.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-scarlet">
                        {cand.match_score}%
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-scarlet/10 text-scarlet">
                        {cand.fit_assessment}
                      </span>
                    </div>
                  </div>

                  {/* Warning Notice if Overloaded */}
                  {cand.warning && (
                    <div className="mt-3.5 p-2 px-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>{cand.warning}</span>
                    </div>
                  )}


                  {/* Sub-Score Breakdown with Interactive Contribution Micro-Bars */}
                  <div
                    onMouseEnter={() => setHoveredCandidateId(cand.employee_id)}
                    onMouseLeave={() => setHoveredCandidateId(null)}
                    className="mt-4 p-3 rounded-lg bg-ivory border border-charcoal/10 space-y-2 cursor-help"
                    title="Hover to view exact points contribution out of 100"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-charcoal-muted">
                      <span>Score Contribution Breakdown</span>
                      <span className="text-scarlet font-mono font-black">{cand.match_score} / 100 pts</span>
                    </div>

                    {/* Stacked Micro-Bars */}
                    <div className="w-full h-2 rounded-full bg-charcoal/10 flex overflow-hidden">
                      <div
                        className="bg-scarlet h-full transition-all duration-300"
                        style={{ width: `${(cand.skill_match_score * 0.5)}%` }}
                        title={`Skill Match: ${(cand.skill_match_score * 0.5).toFixed(1)} / 50 pts`}
                      ></div>
                      <div
                        className="bg-charcoal h-full transition-all duration-300"
                        style={{ width: `${(cand.experience_score * 0.25)}%` }}
                        title={`Experience: ${(cand.experience_score * 0.25).toFixed(1)} / 25 pts`}
                      ></div>
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${(cand.availability_score * 0.25)}%` }}
                        title={`Availability: ${(cand.availability_score * 0.25).toFixed(1)} / 25 pts`}
                      ></div>
                    </div>

                    {/* Explanatory Legend / Micro Stats */}
                    <div className="grid grid-cols-3 gap-1 pt-1 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-scarlet shrink-0"></span>
                        <span className="text-charcoal-muted truncate">
                          Skill: <strong className="text-charcoal">{(cand.skill_match_score * 0.5).toFixed(1)}p</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-charcoal shrink-0"></span>
                        <span className="text-charcoal-muted truncate">
                          Exp: <strong className="text-charcoal">{(cand.experience_score * 0.25).toFixed(1)}p</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="text-charcoal-muted truncate">
                          Avail: <strong className="text-charcoal">{(cand.availability_score * 0.25).toFixed(1)}p</strong>
                        </span>
                      </div>
                    </div>

                    {hoveredCandidateId === cand.employee_id && (
                      <div className="text-[10px] text-charcoal/70 pt-1 border-t border-charcoal/5 leading-snug">
                        {cand.skill_match_score}% of required skills matched • {cand.experience_years}y tenure • {cand.utilization_pct}% capacity
                      </div>
                    )}
                  </div>


                  {/* Skill Badges */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-bold text-charcoal-muted uppercase block">
                      Matched Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cand.matched_skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                          {skill}
                        </span>
                      ))}
                    </div>

                    {cand.missing_skills.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] text-charcoal-muted font-semibold block">Missing:</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {cand.missing_skills.map((mSkill, mIdx) => (
                            <span
                              key={mIdx}
                              className="text-[9px] px-2 py-0.5 rounded-full bg-charcoal/5 text-charcoal-muted font-medium"
                            >
                              {mSkill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer with Direct Interactive Assignment */}
                <div className="mt-5 pt-3 border-t border-charcoal/10 flex items-center justify-between text-xs">
                  <span className="text-charcoal-muted font-medium truncate max-w-[140px]">
                    {cand.email}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        cand.status === "Available"
                          ? "bg-emerald-100 text-emerald-700"
                          : cand.status === "Partially Allocated"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {cand.status}
                    </span>
                    <button
                      onClick={() => {
                        if (!recommendation) return;
                        if (recommendation.selected_team.length <= 1) {
                          alert("A squad must contain at least 1 specialist.");
                          return;
                        }
                        const currentIds = new Set(recommendation.selected_team.map((m) => m.employee_id));
                        const replacement = recommendation.all_ranked_candidates.find(
                          (c) => !currentIds.has(c.employee_id)
                        );
                        if (replacement) {
                          handleSwapMember(cand.employee_id, replacement);
                        } else {
                          const updated = recommendation.selected_team.filter((m) => m.employee_id !== cand.employee_id);
                          setRecommendation({ ...recommendation, selected_team: updated });
                        }
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold text-charcoal/70 bg-charcoal/5 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-all flex items-center gap-1 border border-charcoal/10 cursor-pointer"
                      title="Remove candidate and swap with next best specialist"
                    >
                      <UserMinus className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Complete Pool Matrix */}
      <div className="clay-card p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-charcoal flex items-center gap-2">
              <Layers className="w-4 h-4 text-scarlet" />
              Full Talent Matrix Ranking
            </h3>
            <span className="text-xs font-bold text-charcoal-muted">All active staff evaluated against project criteria</span>
          </div>

          {/* Filter out Busy Staff Toggle */}
          <div className="flex items-center gap-2 bg-ivory p-2 px-3 rounded-lg border border-charcoal/10">
            <Filter className="w-3.5 h-3.5 text-charcoal-muted" />
            <label className="text-xs font-bold text-charcoal flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideOverallocated}
                onChange={(e) => setHideOverallocated(e.target.checked)}
                className="rounded text-scarlet focus:ring-scarlet/30 cursor-pointer"
              />
              <span>Hide Overallocated (&gt;80%)</span>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="clay-inset text-charcoal-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Match Score</th>
                <th className="py-3 px-4">Workload</th>
                <th className="py-3 px-4">Matching Competencies</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Direct Swap Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5 font-medium text-charcoal">
              {recommendation?.all_ranked_candidates
                .filter((cand) => !hideOverallocated || cand.utilization_pct <= 80)
                .map((cand) => {
                  const isInSquad = recommendation.selected_team.some(
                    (m) => m.employee_id === cand.employee_id
                  );

                  return (
                    <tr
                      key={cand.employee_id}
                      className={`hover:bg-ivory-100/60 transition-colors ${
                        isInSquad ? "bg-scarlet/5 font-semibold" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-charcoal">
                        <div className="flex items-center gap-1.5">
                          {cand.name}
                          {isInSquad && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-scarlet text-white">
                              In Squad
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-charcoal-muted">{cand.role}</td>
                      <td className="py-3 px-4">{cand.experience_years} Years</td>
                      <td className="py-3 px-4 font-black text-scarlet">{cand.match_score}%</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-charcoal/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cand.utilization_pct > 85
                                  ? "bg-rose-500"
                                  : cand.utilization_pct < 40
                                  ? "bg-emerald-500"
                                  : "bg-scarlet"
                              }`}
                              style={{ width: `${Math.min(cand.utilization_pct, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-bold">{cand.utilization_pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {cand.matched_skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-white text-charcoal font-semibold shadow-clay-pill"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cand.status === "Available"
                              ? "bg-emerald-100 text-emerald-700"
                              : cand.status === "Partially Allocated"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {cand.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isInSquad ? (
                          <span className="text-[11px] text-charcoal-muted font-bold italic">
                            Active in Squad
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            {recommendation.selected_team.map((squadMember, sIdx) => (
                              <button
                                key={squadMember.employee_id}
                                onClick={() => handleSwapMember(squadMember.employee_id, cand)}
                                className="px-2 py-1 text-[10px] font-bold rounded bg-white hover:bg-scarlet hover:text-white border border-charcoal/10 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                                title={`Swap with #${sIdx + 1} (${squadMember.name})`}
                              >
                                <ArrowLeftRight className="w-2.5 h-2.5" />
                                <span>Swap #{sIdx + 1}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>


      {/* Scoring Methodology Modal */}
      <AnimatePresence>
        {methodologyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="clay-card bg-white max-w-xl w-full p-6 md:p-8 space-y-5 shadow-clay-lg relative border border-charcoal/10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-charcoal/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-scarlet/10 text-scarlet flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-charcoal">
                      Scoring & Selection Methodology
                    </h3>
                    <p className="text-xs text-charcoal-muted">
                      Mathematical criteria for squad synthesis & candidate ranking
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMethodologyOpen(false)}
                  className="p-1 rounded-lg text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs md:text-sm text-charcoal/80 leading-relaxed">
                <div className="p-3.5 rounded-lg bg-ivory border border-charcoal/10 space-y-1">
                  <div className="font-bold text-charcoal flex items-center justify-between">
                    <span>1. Skill Coverage (50% Weight)</span>
                    <span className="text-scarlet font-black">50 pts max</span>
                  </div>
                  <p className="text-xs text-charcoal-muted">
                    Ratio of project required skills matched by candidate proficiencies: <br />
                    <code className="text-charcoal font-semibold">(skills_matched / skills_required) × 50</code>
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-ivory border border-charcoal/10 space-y-1">
                  <div className="font-bold text-charcoal flex items-center justify-between">
                    <span>2. Strict Experience Threshold (25% Weight)</span>
                    <span className="text-scarlet font-black">25 pts max</span>
                  </div>
                  <p className="text-xs text-charcoal-muted">
                    Engineers meeting or exceeding required tenure receive full points. Candidates below the threshold receive strict sub-linear penalties to prevent under-qualified staff from ranking #1.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-ivory border border-charcoal/10 space-y-1">
                  <div className="font-bold text-charcoal flex items-center justify-between">
                    <span>3. Hard Burnout Filter & Availability (25% Weight)</span>
                    <span className="text-scarlet font-black">25 pts max</span>
                  </div>
                  <p className="text-xs text-charcoal-muted">
                    Personnel with &gt;85% workload receive zero availability points and are disqualified from auto-selection squads to prevent organizational burnout.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center justify-between">
                    <span>4. Squad-Level Optimization (Whole Team Cover)</span>
                    <span className="text-emerald-700 font-bold">Combinatorial Cover</span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Rather than picking isolated individuals, the engine executes a greedy set-cover to guarantee all project competencies (e.g. React, Cloud, Python) are satisfied across the assembled squad.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setMethodologyOpen(false)}
                  className="px-5 py-2 rounded-lg bg-charcoal text-white text-xs font-bold hover:bg-charcoal-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CRUD Modal */}
      <CreateEntityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEmployeeCreated={() => fetchTeam(selectedProjectId, teamSize)}
        onProjectCreated={(newId) => loadProjects(newId)}
      />
    </main>

  );
}
