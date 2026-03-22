export function segmentVoters(voters) {
  const segments = {
    farmers: [],
    students: [],
    seniorCitizens: [],
    workers: [],
    women: [],
    others: [],
  };

  voters.forEach((voter) => {
    const gender = (voter.gender || "").toString().toLowerCase();
    
    // Sync with backend hard-lock category rules
    const validBaseCats = ["Farmer", "Worker", "Student", "Senior Citizen"];
    const primaryCat = validBaseCats.includes(voter.occupation) 
      ? voter.occupation 
      : (voter.category || "");

    if (primaryCat === "Farmer") {
      segments.farmers.push(voter);
    } else if (primaryCat === "Student" || (!primaryCat && voter.age < 25)) {
      segments.students.push(voter);
    } else if (primaryCat === "Senior Citizen" || (!primaryCat && voter.age > 60)) {
      segments.seniorCitizens.push(voter);
    } else if (primaryCat === "Worker") {
      segments.workers.push(voter);
    } else {
      segments.others.push(voter);
    }

    if (gender === "female") {
      segments.women.push(voter);
    }
  });

  return segments;
}