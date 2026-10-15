"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Check
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  required_skills: string[];
  required_experience: number;
  status: string;
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

import { API_BASE } from "../../lib/api";

export default function SkillGapPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [gapData, setGapData] = useState<SkillGapData | null>(null);
  const [enrolledNotice, setEnrolledNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch(`${API_BASE}/api/projects`);
        if (res.ok) {
          const projs = await res.json();
          setProjects(projs);
          if (projs.length > 0) {
            setSelectedProjectId(projs[0].id);
            fetchSkillGap(projs[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    loadInitial();
  }, []);

  const fetchSkillGap = async (projId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/skill-gaps/${projId}`);
      if (res.ok) {
        setGapData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch skill gap:", err);
    }
  };

  const handleProjectSelect = (id: number) => {
    setSelectedProjectId(id);
    fetchSkillGap(id);
  };

  const handleEnroll = (course: string, skill: string) => {
    setEnrolledNotice(`Enrolled Talent into "${course}" for ${skill}!`);
    setTimeout(() => setEnrolledNotice(null), 4000);
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {enrolledNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 px-6 rounded-xl bg-scarlet-soft border border-scarlet/20 text-scarlet-dark text-xs font-bold shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-scarlet" />
            <span>{enrolledNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs shadow-clay-pill mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Skill Gaps & Recommended Training</span>
          </div>
          <h1 className="text-3xl font-black text-charcoal tracking-tight">
            Skill Gaps & Recommended Training
          </h1>
          <p className="text-xs md:text-sm font-medium text-charcoal-muted mt-1">
            Identify missing skills across projects and review suggested training pathways.
          </p>
        </div>

        {/* Project Selector */}
        <div className="clay-card p-2 px-4 flex items-center gap-3">
          <span className="text-xs font-bold text-charcoal-muted uppercase">Target Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectSelect(Number(e.target.value))}
            className="bg-transparent text-xs font-bold text-charcoal focus:outline-none cursor-pointer"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gap Analysis Summary Banner */}
      {gapData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -3 }} className="clay-card p-6 border-b-4 border-b-scarlet">
            <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
              Competency Coverage
            </span>
            <div className="text-4xl font-black text-scarlet mt-2">
              {gapData.coverage_percentage}%
            </div>
            <div className="w-full h-3 bg-white rounded-full mt-3 shadow-clay-inset overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-scarlet-light to-scarlet rounded-full transition-all duration-500"
                style={{ width: `${gapData.coverage_percentage}%` }}
              ></div>
            </div>
            <span className="text-[11px] font-medium text-charcoal-muted mt-2 block">
              {gapData.covered_skills.length} of {gapData.required_skills.length} required competencies verified
            </span>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="clay-card p-6 border-b-4 border-b-emerald-500">
            <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
              Covered Competencies
            </span>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {gapData.covered_skills.map((s, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1 shadow-clay-pill"
                >
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  {s}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="clay-card p-6 border-b-4 border-b-rose-500">
            <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
              Identified Skill Gaps
            </span>
            <div className="mt-3">
              {gapData.missing_skills.length === 0 ? (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> All required project skills covered
                </span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {gapData.missing_skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 flex items-center gap-1 shadow-clay-pill"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Recommended Upskilling Tracks Grid */}
      <div className="clay-card p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-black text-charcoal flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-scarlet" />
            Suggested Courses
          </h2>
          <p className="text-xs font-semibold text-charcoal-muted mt-0.5">
            Courses tailored to fill project skill gaps and advance team capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {gapData?.recommended_training.map((module, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="clay-inset p-5 rounded-xl flex flex-col justify-between space-y-4 h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-scarlet/10 text-scarlet border border-scarlet/20">
                    {module.skill}
                  </span>
                  <span className="text-xs font-semibold text-charcoal-muted flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-charcoal/5 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-scarlet" /> 4-6 Weeks
                  </span>
                </div>

                <h3 className="font-bold text-base text-charcoal leading-snug min-h-[44px] flex items-center">
                  {module.course}
                </h3>

                <div className="flex items-center gap-2 text-xs text-charcoal-muted font-medium">
                  <span>Accreditation Provider:</span>
                  <span className="text-charcoal font-bold">{module.provider}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-charcoal/10 flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-scarlet">Enterprise License Ready</span>
                <button
                  onClick={() => handleEnroll(module.course, module.skill)}
                  className="clay-btn-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Enroll Candidate</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
