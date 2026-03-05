"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"

import { Pie } from "react-chartjs-2"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

export default function CategoryChart({ segments }) {

  const data = {
    labels: [
      "Farmers",
      "Students",
      "Senior Citizens",
      "Workers",
      "Others"
    ],
    datasets: [
      {
        data: [
          segments.farmers.length,
          segments.students.length,
          segments.seniorCitizens.length,
          segments.workers.length,
          segments.others.length
        ],
        backgroundColor: [
          "#6366f1",
          "#22c55e",
          "#f59e0b",
          "#3b82f6",
          "#ef4444"
        ],
        borderWidth: 2,
        borderColor: "#1a1a1a"
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.2,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          padding: 8,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#2a2a2a',
        borderWidth: 1
      }
    }
  }

  return (
    <div className="chart-card">
      <h2 className="text-sm md:text-base font-semibold text-center text-white mb-3">
        Voter Category Distribution
      </h2>

      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '220px', maxHeight: '220px' }}>
          <Pie data={data} options={options} />
        </div>
      </div>
    </div>
  )
}