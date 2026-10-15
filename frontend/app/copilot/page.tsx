"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/api";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RefreshCw,
  Search
} from "lucide-react";
import Link from "next/link";

interface CopilotMatch {
  id: number;
  name: string;
  role: string;
  skills: string[];
  experience_years: number;
  match_score: number;
  status: string;
  current_workload_hours: number;
  utilization_percent: number;
}

interface CopilotResponse {
  intent: string;
  answer: string;
  matched_count: number;
  matches: CopilotMatch[];
  suggestions: string[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  data?: CopilotResponse;
  suggestions?: string[];
  timestamp: string;
}

const QUICK_QUERIES = [
  "Find available engineers with Python and Cloud Computing",
  "Who is currently at risk of burnout (>85% workload)?",
  "Show me bench specialists with under 40% workload",
  "Recommend senior engineers with at least 5 years experience",
  "Find React frontend developers ready for deployment"
];

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      sender: "copilot",
      text: "Namaste! I am your AI Talent & Workforce Copilot. Ask me anything in natural language about your engineers, skill availability, burnout risks, or squad recommendations.",
      suggestions: QUICK_QUERIES,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const prompt = (queryText || inputText).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch(`${getApiUrl()}/api/ai-copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to process copilot query");
      }

      const copilotData: CopilotResponse = await res.json();

      const copilotMsg: ChatMessage = {
        id: "copilot-" + Date.now(),
        sender: "copilot",
        text: copilotData.answer,
        data: copilotData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "copilot-err-" + Date.now(),
          sender: "copilot",
          text: "I encountered an error querying the workforce intelligence engine. Please ensure the backend is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="clay-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-scarlet/10 text-scarlet mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Natural Language Workforce Copilot
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-charcoal">
            AI Talent & Squad <span className="text-scarlet">Copilot</span>
          </h1>
          <p className="text-charcoal/70 mt-1">
            Query your talent pool, identify bench capacity, diagnose burnout, and synthesize squads using conversational prompts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/team-formation"
            className="clay-button-secondary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            Team Formation <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/workload-balancing"
            className="clay-button text-xs px-4 py-2 flex items-center gap-1.5 text-white"
          >
            Workload Balancing <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Suggested Quick Queries */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60 px-1">
          Instant Queries (Click to Run):
        </span>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-xs font-medium px-3.5 py-2 rounded-xl bg-ivory border border-charcoal/10 text-charcoal/80 hover:text-scarlet hover:border-scarlet/40 hover:shadow-clay-sm transition-all duration-150 text-left cursor-pointer disabled:opacity-50"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "copilot" && (
              <div className="w-10 h-10 rounded-2xl bg-scarlet text-white flex items-center justify-center shrink-0 shadow-clay-sm">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-3xl space-y-4 ${
                msg.sender === "user"
                  ? "clay-card bg-charcoal text-white p-5 rounded-2xl rounded-tr-none"
                  : "clay-card p-6 rounded-2xl rounded-tl-none border-l-4 border-l-scarlet"
              }`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-charcoal/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${msg.sender === "user" ? "text-ivory/70" : "text-scarlet"}`}>
                    {msg.sender === "user" ? "Resource Manager" : "WorkforceIQ Copilot"}
                  </span>
                </div>
                <span className={`text-[10px] ${msg.sender === "user" ? "text-ivory/50" : "text-charcoal/40"}`}>
                  {msg.timestamp}
                </span>
              </div>

              {/* Message text */}
              <p className={`text-sm md:text-base leading-relaxed ${msg.sender === "user" ? "text-ivory" : "text-charcoal"}`}>
                {msg.text}
              </p>

              {/* If Copilot returned matching candidate cards */}
              {msg.data && msg.data.matches && msg.data.matches.length > 0 && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal/70 uppercase tracking-wider">
                      Identified Talent Candidates ({msg.data.matches.length}):
                    </span>
                    <span className="text-xs text-scarlet font-semibold">
                      Intent: {msg.data.intent}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {msg.data.matches.map((cand) => {
                      const isOverloaded = cand.utilization_percent >= 85;
                      const isBench = cand.utilization_percent < 40;

                      return (
                        <div
                          key={cand.id}
                          className="bg-white/80 p-3.5 rounded-xl border border-charcoal/10 shadow-sm space-y-2 hover:border-scarlet/40 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-charcoal text-sm flex items-center gap-1.5">
                                {cand.name}
                                {isOverloaded && (
                                  <Flame className="w-3.5 h-3.5 text-scarlet shrink-0" />
                                )}
                              </div>
                              <div className="text-xs text-charcoal/60">{cand.role}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-extrabold text-scarlet px-2 py-0.5 rounded-md bg-scarlet/10">
                                {Math.round(cand.match_score)}%
                              </span>
                              <div className="text-[10px] text-charcoal/50 mt-0.5">
                                {cand.experience_years}y exp
                              </div>
                            </div>
                          </div>

                          {/* Skill pills */}
                          <div className="flex flex-wrap gap-1">
                            {cand.skills.map((s, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-charcoal/5 text-charcoal/80 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Workload metric */}
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-charcoal/5">
                            <span className="text-charcoal/60">
                              Load: <strong className="text-charcoal">{cand.current_workload_hours}h</strong> ({cand.utilization_percent}%)
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                isOverloaded
                                  ? "bg-scarlet/15 text-scarlet"
                                  : isBench
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {cand.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {msg.data?.suggestions && msg.data.suggestions.length > 0 && (
                <div className="pt-2 border-t border-charcoal/10">
                  <span className="text-[11px] font-bold text-charcoal/60 uppercase tracking-wider block mb-1.5">
                    Recommended Follow-ups:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.data.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(sug)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-charcoal/5 hover:bg-scarlet/10 text-charcoal hover:text-scarlet transition-colors text-left"
                      >
                        ⚡ {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-10 h-10 rounded-2xl bg-charcoal text-ivory flex items-center justify-center shrink-0 shadow-clay-sm">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start items-center">
            <div className="w-10 h-10 rounded-2xl bg-scarlet text-white flex items-center justify-center shrink-0 shadow-clay-sm animate-pulse">
              <Bot className="w-5 h-5" />
            </div>
            <div className="clay-card p-4 rounded-2xl rounded-tl-none border-l-4 border-l-scarlet flex items-center gap-3">
              <RefreshCw className="w-4 h-4 animate-spin text-scarlet" />
              <span className="text-sm font-medium text-charcoal/70">
                WorkforceIQ engine is analyzing employee capacities and matching algorithms...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="clay-card p-3 md:p-4 sticky bottom-4 shadow-clay-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything... (e.g., 'Find 3 engineers with Cloud Computing under 30h workload')"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-ivory border border-charcoal/20 text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-scarlet/50 focus:border-scarlet font-medium text-sm transition-all"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="clay-button px-5 py-3 rounded-xl text-white font-bold flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
