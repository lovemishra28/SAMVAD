"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function BackButton({ fallbackHref }) {
  const router = useRouter()

  const handleBack = () => {
    if (fallbackHref) {
      router.push(fallbackHref)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-1.5 mb-4 px-2 py-1 rounded-md transition-colors"
      style={{ color: "var(--text-secondary)", background: "transparent", border: "none", cursor: "pointer" }}
    >
      <ArrowLeft size={16} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.06em" }}>
        Back
      </span>
    </button>
  )
}
