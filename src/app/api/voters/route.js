export async function GET() {

  const voters = [
    { name: "Ramesh Kumar", age: 48, occupation: "Farmer" },
    { name: "Aman Singh", age: 21, occupation: "Student" },
    { name: "Sunita Devi", age: 63, occupation: "Retired" },
    { name: "Ravi Sharma", age: 35, occupation: "Worker" },
    { name: "Meena Kumari", age: 28, occupation: "Teacher" },
    { name: "Suresh Yadav", age: 55, occupation: "Farmer" },
    { name: "Priya Verma", age: 22, occupation: "Student" },
    { name: "Kamlesh Patel", age: 41, occupation: "Worker" },
    { name: "Geeta Devi", age: 67, occupation: "Retired" },
    { name: "Vikram Singh", age: 30, occupation: "Worker" },
    { name: "Anita Sharma", age: 19, occupation: "Student" },
    { name: "Rajendra Prasad", age: 72, occupation: "Retired" },
    { name: "Neha Gupta", age: 26, occupation: "Teacher" },
    { name: "Bhola Nath", age: 52, occupation: "Farmer" },
    { name: "Kavita Rani", age: 34, occupation: "Worker" },
    { name: "Deepak Joshi", age: 23, occupation: "Student" },
    { name: "Sushila Devi", age: 65, occupation: "Retired" },
    { name: "Mohan Lal", age: 44, occupation: "Farmer" },
    { name: "Pooja Mishra", age: 20, occupation: "Student" },
    { name: "Arun Kumar", age: 38, occupation: "Worker" },
    { name: "Saroj Kumari", age: 61, occupation: "Retired" },
    { name: "Dinesh Chandra", age: 50, occupation: "Farmer" },
    { name: "Rohit Verma", age: 24, occupation: "Student" },
    { name: "Kamla Devi", age: 69, occupation: "Retired" },
    { name: "Pankaj Tiwari", age: 33, occupation: "Worker" },
  ]

  return Response.json({
    booth: "B101",
    totalVoters: voters.length,
    voters: voters
  })
}