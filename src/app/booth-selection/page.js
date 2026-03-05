"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Check, Loader } from "lucide-react";
import BackButton from "../../components/BackButton";
import ProgressBar from "../../components/ProgressBar";

const BOOTHS = [
  {
    id: "B101",
    name: "Booth 101",
    area: "Ward 5 — Laxmi Nagar",
    district: "East Delhi",
    voters: 1240,
    type: "Urban",
    lat: 28.6312,
    lng: 77.2772,
  },
  {
    id: "B102",
    name: "Booth 102",
    area: "Ward 12 — Sadar Bazaar",
    district: "Central Delhi",
    voters: 980,
    type: "Semi-Urban",
    lat: 28.6563,
    lng: 77.2078,
  },
  {
    id: "B103",
    name: "Booth 103",
    area: "Ward 8 — Kisan Colony",
    district: "North Delhi",
    voters: 1560,
    type: "Rural",
    lat: 28.7183,
    lng: 77.2024,
  },
  {
    id: "B104",
    name: "Booth 104",
    area: "Ward 3 — Shastri Park",
    district: "East Delhi",
    voters: 870,
    type: "Urban",
    lat: 28.6731,
    lng: 77.2507,
  },
  {
    id: "B105",
    name: "Booth 105",
    area: "Ward 17 — Patel Chowk",
    district: "New Delhi",
    voters: 1100,
    type: "Urban",
    lat: 28.6228,
    lng: 77.2148,
  },
];

const DEFAULT_CENTER = [28.6448, 77.2167]; // Central Delhi
const DEFAULT_ZOOM = 12;

/* ── Map component loaded client-side only ── */
const MapInner = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { MapContainer, TileLayer, Marker, Popup, useMap } = mod;

      // Component that handles map fly-to
      function MapUpdater({ center, zoom }) {
        const map = useMap();
        useEffect(() => {
          if (center) map.flyTo(center, zoom, { duration: 1.2 });
        }, [center, zoom, map]);
        return null;
      }

      // The actual map component
      function LeafletMap({
        booths,
        selectedBoothId,
        userLocation,
        onBoothClick,
      }) {
        const L = require("leaflet");

        // Theme-colored marker
        const boothIcon = (isSelected) =>
          L.divIcon({
            className: "",
            html: `<div style="
        width:${isSelected ? 20 : 14}px;height:${isSelected ? 20 : 14}px;
        background:${isSelected ? "#c8ff00" : "rgba(200,255,0,0.5)"};
        border:2px solid #c8ff00;
        border-radius:50%;
        box-shadow:0 0 ${isSelected ? 16 : 8}px rgba(200,255,0,${isSelected ? 0.6 : 0.3});
        transition:all 0.3s ease;
      "></div>`,
            iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14],
            iconAnchor: [isSelected ? 10 : 7, isSelected ? 10 : 7],
          });

        const userIcon = L.divIcon({
          className: "",
          html: `<div style="
        width:12px;height:12px;
        background:#3b82f6;
        border:2px solid #93c5fd;
        border-radius:50%;
        box-shadow:0 0 12px rgba(59,130,246,0.5);
      "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const selected = booths.find((b) => b.id === selectedBoothId);
        const center = selected
          ? [selected.lat, selected.lng]
          : userLocation || DEFAULT_CENTER;
        const zoom = selected ? 15 : DEFAULT_ZOOM;

        return (
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "var(--radius-lg)",
            }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <MapUpdater center={center} zoom={zoom} />

            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup>
                  <span
                    style={{
                      color: "var(--accent)",
                      fontFamily: "Sora, sans-serif",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Your Location
                  </span>
                </Popup>
              </Marker>
            )}

            {booths.map((b) => (
              <Marker
                key={b.id}
                position={[b.lat, b.lng]}
                icon={boothIcon(b.id === selectedBoothId)}
                eventHandlers={{ click: () => onBoothClick(b.id) }}
              >
                <Popup>
                  <div
                    style={{
                      fontFamily: "Sora, sans-serif",
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ color: "var(--accent)", display: "block", marginBottom: "4px" }}>{b.id}</strong>
                    <span style={{ color: "var(--text-primary)" }}>{b.area}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        );
      }

      return LeafletMap;
    }),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          Loading map...
        </span>
      </div>
    ),
  },
);

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function BoothSelection() {
  const [boothId, setBoothId] = useState("");
  const [manualId, setManualId] = useState("");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [autoDetecting, setAutoDetecting] = useState(true);
  const [nearestBoothMsg, setNearestBoothMsg] = useState("");
  const router = useRouter();

  const selectedBooth = BOOTHS.find((b) => b.id === boothId);

  // Auto-detect user location and find nearest booth
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);

          // Find nearest booth
          let minDist = Infinity;
          let nearest = null;
          BOOTHS.forEach((b) => {
            const d = getDistance(loc[0], loc[1], b.lat, b.lng);
            if (d < minDist) { minDist = d; nearest = b; }
          });

          if (nearest) {
            setBoothId(nearest.id);
            setNearestBoothMsg(`Nearest booth detected: ${nearest.id} — ${nearest.area} (${minDist.toFixed(1)} km)`);
          }
          setAutoDetecting(false);
        },
        () => { setAutoDetecting(false); },
      );
    } else {
      setAutoDetecting(false);
    }
  }, []);

  const handleSelectChange = (e) => {
    setBoothId(e.target.value);
    setManualId("");
    setError("");
    setConfirmed(false);
  };

  const handleManualInput = (e) => {
    const val = e.target.value.toUpperCase();
    setManualId(val);
    setError("");
    setConfirmed(false);
    const match = BOOTHS.find((b) => b.id === val);
    if (match) setBoothId(val);
    else setBoothId("");
  };

  const handleBoothClick = (id) => {
    setBoothId(id);
    setManualId("");
    setError("");
    setConfirmed(false);
  };

  const handleConfirm = () => {
    const finalId = boothId || manualId;
    if (!finalId) {
      setError("Please select or enter a Booth ID");
      return;
    }
    const match = BOOTHS.find((b) => b.id === finalId);
    if (!match) {
      setError("Invalid Booth ID. Please select from available booths.");
      return;
    }
    setConfirmed(true);
    localStorage.setItem("boothId", finalId);
    localStorage.setItem("boothMeta", JSON.stringify(match));

    setTimeout(() => router.push("/fetch-data"), 1200);
  };

  return (
    <div
      className="min-h-[calc(100vh-70px)] flex flex-col p-4 md:p-6"
    >
      <BackButton fallbackHref="/dashboard" />

      {/* Auto-detection status */}
      {autoDetecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-4 p-3 rounded-lg"
          style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,255,0,0.15)" }}
        >
          <Loader size={14} className="animate-spin" style={{ color: "var(--accent)" }} />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Detecting nearest booth from your location...</span>
        </motion.div>
      )}

      {nearestBoothMsg && !autoDetecting && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4 p-3 rounded-lg"
          style={{ background: "var(--accent-dim)", border: "1px solid rgba(200,255,0,0.15)" }}
        >
          <Navigation size={14} style={{ color: "var(--accent)" }} />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{nearestBoothMsg}</span>
        </motion.div>
      )}

      {/* ── Interactive Map ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full mb-6"
        style={{
          height: "clamp(280px, 42vh, 480px)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <MapInner
          booths={BOOTHS}
          selectedBoothId={boothId}
          userLocation={userLocation}
          onBoothClick={handleBoothClick}
        />
        {/* Map overlay label */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 1000,
            background: "rgba(10,10,10,0.82)",
            backdropFilter: "blur(8px)",
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent)",
            }}
          >
            {selectedBooth ? selectedBooth.area : "Booth Locations"}
          </span>
        </div>
      </motion.div>

      {/* ── Selection Controls ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="booth-summary-card">
          {/* Dropdown */}
          <label
            className="block mb-3"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Select Booth
          </label>
          <select
            value={boothId}
            onChange={handleSelectChange}
            className="w-full mb-4 text-base outline-none transition-all duration-200 booth-select"
            style={{
              padding: 15,
              // marginTop: 10,
              background: "var(--surface)",
              border: "2px solid var(--border)",
              color: "var(--text-primary)",
              borderRadius: "var(--radius-md)",
              fontWeight: 400,
              cursor: "pointer",
            }}
          >
            <option value="">— Choose from available booths —</option>
            {BOOTHS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.area}
              </option>
            ))}
          </select>

          {/* Divider */}
            <div className="flex items-center gap-3 my-4">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                fontWeight: 500,
              }}
            >
              OR
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border)" }}
            />
          </div>

          {/* Manual Entry */}
          <label
            className="block mb-3"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Enter Booth ID
          </label>
          <input
            type="text"
            value={manualId}
            onChange={handleManualInput}
            maxLength={10}
            className="w-full mb-4 text-base outline-none transition-all duration-200 booth-input"
            style={{
              background: "var(--surface)",
              border: "2px solid var(--border)",
              color: "var(--text-primary)",
              borderRadius: "var(--radius-md)",
              fontWeight: 400,
              padding: 15,
            }}
          />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-sm mb-3"
                style={{ color: "#ef4444" }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Preview Card */}
          <AnimatePresence>
            {selectedBooth && !confirmed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className="p-4 rounded-lg mb-4"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "10px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      marginBottom: "12px",
                    }}
                  >
                    Booth Preview
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        ID
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {selectedBooth.id}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Area
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {selectedBooth.area}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        District
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {selectedBooth.district}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Type
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {selectedBooth.type}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Registered Voters
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--accent)" }}
                      >
                        {selectedBooth.voters.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={confirmed}
            className="primary-button w-full text-center my-4"
            style={{ opacity: confirmed ? 0.6 : 1 }}
          >
            {confirmed
              ? "Booth Confirmed — Redirecting..."
              : "Confirm & Proceed"}
          </motion.button>
        </div>

        <ProgressBar currentStep={0} />
      </motion.div>
    </div>
  );
}
