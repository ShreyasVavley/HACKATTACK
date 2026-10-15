"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Users,
  Flame,
  Award,
  Layers,
  BarChart3,
  Plus,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import CreateEntityModal from "./CreateEntityModal";
import RealtimeNotificationCenter from "./RealtimeNotificationCenter";

export default function SidebarNavigation() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  // Strictly the 3 core problem scenarios + Overview Hub
  const primaryNavItems = [
    {
      name: "Overview Hub",
      href: "/",
      icon: Layers,
      description: "Executive workforce overview",
    },
    {
      name: "Smart Team Formation",
      href: "/team-formation",
      icon: Users,
      badge: "Scenario A",
      description: "Skills, tenure & availability matching",
    },
    {
      name: "Workload Balancing",
      href: "/workload-balancing",
      icon: Flame,
      badge: "Scenario B",
      description: "Capacity analysis & task reallocation",
    },
    {
      name: "Skill Gap & Training",
      href: "/skill-gap",
      icon: Award,
      badge: "Upskilling",
      description: "Missing skills & training pathways",
    },
  ];

  return (
    <>
      <aside className="w-68 bg-white border-r border-charcoal/10 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30 select-none shadow-xs">
        {/* Top Section: Logo & Brand */}
        <div className="flex flex-col">
          <div className="p-5 border-b border-charcoal/10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-scarlet-light via-scarlet to-scarlet-dark p-0.5 shadow-xs flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full rounded-[6px] bg-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-scarlet" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-charcoal">
                    WorkforceIQ
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-scarlet/10 text-scarlet border border-scarlet/20">
                    Enterprise
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-charcoal-muted">
                  Resource Planning & Staffing Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Action Button */}
          <div className="p-4 border-b border-charcoal/5">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full px-3 py-2 rounded-lg bg-scarlet hover:bg-scarlet-dark text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create New Record</span>
            </button>
          </div>

          {/* Vertical Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto">
            <span className="text-[10px] uppercase font-black tracking-wider text-charcoal-muted px-3 py-2 block">
              Core Modules
            </span>

            {primaryNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 group ${
                    isActive
                      ? "bg-charcoal text-white shadow-xs"
                      : "text-charcoal-muted hover:text-charcoal hover:bg-ivory-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-scarlet-light" : "text-charcoal-muted group-hover:text-charcoal"
                      }`}
                    />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 ml-1.5 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-scarlet/10 text-scarlet border border-scarlet/20"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Real-time Live Sync & Status */}
        <div className="p-4 border-t border-charcoal/10 bg-ivory/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
              Live Engine
            </span>
            <RealtimeNotificationCenter />
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-charcoal/10 shadow-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[10px] leading-tight text-charcoal-muted">
              <span className="font-bold text-charcoal block">Active SQLite Database</span>
              Multi-factor Optimization
            </div>
          </div>
        </div>
      </aside>

      <CreateEntityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onEmployeeCreated={() => window.location.reload()}
        onProjectCreated={() => window.location.reload()}
      />
    </>
  );
}
