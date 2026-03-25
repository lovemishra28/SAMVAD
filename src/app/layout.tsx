import "./globals.css"
import BoothIndicator from "../components/BoothIndicator"
import ThemeProvider from "../components/ThemeProvider"
import ThemeToggle from "../components/ThemeToggle"
import { ReactNode } from "react"

export const metadata = {
  title: "SAMVAD — AI Booth Intelligence",
  description: "AI-powered governance communication and voter intelligence system"
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div className="min-h-screen" style={{ background: "var(--bg)" }}>

            {/* Navigation Bar */}
            <header className="dashboard-header" style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--bg)", backdropFilter: "blur(12px)" }}>

              <a href="/dashboard" className="flex items-center gap-3" style={{ textDecoration: "none", cursor: "pointer" }}>
                <img 
                  src="/assets/samvad_logo.png" 
                  alt="SAMVAD Logo" 
                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} 
                />
                <div>
                  <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", fontWeight: 500, letterSpacing: "0.08em", color: "var(--text-primary)" }}>
                    SAMVAD
                  </h1>
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
                <a href="/feedback" className="nav-link">
                  Feedback
                </a>

                <BoothIndicator />
                <ThemeToggle />
              </nav>

            </header>

            {/* Page Content */}
            <main>
              {children}
            </main>

          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}