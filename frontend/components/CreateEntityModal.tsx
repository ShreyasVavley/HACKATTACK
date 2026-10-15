"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, UserPlus, Briefcase, CheckCircle2, Sparkles } from "lucide-react";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated?: () => void;
  onProjectCreated?: (newProjId?: number) => void;
}

import { API_BASE } from "../lib/api";

export default function CreateEntityModal({
  isOpen,
  onClose,
  onEmployeeCreated,
  onProjectCreated,
}: CreateModalProps) {
  const [activeTab, setActiveTab] = useState<"employee" | "project">("employee");

  // Employee Form State
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [empSkills, setEmpSkills] = useState("");
  const [empExp, setEmpExp] = useState(4.0);
  const [empHours, setEmpHours] = useState(12);

  // Project Form State
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projSkills, setProjSkills] = useState("");
  const [projExp, setProjExp] = useState(3.5);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const skillsArray = empSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skillsArray.length === 0) {
      setErrorMsg("Please specify at least 1 technical skill (comma-separated).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: empName,
          email: empEmail || `${empName.toLowerCase().replace(/\s+/g, ".")}@workforceiq.internal`,
          role: empRole || "Senior Software Engineer",
          skills: skillsArray,
          experience_years: Number(empExp),
          max_hours: 40,
          current_workload_hours: Number(empHours),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create employee");
      }

      setSuccessMsg(`✓ Specialist "${empName}" created and added to talent pool!`);
      setTimeout(() => {
        setSuccessMsg(null);
        if (onEmployeeCreated) onEmployeeCreated();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const skillsArray = projSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skillsArray.length === 0) {
      setErrorMsg("Please specify at least 1 required skill (comma-separated).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projName,
          description: projDesc || "Initiative requiring strategic engineering capabilities.",
          required_skills: skillsArray,
          required_experience: Number(projExp),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create project");
      }

      const newProj = await res.json();
      setSuccessMsg(`✓ Project "${projName}" created! Triggering real-time match engine...`);
      setTimeout(() => {
        setSuccessMsg(null);
        if (onProjectCreated) onProjectCreated(newProj.id);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="clay-card p-6 md:p-8 w-full max-w-lg bg-white relative shadow-clay-card"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal hover:bg-ivory-300 transition-colors shadow-clay-pill"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-scarlet/10 text-scarlet text-[11px] font-bold shadow-clay-pill mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive CRUD Operations</span>
          </div>
          <h2 className="text-xl font-black text-charcoal tracking-tight">
            Add Entity into Live SQLite Database
          </h2>
          <p className="text-xs text-charcoal-muted font-medium mt-0.5">
            Watch the algorithmic engine update talent scores and heatmaps in real-time.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-ivory-200 rounded-full shadow-clay-inset mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("employee")}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "employee"
                ? "bg-white text-scarlet shadow-clay-pill"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Employee</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("project")}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "project"
                ? "bg-white text-scarlet shadow-clay-pill"
                : "text-charcoal-muted hover:text-charcoal"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Employee Form */}
        {activeTab === "employee" && (
          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-charcoal block mb-1">Full Name</label>
              <div className="clay-inset p-2 px-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-charcoal block mb-1">Primary Role</label>
                <div className="clay-inset p-2 px-3">
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI / ML Engineer"
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-charcoal block mb-1">Email</label>
                <div className="clay-inset p-2 px-3">
                  <input
                    type="email"
                    placeholder="e.g. maya.lin@workforceiq.internal"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal block mb-1">
                Technical Skills (comma-separated)
              </label>
              <div className="clay-inset p-2 px-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, Machine Learning, Cloud Computing, PyTorch"
                  value={empSkills}
                  onChange={(e) => setEmpSkills(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-charcoal block mb-1">
                  Experience ({empExp} Yrs)
                </label>
                <div className="clay-inset p-2 px-3">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={empExp}
                    onChange={(e) => setEmpExp(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal block mb-1">
                  Initial Workload ({empHours}h/40h)
                </label>
                <div className="clay-inset p-2 px-3">
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={empHours}
                    onChange={(e) => setEmpHours(Number(e.target.value))}
                    className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clay-btn-primary w-full py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? "Adding Employee..." : "Create Employee in DB"}</span>
            </button>
          </form>
        )}

        {/* Project Form */}
        {activeTab === "project" && (
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-charcoal block mb-1">Project Name</label>
              <div className="clay-inset p-2 px-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. Real-Time Fraud Detection Engine"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal block mb-1">Description</label>
              <div className="clay-inset p-2 px-3">
                <input
                  type="text"
                  placeholder="e.g. Low-latency streaming fraud analytics infrastructure."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal block mb-1">
                Required Technical Skills (comma-separated)
              </label>
              <div className="clay-inset p-2 px-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, Cloud Computing, Data Analytics, Java"
                  value={projSkills}
                  onChange={(e) => setProjSkills(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal block mb-1">
                Required Experience Threshold ({projExp} Yrs)
              </label>
              <div className="clay-inset p-2 px-3">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="15"
                  value={projExp}
                  onChange={(e) => setProjExp(Number(e.target.value))}
                  className="w-full bg-transparent text-xs font-semibold text-charcoal focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="clay-btn-primary w-full py-3 text-xs font-bold mt-2 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? "Adding Project..." : "Create Project & Trigger Match"}</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
