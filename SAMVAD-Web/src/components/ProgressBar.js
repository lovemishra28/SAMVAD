"use client"

import { motion } from "framer-motion"

const STEPS = ["Booth", "Data", "AI Analysis", "Dashboard", "Notify"]

export default function ProgressBar({ currentStep = 0 }) {
  const progress = Math.min(((currentStep + 1) / STEPS.length) * 100, 100)

  return (
    <div className="flex items-center justify-center py-6">
      <div className="w-full max-w-xs">
        <div className="flex justify-between items-center mb-1.5">
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            {STEPS[currentStep] || "Complete"}
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--accent)" }}>
            {Math.round(progress)}%
          </p>
        </div>
        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--accent)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  )
}
