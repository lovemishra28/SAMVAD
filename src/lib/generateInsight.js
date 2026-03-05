export function generateInsight(voters, segments) {

  const total = voters.length

  const avgAge =
    voters.reduce((sum, v) => sum + v.age, 0) / total

  const categories = [
    { name: "Farmers", count: segments.farmers.length },
    { name: "Students", count: segments.students.length },
    { name: "Senior Citizens", count: segments.seniorCitizens.length },
    { name: "Workers", count: segments.workers.length },
    { name: "Others", count: segments.others.length }
  ]

  const dominant = categories.sort((a,b)=>b.count-a.count)[0]

  return `This booth is dominated by ${dominant.name}. 
  The average voter age is ${avgAge.toFixed(1)}. 
  Government outreach should prioritize schemes relevant to ${dominant.name}.`
}