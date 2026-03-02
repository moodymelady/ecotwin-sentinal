"use client";
// ━━━ EcoTwin Sentinal – Main 3D Dashboard Page ━━━
import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/UI/Sidebar";
import Globe from "@/components/UI/globe";
import type { Hotspot, DashboardState } from "@/types";

// Dynamic import for Three.js (no SSR)
const Scene = dynamic(() => import("@/components/3D/Scene"), { ssr: false });

// ━━━ Location Database ━━━
const FACILITIES = [
  { id: "FAC-MONTERREY-001", name: "Monterrey Manufacturing Complex", country: "Mexico", type: "manufacturing" },
  { id: "FAC-SHANGHAI-002", name: "Shanghai Processing Hub", country: "China", type: "processing" },
  { id: "FAC-MUNICH-003", name: "Munich Automotive Plant", country: "Germany", type: "manufacturing" },
  { id: "FAC-HOUSTON-004", name: "Houston Petrochemical Facility", country: "USA", type: "processing" },
  { id: "FAC-MUMBAI-005", name: "Mumbai Textile Works", country: "India", type: "manufacturing" },
  { id: "FAC-SAOPAULO-006", name: "São Paulo Agriprocessing", country: "Brazil", type: "processing" },
  { id: "FAC-ROTTERDAM-007", name: "Rotterdam Logistics Center", country: "Netherlands", type: "warehouse" },
  { id: "FAC-NAIROBI-008", name: "Nairobi Green Energy Park", country: "Kenya", type: "office" },
] as const;

const HOTSPOT_TEMPLATES = [
  { label: "Furnace Emissions", category: "carbon" as const, position: [1.5, 4.2, -0.5] as [number, number, number] },
  { label: "Water Treatment", category: "water" as const, position: [7, 2.2, 3] as [number, number, number] },
  { label: "Waste Sorting Bay", category: "waste" as const, position: [-1.5, 1.2, 3.5] as [number, number, number] },
  { label: "Solar Array", category: "energy" as const, position: [-0.8, 3.8, -0.1] as [number, number, number] },
  { label: "Warehouse Ops", category: "compliance" as const, position: [-5, 2.5, 2] as [number, number, number] },
  { label: "Processing Unit", category: "carbon" as const, position: [2, 3, -4] as [number, number, number] },
];

const DESCRIPTIONS: Record<string, string[]> = {
  carbon: [
    "CO₂ emissions exceed 2026 EU ETS threshold. Immediate action required.",
    "Thermal anomaly detected via satellite. Carbon intensity above sector average.",
    "Combustion efficiency below target. Excess emissions at stack monitored.",
    "Process heat generation using fossil fuel. Transition to biogas recommended.",
  ],
  water: [
    "Freshwater intake above industry benchmark. Recycling rate below target.",
    "Effluent quality borderline for regulatory limits. Treatment upgrade needed.",
    "Cooling water loop leaking. Increased makeup water consumption detected.",
    "Rainwater harvesting system underutilized. Only 30% capture rate.",
  ],
  waste: [
    "Video analysis shows non-compliant waste sorting. Contamination rate high.",
    "Hazardous waste storage approaching capacity. Pickup schedule overdue.",
    "Recyclable material being landfilled. Sorting line needs recalibration.",
    "E-waste accumulation in storage bay. Certified recycler not yet engaged.",
  ],
  energy: [
    "Solar coverage below potential. Satellite imagery confirms panel availability.",
    "Peak demand charges increasing. Load shifting strategy recommended.",
    "Compressed air system leak detected. Energy waste estimated at 15%.",
    "LED retrofit incomplete in 3 production halls. ROI payback under 1 year.",
  ],
  compliance: [
    "CSRD reporting gap detected: Scope 3 supply chain data incomplete.",
    "EU Green Claims Directive Art.5 non-compliance: using industry averages.",
    "Third-party verification not yet arranged per Art.8 requirements.",
    "Biodiversity impact assessment missing for adjacent wetland area.",
  ],
};

// ━━━ Random generation helpers ━━━
function rand(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSeverity(riskScore: number): "low" | "medium" | "high" | "critical" {
  if (riskScore >= 80) return "critical";
  if (riskScore >= 60) return "high";
  if (riskScore >= 40) return "medium";
  return "low";
}

function generateHotspots(facilityId: string): Hotspot[] {
  return HOTSPOT_TEMPLATES.map((template, i) => {
    const riskScore = Math.round(Math.random() * 85 + 10); // 10-95
    return {
      id: `HS-${facilityId}-${String(i + 1).padStart(3, "0")}`,
      facilityId,
      label: template.label,
      category: template.category,
      severity: pickSeverity(riskScore),
      position: template.position,
      riskScore,
      description: pickRandom(DESCRIPTIONS[template.category]),
      lastUpdated: new Date().toISOString(),
    };
  });
}

function generateMetrics() {
  return {
    energyEfficiency: Math.round(rand(35, 92)),
    carbonIntensity: rand(1.2, 8.5),
    waterUsage: Math.round(rand(5000, 35000)),
    wasteRecycling: Math.round(rand(20, 85)),
    complianceScore: Math.round(rand(45, 95)),
    overallRisk: Math.round(rand(25, 90)),
  };
}

// Deterministic defaults so server and client render the same initial HTML
const DEFAULT_METRICS = {
  energyEfficiency: 0,
  carbonIntensity: 0,
  waterUsage: 0,
  wasteRecycling: 0,
  complianceScore: 0,
  overallRisk: 0,
};

export default function DashboardPage() {
  const [selectedFacilityIdx, setSelectedFacilityIdx] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const facility = FACILITIES[selectedFacilityIdx];

  // 2-second loading splash on every page load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Start with deterministic defaults to avoid hydration mismatch,
  // then populate with random values client-side after mount.
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);

  useEffect(() => {
    setHotspots(generateHotspots(facility.id));
    setMetrics(generateMetrics());
  }, [facility.id, refreshKey]);

  const [state, setState] = useState<DashboardState>({
    selectedFacilityId: facility.id,
    selectedHotspot: null,
    sidebarOpen: true,
    activeTab: "chat",
    chatMessages: [],
    scenarios: [],
  });

  const handleFacilityChange = useCallback((idx: number) => {
    setSelectedFacilityIdx(idx);
    setRefreshKey((k) => k + 1);
    setState((prev) => ({
      ...prev,
      selectedFacilityId: FACILITIES[idx].id,
      selectedHotspot: null,
    }));
  }, []);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    setState((prev) => ({
      ...prev,
      selectedHotspot: hotspot,
      sidebarOpen: true,
      activeTab: "chat",
    }));
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const handleTabChange = useCallback((tab: "chat" | "reasoning" | "scenario") => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const severityCount = {
    critical: hotspots.filter((h) => h.severity === "critical").length,
    high: hotspots.filter((h) => h.severity === "high").length,
    medium: hotspots.filter((h) => h.severity === "medium").length,
    low: hotspots.filter((h) => h.severity === "low").length,
  };

  return (
    <>
      {/* Loading Splash Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading-splash"
            className="loading-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              background: "radial-gradient(ellipse at center, #0a1628 0%, #000000 100%)",
            }}
          >
            <Globe />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ textAlign: "center" }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  background: "linear-gradient(135deg, #00a86b, #0077cc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "6px",
                }}
              >
                EcoTwin Sentinal
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                }}
              >
                Digital Twin • ESG Intelligence Platform
              </p>
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              style={{
                width: "120px",
                height: "2px",
                background: "linear-gradient(90deg, transparent, #00a86b, transparent)",
                borderRadius: "2px",
                transformOrigin: "center",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="dashboard">
        {/* Top Header Bar */}
        <motion.header
          className="dashboard-header"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="header-left">
            <div className="header-logo">
              <span className="logo-icon">🛡️</span>
              <div>
                <h1>EcoTwin Sentinal</h1>
                <span className="header-tagline">Digital Twin • ESG Intelligence Platform</span>
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="facility-selector">
              <span className="facility-pin">📍</span>
              <select
                className="facility-select"
                value={selectedFacilityIdx}
                onChange={(e) => handleFacilityChange(Number(e.target.value))}
              >
                {FACILITIES.map((f, i) => (
                  <option key={f.id} value={i}>
                    {f.name}
                  </option>
                ))}
              </select>
              <span className="facility-badge">LIVE</span>
            </div>
          </div>

          <div className="header-right">
            <div className="header-stat">
              <span className="stat-label">Risk Score</span>
              <span className={`stat-value ${metrics.overallRisk > 60 ? "warning" : "good"}`}>
                {metrics.overallRisk}
              </span>
            </div>
            <div className="header-stat">
              <span className="stat-label">Compliance</span>
              <span className={`stat-value ${metrics.complianceScore >= 70 ? "good" : "warning"}`}>{metrics.complianceScore}%</span>
            </div>
            <div className="header-stat">
              <span className="stat-label">Carbon t/yr</span>
              <span className={`stat-value ${metrics.carbonIntensity > 5 ? "warning" : "good"}`}>{metrics.carbonIntensity}k</span>
            </div>
          </div>
        </motion.header>

        {/* Alert Badges */}
        <motion.div
          className="alert-strip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          key={`alerts-${facility.id}-${refreshKey}`}
        >
          <div className="alert-badge critical">
            <span className="alert-dot"></span>
            {severityCount.critical} Critical
          </div>
          <div className="alert-badge high">
            <span className="alert-dot"></span>
            {severityCount.high} High
          </div>
          <div className="alert-badge medium">
            <span className="alert-dot"></span>
            {severityCount.medium} Medium
          </div>
          <div className="alert-badge low">
            <span className="alert-dot"></span>
            {severityCount.low} Low
          </div>

          <div className="alert-separator" />

          <div className="metric-badges">
            <span className="metric-badge">
              ⚡ {metrics.energyEfficiency}% Efficiency
            </span>
            <span className="metric-badge">
              💧 {(metrics.waterUsage / 1000).toFixed(1)}k L/day
            </span>
            <span className="metric-badge">
              ♻️ {metrics.wasteRecycling}% Recycled
            </span>
          </div>
        </motion.div>

        {/* 3D Canvas */}
        <div className="canvas-container">
          <Scene
            hotspots={hotspots}
            onHotspotClick={handleHotspotClick}
            selectedHotspot={state.selectedHotspot}
          />

          {/* Canvas overlay gradient */}
          <div className="canvas-vignette" />

          {/* Selected Hotspot Detail Card */}
          <AnimatePresence>
            {state.selectedHotspot && (
              <motion.div
                className="hotspot-detail-card"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
              >
                <div className="detail-card-header">
                  <span className={`severity-indicator ${state.selectedHotspot.severity}`} />
                  <h3>{state.selectedHotspot.label}</h3>
                  <button
                    className="detail-close"
                    onClick={() =>
                      setState((prev) => ({ ...prev, selectedHotspot: null }))
                    }
                  >
                    ✕
                  </button>
                </div>
                <p className="detail-desc">{state.selectedHotspot.description}</p>
                <div className="detail-meta">
                  <span>Category: {state.selectedHotspot.category}</span>
                  <span>Risk: {state.selectedHotspot.riskScore}/100</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <Sidebar
          isOpen={state.sidebarOpen}
          onToggle={handleSidebarToggle}
          selectedHotspot={state.selectedHotspot}
          activeTab={state.activeTab}
          onTabChange={handleTabChange}
        />

        {/* Gemini powered badge */}
        <div className="powered-badge">
          Powered by <strong>Google Gemini AI</strong> ✦
        </div>
      </main>
    </>
  );
}
