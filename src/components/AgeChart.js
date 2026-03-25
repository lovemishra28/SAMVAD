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
import { useEffect, useState } from "react"

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

function getCSSVar(name) {
  if (typeof window === "undefined") return ""
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export default function AgeChart({ voters }) {
  const [themeKey, setThemeKey] = useState(0)

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeKey(k => k + 1))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => observer.disconnect()
  }, [])

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

  const accent = getCSSVar("--accent") || "#00A4CE"

  const data = {
    labels: Object.keys(groups),
    datasets: [
      {
        label: "Voters",
        data: Object.values(groups),
        backgroundColor: accent,
        borderColor: accent,
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
        backgroundColor: getCSSVar("--chart-tooltip-bg") || '#1a1a1a',
        titleColor: getCSSVar("--chart-tooltip-text") || '#f1f5f9',
        bodyColor: getCSSVar("--chart-tooltip-text") || '#f1f5f9',
        borderColor: getCSSVar("--chart-tooltip-border") || '#2a2a2a',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: getCSSVar("--chart-tick") || '#94a3b8',
          font: { size: 9 }
        },
        grid: {
          color: getCSSVar("--chart-grid") || '#222'
        }
      },
      y: {
        ticks: {
          color: getCSSVar("--chart-tick") || '#94a3b8',
          font: { size: 9 }
        },
        grid: {
          color: getCSSVar("--chart-grid") || '#222'
        }
      }
    }
  }

  return (
    <div className="chart-card">
      <h2 className="text-sm md:text-base font-semibold text-center mb-3" style={{ color: "var(--text-primary)" }}>
        Age Distribution
      </h2>

      <div className="flex justify-center items-center">
        <div style={{ width: '100%', maxWidth: '280px', maxHeight: '200px' }}>
          <Bar key={themeKey} data={data} options={options} />
        </div>
      </div>
    </div>
  )
}