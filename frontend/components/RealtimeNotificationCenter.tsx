"use client";

import React, { useEffect, useState, useRef } from "react";
import { getWsUrl } from "@/lib/api";
import { Radio, Bell, CheckCircle2, Flame, UserPlus, FolderPlus, ArrowRightLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface LiveEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  data?: any;
}

export default function RealtimeNotificationCenter() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let socket: WebSocket;
    let reconnectTimeout: any;

    function connectWs() {
      try {
        const url = getWsUrl();
        socket = new WebSocket(url);
        wsRef.current = socket;

        socket.onopen = () => {
          setConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "CONNECTED" || data.type === "PONG") return;

            const newEvt: LiveEvent = {
              id: "evt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
              type: data.type,
              message: data.message || "Workforce State Mutation Synchronized",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              data: data
            };

            setEvents((prev) => [newEvt, ...prev.slice(0, 19)]); // Keep last 20 events
            setUnreadCount((c) => c + 1);

            // Optional: trigger custom window event for pages to refresh without full reload
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("workforce_iq_live_sync", { detail: data }));
            }
          } catch (e) {
            console.error("WS Parse error", e);
          }
        };

        socket.onclose = () => {
          setConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        socket.onerror = () => {
          setConnected(false);
          socket.close();
        };
      } catch (err) {
        console.error("WS connect failed", err);
        reconnectTimeout = setTimeout(connectWs, 3000);
      }
    }

    connectWs();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "EMPLOYEE_CREATED":
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case "PROJECT_CREATED":
        return <FolderPlus className="w-4 h-4 text-blue-600" />;
      case "SQUAD_DEPLOYED":
        return <CheckCircle2 className="w-4 h-4 text-scarlet" />;
      case "WORKLOAD_SHIFTED":
        return <ArrowRightLeft className="w-4 h-4 text-amber-600" />;
      default:
        return <Flame className="w-4 h-4 text-scarlet" />;
    }
  };

  return (
    <div className="relative">
      {/* Live Badge + Trigger */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        title="Live WebSocket Real-Time Synchronization Stream"
        className="clay-card px-2.5 py-1.5 rounded-full flex items-center gap-2 hover:scale-105 transition-all text-xs cursor-pointer shadow-clay-sm"
      >
        <span className="relative flex h-2.5 w-2.5">
          {connected ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-scarlet animate-pulse"></span>
          )}
        </span>
        <span className="font-extrabold text-[11px] text-charcoal flex items-center gap-1">
          {connected ? "LIVE SYNC" : "CONNECTING"}
        </span>

        {unreadCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-scarlet text-white text-[9px] font-black animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 md:w-96 clay-card bg-ivory/95 p-4 rounded-2xl shadow-clay-lg z-50 border border-white/80"
          >
            <div className="flex items-center justify-between pb-3 border-b border-charcoal/10">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-scarlet animate-pulse" />
                <span className="font-black text-xs uppercase tracking-wider text-charcoal">
                  Real-Time Broadcast Feed
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-charcoal/5 text-charcoal/60 hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-charcoal/60 py-2">
              WebSocket stream synchronized with SQLite state mutations.
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {events.length === 0 ? (
                <div className="p-4 text-center text-xs text-charcoal/50">
                  Awaiting real-time events. Try adding an employee, shifting workload, or deploying a squad!
                </div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-xl bg-white/80 border border-charcoal/10 text-xs shadow-sm flex items-start gap-2.5"
                  >
                    <div className="p-1 rounded-lg bg-charcoal/5 shrink-0 mt-0.5">
                      {getEventIcon(evt.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-charcoal text-xs leading-snug">
                        {evt.message}
                      </p>
                      <span className="text-[10px] text-charcoal/50 mt-1 block">
                        {evt.timestamp} • {evt.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {events.length > 0 && (
              <div className="pt-2 border-t border-charcoal/10 flex justify-end">
                <button
                  onClick={() => setEvents([])}
                  className="text-[10px] font-bold text-charcoal/60 hover:text-scarlet transition-colors"
                >
                  Clear Feed
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
