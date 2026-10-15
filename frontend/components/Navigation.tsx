"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  Flame,
  Award,
  BarChart3,
  Layers,
  ArrowUpRight
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview Hub", href: "/", icon: Layers },
    { name: "Smart Team Formation", href: "/team-formation", icon: Users, badge: "Scenario A" },
    { name: "Workload Balancing", href: "/workload-balancing", icon: Flame, badge: "Scenario B" },
    { name: "Skill Gap & Training", href: "/skill-gap", icon: Award },
    { name: "Talent Directory & Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 md:px-8 py-4 backdrop-blur-md bg-ivory/80 border-b border-white/60">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-scarlet-light via-scarlet to-scarlet-dark p-0.5 shadow-clay-pill flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-scarlet animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-charcoal">
                WorkforceIQ
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-scarlet/10 text-scarlet border border-scarlet/20">
                Clay 3D
              </span>
            </div>
            <p className="text-xs font-semibold text-charcoal-muted">
              Intelligent Workforce Planning Platform
            </p>
          </div>
        </Link>

        {/* Multi-Page Navigation Links */}
        <nav className="flex flex-wrap items-center gap-2 p-1.5 bg-ivory-card rounded-clay-full shadow-clay-pill border border-white/90">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "text-white bg-gradient-to-r from-scarlet to-scarlet-dark shadow-clay-btn scale-[1.03]"
                    : "text-charcoal-muted hover:text-charcoal hover:bg-white/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-charcoal-muted"}`} />
                <span>{item.name}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                      isActive ? "bg-white/20 text-white" : "bg-scarlet/10 text-scarlet"
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
    </header>
  );
}
