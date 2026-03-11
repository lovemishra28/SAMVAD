"use client"

import { useState, useEffect, useMemo, use } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wheat, GraduationCap, UserRound, Wrench, Users,
  Send, Bell, Clock, Calendar, ExternalLink, Shield,
  Check, X, AlertTriangle, TrendingUp, BarChart3,
  Phone, MessageSquare, ChevronDown, Radio, FileCheck,
  Loader, RefreshCw, Eye
} from "lucide-react"
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale,
  LinearScale, Tooltip, Legend
} from "chart.js"
import { Pie, Bar, Doughnut } from "react-chartjs-2"
import BackButton from "../../../components/BackButton"
import { getSchemeById, getDaysUntilDeadline } from "../../../lib/schemesData"
import { segmentVoters } from "../../../lib/segmentVoters"
import { createLaunchCampaign, createReminderCampaign, simulateDelivery, computeCampaignAnalytics } from "../../../lib/campaignEngine"
import { generateApplicationData, computeApplicationAnalytics } from "../../../lib/applicationTracker"
import { getNotificationsForCategory, getNotificationsForScheme } from "../../../lib/notificationStore"

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const CATEGORY_ICONS = {
  Farmers: Wheat, Students: GraduationCap,
  "Senior Citizens": UserRound, Workers: Wrench, Others: Users,
}

const CATEGORY_COLORS = {
  Farmers: "#22c55e", Students: "#3b82f6",
  "Senior Citizens": "#f59e0b", Workers: "#8b5cf6", Others: "#ec4899",
}

const STATUS_CONFIG = {
  active: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  upcoming: { label: "Upcoming", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  closed: { label: "Closed", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
}

const TAB_CONFIG = [
  { key: "overview", label: "Overview", icon: Eye },
  { key: "campaign", label: "Campaign Control", icon: Send },
  { key: "tracking", label: "Notification Tracking", icon: Bell },
  { key: "applications", label: "Application Tracking", icon: FileCheck },
]

export default function SchemeDetail({ params }) {
  const { id } = use(params)
  const router = useRouter()

  const scheme = getSchemeById(id)
  const [activeTab, setActiveTab] = useState("overview")
  const [targetVoters, setTargetVoters] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [isSending, setIsSending] = useState(false)
  const [sendingType, setSendingType] = useState(null)
  const [applications, setApplications] = useState([])
  const [appAnalytics, setAppAnalytics] = useState(null)
  const [notificationHistory, setNotificationHistory] = useState([])

  // Load voter data from localStorage and segment
  useEffect(() => {
    if (!scheme) return
    const storedVoters = localStorage.getItem("voters")
    if (!storedVoters) return

    const voters = JSON.parse(storedVoters)
    const segments = segmentVoters(voters)

    // Map scheme category to segment key
    const categoryMap = {
      Farmers: "farmers", Students: "students",
      "Senior Citizens": "seniorCitizens", Workers: "workers", Others: "others",
    }

    const segKey = categoryMap[scheme.category]
    const target = segKey ? segments[segKey] : []
    setTargetVoters(target)

    // Load persisted campaigns
    const storedCampaigns = localStorage.getItem(`campaigns-${id}`)
    if (storedCampaigns) setCampaigns(JSON.parse(storedCampaigns))

    // Generate application data
    if (target.length > 0) {
      const storedApps = localStorage.getItem(`applications-${id}`)
      if (storedApps) {
        const apps = JSON.parse(storedApps)
        setApplications(apps)
        setAppAnalytics(computeApplicationAnalytics(apps))
      } else {
        const apps = generateApplicationData(scheme, target)
        setApplications(apps)
        setAppAnalytics(computeApplicationAnalytics(apps))
        localStorage.setItem(`applications-${id}`, JSON.stringify(apps))
      }
    }

    // Load notification engine history
    const schemeNotifs = getNotificationsForScheme(scheme.name)
    const categoryNotifs = getNotificationsForCategory(scheme.category)
    const allNotifs = [...schemeNotifs]
    categoryNotifs.forEach(cn => {
      if (!allNotifs.some(n => n.id === cn.id)) {
        allNotifs.push(cn)
      }
    })
    setNotificationHistory(allNotifs)
  }, [scheme, id])

  // Persist campaigns
  useEffect(() => {
    if (campaigns.length > 0) {
      localStorage.setItem(`campaigns-${id}`, JSON.stringify(campaigns))
    }
  }, [campaigns, id])

  if (!scheme) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center">
        <p style={{ color: "var(--text-secondary)" }}>Scheme not found</p>
      </div>
    )
  }

  const Icon = CATEGORY_ICONS[scheme.category] || Users
  const statusCfg = STATUS_CONFIG[scheme.status] || STATUS_CONFIG.active
  const daysLeft = getDaysUntilDeadline(scheme)
  const campaignAnalytics = computeCampaignAnalytics(campaigns)
  const hasLaunchCampaign = campaigns.some(c => c.type === "launch")
  const hasReminderCampaign = campaigns.some(c => c.type === "reminder")

  // ── Send Campaign (Bulk Dispatch) ──
  const handleSendCampaign = async (type) => {
    if (isSending) return
    setIsSending(true)
    setSendingType(type)

    const campaign = type === "launch"
      ? createLaunchCampaign(scheme, targetVoters)
      : createReminderCampaign(scheme, targetVoters)

    campaign.status = "in-progress"
    setCampaigns(prev => [...prev, campaign])

    // Bulk generate all delivery logs instantly
    const logs = targetVoters.map(voter => {
      const channel = Math.random() > 0.4 ? "sms" : "voice"
      return simulateDelivery(voter, scheme, channel, type)
    })

    // Brief cosmetic progress animation
    const animSteps = 10
    for (let step = 1; step <= animSteps; step++) {
      await new Promise(r => setTimeout(r, 150))
      setCampaigns(prev => {
        const updated = [...prev]
        const idx = updated.findIndex(c => c.id === campaign.id)
        if (idx > -1) {
          const progress = Math.round((step / animSteps) * logs.length)
          updated[idx] = {
            ...updated[idx],
            logs: logs.slice(0, progress),
            deliveredCount: logs.slice(0, progress).filter(l => l.status === "delivered").length,
            failedCount: logs.slice(0, progress).filter(l => l.status === "failed").length,
            pendingCount: targetVoters.length - progress,
          }
        }
        return updated
      })
    }

    // Finalize with all logs
    setCampaigns(prev => {
      const updated = [...prev]
      const idx = updated.findIndex(c => c.id === campaign.id)
      if (idx > -1) {
        updated[idx] = {
          ...updated[idx],
          status: "completed",
          completedAt: new Date().toISOString(),
          logs,
          deliveredCount: logs.filter(l => l.status === "delivered").length,
          failedCount: logs.filter(l => l.status === "failed").length,
          pendingCount: 0,
        }
      }
      return updated
    })

    setIsSending(false)
    setSendingType(null)
  }

  return (
    <div className="min-h-[calc(100vh-70px)] p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto"
      >
        <BackButton fallbackHref="/schemes" />

        {/* ── Scheme Header ── */}
        <div className="booth-summary-card mb-6">
          <div className="flex items-start gap-4 mb-5">
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{
                width: 56, height: 56,
                background: `${CATEGORY_COLORS[scheme.category]}15`,
                border: `1px solid ${CATEGORY_COLORS[scheme.category]}30`,
              }}
            >
              <Icon size={26} style={{ color: CATEGORY_COLORS[scheme.category] }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {scheme.name}
                </h1>
                <span
                  className="px-2.5 py-1 rounded text-xs"
                  style={{ background: statusCfg.bg, color: statusCfg.color, fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.06em" }}
                >
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                {scheme.description}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                  <Shield size={12} /> {scheme.category}
                </span>
                <span className="flex items-center gap-1.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>
                  <Users size={12} /> {targetVoters.length} targeted voters
                </span>
                <span className="flex items-center gap-1.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>
                  <Calendar size={12} /> Deadline: {new Date(scheme.registrationDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {daysLeft > 0 && (
                  <span className="flex items-center gap-1.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: daysLeft <= 7 ? "#ef4444" : "#22c55e" }}>
                    <Clock size={12} /> {daysLeft} days left
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="insight-stat-box">
              <p>Target Voters</p>
              <p>{targetVoters.length}</p>
            </div>
            <div className="insight-stat-box">
              <p>Campaigns Sent</p>
              <p>{campaigns.filter(c => c.status === "completed").length}</p>
            </div>
            <div className="insight-stat-box">
              <p>Delivery Rate</p>
              <p>{campaignAnalytics.successRate}%</p>
            </div>
            <div className="insight-stat-box">
              <p>Adoption Rate</p>
              <p>{appAnalytics ? `${appAnalytics.adoptionRate}%` : "—"}</p>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {TAB_CONFIG.map(tab => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all"
                style={{
                  background: isActive ? "var(--accent-dim)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(200,255,0,0.25)" : "var(--border)"}`,
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.04em",
                }}
              >
                <TabIcon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <OverviewTab key="overview" scheme={scheme} targetVoters={targetVoters} campaigns={campaigns} appAnalytics={appAnalytics} notificationHistory={notificationHistory} />
          )}
          {activeTab === "campaign" && (
            <CampaignTab
              key="campaign"
              scheme={scheme}
              targetVoters={targetVoters}
              campaigns={campaigns}
              isSending={isSending}
              sendingType={sendingType}
              hasLaunchCampaign={hasLaunchCampaign}
              hasReminderCampaign={hasReminderCampaign}
              onSend={handleSendCampaign}
            />
          )}
          {activeTab === "tracking" && (
            <TrackingTab key="tracking" campaigns={campaigns} analytics={campaignAnalytics} />
          )}
          {activeTab === "applications" && (
            <ApplicationsTab key="applications" scheme={scheme} applications={applications} analytics={appAnalytics} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}


// ═══════════════════════════════════════
// ── OVERVIEW TAB ──
// ═══════════════════════════════════════
function OverviewTab({ scheme, targetVoters, campaigns, appAnalytics, notificationHistory }) {
  const [voterVisibleCount, setVoterVisibleCount] = useState(10)
  const VOTER_INCREMENT = 10
  const NOTIF_TYPE_LABELS = {
    early_alert: "Early Alert",
    deadline_reminder: "Deadline Reminder",
    launch: "Launch Notification",
    reminder: "Deadline Reminder",
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheme Details */}
        <div className="booth-summary-card">
          <h2 style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            Scheme Details
          </h2>
          <div className="space-y-4">
            {[
              { label: "Scheme ID", value: scheme.id },
              { label: "Category", value: scheme.category },
              { label: "Launch Date", value: new Date(scheme.launchDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Registration Start", value: new Date(scheme.registrationStart).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Registration Deadline", value: new Date(scheme.registrationDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Beneficiary Group", value: scheme.beneficiaryGroup },
              { label: "Portal", value: scheme.portalUrl },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start gap-3">
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", flexShrink: 0 }}>
                  {item.label}
                </span>
                <span className="text-xs text-right" style={{ color: "var(--text-primary)" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Targeted Voters */}
        <div className="booth-summary-card">
          <h2 style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            Targeted Voter List ({targetVoters.length})
          </h2>
          {targetVoters.length === 0 ? (
            <div className="text-center py-8">
              <Users size={24} className="mx-auto mb-2 opacity-30" style={{ color: "var(--text-muted)" }} />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No voter data loaded. Complete the booth flow first.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {targetVoters.slice(0, voterVisibleCount).map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{v.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>{v.occupation}</p>
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>Age {v.age}</span>
                  </div>
                ))}
              </div>
              {voterVisibleCount < targetVoters.length && (
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setVoterVisibleCount(prev => prev + VOTER_INCREMENT)}
                    className="text-xs px-4 py-1.5 rounded-lg transition-all"
                    style={{
                      background: "var(--accent-dim)",
                      border: "1px solid rgba(200,255,0,0.2)",
                      color: "var(--accent)",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "10px",
                    }}
                  >
                    Show More ({targetVoters.length - voterVisibleCount} remaining)
                  </button>
                </div>
              )}
              {voterVisibleCount >= targetVoters.length && targetVoters.length > VOTER_INCREMENT && (
                <div className="flex justify-center mt-3">
                  <button
                    onClick={() => setVoterVisibleCount(VOTER_INCREMENT)}
                    className="text-xs px-3 py-1 rounded-lg"
                    style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}
                  >
                    Collapse List
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Notification Engine History ── */}
      <div className="booth-summary-card mt-6">
        <h2 style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          Notification Engine History
        </h2>
        {notificationHistory.length === 0 ? (
          <div className="text-center py-8">
            <Bell size={24} className="mx-auto mb-2 opacity-30" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No notifications sent yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Use the Notification Engine to send scheme alerts to targeted citizens</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notificationHistory.map((notif, i) => {
              const deliveredCount = notif.logs?.filter(l => l.status === "delivered").length || 0
              const totalLogs = notif.logs?.length || notif.audienceCount || 0

              return (
                <motion.div
                  key={notif.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg"
                  style={{ background: "var(--bg)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "var(--radius-md)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                        <Check size={14} style={{ color: "#22c55e" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {NOTIF_TYPE_LABELS[notif.type] || notif.type}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                          via Notification Engine
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded text-xs"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        color: "#22c55e",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "10px",
                        letterSpacing: "0.06em",
                        border: "1px solid rgba(34,197,94,0.2)",
                      }}
                    >
                      ✓ Delivered
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Type</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{NOTIF_TYPE_LABELS[notif.type] || notif.type}</p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Sent At</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {new Date(notif.sentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                        {new Date(notif.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Audience</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{notif.audienceCount || totalLogs} recipients</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                        {notif.category || scheme.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Delivered</p>
                      <p className="text-sm font-medium" style={{ color: "#22c55e" }}>{deliveredCount} / {totalLogs}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Summary Insight */}
      {targetVoters.length > 0 && (
        <div className="insight-text-box mt-6">
          <p>
            This scheme targets <strong style={{ color: "var(--accent)" }}>{targetVoters.length}</strong> {scheme.category.toLowerCase()} in the selected booth.
            {campaigns.length > 0
              ? ` ${campaigns.filter(c => c.status === "completed").length} campaign(s) have been executed with a ${computeCampaignAnalytics(campaigns).successRate}% delivery success rate.`
              : " No notification campaigns have been launched yet. Go to Campaign Control to initiate the first announcement."
            }
            {notificationHistory.length > 0
              ? ` ${notificationHistory.length} notification(s) sent via the Notification Engine.`
              : ""
            }
            {appAnalytics
              ? ` Application adoption rate stands at ${appAnalytics.adoptionRate}% with ${appAnalytics.applied} voters having successfully applied.`
              : ""
            }
          </p>
        </div>
      )}
    </motion.div>
  )
}


// ═══════════════════════════════════════
// ── CAMPAIGN CONTROL TAB ──
// ═══════════════════════════════════════
function CampaignTab({ scheme, targetVoters, campaigns, isSending, sendingType, hasLaunchCampaign, hasReminderCampaign, onSend }) {
  const activeCampaign = campaigns.find(c => c.status === "in-progress")
  const sendProgress = activeCampaign ? ((activeCampaign.deliveredCount + activeCampaign.failedCount) / activeCampaign.targetCount) * 100 : 0

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Actions */}
        <div className="booth-summary-card">
          <h2 style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            Launch Campaign
          </h2>

          {/* Launch Announcement */}
          <div className="p-4 rounded-lg mb-4" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <MessageSquare size={18} style={{ color: "#3b82f6" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Scheme Launch Announcement</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>SMS + Voice Call to {targetVoters.length} citizens</p>
              </div>
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
              Initial notification informing citizens about scheme details, eligibility, and the registration process.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: "rgba(59,130,246,0.1)", fontSize: "10px", fontFamily: "'DM Mono', monospace", color: "#3b82f6" }}>
                <MessageSquare size={10} /> SMS
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: "rgba(139,92,246,0.1)", fontSize: "10px", fontFamily: "'DM Mono', monospace", color: "#8b5cf6" }}>
                <Phone size={10} /> Voice
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSend("launch")}
              disabled={isSending || hasLaunchCampaign || targetVoters.length === 0}
              className="primary-button w-full text-center"
              style={{ opacity: (isSending || hasLaunchCampaign || targetVoters.length === 0) ? 0.5 : 1 }}
            >
              {hasLaunchCampaign ? "✓ Launch Sent" : sendingType === "launch" ? "Sending..." : "Send Launch Notification"}
            </motion.button>
          </div>

          {/* Deadline Reminder */}
          <div className="p-4 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <Bell size={18} style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Deadline Reminder</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Auto-scheduled 1 day before deadline</p>
              </div>
            </div>
            <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
              Automated reminder sent one day before registration closes. Ensures citizens who missed the initial announcement are reminded to apply.
            </p>
            <div className="p-2 rounded mb-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <p className="text-xs flex items-center gap-1.5" style={{ color: "#f59e0b", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                <Clock size={11} />
                Scheduled for: {new Date(new Date(scheme.registrationDeadline).getTime() - 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSend("reminder")}
              disabled={isSending || hasReminderCampaign || targetVoters.length === 0}
              className="primary-button w-full text-center"
              style={{ opacity: (isSending || hasReminderCampaign || targetVoters.length === 0) ? 0.5 : 1 }}
            >
              {hasReminderCampaign ? "✓ Reminder Sent" : sendingType === "reminder" ? "Sending..." : "Send Deadline Reminder"}
            </motion.button>
          </div>
        </div>

        {/* Dispatch Summary */}
        <div className="booth-summary-card" style={{ minHeight: 300 }}>
          <h2 style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            Dispatch Summary
          </h2>

          {/* Progress bar when sending */}
          {isSending && activeCampaign && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {sendingType === "launch" ? "Dispatching Launch" : "Dispatching Reminder"}
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--accent)" }}>
                  {Math.round(sendProgress)}%
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--accent)" }}
                  animate={{ width: `${sendProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* No campaigns yet */}
          {campaigns.length === 0 && !isSending ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Radio size={28} className="mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No campaigns sent yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Launch a campaign to dispatch notifications</p>
            </div>
          ) : campaigns.some(c => c.status === "completed") ? (
            <>
              {/* Success confirmation */}
              <div className="text-center py-6">
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
                  Dispatched to <strong style={{ color: "var(--accent)" }}>{targetVoters.length}</strong> {scheme.category.toLowerCase()} in bulk
                </p>
              </div>

              {/* Per-campaign summary cards (no per-user logs) */}
              <div className="space-y-3 mt-2">
                {campaigns.filter(c => c.status === "completed").map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-lg"
                    style={{ background: "var(--bg)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "var(--radius-md)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {c.type === "launch" ? <Send size={14} style={{ color: "#3b82f6" }} /> : <Bell size={14} style={{ color: "#f59e0b" }} />}
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.label || (c.type === "launch" ? "Launch Notification" : "Deadline Reminder")}</span>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded text-xs"
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          color: "#22c55e",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "10px",
                          border: "1px solid rgba(34,197,94,0.2)",
                        }}
                      >
                        ✓ Completed
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Delivered</p>
                        <p className="text-sm font-medium" style={{ color: "#22c55e" }}>{c.deliveredCount}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Failed</p>
                        <p className="text-sm font-medium" style={{ color: "#ef4444" }}>{c.failedCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Sent At</p>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {c.completedAt ? new Date(c.completedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}


// ═══════════════════════════════════════
// ── NOTIFICATION TRACKING TAB ──
// ═══════════════════════════════════════
function TrackingTab({ campaigns, analytics }) {
  // Chart data for delivery status
  const deliveryChartData = {
    labels: ["Delivered", "Failed", "Pending"],
    datasets: [{
      data: [analytics.totalDelivered, analytics.totalFailed, analytics.totalPending],
      backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"],
      borderWidth: 2,
      borderColor: "#1a1a1a",
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: { position: "bottom", labels: { color: "#e2e8f0", padding: 8, font: { size: 10 } } },
      tooltip: { backgroundColor: "#1a1a1a", titleColor: "#f1f5f9", bodyColor: "#f1f5f9", borderColor: "#2a2a2a", borderWidth: 1 },
    },
  }

  // Channel distribution
  const allLogs = campaigns.flatMap(c => c.logs)
  const smsCount = allLogs.filter(l => l.channel === "sms").length
  const voiceCount = allLogs.filter(l => l.channel === "voice").length

  const channelChartData = {
    labels: ["SMS", "Voice Call"],
    datasets: [{
      label: "Notifications",
      data: [smsCount, voiceCount],
      backgroundColor: ["#3b82f6", "#8b5cf6"],
      borderColor: ["#2563eb", "#7c3aed"],
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.6,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#1a1a1a", titleColor: "#f1f5f9", bodyColor: "#f1f5f9", borderColor: "#2a2a2a", borderWidth: 1 },
    },
    scales: {
      x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#222" } },
      y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#222" } },
    },
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total Targeted", value: analytics.totalTargeted, color: "var(--text-primary)" },
          { label: "Notifications Sent", value: analytics.totalSent, color: "var(--accent)" },
          { label: "Delivered", value: analytics.totalDelivered, color: "#22c55e" },
          { label: "Failed", value: analytics.totalFailed, color: "#ef4444" },
          { label: "Success Rate", value: `${analytics.successRate}%`, color: analytics.successRate >= 90 ? "#22c55e" : "#f59e0b" },
        ].map(stat => (
          <div key={stat.label} className="insight-stat-box">
            <p>{stat.label}</p>
            <p style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Status Chart */}
        <div className="booth-summary-card">
          <h2 style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            Delivery Status Distribution
          </h2>
          {analytics.totalSent > 0 ? (
            <div className="flex justify-center">
              <div style={{ maxWidth: 220, maxHeight: 220 }}>
                <Doughnut data={deliveryChartData} options={chartOptions} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 size={28} className="mx-auto mb-2 opacity-30" style={{ color: "var(--text-muted)" }} />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No data yet — launch a campaign first</p>
            </div>
          )}
        </div>

        {/* Channel Distribution Chart */}
        <div className="booth-summary-card">
          <h2 style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            Channel Distribution
          </h2>
          {allLogs.length > 0 ? (
            <div className="flex justify-center">
              <div style={{ width: "100%", maxWidth: 280, maxHeight: 200 }}>
                <Bar data={channelChartData} options={barOptions} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 size={28} className="mx-auto mb-2 opacity-30" style={{ color: "var(--text-muted)" }} />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign History */}
      <div className="booth-summary-card mt-6">
        <h2 style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
          Campaign History
        </h2>
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>No campaigns have been executed yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c, i) => (
              <div key={c.id} className="p-4 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {c.type === "launch" ? <Send size={14} style={{ color: "#3b82f6" }} /> : <Bell size={14} style={{ color: "#f59e0b" }} />}
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.label}</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{
                      background: c.status === "completed" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                      color: c.status === "completed" ? "#22c55e" : "#f59e0b",
                      fontFamily: "'DM Mono', monospace", fontSize: "10px",
                    }}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Targeted</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.targetCount}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Delivered</p>
                    <p className="text-sm font-medium" style={{ color: "#22c55e" }}>{c.deliveredCount}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Failed</p>
                    <p className="text-sm font-medium" style={{ color: "#ef4444" }}>{c.failedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px", textTransform: "uppercase" }}>Pending</p>
                    <p className="text-sm font-medium" style={{ color: "#f59e0b" }}>{c.pendingCount}</p>
                  </div>
                </div>
                {c.completedAt && (
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                    Completed: {new Date(c.completedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}


// ═══════════════════════════════════════
// ── APPLICATION TRACKING TAB ──
// ═══════════════════════════════════════
function ApplicationsTab({ scheme, applications, analytics }) {
  const [filter, setFilter] = useState("all")

  const filteredApps = filter === "all" ? applications : applications.filter(a => a.status === filter)

  // Adoption Chart
  const adoptionData = analytics ? {
    labels: ["Applied", "In Progress", "Not Applied"],
    datasets: [{
      data: [analytics.applied, analytics.inProgress, analytics.notApplied],
      backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
      borderWidth: 2,
      borderColor: "#1a1a1a",
    }],
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: { position: "bottom", labels: { color: "#e2e8f0", padding: 8, font: { size: 10 } } },
      tooltip: { backgroundColor: "#1a1a1a", titleColor: "#f1f5f9", bodyColor: "#f1f5f9", borderColor: "#2a2a2a", borderWidth: 1 },
    },
  }

  const statusColors = { applied: "#22c55e", "in-progress": "#f59e0b", "not-applied": "#ef4444" }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total Targeted", value: analytics.total, color: "var(--text-primary)" },
            { label: "Applied", value: analytics.applied, color: "#22c55e" },
            { label: "In Progress", value: analytics.inProgress, color: "#f59e0b" },
            { label: "Not Applied", value: analytics.notApplied, color: "#ef4444" },
            { label: "Adoption Rate", value: `${analytics.adoptionRate}%`, color: parseFloat(analytics.adoptionRate) >= 50 ? "#22c55e" : "#f59e0b" },
          ].map(stat => (
            <div key={stat.label} className="insight-stat-box">
              <p>{stat.label}</p>
              <p style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adoption Chart */}
        <div className="booth-summary-card">
          <h2 style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            Application Adoption Distribution
          </h2>
          {adoptionData ? (
            <div className="flex justify-center">
              <div style={{ maxWidth: 220, maxHeight: 220 }}>
                <Doughnut data={adoptionData} options={chartOptions} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No application data available</p>
            </div>
          )}

          {/* Progress Bar */}
          {analytics && (
            <div className="mt-5">
              <div className="flex justify-between items-center mb-1.5">
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                  Adoption Progress
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--accent)" }}>
                  {analytics.adoptionRate}%
                </p>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #22c55e, var(--accent))" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics.adoptionRate}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Application List */}
        <div className="booth-summary-card">
          <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
              Application Records ({filteredApps.length})
            </p>
            <div className="flex gap-1">
              {["all", "applied", "in-progress", "not-applied"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-2 py-1 rounded text-xs transition-all"
                  style={{
                    background: filter === f ? "var(--accent-dim)" : "transparent",
                    border: `1px solid ${filter === f ? "rgba(200,255,0,0.25)" : "transparent"}`,
                    color: filter === f ? "var(--accent)" : "var(--text-muted)",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "9px",
                    textTransform: "uppercase",
                  }}
                >
                  {f === "all" ? "All" : f.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {filteredApps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>No records match this filter</p>
              </div>
            ) : (
              filteredApps.map((app, i) => (
                <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                  {app.status === "applied"
                    ? <Check size={14} style={{ color: "#22c55e" }} />
                    : app.status === "in-progress"
                      ? <Loader size={14} style={{ color: "#f59e0b" }} />
                      : <X size={14} style={{ color: "#ef4444" }} />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {app.voterName}
                    </p>
                    {app.portalReference && (
                      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px" }}>
                        Ref: {app.portalReference}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs" style={{ color: statusColors[app.status], fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                      {app.status.replace("-", " ")}
                    </p>
                    {app.appliedAt && (
                      <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "9px" }}>
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Impact Insight */}
      {analytics && (
        <div className="insight-text-box mt-6">
          <p>
            <strong style={{ color: "var(--accent)" }}>{analytics.adoptionRate}%</strong> of targeted {scheme.category.toLowerCase()} have applied for {scheme.name}.
            {parseFloat(analytics.adoptionRate) < 50
              ? " The adoption rate is below 50%, indicating a need for additional outreach campaigns or follow-up communications."
              : " The adoption rate is healthy, indicating successful communication and citizen engagement."
            }
            {" "}Engagement rate (applied + in-progress) stands at <strong style={{ color: "var(--accent)" }}>{analytics.engagementRate}%</strong>.
          </p>
        </div>
      )}
    </motion.div>
  )
}
