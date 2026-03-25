"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star, MessageSquare, TrendingUp, Filter,
  ChevronDown, ChevronUp, Users, FileText,
  Search
} from "lucide-react"
import BackButton from "../../components/BackButton"
import { fetchSchemeFeedbackSummary, fetchAllFeedback } from "../../lib/api/feedback"

// Stars UI helper
function StarDisplay({ rating, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          style={{
            color: i <= Math.round(rating) ? "#FFD700" : "#3a3a3a",
            fill: i <= Math.round(rating) ? "#FFD700" : "none",
          }}
        />
      ))}
    </span>
  )
}

export default function FeedbackPage() {
  const [summaries, setSummaries] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("schemes") // "schemes" | "suggestions"
  const [expandedScheme, setExpandedScheme] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [summaryData, allFeedback] = await Promise.all([
          fetchSchemeFeedbackSummary(),
          fetchAllFeedback(),
        ])
        setSummaries(summaryData.summaries || [])
        setSuggestionCount(summaryData.suggestionCount || 0)
        setSuggestions(allFeedback.filter(f => f.type === "suggestion"))
      } catch (err) {
        console.warn("Failed to load feedback data:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalRatings = useMemo(() =>
    summaries.reduce((sum, s) => sum + s.totalRatings, 0),
    [summaries]
  )

  const overallAvg = useMemo(() => {
    if (summaries.length === 0) return 0
    const weighted = summaries.reduce((sum, s) => sum + s.avgRating * s.totalRatings, 0)
    return totalRatings > 0 ? Math.round((weighted / totalRatings) * 10) / 10 : 0
  }, [summaries, totalRatings])

  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return summaries
    const q = searchQuery.toLowerCase()
    return summaries.filter(s =>
      s.schemeName?.toLowerCase().includes(q) || s.schemeId?.toLowerCase().includes(q)
    )
  }, [summaries, searchQuery])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] flex items-center justify-center p-4 md:p-6">
        <div style={{ color: "var(--text-secondary)" }}>Loading feedback data...</div>
      </div>
    )
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
              Feedback Overview
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              View citizen feedback, scheme ratings, and suggestions
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Ratings", value: totalRatings, icon: Star, color: "#FFD700" },
            { label: "Avg Rating", value: overallAvg.toFixed(1), icon: TrendingUp, color: "#22c55e" },
            { label: "Schemes Rated", value: summaries.length, icon: FileText, color: "#3b82f6" },
            { label: "Suggestions", value: suggestionCount, icon: MessageSquare, color: "#8b5cf6" },
          ].map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-lg"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <Icon size={18} style={{ color: card.color, marginBottom: 8 }} />
                <p style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "22px",
                  fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2,
                }}>
                  {card.value}
                </p>
                <p style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "10px",
                  color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase",
                  marginTop: 4,
                }}>
                  {card.label}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "schemes", label: "Scheme Feedback" },
            { key: "suggestions", label: "Suggestions" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-lg text-xs transition-all"
              style={{
                background: activeTab === tab.key ? "var(--accent-dim)" : "var(--surface)",
                border: `1px solid ${activeTab === tab.key ? "rgba(0,164,206,0.3)" : "var(--border)"}`,
                color: activeTab === tab.key ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SCHEME FEEDBACK TAB */}
        {activeTab === "schemes" && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search schemes by name..."
                className="w-full booth-input"
                style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  color: "var(--text-primary)", borderRadius: "var(--radius-sm)",
                  padding: "10px 14px 10px 36px", fontSize: "13px",
                }}
              />
            </div>

            {/* Scheme Cards */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredSummaries.map((scheme, i) => {
                  const isExpanded = expandedScheme === scheme.schemeId
                  return (
                    <motion.div
                      key={scheme.schemeId}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-lg)",
                      }}
                    >
                      {/* Card Header */}
                      <button
                        onClick={() => setExpandedScheme(isExpanded ? null : scheme.schemeId)}
                        className="w-full p-5 flex items-center gap-4 text-left transition-all"
                        style={{ background: "transparent" }}
                      >
                        <div
                          className="flex items-center justify-center rounded-lg shrink-0"
                          style={{
                            width: 44, height: 44,
                            background: "rgba(59,130,246,0.1)",
                            border: "1px solid rgba(59,130,246,0.2)",
                          }}
                        >
                          <FileText size={20} style={{ color: "#3b82f6" }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {scheme.schemeName}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <StarDisplay rating={scheme.avgRating} size={13} />
                            <span style={{
                              fontFamily: "'DM Mono', monospace", fontSize: "12px",
                              fontWeight: 600, color: "#FFD700",
                            }}>
                              {scheme.avgRating}
                            </span>
                            <span style={{
                              fontFamily: "'DM Mono', monospace", fontSize: "10px",
                              color: "var(--text-muted)",
                            }}>
                              ({scheme.totalRatings} {scheme.totalRatings === 1 ? "rating" : "ratings"})
                            </span>
                          </div>
                        </div>

                        {isExpanded
                          ? <ChevronUp size={18} style={{ color: "var(--text-muted)", shrink: 0 }} />
                          : <ChevronDown size={18} style={{ color: "var(--text-muted)", shrink: 0 }} />
                        }
                      </button>

                      {/* Expanded Notes */}
                      <AnimatePresence>
                        {isExpanded && scheme.recentNotes.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="px-5 pb-5 space-y-2" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                              <p style={{
                                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                                color: "var(--text-muted)", letterSpacing: "0.1em",
                                textTransform: "uppercase", marginBottom: 8,
                              }}>
                                User Notes
                              </p>
                              {scheme.recentNotes.map((n, j) => (
                                <div
                                  key={j}
                                  className="p-3 rounded-lg"
                                  style={{
                                    background: "var(--bg)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius-sm)",
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="flex items-center gap-1" style={{
                                      fontFamily: "'DM Mono', monospace", fontSize: "11px",
                                      color: "var(--text-secondary)",
                                    }}>
                                      <Users size={11} />
                                      {n.voterName || "Anonymous"}
                                    </span>
                                    <StarDisplay rating={n.rating} size={10} />
                                  </div>
                                  <p style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                                    {n.note}
                                  </p>
                                  <p style={{
                                    fontFamily: "'DM Mono', monospace", fontSize: "9px",
                                    color: "var(--text-muted)", marginTop: 4,
                                  }}>
                                    {new Date(n.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric", month: "short", year: "numeric",
                                    })}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {filteredSummaries.length === 0 && (
                <div className="text-center py-16">
                  <Filter size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {summaries.length === 0 ? "No scheme feedback received yet" : "No schemes match your search"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* SUGGESTIONS TAB */}
        {activeTab === "suggestions" && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {suggestions.length > 0 ? suggestions.map((s, i) => (
                <motion.div
                  key={s._id || i}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="p-5 rounded-xl"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center rounded-lg shrink-0"
                      style={{
                        width: 36, height: 36,
                        background: "rgba(139,92,246,0.1)",
                        border: "1px solid rgba(139,92,246,0.2)",
                      }}
                    >
                      <MessageSquare size={16} style={{ color: "#8b5cf6" }} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>
                        {s.suggestionText}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: "10px",
                          color: "var(--text-muted)",
                        }}>
                          {s.voterName || "Anonymous"}
                        </span>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: "10px",
                          color: "var(--text-muted)",
                        }}>
                          {new Date(s.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-16">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No suggestions received yet</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}
