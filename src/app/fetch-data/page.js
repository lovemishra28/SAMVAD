"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plug, Lock, BarChart3, ShieldCheck, Puzzle, Check, Loader } from "lucide-react"
import BackButton from "../../components/BackButton"
import ProgressBar from "../../components/ProgressBar"

const STAGE_ICONS = [Plug, Lock, BarChart3, ShieldCheck, Puzzle]

const STAGES = [
  { label: "Connecting to database", duration: 600 },
  { label: "Authenticating booth credentials", duration: 500 },
  { label: "Querying voter records", duration: 800 },
  { label: "Validating data integrity", duration: 400 },
  { label: "Preparing segmentation input", duration: 500 },
]

export default function FetchData() {
  const router = useRouter()
  const [boothId, setBoothId] = useState("")
  const [boothMeta, setBoothMeta] = useState(null)
  const [fetchState, setFetchState] = useState("idle") // idle | fetching | done
  const [currentStage, setCurrentStage] = useState(-1)
  const [stagesDone, setStagesDone] = useState([])
  const [voterCount, setVoterCount] = useState(0)

  useEffect(() => {
    const storedBooth = localStorage.getItem("boothId")
    const storedMeta = localStorage.getItem("boothMeta")
    if (!storedBooth) {
      router.push("/booth-selection")
    } else {
      setBoothId(storedBooth)
      if (storedMeta) setBoothMeta(JSON.parse(storedMeta))
    }
  }, [router])

  const fetchVoters = async () => {
    setFetchState("fetching")
    setCurrentStage(0)
    setStagesDone([])

    // Animate through stages
    for (let i = 0; i < STAGES.length; i++) {
      setCurrentStage(i)
      await new Promise(r => setTimeout(r, STAGES[i].duration))
      setStagesDone(prev => [...prev, i])
    }

    const res = await fetch("/api/voters")
    const data = await res.json()
    localStorage.setItem("voters", JSON.stringify(data.voters))
    setVoterCount(data.voters.length)
    setFetchState("done")

    setTimeout(() => router.replace("/processing"), 1500)
  }

  const progress = fetchState === "done" ? 100 : fetchState === "fetching" ? ((stagesDone.length / STAGES.length) * 90) : 0

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto"
      >
        <BackButton fallbackHref="/booth-selection" />

        {/* Header */}
        <div className="text-center mb-8">
          {/* <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,255,0,0.15)" }}
          >
          </motion.div> */}
          <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            Retrieve Voter Data
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Query the database for booth <span style={{ color: "var(--accent)" }}>{boothId}</span> and prepare voter records
          </p>
        </div>

        {/* Booth Info */}
        {boothMeta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
              <div 
                className="flex flex-col items-center justify-center  p-3"
                style={{ 
                  background: "var(--surface)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius-sm)",
                  minHeight: "80px"
                }}
              >
                <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Booth</p>
                <p className="text-base font-semibold" style={{ color: "var(--accent)" }}>{boothMeta.id}</p>
              </div>
              <div 
                className="flex flex-col items-center justify-center  p-3"
                style={{ 
                  background: "var(--surface)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius-sm)",
                  minHeight: "80px"
                }}
              >
                <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Area</p>
                <p className="text-sm font-medium text-center leading-tight" style={{ color: "var(--text-primary)" }}>{boothMeta.area}</p>
              </div>
              <div 
                className="flex flex-col items-center justify-center  p-3"
                style={{ 
                  background: "var(--surface)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "var(--radius-sm)",
                  minHeight: "80px"
                }}
              >
                <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Type</p>
                <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>{boothMeta.type}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="booth-summary-card">
          {fetchState === "idle" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="mb-4 p-4 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Ready to fetch voter records for Booth <strong style={{ color: "var(--accent)" }}>{boothId}</strong>.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchVoters}
                className="primary-button w-full text-center"
              >
                Begin Data Retrieval
              </motion.button>
            </motion.div>
          )}

          {fetchState !== "idle" && (
            <div>
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    {fetchState === "done" ? "Complete" : "Fetching Data"}
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
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Stages */}
              <div className="space-y-2">
                {STAGES.map((stage, i) => {
                  const isDone = stagesDone.includes(i)
                  const isCurrent = currentStage === i && !isDone
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: i <= currentStage ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg"
                      style={{
                        background: isCurrent ? "var(--accent-dim)" : "transparent",
                        border: isCurrent ? "1px solid rgba(200,255,0,0.12)" : "1px solid transparent",
                      }}
                    >
                      {(() => { const Icon = isDone ? Check : STAGE_ICONS[i]; return <Icon size={16} style={{ color: isDone ? "var(--text-primary)" : isCurrent ? "var(--accent)" : "var(--text-muted)" }} />; })()}
                      <span className="text-sm flex-1" style={{ color: isDone ? "var(--text-primary)" : isCurrent ? "var(--accent)" : "var(--text-muted)" }}>
                        {stage.label}
                      </span>
                      {isCurrent && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-4 h-4 rounded-full border-2 border-t-transparent"
                          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Done summary */}
              <AnimatePresence>
                {fetchState === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="insight-text-box mt-4"
                  >
                    <p className="text-sm" style={{ color: "rgba(245,245,243,0.75)" }}>
                      Successfully retrieved <strong style={{ color: "var(--accent)" }}>{voterCount}</strong> voter records. Redirecting to AI analysis...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <ProgressBar currentStep={1} />
      </motion.div>
    </div>
  )
}