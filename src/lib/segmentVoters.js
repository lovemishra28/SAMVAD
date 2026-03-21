export function segmentVoters(voters) {
  const segments = {
    farmers: [],
    students: [],
    seniorCitizens: [],
    workers: [],
    women: [],
  };

  voters.forEach((voter) => {
    const gender = (voter.gender || "").toString().toLowerCase();

    if (voter.occupation === "Farmer") {
      segments.farmers.push(voter);
    } else if (voter.age < 25) {
      segments.students.push(voter);
    } else if (voter.age > 60) {
      segments.seniorCitizens.push(voter);
    } else if (voter.occupation === "Worker") {
      segments.workers.push(voter);
    }

    if (gender === "female") {
      segments.women.push(voter);
    }
  });

  return segments;
}