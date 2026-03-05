export function segmentVoters(voters) {

  const segments = {
    farmers: [],
    students: [],
    seniorCitizens: [],
    workers: [],
    others: []
  }

  voters.forEach((voter) => {

    if (voter.occupation === "Farmer") {
      segments.farmers.push(voter)

    } else if (voter.age < 25) {
      segments.students.push(voter)

    } else if (voter.age > 60) {
      segments.seniorCitizens.push(voter)

    } else if (voter.occupation === "Worker") {
      segments.workers.push(voter)

    } else {
      segments.others.push(voter)
    }

  })

  return segments
}