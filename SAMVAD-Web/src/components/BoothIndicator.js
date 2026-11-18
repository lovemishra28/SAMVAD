"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MapPin, ChevronDown, RefreshCw } from "lucide-react"

export default function BoothIndicator() {
  const [booths, setBooths] = useState([])
  const [loadingBooths, setLoadingBooths] = useState(true)

  const [booth, setBooth] = useState(null)
  const [open, setOpen] = useState(false)
  const [hoverIndex, setHoverIndex] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const ref = useRef(null)

  useEffect(() => {
    const id = localStorage.getItem("boothId")
    setBooth(id)
  }, [pathname])

  useEffect(() => {
    if (!booth || booths.length === 0) return
    const idx = booths.findIndex((b) => b.id === booth)
    setHoverIndex(idx >= 0 ? idx : 0)
  }, [booth, booths])

  useEffect(() => {
    let mounted = true
    const fetchBooths = async () => {
      setLoadingBooths(true)
      try {
        const res = await fetch("/api/booths/list")
        if (!res.ok) throw new Error("Failed to load booths")
        const data = await res.json()
        if (!mounted) return
        setBooths(Array.isArray(data.booths) ? data.booths : [])
      } catch (err) {
        console.warn("Failed to fetch booth list", err)
        setBooths([])
      } finally {
        if (mounted) setLoadingBooths(false)
      }
    }

    fetchBooths()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSwitch = (id) => {
    localStorage.setItem("boothId", id)
    const meta = booths.find(b => b.id === id)
    if (meta) localStorage.setItem("boothMeta", JSON.stringify(meta))
    setBooth(id)
    setOpen(false)
    router.push("/fetch-data")
  }

  if (!booth) return (
    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
      No booth selected
    </div>
  )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
        style={{ background: open ? "var(--surface)" : "transparent", border: "1px solid var(--border)" }}
      >
        <MapPin size={14} style={{ color: "var(--accent)" }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "var(--text-secondary)" }}>
          Booth
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", fontWeight: 500, color: "var(--accent)" }}>
          {booth}
        </span>
        <ChevronDown size={12} style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-56 py-1 rounded-lg shadow-xl z-50"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "220px", overflowY: "auto" }}
          onMouseLeave={() => setOpen(false)}
          onWheel={(e) => {
            e.preventDefault()
            if (booths.length === 0) return
            const delta = e.deltaY > 0 ? 1 : -1
            const next = Math.min(Math.max(0, hoverIndex + delta), booths.length - 1)
            setHoverIndex(next)
            const candidate = booths[next]
            if (candidate) {
              setBooth(candidate.id)
            }
          }}
        >
          <p className="px-3 py-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
            Switch Booth
          </p>
          {loadingBooths ? (
            <div className="px-3 py-2 text-xs" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
              Loading booths...
            </div>
          ) : (
            booths.map((b, i) => (
              <button
                key={b.id}
                onClick={() => handleSwitch(b.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
                style={{
                  background: i === hoverIndex ? "rgba(34,197,94,0.12)" : b.id === booth ? "var(--accent-dim)" : "transparent",
                  color: b.id === booth ? "var(--accent)" : "var(--text-secondary)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                }}
              >
                <MapPin size={12} />
                <span className="flex-1">{b.id}</span>
                {b.id === booth && <span style={{ fontSize: "10px", color: "var(--accent)" }}>Active</span>}
              </button>
            ))
          )}
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={() => { setOpen(false); router.push("/booth-selection") }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
              style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: "11px" }}
            >
              <RefreshCw size={12} />
              <span>Change on Map</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}