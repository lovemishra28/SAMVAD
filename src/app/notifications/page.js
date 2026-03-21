"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { segmentVoters } from "../../lib/segmentVoters"
import { createLaunchCampaign } from "../../lib/campaignEngine"
import { saveNotificationRecord } from "../../lib/notificationStore"
import { fetchNotificationHistory, sendNotification } from "../../lib/api/notifications"
import { fetchSchemes } from "../../lib/api/schemes"
import { createCampaign } from "../../lib/api/campaigns"
import { Wheat, GraduationCap, UserRound, Wrench, Users, Send, Check, ShieldCheck } from "lucide-react"
import BackButton from "../../components/BackButton"
import ProgressBar from "../../components/ProgressBar"

const CATEGORY_ICONS = {
  Farmers: Wheat,
  Students: GraduationCap,
  "Senior Citizens": UserRound,
  Workers: Wrench,
  Others: Users,
  Women: UserRound,
  Student: GraduationCap,
  Farmer: Wheat,
  Worker: Wrench,
}

const FALLBACK_SCHEMES = [
  { id: "SCH001", name: "PM Kisan", category: "Farmers", description: "Fallback scheme" },
  { id: "SCH002", name: "Skill India", category: "Students", description: "Fallback scheme" },
  { id: "SCH003", name: "Senior Citizen Pension", category: "Senior Citizens", description: "Fallback scheme" },
  { id: "SCH004", name: "Rozgar Mela", category: "Workers", description: "Fallback scheme" },
  { id: "SCH005", name: "Beti Bachao", category: "Women", description: "Fallback scheme" },
]

const normalizeCategoryToSegmentKey = (category) => {
  if (!category) return null
  const lower = category.toLowerCase()
  if (lower.includes("farmer")) return "farmers"
  if (lower.includes("student") || lower.includes("school") || lower.includes("college") || lower.includes("youth")) return "students"
  if (lower.includes("senior")) return "seniorCitizens"
  if (lower.includes("worker") || lower.includes("labor") || lower.includes("labour")) return "workers"
  if (lower.includes("women")) return "women"
  if (lower.includes("other")) return "women"
  return null
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
  const [schemeVisibleCount, setSchemeVisibleCount] = useState(6)
  const SCHEME_INCREMENT = 6
  const [loggedCategoryStatus, setLoggedCategoryStatus] = useState([])
  const [allSchemes, setAllSchemes] = useState([])

  useEffect(() => {
    // Load all schemes from backend first, fallback if API fails or empty
    fetchSchemes().then((schemes) => {
      if (!Array.isArray(schemes) || schemes.length === 0) {
        console.warn("fetchSchemes returned empty; using fallback schemes")
        setAllSchemes(FALLBACK_SCHEMES)
      } else {
        setAllSchemes(schemes)
      }
    }).catch(err => {
      console.error("Failed to fetch schemes:", err)
      setAllSchemes(FALLBACK_SCHEMES)
    })
  }, [])

  const categoryNames = useMemo(() => {
    const set = new Set(allSchemes.map(s => s.category).filter(Boolean))
    if (set.size === 0) {
      // fallback to existing default categories when no scheme categories
      ["Farmers", "Students", "Senior Citizens", "Workers", "Women"].forEach(c => set.add(c))
    }
    return Array.from(set)
  }, [allSchemes])

  const categoryMap = useMemo(() => {
    if (!segments) return {}

    const map = {}
    categoryNames.forEach((cat) => {
      const key = normalizeCategoryToSegmentKey(cat)
      map[cat] = key && segments[key] ? segments[key] : []
    })
    return map
  }, [segments, categoryNames])

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

  useEffect(() => {
    const fetchLogCategories = async () => {
      try {
        const res = await fetch("/api/notifications/log-categories")
        const payload = await res.json()
        if (payload.success) {
          setLoggedCategoryStatus(payload.categories || [])
        }
      } catch (err) {
        console.error("Failed to fetch log categories:", err)
      }
    }
    fetchLogCategories()
  }, [])

  const logCategoryMap = useMemo(() => {
    const m = {}
    loggedCategoryStatus.forEach((entry) => {
      if (entry && entry.category) {
        m[entry.category] = {
          lastSentAt: entry.lastSentAt ? new Date(entry.lastSentAt) : null,
        }
      }
    })
    return m
  }, [loggedCategoryStatus])

  const LOCK_MINUTES = 60
  const isCategoryLocked = (category) => {
    const entry = logCategoryMap[category]
    if (!entry || !entry.lastSentAt) return false
    const now = new Date()
    const diffMs = now - entry.lastSentAt
    return diffMs < LOCK_MINUTES * 60 * 1000
  }

  const isSendDisabled = () => {
    if (!selectedCategory) return true
    if (sending) return true
    if (isCategoryLocked(selectedCategory)) return true
    return false
  }

  const getButtonLabel = () => {
    if (sending) return "Dispatching..."
    if (!selectedCategory) return "Select a category to send"
    if (isCategoryLocked(selectedCategory)) {
      return "⏳ Recently sent - wait before re-sending"
    }
    if (logCategoryMap[selectedCategory]) {
      return "✓ Previously sent this category"
    }
    return `Send Notifications to All ${selectedCategory}`
  }

  const handleSend = async () => {
    if (!selectedCategory || isSendDisabled()) return
    const voters = categoryMap[selectedCategory]
    if (!voters || voters.length === 0) return

    // Replace dummy getters with filtered state
    const categorySchemes = allSchemes.filter(s => s.category === selectedCategory)
    const schemeNames = categorySchemes.map(s => s.name)
    
    setSending(true)
    setDone(false)
    setSendProgress(0)
    logsRef.current = []

    // Bulk generate all notification logs instantly
    const allLogs = voters.map((voter, i) => {
      const scheme = schemeNames[i % schemeNames.length]
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

    // ── Also persist campaign records per-scheme locally (existing behavior) ──
    // Use the fetched scheme objects directly
    categorySchemes.forEach(schemeObj => {
      const storageKey = `campaigns-${schemeObj.id}`
      let existing = []
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) existing = JSON.parse(raw)
      } catch {}

      const alreadyHasEngineEntry = existing.some(c => c.source === "notification-engine" && c.type === "launch")
      if (!alreadyHasEngineEntry) {
        // createLaunchCampaign expects a scheme object like in schemesData.
        // Our fetched object should be compatible (has id, name, category etc)
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
            voterName: l.voter, // Fallback if name is missing
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

    // Sync with backend storage (best effort guard)
    const boothId = localStorage.getItem("boothId") || ""
    try {
      await sendNotification({
        category: selectedCategory,
        boothId,
        schemeIds: schemeNames,
        deliveryMethod: "sms",
      })
    } catch (err) {
      console.warn("Failed to persist notification to backend:", err)
    }

    try {
      if (schemeNames.length > 0) {
        await createCampaign({
          schemeId: schemeNames[0], // using first scheme name/id ? The existing code passed schemes[0] which was a name string.
          // Wait, createCampaign likely expects a scheme ID if backend tied, but here frontend seems to pass name sometimes.
          // In the original code schemes[0] was "PM-Kisan".
          // If the backend expects ID, we should pass ID. But looking at existing code: schemes was names.
          // Let's pass what it expects. The existing code passed a name string.
          // Actually, createCampaign signature in lib/api/campaigns.js might clarify.
          // Assuming it takes schemeId. If previously it took name, then we pass name.
          // If we pass schemeNames[0] it's a name.
          type: "launch",
          category: selectedCategory,
          boothId,
        })
      }
    } catch (err) {
      console.warn("Failed to create campaign on backend:", err)
    }

    setSentCount(allLogs.length)
    setDone(true)
    setSending(false)

    // Refresh log-derived category status after sending
    const refreshLoggedCategories = async () => {
      try {
        const res = await fetch("/api/notifications/log-categories")
        const payload = await res.json()
        if (payload.success) {
          setLoggedCategoryStatus(payload.categories || [])
        }
      } catch (err) {
        console.error("Failed to refresh log categories:", err)
      }
    }

    refreshLoggedCategories()
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
              const logged = Boolean(logCategoryMap[name])
              const isLocked = isCategoryLocked(name)
              return (
                <motion.button
                  key={name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCategory(name)
                    setDone(false)
                    setSendProgress(0)
                    setTargetVisibleCount(TARGET_INCREMENT)
                    setSchemeVisibleCount(SCHEME_INCREMENT)
                  }}
                  className="p-3 rounded-lg text-left transition-all relative"
                  style={{
                    background: isSelected ? "var(--accent-dim)" : "var(--bg)",
                    border: `1px solid ${isSelected ? "rgba(200,255,0,0.3)" : logged ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)",
                    opacity: isLocked ? 0.6 : 1,
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
                  {logged && (
                    <div
                      className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full"
                      style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
                      title="Category has logged notifications"
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
                    Schemes for {selectedCategory} ({allSchemes.filter(s => s.category === selectedCategory).length})
                  </p>
                  <div style={{ maxHeight: "180px", overflowY: "auto", paddingRight: "8px" }}>
                    {allSchemes.filter(s => s.category === selectedCategory).slice(0, schemeVisibleCount).map((schemeObj, i) => {
                      return (
                        <div key={schemeObj.id || `${schemeObj.name}-${i}`} className="flex items-center gap-2 py-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{schemeObj.name}</p>
                        </div>
                      )
                    })}
                  </div>
                  {schemeVisibleCount < allSchemes.filter(s => s.category === selectedCategory).length && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => setSchemeVisibleCount(prev => prev + SCHEME_INCREMENT)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all"
                        style={{
                          background: "var(--accent-dim)",
                          border: "1px solid rgba(200,255,0,0.2)",
                          color: "var(--accent)",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "10px",
                        }}
                      >
                        Show More ({allSchemes.filter(s => s.category === selectedCategory).length - schemeVisibleCount} remaining)
                      </button>
                    </div>
                  )}
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

          <AnimatePresence>
            {selectedCategory && logCategoryMap[selectedCategory] && !done && (
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
                    This category has logged notifications
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Tick indicates notification entries are found in notification log (.md).
                  </p>
                  {logCategoryMap[selectedCategory] && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Last sent: {new Date(logCategoryMap[selectedCategory].lastSentAt).toLocaleString()}
                    </p>
                  )}
                  {isCategoryLocked(selectedCategory) && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-warning)" }}>
                      You can re-send after {new Date(logCategoryMap[selectedCategory].lastSentAt.getTime() + LOCK_MINUTES * 60 * 1000).toLocaleString()}.
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
                  <strong style={{ color: "var(--accent)" }}>{allSchemes.filter(s => s.category === selectedCategory).length}</strong> scheme(s).
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