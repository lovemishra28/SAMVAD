// ── Notification Store ──
// Central persistence layer for notification records.
// Bridges the Notification Engine and Scheme Dashboard so that
// once a notification is sent, every scheme-related view can
// reflect the delivery status, type, timestamp, and audience.

const STORAGE_KEY = "samvad-notification-history"

/**
 * Read the full notification history from localStorage.
 * Returns an object keyed by category, each value being an array
 * of notification records.
 *
 * Shape:
 * {
 *   "Farmers": [
 *     {
 *       id: "notif-1710...",
 *       category: "Farmers",
 *       type: "early_alert",             // early_alert | deadline_reminder
 *       sentAt: "2026-03-11T22:30:00...", // ISO timestamp
 *       audienceCount: 12,
 *       schemes: ["PM-Kisan", "Soil Health Card", ...],
 *       logs: [ { voter, scheme, status, time }, ... ],
 *     }
 *   ]
 * }
 */
export function getNotificationHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Get all notification records that mention a particular scheme name.
 * Searches across all categories.
 */
export function getNotificationsForScheme(schemeName) {
  const history = getNotificationHistory()
  const matches = []

  Object.values(history).forEach(categoryRecords => {
    categoryRecords.forEach(record => {
      // Check if any log entry references this scheme, or if the scheme
      // is listed in the record's schemes array
      const mentionsScheme =
        record.schemes?.some(s =>
          schemeName.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(schemeName.toLowerCase())
        ) ||
        record.logs?.some(log =>
          schemeName.toLowerCase().includes(log.scheme?.toLowerCase()) ||
          log.scheme?.toLowerCase().includes(schemeName.toLowerCase())
        )

      if (mentionsScheme) {
        matches.push(record)
      }
    })
  })

  return matches
}

/**
 * Get all notification records for a given category.
 */
export function getNotificationsForCategory(category) {
  const history = getNotificationHistory()
  return history[category] || []
}

/**
 * Save a new notification record after the Notification Engine
 * finishes sending a batch.
 *
 * @param {object} record
 * @param {string} record.category   – Target category (e.g. "Farmers")
 * @param {string} record.type       – "early_alert" | "deadline_reminder"
 * @param {number} record.audienceCount
 * @param {string[]} record.schemes  – Scheme names that were dispatched
 * @param {Array}  record.logs       – Individual delivery logs
 */
export function saveNotificationRecord(record) {
  const history = getNotificationHistory()

  const entry = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category: record.category,
    type: record.type || "early_alert",
    sentAt: new Date().toISOString(),
    audienceCount: record.audienceCount,
    schemes: record.schemes || [],
    logs: record.logs || [],
  }

  if (!history[record.category]) {
    history[record.category] = []
  }
  history[record.category].push(entry)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  return entry
}

/**
 * Check if any notification has ever been sent for a given category.
 */
export function hasNotificationBeenSent(category) {
  const records = getNotificationsForCategory(category)
  return records.length > 0
}

/**
 * Get the most recent notification record for a category.
 */
export function getLatestNotification(category) {
  const records = getNotificationsForCategory(category)
  if (records.length === 0) return null
  return records[records.length - 1]
}

/**
 * Get a summary object with counts and latest timestamps per category.
 * Useful for the schemes list page badges.
 */
export function getNotificationSummary() {
  const history = getNotificationHistory()
  const summary = {}

  Object.entries(history).forEach(([category, records]) => {
    if (records.length > 0) {
      const latest = records[records.length - 1]
      const totalDelivered = records.reduce(
        (sum, r) => sum + (r.logs?.filter(l => l.status === "delivered").length || 0),
        0
      )
      summary[category] = {
        totalBatches: records.length,
        totalDelivered,
        latestSentAt: latest.sentAt,
        latestType: latest.type,
        latestAudienceCount: latest.audienceCount,
      }
    }
  })

  return summary
}

/**
 * Check which schemes in a category have NOT yet been covered
 * by any notification batch. Returns an array of scheme names
 * that still need notifications.
 *
 * @param {string} category – e.g. "Farmers"
 * @param {string[]} allSchemeNames – all scheme names for this category
 * @returns {string[]} scheme names that haven't been notified yet
 */
export function getUnnotifiedSchemes(category, allSchemeNames) {
  const records = getNotificationsForCategory(category)

  // Collect all scheme names that have been covered
  const notifiedSet = new Set()
  records.forEach(record => {
    (record.schemes || []).forEach(s => notifiedSet.add(s.toLowerCase()))
    ;(record.logs || []).forEach(log => {
      if (log.scheme) notifiedSet.add(log.scheme.toLowerCase())
    })
  })

  return allSchemeNames.filter(
    name => !notifiedSet.has(name.toLowerCase())
  )
}
