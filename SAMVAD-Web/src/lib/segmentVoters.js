export function segmentVoters(voters) {
  const segments = {
    farmers: [],
    students: [],
    seniorCitizens: [],
    workers: [],
    women: [],
    others: [],
  };

  if (!Array.isArray(voters)) return segments;

  voters.forEach((voter) => {
    const gender = (voter.gender || "").toString().toLowerCase().trim();
    const occupation = (voter.occupation || "").toString().toLowerCase().trim();
    const category = (voter.category || "").toString().toLowerCase().trim();
    const age = Number(voter.age);

    const combined = `${occupation} ${category}`.trim();
    let assigned = false;

    if (combined.includes("farmer") || combined.includes("agriculture")) {
      segments.farmers.push(voter);
      assigned = true;
    } else if (
      combined.includes("student") ||
      combined.includes("school") ||
      combined.includes("college") ||
      combined.includes("youth")
    ) {
      segments.students.push(voter);
      assigned = true;
    } else if (combined.includes("senior")) {
      segments.seniorCitizens.push(voter);
      assigned = true;
    } else if (
      combined.includes("worker") ||
      combined.includes("labor") ||
      combined.includes("labour")
    ) {
      segments.workers.push(voter);
      assigned = true;
    } else if (!assigned) {
      if (!Number.isNaN(age)) {
        if (age < 25) {
          segments.students.push(voter);
          assigned = true;
        } else if (age >= 60) {
          segments.seniorCitizens.push(voter);
          assigned = true;
        }
      }
    }

    if (!assigned) {
      // If category explicitly says women, do not reassign from others because women is cross-cutting.
      if (combined.includes("women") || combined.includes("woman")) {
        // no extra action; it's still valid as non-other if role category is unknown
      } else {
        segments.others.push(voter);
      }
    }

    if (gender === "female") {
      segments.women.push(voter);
    }
  });

  return segments;
}