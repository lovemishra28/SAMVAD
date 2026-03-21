export function getSchemeStatus(scheme) {
  // Gracefully handle missing dates
  if (!scheme.registrationDeadline || !scheme.launchDate) return "active";
  
  const today = new Date()
  const deadline = new Date(scheme.registrationDeadline)
  const launch = new Date(scheme.launchDate)

  if (today < launch) return "upcoming"
  if (today > deadline) return "closed"
  return "active"
}

export function getDaysUntilDeadline(scheme) {
  if (!scheme.registrationDeadline) return 0;
  const today = new Date()
  const deadline = new Date(scheme.registrationDeadline)
  const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
  return diff
}

const categoryMap = {
  farmer: "farmers",
  farmers: "farmers",
  agriculture: "farmers",
  student: "students",
  students: "students",
  school: "students",
  college: "students",
  youth: "students",
  "senior citizen": "seniorCitizens",
  "senior citizens": "seniorCitizens",
  senior: "seniorCitizens",
  "senior citizens": "seniorCitizens",
  worker: "workers",
  workers: "workers",
  labor: "workers",
  labour: "workers",
  women: "women",
  others: "women",
  other: "women",
};

export function mapSchemeCategoryToSegmentKey(category) {
  if (!category) return null;
  const norm = String(category).trim().toLowerCase();
  if (categoryMap[norm]) return categoryMap[norm];

  // fuzzy matching
  if (norm.includes("farmer")) return "farmers";
  if (norm.includes("student") || norm.includes("school") || norm.includes("college") || norm.includes("youth")) return "students";
  if (norm.includes("senior")) return "seniorCitizens";
  if (norm.includes("worker") || norm.includes("labor") || norm.includes("labour")) return "workers";
  if (norm.includes("other")) return "women";

  return null;
}

export function filterVotersByScheme(voters, scheme) {
  if (!Array.isArray(voters) || voters.length === 0) return [];
  if (!scheme) return voters;

  const categoryKey = mapSchemeCategoryToSegmentKey(scheme.category);
  if (categoryKey) {
    switch (categoryKey) {
      case "farmers":
        return voters.filter(v => String(v.occupation || "").toLowerCase().includes("farmer"));
      case "students":
        return voters.filter(v => String(v.occupation || "").toLowerCase().includes("student") || (typeof v.age === "number" && v.age < 30));
      case "seniorCitizens":
        return voters.filter(v => String(v.occupation || "").toLowerCase().includes("senior") || (typeof v.age === "number" && v.age >= 60));
      case "workers":
        return voters.filter(v => String(v.occupation || "").toLowerCase().includes("worker") || String(v.occupation || "").toLowerCase().includes("labor") || String(v.occupation || "").toLowerCase().includes("labour"));
      case "women":
        return voters.filter(v => {
          const occ = String(v.occupation || "").toLowerCase();
          return !occ.includes("farmer") && !occ.includes("student") && !occ.includes("senior") && !occ.includes("worker") && !occ.includes("labor") && !occ.includes("labour")
        });
      default:
        return voters;
    }
  }

  // fallback: if issue_targeted exists, use string matching across occupation and category fields.
  const issue = String(scheme.issue_targeted || "").toLowerCase();
  if (issue) {
    return voters.filter(v => {
      const occ = String(v.occupation || "").toLowerCase();
      const name = String(v.name || "").toLowerCase();
      return occ.includes(issue) || name.includes(issue);
    });
  }

  // fallback all voters if category not understood
  return voters;
}

