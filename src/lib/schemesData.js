// ── Centralized Scheme Data Store ──
// Each scheme is a structured entity with metadata for campaign management

export const SCHEMES_DATABASE = [
  {
    id: "SCH001",
    name: "PM-Kisan Samman Nidhi",
    description: "Direct income support of ₹6,000 per year in three equal installments to small and marginal farmer families across India.",
    category: "Farmers",
    launchDate: "2026-02-15",
    registrationStart: "2026-02-20",
    registrationDeadline: "2026-04-15",
    beneficiaryGroup: "Small and marginal farmers with cultivable land",
    status: "active",
    portalUrl: "https://pmkisan.gov.in",
  },
  {
    id: "SCH002",
    name: "Soil Health Card Scheme",
    description: "Provides soil health cards to farmers carrying crop-wise nutrient recommendations to improve productivity through judicious use of inputs.",
    category: "Farmers",
    launchDate: "2026-03-01",
    registrationStart: "2026-03-05",
    registrationDeadline: "2026-05-30",
    beneficiaryGroup: "All farmers engaged in agricultural activities",
    status: "active",
    portalUrl: "https://soilhealth.dac.gov.in",
  },
  {
    id: "SCH003",
    name: "Pradhan Mantri Fasal Bima Yojana",
    description: "Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss or damage due to unforeseen events.",
    category: "Farmers",
    launchDate: "2026-03-10",
    registrationStart: "2026-03-15",
    registrationDeadline: "2026-06-01",
    beneficiaryGroup: "All farmers including sharecroppers and tenant farmers",
    status: "upcoming",
    portalUrl: "https://pmfby.gov.in",
  },
  {
    id: "SCH004",
    name: "National Scholarship Portal",
    description: "One-stop scholarship platform providing pre-matric and post-matric scholarships to meritorious students from economically weaker sections.",
    category: "Students",
    launchDate: "2026-01-10",
    registrationStart: "2026-01-15",
    registrationDeadline: "2026-03-31",
    beneficiaryGroup: "Students from Class 1 to PhD level from low-income families",
    status: "active",
    portalUrl: "https://scholarships.gov.in",
  },
  {
    id: "SCH005",
    name: "Skill India — PMKVY",
    description: "Skill development and certification program enabling Indian youth to take up industry-relevant skill training for better livelihood.",
    category: "Students",
    launchDate: "2026-02-01",
    registrationStart: "2026-02-10",
    registrationDeadline: "2026-04-30",
    beneficiaryGroup: "Youth aged 15-35 seeking skill development and certification",
    status: "active",
    portalUrl: "https://skillindia.gov.in",
  },
  {
    id: "SCH006",
    name: "National Pension Scheme",
    description: "Voluntary defined contribution retirement savings scheme designed to enable systematic savings for old age during the working life.",
    category: "Senior Citizens",
    launchDate: "2026-01-20",
    registrationStart: "2026-01-25",
    registrationDeadline: "2026-05-15",
    beneficiaryGroup: "Citizens aged 60 and above, retired individuals",
    status: "active",
    portalUrl: "https://npscra.nsdl.co.in",
  },
  {
    id: "SCH007",
    name: "Ayushman Bharat — PMJAY",
    description: "World's largest health assurance scheme providing ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
    category: "Senior Citizens",
    launchDate: "2026-02-25",
    registrationStart: "2026-03-01",
    registrationDeadline: "2026-06-30",
    beneficiaryGroup: "Senior citizens and economically vulnerable families",
    status: "active",
    portalUrl: "https://pmjay.gov.in",
  },
  {
    id: "SCH008",
    name: "PM Shram Yogi Maandhan",
    description: "Pension scheme for unorganized sector workers ensuring a minimum monthly pension of ₹3,000 after the age of 60.",
    category: "Workers",
    launchDate: "2026-03-05",
    registrationStart: "2026-03-10",
    registrationDeadline: "2026-05-10",
    beneficiaryGroup: "Unorganized workers aged 18-40 with monthly income below ₹15,000",
    status: "active",
    portalUrl: "https://maandhan.in",
  },
  {
    id: "SCH009",
    name: "Skill Development Initiative — SDI",
    description: "Provides modular employable skills to school dropouts and existing workers through flexible delivery mechanisms.",
    category: "Workers",
    launchDate: "2026-03-15",
    registrationStart: "2026-03-20",
    registrationDeadline: "2026-06-15",
    beneficiaryGroup: "Existing workers and school dropouts in unorganized sector",
    status: "upcoming",
    portalUrl: "https://dgt.gov.in",
  },
  {
    id: "SCH010",
    name: "Jan Dhan Yojana",
    description: "National mission for financial inclusion to ensure access to financial services including banking, credit, insurance, and pension.",
    category: "Others",
    launchDate: "2026-01-05",
    registrationStart: "2026-01-10",
    registrationDeadline: "2026-12-31",
    beneficiaryGroup: "All citizens without bank accounts",
    status: "active",
    portalUrl: "https://pmjdy.gov.in",
  },
  {
    id: "SCH011",
    name: "Digital India Services",
    description: "Initiative to transform India into a digitally empowered society by ensuring digital infrastructure and digital literacy to citizens.",
    category: "Others",
    launchDate: "2026-02-20",
    registrationStart: "2026-02-25",
    registrationDeadline: "2026-07-31",
    beneficiaryGroup: "All citizens seeking digital literacy and government e-services",
    status: "active",
    portalUrl: "https://digitalindia.gov.in",
  },
]

// ── Helper Functions ──

export function getSchemesByCategory(category) {
  return SCHEMES_DATABASE.filter(s => s.category === category)
}

export function getSchemeById(id) {
  return SCHEMES_DATABASE.find(s => s.id === id)
}

export function getAllCategories() {
  return [...new Set(SCHEMES_DATABASE.map(s => s.category))]
}

export function getSchemeStatus(scheme) {
  const today = new Date()
  const deadline = new Date(scheme.registrationDeadline)
  const launch = new Date(scheme.launchDate)

  if (today < launch) return "upcoming"
  if (today > deadline) return "closed"
  return "active"
}

export function getDaysUntilDeadline(scheme) {
  const today = new Date()
  const deadline = new Date(scheme.registrationDeadline)
  const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
  return diff
}
