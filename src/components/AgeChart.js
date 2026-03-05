"use client"

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js"

import { Bar } from "react-chartjs-2"

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

export default function AgeChart({ voters }) {

  const groups = {
    "18-25": 0,
    "26-40": 0,
    "41-60": 0,
    "60+": 0
  }

  voters.forEach((voter) => {

    if (voter.age <= 25) groups["18-25"]++
    else if (voter.age <= 40) groups["26-40"]++
    else if (voter.age <= 60) groups["41-60"]++
    else groups["60+"]++

  })

  const data = {
    labels: Object.keys(groups),
    datasets: [
      {
        label: "Voters",
        data: Object.values(groups),
        backgroundColor: "#6366f1",
        borderColor: "#4f46e5",
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.4,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#2a2a2a',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
          font: {
            size: 9
          }
        },
        grid: {
          color: '#222'
        }
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: {
            size: 9
          }
        },
        grid: {
          color: '#222'
        }
      }
    }
  }

  return (
    <div className="chart-card">
      <h2 className="text-sm md:text-base font-semibold text-center text-white mb-3">
        Age Distribution
      </h2>

      <div className="flex justify-center items-center">
        <div style={{ width: '100%', maxWidth: '280px', maxHeight: '200px' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  )
}