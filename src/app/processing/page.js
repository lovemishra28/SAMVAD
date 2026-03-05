"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FolderOpen, Dna, Cpu, TrendingUp, Sparkles, Check } from "lucide-react"
import ProgressBar from "../../components/ProgressBar"

const STEP_ICONS = [FolderOpen, Dna, Cpu, TrendingUp, Sparkles]

const AI_STEPS = [
  { label: "Loading voter dataset", detail: "Parsing local voter records into processing engine", weight: 10 },
  { label: "Running demographic analysis", detail: "Mapping age, occupation, and geographic distributions", weight: 20 },
  { label: "Executing segmentation model", detail: "Classifying voters into Farmers, Students, Workers, Senior Citizens", weight: 30 },
  { label: "Generating booth intelligence", detail: "Computing averages, dominant categories, and patterns", weight: 25 },
  { label: "Preparing insights report", detail: "Building AI-powered governance recommendations", weight: 15 },
]

const AI_FACTS = [
  "AI segmentation helps identify vulnerable populations for targeted welfare delivery.",
  "Booth-level analysis enables micro-governance with precision outreach.",
  "Demographic pattern recognition can predict resource allocation needs.",
  "Smart voter profiling ensures no citizen is left behind by government schemes.",
]

export default function Processing() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(-1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [progress, setProgress] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const [done, setDone] = useState(false)

  // Redirect if accessed directly without proper flow
  useEffect(() => {
    const voters = localStorage.getItem("voters")
    if (!voters) {
      router.replace("/booth-selection")
      return
    }
  }, [router])

  useEffect(() => {
    let totalProgress = 0

    const runSteps = async () => {
      for (let i = 0; i < AI_STEPS.length; i++) {
        setCurrentStep(i)
        const step = AI_STEPS[i]
        const stepDuration = 600 + Math.random() * 400
        const increments = 10
        const incrementValue = step.weight / increments

        for (let j = 0; j < increments; j++) {
          await new Promise(r => setTimeout(r, stepDuration / increments))
          totalProgress += incrementValue
          setProgress(Math.min(totalProgress, 100))
        }
        setCompletedSteps(prev => [...prev, i])
      }
      setProgress(100)
      setDone(true)
      setTimeout(() => router.replace("/dashboard"), 1800)
    }

    runSteps()
  }, [router])

  // Rotate facts
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % AI_FACTS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              rotate: done ? 0 : [0, 5, -5, 5, 0],
              scale: done ? [1, 1.2, 1] : 1,
            }}
            transition={{
              rotate: { repeat: done ? 0 : Infinity, duration: 2 },
              scale: { duration: 0.5 },
            }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,255,0,0.15)" }}
          >
            {done ? <Check size={28} style={{ color: "var(--accent)" }} /> : <Cpu size={28} style={{ color: "var(--accent)" }} />}
          </motion.div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            {done ? "Analysis Complete" : "AI Processing"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {done ? "Voter segmentation and insights are ready" : "Analyzing voter data with AI segmentation engine"}
          </p>
        </div>

        {/* Processing Card */}
        <div className="booth-summary-card">
          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                {done ? "Processing Complete" : "Analyzing"}
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--accent)" }}>
                {Math.round(progress)}%
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: done ? "#22c55e" : "var(--accent)" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-1.5 mb-5">
            {AI_STEPS.map((step, i) => {
              const isDone = completedSteps.includes(i)
              const isCurrent = currentStep === i && !isDone
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: i <= currentStep ? 1 : 0.2, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-start gap-3 p-2.5 rounded-lg"
                  style={{
                    background: isCurrent ? "var(--accent-dim)" : "transparent",
                    border: isCurrent ? "1px solid rgba(200,255,0,0.12)" : "1px solid transparent",
                  }}
                >
                  {(() => { const Icon = isDone ? Check : STEP_ICONS[i]; return <Icon size={16} className="mt-0.5" style={{ color: isDone ? "var(--text-primary)" : isCurrent ? "var(--accent)" : "var(--text-muted)" }} />; })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: isDone ? "var(--text-primary)" : isCurrent ? "var(--accent)" : "var(--text-muted)" }}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {step.detail}
                      </motion.p>
                    )}
                  </div>
                  {isCurrent && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 rounded-full border-2 border-t-transparent mt-0.5"
                      style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* AI Fact Ticker */}
          {!done && (
            <div className="p-3 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                Did You Know?
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={factIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {AI_FACTS[factIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          )}

          {/* Done Message */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="insight-text-box"
              >
                <p className="text-sm" style={{ color: "rgba(245,245,243,0.75)" }}>
                  Segmentation complete. Redirecting to your intelligence dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ProgressBar currentStep={2} />
      </motion.div>
    </div>
  )
}