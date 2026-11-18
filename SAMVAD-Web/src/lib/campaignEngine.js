// ── Campaign Engine ──
// Manages notification campaigns, delivery simulation, and reminder scheduling

/**
 * Generate a campaign record for a scheme launch notification
 */
export function createLaunchCampaign(scheme, targetVoters) {
  return {
    id: `CMP-${scheme.id}-LAUNCH`,
    schemeId: scheme.id,
    type: "launch",
    label: "Scheme Launch Announcement",
    channels: ["sms", "voice"],
    targetCount: targetVoters.length,
    deliveredCount: 0,
    failedCount: 0,
    pendingCount: targetVoters.length,
    status: "pending", // pending | in-progress | completed
    createdAt: new Date().toISOString(),
    completedAt: null,
    logs: [],
  }
}

/**
 * Generate a campaign record for a deadline reminder notification
 */
export function createReminderCampaign(scheme, targetVoters) {
  return {
    id: `CMP-${scheme.id}-REMINDER`,
    schemeId: scheme.id,
    type: "reminder",
    label: "Registration Deadline Reminder",
    channels: ["sms", "voice"],
    targetCount: targetVoters.length,
    deliveredCount: 0,
    failedCount: 0,
    pendingCount: targetVoters.length,
    status: "scheduled", // scheduled | in-progress | completed
    scheduledFor: getOneDayBefore(scheme.registrationDeadline),
    createdAt: new Date().toISOString(),
    completedAt: null,
    logs: [],
  }
}

/**
 * Simulate sending a notification to a single voter
 * Returns a log entry with delivery status
 */
export function simulateDelivery(voter, scheme, channel, type) {
  // 92% success rate simulation
  const isSuccess = Math.random() > 0.08
  const status = isSuccess ? "delivered" : "failed"
  const failReason = !isSuccess
    ? ["Network unreachable", "Invalid number", "DND enabled"][Math.floor(Math.random() * 3)]
    : null

  return {
    voterId: voter.name,
    voterName: voter.name,
    voterAge: voter.age,
    voterOccupation: voter.occupation,
    channel,
    type,
    schemeName: scheme.name,
    status,
    failReason,
    timestamp: new Date().toISOString(),
    message: generateNotificationMessage(scheme, voter, type),
  }
}

/**
 * Generate a realistic notification message
 */
function generateNotificationMessage(scheme, voter, type) {
  if (type === "launch") {
    return `Namaste ${voter.name}, ${scheme.name} is now open for registration. ${scheme.description.substring(0, 80)}... Apply before ${formatDate(scheme.registrationDeadline)}. Visit ${scheme.portalUrl}`
  }
  return `Reminder: ${voter.name}, registration for ${scheme.name} closes tomorrow (${formatDate(scheme.registrationDeadline)}). Apply now at ${scheme.portalUrl} to avail benefits.`
}

/**
 * Calculate campaign analytics from logs
 */
export function computeCampaignAnalytics(campaigns) {
  let totalTargeted = 0
  let totalSent = 0
  let totalDelivered = 0
  let totalFailed = 0
  let totalPending = 0

  campaigns.forEach(c => {
    totalTargeted += c.targetCount
    totalDelivered += c.deliveredCount
    totalFailed += c.failedCount
    totalPending += c.pendingCount
    totalSent += c.deliveredCount + c.failedCount
  })

  const successRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0

  return {
    totalTargeted,
    totalSent,
    totalDelivered,
    totalFailed,
    totalPending,
    successRate,
    campaignCount: campaigns.length,
  }
}

// ── Helpers ──

function getOneDayBefore(dateStr) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split("T")[0]
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
