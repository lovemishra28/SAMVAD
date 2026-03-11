"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wheat, GraduationCap, UserRound, Wrench, Users,
  Plus, Search, Filter, Calendar, Clock, ExternalLink,
  ChevronRight, Shield, TrendingUp, Bell, CheckCircle2,
  Send, AlertCircle
} from "lucide-react"
import BackButton from "../../components/BackButton"
import { SCHEMES_DATABASE, getSchemesByCategory, getAllCategories, getDaysUntilDeadline } from "../../lib/schemesData"
import { getNotificationSummary, getNotificationsForCategory, getNotificationsForScheme } from "../../lib/notificationStore"

const CATEGORY_ICONS = {
  Farmers: Wheat,
  Students: GraduationCap,
  "Senior Citizens": UserRound,
  Workers: Wrench,
  Others: Users,
}

const CATEGORY_COLORS = {
  Farmers: "#22c55e",
  Students: "#3b82f6",
  "Senior Citizens": "#f59e0b",
  Workers: "#8b5cf6",
  Others: "#ec4899",
}

const STATUS_CONFIG = {
  active: { label: "Active", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  upcoming: { label: "Upcoming", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  closed: { label: "Closed", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
}

const NOTIF_TYPE_LABELS = {
  early_alert: "Early Alert",
  deadline_reminder: "Deadline Reminder",
  launch: "Launch Notification",
  reminder: "Deadline Reminder",
}

export default function SchemesManagement() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [schemes, setSchemes] = useState(SCHEMES_DATABASE)
  const [notifSummary, setNotifSummary] = useState({})
  const [schemeNotifications, setSchemeNotifications] = useState({})

  // New scheme form state
  const [newScheme, setNewScheme] = useState({
    name: "", description: "", category: "Farmers",
    launchDate: "", registrationStart: "", registrationDeadline: "",
    beneficiaryGroup: "", portalUrl: "",
  })

  const categories = getAllCategories()

  // Load notification data on mount
  useEffect(() => {
    const summary = getNotificationSummary()
    setNotifSummary(summary)

    // Build per-scheme notification lookup
    const schemeNotifs = {}
    schemes.forEach(s => {
      const notifs = getNotificationsForScheme(s.name)
      const categoryNotifs = getNotificationsForCategory(s.category)
      // Merge: scheme-specific + category-level notifications
      const allNotifs = [...notifs]
      categoryNotifs.forEach(cn => {
        if (!allNotifs.some(n => n.id === cn.id)) {
          allNotifs.push(cn)
        }
      })
      if (allNotifs.length > 0) {
        schemeNotifs[s.id] = allNotifs
      }

      // Also check localStorage for scheme-level campaign records
      try {
        const raw = localStorage.getItem(`campaigns-${s.id}`)
        if (raw) {
          const campaigns = JSON.parse(raw)
          const completedCampaigns = campaigns.filter(c => c.status === "completed")
          if (completedCampaigns.length > 0 && !schemeNotifs[s.id]) {
            schemeNotifs[s.id] = completedCampaigns.map(c => ({
              id: c.id,
              type: c.type || "launch",
              sentAt: c.completedAt,
              audienceCount: c.targetCount,
              logs: c.logs,
            }))
          } else if (completedCampaigns.length > 0 && schemeNotifs[s.id]) {
            // Merge campaign data in
            completedCampaigns.forEach(c => {
              if (!schemeNotifs[s.id].some(n => n.id === c.id)) {
                schemeNotifs[s.id].push({
                  id: c.id,
                  type: c.type || "launch",
                  sentAt: c.completedAt,
                  audienceCount: c.targetCount,
                  logs: c.logs,
                })
              }
            })
          }
        }
      } catch {}
    })
    setSchemeNotifications(schemeNotifs)
  }, [schemes])

  const filteredSchemes = useMemo(() => {
    let result = [...schemes]
    if (activeFilter !== "all") {
      result = result.filter(s => s.category === activeFilter)
    }
    if (statusFilter !== "all") {
      result = result.filter(s => s.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [schemes, activeFilter, statusFilter, searchQuery])

  const categoryStats = useMemo(() => {
    return categories.map(cat => ({
      name: cat,
      count: schemes.filter(s => s.category === cat).length,
      active: schemes.filter(s => s.category === cat && s.status === "active").length,
      notified: !!notifSummary[cat],
    }))
  }, [schemes, categories, notifSummary])

  const handleAddScheme = () => {
    if (!newScheme.name || !newScheme.description) return
    const id = `SCH${String(schemes.length + 1).padStart(3, "0")}`
    const scheme = { ...newScheme, id, status: "upcoming" }
    setSchemes(prev => [...prev, scheme])
    setShowAddModal(false)
    setNewScheme({
      name: "", description: "", category: "Farmers",
      launchDate: "", registrationStart: "", registrationDeadline: "",
      beneficiaryGroup: "", portalUrl: "",
    })
  }

  // Helper to get latest notification info for a scheme
  const getSchemeNotifInfo = (schemeId) => {
    const notifs = schemeNotifications[schemeId]
    if (!notifs || notifs.length === 0) return null
    const latest = notifs[notifs.length - 1]
    return {
      count: notifs.length,
      latestType: latest.type,
      latestSentAt: latest.sentAt,
      audienceCount: latest.audienceCount,
      totalDelivered: notifs.reduce(
        (sum, n) => sum + (n.logs?.filter(l => l.status === "delivered").length || n.audienceCount || 0),
        0
      ),
    }
  }

  return (
    <div className="min-h-[calc(100vh-70px)] p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto"
      >
        <BackButton fallbackHref="/dashboard" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
              Scheme Management
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage, monitor, and deploy government schemes as targeted campaigns
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="primary-button flex items-center gap-2"
          >
            <Plus size={14} />
            Add New Scheme
          </motion.button>
        </div>

        {/* Category Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {categoryStats.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.name] || Users
            const isActive = activeFilter === cat.name
            return (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFilter(isActive ? "all" : cat.name)}
                className="p-4 rounded-lg text-left transition-all relative"
                style={{
                  background: isActive ? "var(--accent-dim)" : "var(--surface)",
                  border: `1px solid ${isActive ? "rgba(200,255,0,0.3)" : "var(--border)"}`,
                  borderRadius: "var(--radius-md)",
                }}
              >
                <Icon size={20} style={{ color: isActive ? "var(--accent)" : CATEGORY_COLORS[cat.name] }} />
                <p className="text-xs font-medium mt-2" style={{ color: isActive ? "var(--accent)" : "var(--text-primary)" }}>
                  {cat.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "18px", fontWeight: 600, color: isActive ? "var(--accent)" : "var(--text-primary)" }}>
                    {cat.count}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>
                    schemes
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#22c55e" }}>
                    {cat.active} active
                  </span>
                  {cat.notified && (
                    <span className="flex items-center gap-0.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "#22c55e" }}>
                      <CheckCircle2 size={9} /> sent
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes by name, description, or category..."
              className="w-full booth-input"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px 10px 36px",
                fontSize: "13px",
              }}
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "upcoming", "closed"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-lg text-xs transition-all"
                style={{
                  background: statusFilter === s ? "var(--accent-dim)" : "var(--surface)",
                  border: `1px solid ${statusFilter === s ? "rgba(200,255,0,0.3)" : "var(--border)"}`,
                  color: statusFilter === s ? "var(--accent)" : "var(--text-secondary)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredSchemes.map((scheme, i) => {
              const Icon = CATEGORY_ICONS[scheme.category] || Users
              const statusCfg = STATUS_CONFIG[scheme.status] || STATUS_CONFIG.active
              const daysLeft = getDaysUntilDeadline(scheme)
              const notifInfo = getSchemeNotifInfo(scheme.id)

              return (
                <motion.div
                  key={scheme.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  onClick={() => router.push(`/schemes/${scheme.id}`)}
                  className="p-5 rounded-xl cursor-pointer transition-all group"
                  style={{
                    background: "var(--surface)",
                    border: `1px solid ${notifInfo ? "rgba(34,197,94,0.15)" : "var(--border)"}`,
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="flex items-center justify-center rounded-lg shrink-0"
                      style={{
                        width: 44, height: 44,
                        background: `${CATEGORY_COLORS[scheme.category]}15`,
                        border: `1px solid ${CATEGORY_COLORS[scheme.category]}30`,
                      }}
                    >
                      <Icon size={20} style={{ color: CATEGORY_COLORS[scheme.category] }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {scheme.name}
                        </h3>
                        <span
                          className="px-2 py-0.5 rounded text-xs shrink-0"
                          style={{
                            background: statusCfg.bg,
                            color: statusCfg.color,
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "10px",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {statusCfg.label}
                        </span>

                        {/* ── Notification Status Badge ── */}
                        {notifInfo ? (
                          <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs shrink-0"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              color: "#22c55e",
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "10px",
                              letterSpacing: "0.04em",
                              border: "1px solid rgba(34,197,94,0.2)",
                            }}
                          >
                            <CheckCircle2 size={10} />
                            Notified
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs shrink-0"
                            style={{
                              background: "rgba(245,158,11,0.08)",
                              color: "#f59e0b",
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "10px",
                              letterSpacing: "0.04em",
                              border: "1px solid rgba(245,158,11,0.15)",
                            }}
                          >
                            <AlertCircle size={10} />
                            Awaiting Notification
                          </span>
                        )}
                      </div>

                      <p className="text-xs mb-2 line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                        {scheme.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                          <Shield size={11} />
                          {scheme.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                          <Calendar size={11} />
                          Deadline: {new Date(scheme.registrationDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                        {daysLeft > 0 && scheme.status === "active" && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: daysLeft <= 7 ? "#ef4444" : "#22c55e", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                            <Clock size={11} />
                            {daysLeft} days left
                          </span>
                        )}
                      </div>

                      {/* ── Notification Metadata Row ── */}
                      {notifInfo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2 flex flex-wrap items-center gap-3 pt-2"
                          style={{ borderTop: "1px solid var(--border)" }}
                        >
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#22c55e", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                            <Send size={10} />
                            {NOTIF_TYPE_LABELS[notifInfo.latestType] || notifInfo.latestType}
                          </span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                            <Clock size={10} />
                            {new Date(notifInfo.latestSentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}{" "}
                            {new Date(notifInfo.latestSentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                            <Users size={10} />
                            {notifInfo.audienceCount} recipients
                          </span>
                          {notifInfo.count > 1 && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--accent)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
                              <Bell size={10} />
                              {notifInfo.count} notifications sent
                            </span>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={18}
                      className="shrink-0 mt-2 transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filteredSchemes.length === 0 && (
            <div className="text-center py-16">
              <Filter size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No schemes match your filters</p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}
        >
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "20px", fontWeight: 600, color: "var(--text-primary)" }}>{schemes.length}</p>
            </div>
            <div style={{ width: 1, height: 30, background: "var(--border)" }} />
            <div className="text-center">
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Active</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "20px", fontWeight: 600, color: "#22c55e" }}>{schemes.filter(s => s.status === "active").length}</p>
            </div>
            <div style={{ width: 1, height: 30, background: "var(--border)" }} />
            <div className="text-center">
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Upcoming</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "20px", fontWeight: 600, color: "#f59e0b" }}>{schemes.filter(s => s.status === "upcoming").length}</p>
            </div>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "10px" }}>
            Showing {filteredSchemes.length} of {schemes.length} schemes
          </p>
        </motion.div>
      </motion.div>

      {/* ── Add Scheme Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Add New Scheme</h2>
              <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>
                Create a new government scheme and map it to a citizen category
              </p>

              <div className="space-y-4">
                {/* Scheme Name */}
                <div>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    Scheme Name
                  </label>
                  <input
                    type="text"
                    value={newScheme.name}
                    onChange={(e) => setNewScheme(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Pradhan Mantri Awas Yojana"
                    className="w-full mt-1.5 booth-input"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "13px" }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    Description
                  </label>
                  <textarea
                    value={newScheme.description}
                    onChange={(e) => setNewScheme(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the scheme and its benefits..."
                    rows={3}
                    className="w-full mt-1.5 booth-input resize-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "13px" }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    Target Category
                  </label>
                  <select
                    value={newScheme.category}
                    onChange={(e) => setNewScheme(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full mt-1.5 booth-select"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "13px" }}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                      Launch Date
                    </label>
                    <input
                      type="date"
                      value={newScheme.launchDate}
                      onChange={(e) => setNewScheme(prev => ({ ...prev, launchDate: e.target.value }))}
                      className="w-full mt-1.5 booth-input"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", padding: "8px 10px", fontSize: "11px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                      Reg. Start
                    </label>
                    <input
                      type="date"
                      value={newScheme.registrationStart}
                      onChange={(e) => setNewScheme(prev => ({ ...prev, registrationStart: e.target.value }))}
                      className="w-full mt-1.5 booth-input"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", padding: "8px 10px", fontSize: "11px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newScheme.registrationDeadline}
                      onChange={(e) => setNewScheme(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                      className="w-full mt-1.5 booth-input"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", padding: "8px 10px", fontSize: "11px" }}
                    />
                  </div>
                </div>

                {/* Beneficiary Group */}
                <div>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    Beneficiary Group
                  </label>
                  <input
                    type="text"
                    value={newScheme.beneficiaryGroup}
                    onChange={(e) => setNewScheme(prev => ({ ...prev, beneficiaryGroup: e.target.value }))}
                    placeholder="e.g. Small and marginal farmers"
                    className="w-full mt-1.5 booth-input"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "13px" }}
                  />
                </div>

                {/* Portal URL */}
                <div>
                  <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                    Government Portal URL
                  </label>
                  <input
                    type="url"
                    value={newScheme.portalUrl}
                    onChange={(e) => setNewScheme(prev => ({ ...prev, portalUrl: e.target.value }))}
                    placeholder="https://scheme.gov.in"
                    className="w-full mt-1.5 booth-input"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm transition-colors"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddScheme}
                  className="flex-1 primary-button text-center"
                  style={{ opacity: (!newScheme.name || !newScheme.description) ? 0.5 : 1 }}
                >
                  Create Scheme
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
