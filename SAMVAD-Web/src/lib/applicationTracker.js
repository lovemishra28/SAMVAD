// ── Application Tracker ──
// Simulates government portal integration for scheme application tracking

/**
 * Generate simulated application data for a scheme
 * Simulates that some voters have applied, some pending
 */
export function generateApplicationData(scheme, targetVoters) {
  const applications = targetVoters.map((voter, index) => {
    // Randomize: ~60% applied, ~15% in-progress, ~25% not applied
    const rand = Math.random()
    let status, appliedAt

    if (rand < 0.60) {
      status = "applied"

      // Random date between registration start and now
      const now = new Date()
      let start = new Date(scheme.registrationStart)

      // if start is invalid or in future, fallback to 30 days ago
      if (Number.isNaN(start.getTime()) || start.getTime() > now.getTime()) {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      const minTime = start.getTime()
      const maxTime = now.getTime()
      const randomTime = minTime + Math.random() * (maxTime - minTime)
      appliedAt = new Date(randomTime)

      if (Number.isNaN(appliedAt.getTime())) {
        appliedAt = now
      }

      appliedAt = appliedAt.toISOString()
    } else if (rand < 0.75) {
      status = "in-progress"
      appliedAt = null
    } else {
      status = "not-applied"
      appliedAt = null
    }

    return {
      id: `APP-${scheme.id}-${index}`,
      voterId: index,
      voterName: voter.name,
      voterAge: voter.age,
      voterOccupation: voter.occupation,
      schemeId: scheme.id,
      schemeName: scheme.name,
      status,
      appliedAt,
      portalReference: status === "applied" ? `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
    }
  })

  return applications
}

/**
 * Compute application analytics from application data
 */
export function computeApplicationAnalytics(applications) {
  const total = applications.length
  const applied = applications.filter(a => a.status === "applied").length
  const inProgress = applications.filter(a => a.status === "in-progress").length
  const notApplied = applications.filter(a => a.status === "not-applied").length

  return {
    total,
    applied,
    inProgress,
    notApplied,
    adoptionRate: total > 0 ? ((applied / total) * 100).toFixed(1) : 0,
    engagementRate: total > 0 ? (((applied + inProgress) / total) * 100).toFixed(1) : 0,
  }
}

/**
 * Simulate real-time application event coming from government portal
 */
export function simulateApplicationEvent(voter, scheme) {
  return {
    id: `APP-${scheme.id}-${Date.now()}`,
    voterId: voter.name,
    voterName: voter.name,
    schemeId: scheme.id,
    schemeName: scheme.name,
    status: "applied",
    appliedAt: new Date().toISOString(),
    portalReference: `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    source: "government-portal-api",
  }
}
