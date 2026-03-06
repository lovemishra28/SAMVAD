import "./globals.css"
import BoothIndicator from "../components/BoothIndicator"
import { ReactNode } from "react"

export const metadata = {
  title: "SAMVAD — AI Booth Intelligence",
  description: "AI-powered governance communication and voter intelligence system"
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>

        <div className="min-h-screen" style={{ background: "var(--bg)" }}>

          {/* Navigation Bar */}
          <header className="dashboard-header" style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--bg)", backdropFilter: "blur(12px)" }}>

            <a href="/dashboard" className="flex items-center gap-3" style={{ textDecoration: "none", cursor: "pointer" }}>
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: 32, height: 32, background: "var(--accent)", color: "#0a0a0a", fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: "12px" }}
              >
                S
              </div>
              <div>
                <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", fontWeight: 500, letterSpacing: "0.08em", color: "var(--text-primary)" }}>
                  SAMVAD
                </h1>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                  AI Booth Intelligence
                </p>
              </div>
            </a>

            {/* Navigation Links */}
            <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <a href="/dashboard" className="nav-link">
                Dashboard
              </a>
              <a href="/schemes" className="nav-link">
                Schemes
              </a>

              <BoothIndicator />
            </nav>

          </header>

          {/* Page Content */}
          <main>
            {children}
          </main>

        </div>

      </body>
    </html>
  )
}