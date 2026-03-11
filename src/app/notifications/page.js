"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { segmentVoters } from "../../lib/segmentVoters"
import { getSchemes } from "../../lib/getSchemes"
import { getSchemesByCategory } from "../../lib/schemesData"
import { createLaunchCampaign } from "../../lib/campaignEngine"
import { saveNotificationRecord, getUnnotifiedSchemes, getLatestNotification } from "../../lib/notificationStore"
import { Wheat, GraduationCap, UserRound, Wrench, Users, Send, Check, ShieldCheck } from "lucide-react"
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
  const [done, setDone] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const logsRef = useRef([])
  const [targetVisibleCount, setTargetVisibleCount] = useState(10)
  const TARGET_INCREMENT = 10
  // Track which categories are fully notified (all schemes covered)
  const [categoryStatus, setCategoryStatus] = useState({})

  useEffect(() => {
    const storedVoters = localStorage.getItem("voters")
    if (!storedVoters) {
      router.push("/booth-selection")
      return
    }
    const voters = JSON.parse(storedVoters)
    const result = segmentVoters(voters)
    setSegments(result)

    // Check notification status for each category
    const status = {}
    Object.keys(CATEGORY_ICONS).forEach(cat => {
      const schemeNames = getSchemes(cat)
      const unnotified = getUnnotifiedSchemes(cat, schemeNames)
      const latest = getLatestNotification(cat)
      status[cat] = {
        allNotified: unnotified.length === 0 && schemeNames.length > 0,
        unnotifiedCount: unnotified.length,
        totalSchemes: schemeNames.length,
        lastSentAt: latest?.sentAt || null,
      }
    })
    setCategoryStatus(status)
  }, [router])

  const categoryMap = {
    Farmers: segments?.farmers,
    Students: segments?.students,
    "Senior Citizens": segments?.seniorCitizens,
    Workers: segments?.workers,
    Others: segments?.others,
  }

  // Check if sending is allowed for the selected category
  const isSendDisabled = () => {
    if (!selectedCategory) return true
    if (sending) return true
    const status = categoryStatus[selectedCategory]
    if (!status) return false
    // Disabled if all schemes in this category are already notified
    return status.allNotified
  }

  const getButtonLabel = () => {
    if (sending) return "Dispatching..."
    if (!selectedCategory) return "Select a category to send"
    const status = categoryStatus[selectedCategory]
    if (status?.allNotified) return "✓ All Schemes Notified"
    return `Send Notifications to All ${selectedCategory}`
  }

  const handleSend = async () => {
    if (!selectedCategory || isSendDisabled()) return
    const voters = categoryMap[selectedCategory]
    if (!voters || voters.length === 0) return

    const schemes = getSchemes(selectedCategory)
    setSending(true)
    setDone(false)
    setSendProgress(0)
    logsRef.current = []

    // Bulk generate all notification logs instantly
    const allLogs = voters.map((voter, i) => {
      const scheme = schemes[i % schemes.length]
      const timestamp = new Date().toLocaleTimeString()
      return {
        voter: voter.name,
        scheme,
        status: "delivered",
        time: timestamp,
      }
    })
    logsRef.current = allLogs

    // Brief progress animation (cosmetic)
    const animSteps = 10
    for (let step = 1; step <= animSteps; step++) {
      await new Promise(r => setTimeout(r, 150))
      setSendProgress((step / animSteps) * 100)
    }

    // ── Persist notification record to central store ──
    saveNotificationRecord({
      category: selectedCategory,
      type: "early_alert",
      audienceCount: voters.length,
      schemes: [...new Set(logsRef.current.map(l => l.scheme))],
      logs: logsRef.current,
    })

    // ── Also persist campaign records per-scheme ──
    const schemesDb = getSchemesByCategory(selectedCategory)
    schemesDb.forEach(schemeObj => {
      const storageKey = `campaigns-${schemeObj.id}`
      let existing = []
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) existing = JSON.parse(raw)
      } catch {}

      const alreadyHasEngineEntry = existing.some(c => c.source === "notification-engine" && c.type === "launch")
      if (!alreadyHasEngineEntry) {
        const campaign = createLaunchCampaign(schemeObj, voters)
        campaign.status = "completed"
        campaign.source = "notification-engine"
        campaign.completedAt = new Date().toISOString()
        campaign.deliveredCount = voters.length
        campaign.pendingCount = 0
        campaign.logs = logsRef.current
          .filter(l => {
            return schemeObj.name.toLowerCase().includes(l.scheme.toLowerCase()) ||
                   l.scheme.toLowerCase().includes(schemeObj.name.toLowerCase().split(" ")[0].toLowerCase())
          })
          .map(l => ({
            voterId: l.voter,
            voterName: l.voter,
            channel: "sms",
            type: "launch",
            schemeName: schemeObj.name,
            status: l.status,
            timestamp: new Date().toISOString(),
          }))

        if (campaign.logs.length === 0) {
          campaign.logs = logsRef.current.map(l => ({
            voterId: l.voter,
            voterName: l.voter,
            channel: "sms",
            type: "launch",
            schemeName: schemeObj.name,
            status: l.status,
            timestamp: new Date().toISOString(),
          }))
        }

        campaign.deliveredCount = campaign.logs.filter(l => l.status === "delivered").length
        campaign.failedCount = campaign.logs.filter(l => l.status === "failed").length

        existing.push(campaign)
        localStorage.setItem(storageKey, JSON.stringify(existing))
      }
    })

    setSentCount(allLogs.length)
    setDone(true)
    setSending(false)

    // Update category status after sending
    setCategoryStatus(prev => {
      const schemeNames = getSchemes(selectedCategory)
      const unnotified = getUnnotifiedSchemes(selectedCategory, schemeNames)
      return {
        ...prev,
        [selectedCategory]: {
          allNotified: unnotified.length === 0 && schemeNames.length > 0,
          unnotifiedCount: unnotified.length,
          totalSchemes: schemeNames.length,
          lastSentAt: new Date().toISOString(),
        },
      }
    })
  }

  if (!segments) return <p className="p-10" style={{ color: "var(--text-secondary)" }}>Loading...</p>

  return (
    <div className="min-h-[calc(100vh-70px)] p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl mx-auto"
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
            Bulk-dispatch scheme notifications to voter categories
          </p>
        </div>

        <div className="booth-summary-card">
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
            Select Target Category
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {Object.entries(categoryMap).map(([name, voters]) => {
              const Icon = CATEGORY_ICONS[name] || Users
              const isSelected = selectedCategory === name
              const status = categoryStatus[name]
              const isFullyNotified = status?.allNotified
              return (
                <motion.button
                  key={name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedCategory(name); setDone(false); setSendProgress(0); setTargetVisibleCount(TARGET_INCREMENT); }}
                  className="p-3 rounded-lg text-left transition-all relative"
                  style={{
                    background: isSelected ? "var(--accent-dim)" : "var(--bg)",
                    border: `1px solid ${isSelected ? "rgba(200,255,0,0.3)" : isFullyNotified ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
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
                  {/* Status badge */}
                  {isFullyNotified && (
                    <div
                      className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full"
                      style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
                      title="All schemes notified"
                    >
                      <Check size={10} style={{ color: "#22c55e" }} />
                    </div>
                  )}
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
                  {getSchemes(selectedCategory).map((scheme, i) => {
                    const status = categoryStatus[selectedCategory]
                    const isNotified = status?.allNotified || (status && status.unnotifiedCount < status.totalSchemes)
                    return (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{scheme}</p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Target List Preview */}
          <AnimatePresence>
            {selectedCategory && categoryMap[selectedCategory]?.length > 0 && !sending && !done && !categoryStatus[selectedCategory]?.allNotified && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="p-3 rounded-lg mb-4" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                  <p className="text-xs mb-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Target List ({categoryMap[selectedCategory].length} voters)
                  </p>
                  {categoryMap[selectedCategory].slice(0, targetVisibleCount).map((v, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
                      <span className="text-xs" style={{ color: "var(--text-primary)" }}>{v.name}</span>
                      <span className="text-xs" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>Age {v.age}</span>
                    </div>
                  ))}
                  {targetVisibleCount < categoryMap[selectedCategory].length && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => setTargetVisibleCount(prev => prev + TARGET_INCREMENT)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          background: "var(--accent-dim)",
                          border: "1px solid rgba(200,255,0,0.2)",
                          color: "var(--accent)",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "10px",
                        }}
                      >
                        Show More ({categoryMap[selectedCategory].length - targetVisibleCount} remaining)
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Already notified notice */}
          <AnimatePresence>
            {selectedCategory && categoryStatus[selectedCategory]?.allNotified && !done && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-4 rounded-lg mb-4 flex items-start gap-3"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-md)" }}
              >
                <ShieldCheck size={20} style={{ color: "#22c55e", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    All schemes covered for {selectedCategory}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Notifications have already been sent for all {categoryStatus[selectedCategory].totalSchemes} scheme(s) in this category.
                    The send option will become available when new schemes are added.
                  </p>
                  {categoryStatus[selectedCategory].lastSentAt && (
                    <p className="text-xs mt-1.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>
                      Last sent: {new Date(categoryStatus[selectedCategory].lastSentAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Send Button */}
          <motion.button
            whileHover={isSendDisabled() ? {} : { scale: 1.01 }}
            whileTap={isSendDisabled() ? {} : { scale: 0.98 }}
            onClick={handleSend}
            disabled={isSendDisabled()}
            className="primary-button w-full text-center"
            style={{ opacity: isSendDisabled() ? 0.4 : 1, cursor: isSendDisabled() ? "not-allowed" : "pointer" }}
          >
            {getButtonLabel()}
          </motion.button>

          {/* Progress bar during sending */}
          {sending && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                  Dispatching to all {selectedCategory}
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--accent)" }}>
                  {Math.round(sendProgress)}%
                </p>
              </div>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--accent)" }}
                  animate={{ width: `${sendProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Success confirmation — simple single message */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-5 p-5 rounded-xl text-center"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--radius-lg)" }}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
                  style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
                >
                  <Check size={24} style={{ color: "#22c55e" }} />
                </div>
                <p className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  All notifications sent successfully
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--accent)" }}>{sentCount}</strong> notifications dispatched to all {selectedCategory} across{" "}
                  <strong style={{ color: "var(--accent)" }}>{getSchemes(selectedCategory).length}</strong> scheme(s).
                </p>
                <p className="text-xs mt-3" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>
                  Sent at {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Steps indicator */}
        <ProgressBar currentStep={4} />
      </motion.div>
    </div>
  )
}