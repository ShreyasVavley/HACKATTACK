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
  Plus
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
            <span>Scenario A • Algorithmic Matching & Dynamic State Shifts</span>
          </div>
          <h1 className="text-3xl font-black text-charcoal tracking-tight">
            Smart Team Formation
          </h1>
          <p className="text-xs md:text-sm font-medium text-charcoal-muted mt-1">
            Real-time scoring: <code className="bg-ivory-200 px-2 py-0.5 rounded font-mono text-scarlet font-bold">(skills_matched / skills_required * 50) + (experience * 25) + (availability * 25)</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="clay-btn-secondary px-5 py-3 text-xs md:text-sm font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-scarlet" />
            <span>Add Custom Entity</span>
          </button>

          <button
            onClick={() => fetchTeam(selectedProjectId, teamSize)}
            disabled={loading}
            className="clay-btn-primary px-6 py-3 text-xs md:text-sm font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Matching..." : "Recalculate Match"}</span>
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

            {/* Deploy Squad Action Button */}
            <button
              onClick={handleAssignSquad}
              disabled={assigning || !recommendation}
              className="clay-btn-primary px-6 py-2.5 text-xs font-black flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 shadow-clay-btn"
            >
              <UserCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{assigning ? "Updating Database..." : "Deploy Squad to Project"}</span>
            </button>
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
            <div className="w-12 h-12 rounded-2xl bg-scarlet/10 flex items-center justify-center text-scarlet shadow-clay-pill">
              <TrendingUp className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="clay-card p-6 flex items-center justify-between border-b-4 border-b-charcoal"
          >
            <div>
              <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
                Selected Squad
              </span>
              <div className="text-3xl font-black text-charcoal mt-1">
                {recommendation.selected_team.length} Specialists
              </div>
              <p className="text-[11px] font-medium text-charcoal-muted mt-1">
                Ranked optimal candidate mix
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-charcoal/5 flex items-center justify-center text-charcoal shadow-clay-pill">
              <Users className="w-6 h-6" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="clay-card p-6 flex items-center justify-between border-b-4 border-b-rose-500"
          >
            <div>
              <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
                Skill Gap Warnings
              </span>
              <div className="text-xl font-black mt-1">
                {recommendation.missing_team_competencies.length === 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" /> 100% Core Skill Match
                  </span>
                ) : (
                  <span className="text-rose-600 text-base font-extrabold">
                    {recommendation.missing_team_competencies.join(", ")}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-charcoal-muted mt-1">
                Missing competencies across squad
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-clay-pill">
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
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-scarlet to-scarlet-dark text-white font-black text-sm flex items-center justify-center shadow-clay-btn">
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
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-scarlet/10 text-scarlet">
                        {cand.fit_assessment}
                      </span>
                    </div>
                  </div>

                  {/* Warning Notice if Overloaded */}
                  {cand.warning && (
                    <div className="mt-3.5 p-2 px-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>{cand.warning}</span>
                    </div>
                  )}

                  {/* Sub-Score Breakdown Chips */}
                  <div className="mt-4 grid grid-cols-3 gap-2 clay-inset p-3 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-charcoal-muted font-bold block uppercase">Skill (50%)</span>
                      <span className="font-black text-scarlet">{cand.skill_match_score}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal-muted font-bold block uppercase">Exp (25%)</span>
                      <span className="font-black text-charcoal">{cand.experience_years}y</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-charcoal-muted font-bold block uppercase">Load (25%)</span>
                      <span
                        className={`font-black ${
                          cand.utilization_pct > 85
                            ? "text-rose-600"
                            : cand.utilization_pct < 40
                            ? "text-emerald-600"
                            : "text-scarlet"
                        }`}
                      >
                        {cand.utilization_pct}%
                      </span>
                    </div>
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
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_BASE}/api/assign-squad`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              project_id: selectedProjectId,
                              employee_ids: [cand.employee_id],
                              hours_per_member: 12,
                            }),
                          });
                          if (res.ok) {
                            setAssignedSuccessMsg(`✓ Specialist "${cand.name}" allocated 12h to project in SQLite!`);
                            fetchTeam(selectedProjectId, teamSize);
                            setTimeout(() => setAssignedSuccessMsg(null), 4000);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="clay-btn-secondary px-2.5 py-1 text-[10px] font-bold text-scarlet hover:bg-scarlet hover:text-white transition-all shadow-clay-pill"
                    >
                      + Assign
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
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-charcoal flex items-center gap-2">
            <Layers className="w-4 h-4 text-scarlet" />
            Full Talent Matrix Ranking
          </h3>
          <span className="text-xs font-bold text-charcoal-muted">All active staff ranked against project</span>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5 font-medium text-charcoal">
              {recommendation?.all_ranked_candidates.map((cand) => (
                <tr key={cand.employee_id} className="hover:bg-ivory-100/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-charcoal">{cand.name}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
