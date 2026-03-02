// ━━━ EcoTwin Sentinal – Core Type Definitions ━━━

export interface SensorReading {
  sensorId: string;
  facilityId: string;
  metric: "energy_kwh" | "water_liters" | "waste_kg" | "co2_tons" | "temperature_c";
  value: number;
  unit: string;
  timestamp: string;
  location: { lat: number; lng: number; altitude?: number };
}

export interface SatelliteDataPoint {
  source: "earth_engine" | "sentinel_2" | "landsat";
  captureDate: string;
  region: { lat: number; lng: number; radius_km: number };
  indices: {
    ndvi?: number;      // vegetation index
    methane_ppm?: number;
    thermal_anomaly?: boolean;
    land_use_change?: number;
  };
  imageUrl?: string;
}

export interface ESGDocument {
  id: string;
  title: string;
  type: "esg_report" | "regulation" | "audit" | "utility_bill";
  uploadedAt: string;
  pageCount: number;
  cacheId?: string;   // Gemini context cache ID
  sourceUrl?: string;
}

export interface VerificationResult {
  claimId: string;
  claim: string;
  status: "verified" | "disputed" | "inconclusive";
  confidence: number;
  evidence: EvidenceItem[];
  reasoning: string;
  timestamp: string;
}

export interface EvidenceItem {
  type: "satellite" | "video" | "sensor" | "document";
  sourceId: string;
  description: string;
  imageUrl?: string;
  relevance: number;
}

export interface Hotspot {
  id: string;
  facilityId: string;
  label: string;
  category: "carbon" | "water" | "waste" | "energy" | "compliance";
  severity: "low" | "medium" | "high" | "critical";
  position: [number, number, number]; // x, y, z in 3D space
  riskScore: number;
  description: string;
  lastUpdated: string;
}

export interface WhatIfScenario {
  id: string;
  query: string;
  parameters: Record<string, number | string>;
  result?: SimulationResult;
  createdAt: string;
}

export interface SimulationResult {
  scenarioId: string;
  baselineEmissions: number;
  projectedEmissions: number;
  reductionPercent: number;
  costImpactUSD: number;
  timelineMonths: number;
  confidence: number;
  reasoning: ReasoningTrace;
}

export interface ReasoningTrace {
  steps: ReasoningStep[];
  finalVerdict: string;
  auditHash: string;
  timestamp: string;
}

export interface ReasoningStep {
  stepNumber: number;
  action: string;
  observation: string;
  thought: string;
  toolUsed?: string;
  dataReferences?: string[];
}

export interface GeminiChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  reasoning?: ReasoningTrace;
  timestamp: string;
}

export interface FacilityData {
  id: string;
  name: string;
  location: { lat: number; lng: number; country: string };
  type: "manufacturing" | "warehouse" | "office" | "processing";
  hotspots: Hotspot[];
  overallRiskScore: number;
  lastAudit: string;
  metrics: {
    energyEfficiency: number;
    carbonIntensity: number;
    waterUsage: number;
    wasteRecyclingRate: number;
    complianceScore: number;
  };
}

export interface DashboardState {
  selectedFacilityId: string | null;
  selectedHotspot: Hotspot | null;
  sidebarOpen: boolean;
  activeTab: "chat" | "reasoning" | "scenario";
  chatMessages: GeminiChatMessage[];
  scenarios: WhatIfScenario[];
}
