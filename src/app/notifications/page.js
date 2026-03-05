"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { segmentVoters } from "../../lib/segmentVoters"
import { getSchemes } from "../../lib/getSchemes"
import { Wheat, GraduationCap, UserRound, Wrench, Users, Send, ClipboardList, Check } from "lucide-react"
import BackButton from "../../components/BackButton"
import ProgressBar from "../../components/ProgressBar"

const CATEGORY_ICONS = {
  Farmers: Wheat,
  Students: GraduationCap,
  "Senior Citizens": UserRound,
  Workers: Wrench,
  Others: Users,
}

export default function Notifications() {
  const router = useRouter()
  const [segments, setSegments] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const [targetList, setTargetList] = useState([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    const storedVoters = localStorage.getItem("voters")
    if (!storedVoters) {
      router.push("/booth-selection")
      return
    }
    const voters = JSON.parse(storedVoters)
    const result = segmentVoters(voters)
    setSegments(result)
  }, [router])

  const categoryMap = {
    Farmers: segments?.farmers,
    Students: segments?.students,
    "Senior Citizens": segments?.seniorCitizens,
    Workers: segments?.workers,
    Others: segments?.others,
  }

  const handleSend = async () => {
    if (!selectedCategory) return
    const voters = categoryMap[selectedCategory]
    if (!voters || voters.length === 0) return

    const schemes = getSchemes(selectedCategory)
    setTargetList(voters)
    setSending(true)
    setDone(false)
    setLogs([])
    setSendProgress(0)

    // Simulate sending notifications one by one
    for (let i = 0; i < voters.length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300))
      const scheme = schemes[i % schemes.length]
      const timestamp = new Date().toLocaleTimeString()
      setLogs(prev => [
        ...prev,
        {
          voter: voters[i].name,
          scheme,
          status: "delivered",
          time: timestamp,
        },
      ])
      setSendProgress(((i + 1) / voters.length) * 100)
    }

    setDone(true)
    setSending(false)
  }

  const handleReset = () => {
    setSelectedCategory("")
    setTargetList([])
    setLogs([])
    setDone(false)
    setSendProgress(0)
  }

  if (!segments) return <p className="p-10" style={{ color: "var(--text-secondary)" }}>Loading...</p>

  return (
    <div className="min-h-[calc(100vh-70px)] p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mx-auto"
      >
        <BackButton fallbackHref="/dashboard" />

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,255,0,0.15)" }}
          >
            <Send size={28} style={{ color: "var(--accent)" }} />
          </motion.div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            Notification Engine
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Target voter categories and deliver scheme notifications
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Category Selection + Action */}
          <div className="flex-1">
            <div className="booth-summary-card">
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                Select Target Category
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {Object.entries(categoryMap).map(([name, voters]) => {
                  const Icon = CATEGORY_ICONS[name] || Users
                  const isSelected = selectedCategory === name
                  return (
                    <motion.button
                      key={name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedCategory(name); setLogs([]); setDone(false); setSendProgress(0); }}
                      className="p-3 rounded-lg text-left transition-all"
                      style={{
                        background: isSelected ? "var(--accent-dim)" : "var(--bg)",
                        border: `1px solid ${isSelected ? "rgba(200,255,0,0.3)" : "var(--border)"}`,
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <Icon size={20} style={{ color: isSelected ? "var(--accent)" : "var(--text-secondary)" }} />
                      <p className="text-xs font-medium mt-1.5" style={{ color: isSelected ? "var(--accent)" : "var(--text-primary)" }}>
                        {name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>
                        {voters?.length || 0} voters
                      </p>
                    </motion.button>
                  )
                })}
              </div>

              {/* Schemes Preview */}
              <AnimatePresence>
                {selectedCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-lg mb-4" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                      <p className="text-xs mb-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        Schemes for {selectedCategory}
                      </p>
                      {getSchemes(selectedCategory).map((scheme, i) => (
                        <div key={i} className="flex items-center gap-2 py-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{scheme}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Target List Preview */}
              <AnimatePresence>
                {selectedCategory && categoryMap[selectedCategory]?.length > 0 && !sending && !done && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="p-3 rounded-lg mb-4" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                      <p className="text-xs mb-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        Target List ({categoryMap[selectedCategory].length} voters)
                      </p>
                      {categoryMap[selectedCategory].map((v, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
                          <span className="text-xs" style={{ color: "var(--text-primary)" }}>{v.name}</span>
                          <span className="text-xs" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>Age {v.age}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Send / Reset Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={done ? handleReset : handleSend}
                disabled={sending || (!done && !selectedCategory)}
                className="primary-button w-full text-center"
                style={{ opacity: sending || (!done && !selectedCategory) ? 0.5 : 1 }}
              >
                {sending ? "Sending..." : done ? "Send Another Batch" : `Send Notifications to ${selectedCategory || "..."}`}
              </motion.button>

              {/* Progress */}
              {(sending || done) && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                      {done ? "All Delivered" : "Sending"}
                    </p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--accent)" }}>
                      {Math.round(sendProgress)}%
                    </p>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: done ? "#22c55e" : "var(--accent)" }}
                      animate={{ width: `${sendProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Delivery Logs */}
          <div className="flex-1">
            <div className="booth-summary-card" style={{ minHeight: "300px" }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                Delivery Log {logs.length > 0 && `(${logs.length})`}
              </p>

              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <ClipboardList size={28} className="mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No notifications sent yet
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Select a category and click send
                  </p>
                </div>
              )}

              <div className="space-y-1.5 max-h-100 overflow-y-auto">
                <AnimatePresence>
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                    >
                      <Check size={16} style={{ color: "var(--accent)" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {log.voter}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                          {log.scheme}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs" style={{ color: "#22c55e", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                          {log.status}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px" }}>
                          {log.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="insight-text-box mt-4"
                  >
                    <p className="text-sm" style={{ color: "rgba(245,245,243,0.75)" }}>
                      Successfully delivered <strong style={{ color: "var(--accent)" }}>{logs.length}</strong> notifications to {selectedCategory}.
                      All scheme information has been dispatched via the governance communication channel.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Steps indicator */}
        <ProgressBar currentStep={4} />
      </motion.div>
    </div>
  )
}