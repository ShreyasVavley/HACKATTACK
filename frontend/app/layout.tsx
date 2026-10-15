import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
  title: "Workforce Intelligence Platform — AI Workforce Planning & Talent Optimization",
  description: "Enterprise-grade intelligent talent planning, workload balancing, and skill-gap optimization platform (WorkforceIQ).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-ivory text-charcoal min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1">
          {children}
        </div>
        <footer className="border-t border-white/80 bg-ivory-card/80 backdrop-blur-md py-6 px-6 text-xs text-charcoal-muted mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-scarlet shadow-clay-pill"></span>
              <span className="font-bold text-charcoal">
                Workforce Intelligence Platform (WorkforceIQ)
              </span>
            </div>
            <span className="font-semibold text-charcoal/60">
              Enterprise Workforce Intelligence • Ivory, Charcoal & Scarlet Palette • Multi-Module Engine
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
