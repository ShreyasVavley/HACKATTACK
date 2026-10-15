"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Users,
  Flame,
  Award,
  BarChart3,
  Layers,
  Cpu,
  Bot,
  Plus
} from "lucide-react";
import CreateEntityModal from "./CreateEntityModal";
import RealtimeNotificationCenter from "./RealtimeNotificationCenter";

export default function Navigation() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  const navItems = [
    { name: "Overview Hub", href: "/", icon: Layers },
    { name: "Smart Team Formation", href: "/team-formation", icon: Users, badge: "Scenario A" },
    { name: "Workload Balancing", href: "/workload-balancing", icon: Flame, badge: "Scenario B" },
    { name: "Capacity Simulation", href: "/simulation", icon: Cpu, badge: "What-If" },
    { name: "AI Talent Copilot", href: "/copilot", icon: Bot, badge: "AI Assistant" },
    { name: "Skill Gap & Training", href: "/skill-gap", icon: Award },
    { name: "Talent Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 px-4 md:px-6 py-2.5 backdrop-blur-md bg-ivory/90 border-b border-charcoal/10 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-scarlet-light via-scarlet to-scarlet-dark p-0.5 shadow-sm flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[6px] bg-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-scarlet animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-charcoal">
                  WorkforceIQ
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-scarlet/10 text-scarlet border border-scarlet/20">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] font-bold text-charcoal-muted hidden sm:block">
                Intelligent Workforce Platform
              </p>
            </div>
          </Link>

          {/* Single-Line Navigation */}
          <nav className="flex items-center gap-1 p-1 bg-ivory-card rounded-lg shadow-xs border border-charcoal/10 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? "text-white bg-scarlet shadow-xs"
                      : "text-charcoal-muted hover:text-charcoal hover:bg-ivory-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-charcoal-muted"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions (Integrated right in the top bar) */}
          <div className="flex items-center gap-2 shrink-0">
            <RealtimeNotificationCenter />

            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-charcoal hover:bg-charcoal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap"
              title="Create custom specialist or project"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Record</span>
            </button>
          </div>
        </div>
      </header>

      <CreateEntityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEmployeeCreated={() => window.location.reload()}
        onProjectCreated={() => window.location.reload()}
      />
    </>
  );
}
