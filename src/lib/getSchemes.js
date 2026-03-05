export function getSchemes(category) {

  const schemes = {

    Farmers: [
      "PM-Kisan",
      "Soil Health Card",
      "Crop Insurance Scheme"
    ],

    Students: [
      "National Scholarship Portal",
      "Skill India Program"
    ],

    "Senior Citizens": [
      "National Pension Scheme",
      "Ayushman Bharat"
    ],

    Workers: [
      "PM Shram Yogi Maandhan",
      "Skill Development Scheme"
    ],

    Others: [
      "Jan Dhan Yojana",
      "Digital India Services"
    ]

  }

  return schemes[category] || []
}