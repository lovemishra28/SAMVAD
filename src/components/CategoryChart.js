"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"

import { Pie } from "react-chartjs-2"
import { useEffect, useState } from "react"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

function getCSSVar(name) {
  if (typeof window === "undefined") return ""
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export default function CategoryChart({ segments = {} }) {
  const [themeKey, setThemeKey] = useState(0)

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeKey(k => k + 1))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => observer.disconnect()
  }, [])

  const getCount = (items) => (Array.isArray(items) ? items.length : 0);

  const data = {
    labels: [
      "Farmers",
      "Students",
      "Senior Citizens",
      "Workers",
      "Women"
    ],
    datasets: [
      {
        data: [
          getCount(segments.farmers),
          getCount(segments.students),
          getCount(segments.seniorCitizens),
          getCount(segments.workers),
          getCount(segments.women)
        ],
        backgroundColor: [
          "#6366f1",
          "#22c55e",
          "#f59e0b",
          "#3b82f6",
          "#ef4444"
        ],
        borderWidth: 2,
        borderColor: getCSSVar("--chart-border-color") || "#1a1a1a"
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
          color: getCSSVar("--chart-legend-text") || '#e2e8f0',
          padding: 8,
          font: { size: 10 }
        }
      },
      tooltip: {
        backgroundColor: getCSSVar("--chart-tooltip-bg") || '#1a1a1a',
        titleColor: getCSSVar("--chart-tooltip-text") || '#f1f5f9',
        bodyColor: getCSSVar("--chart-tooltip-text") || '#f1f5f9',
        borderColor: getCSSVar("--chart-tooltip-border") || '#2a2a2a',
        borderWidth: 1
      }
    }
  }

  return (
    <div className="chart-card">
      <h2 className="text-sm md:text-base font-semibold text-center mb-3" style={{ color: "var(--text-primary)" }}>
        Voter Category Distribution
      </h2>

      <div className="flex justify-center">
        <div className="w-full" style={{ maxWidth: '220px', maxHeight: '220px' }}>
          <Pie key={themeKey} data={data} options={options} />
        </div>
      </div>
    </div>
  )
}