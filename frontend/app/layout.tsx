import type { Metadata } from "next";
import "./globals.css";
import SidebarNavigation from "../components/SidebarNavigation";

export const metadata: Metadata = {
  title: "Workforce Intelligence Platform — Workforce Planning & Talent Optimization",
  description: "Enterprise-grade talent planning, workload balancing, and skill-gap optimization platform (WorkforceIQ).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-ivory text-charcoal min-h-screen flex">
        {/* Enterprise Vertical Left Sidebar */}
        <SidebarNavigation />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t border-charcoal/10 bg-white/70 backdrop-blur-md py-4 px-8 text-xs text-charcoal-muted mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-scarlet"></span>
                <span className="font-bold text-charcoal">
                  Workforce Intelligence Platform (WorkforceIQ)
                </span>
              </div>
              <span className="font-semibold text-charcoal/60">
                Enterprise Workforce Intelligence • Ivory, Charcoal & Scarlet Palette
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
