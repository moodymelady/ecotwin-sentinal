// ━━━ Zod Schemas for Gemini Structured Outputs ━━━
import { z } from "zod";

/** Schema for a single reasoning step in the Chain-of-Thought */
export const ReasoningStepSchema = z.object({
    stepNumber: z.number().describe("Sequential step number"),
    action: z.string().describe("What action was taken"),
    observation: z.string().describe("What was observed from the action"),
    thought: z.string().describe("The AI's reasoning about the observation"),
    toolUsed: z.string().optional().describe("Name of external tool invoked, if any"),
    dataReferences: z.array(z.string()).optional().describe("IDs of data sources referenced"),
});

/** Full reasoning trace for audit trails */
export const ReasoningTraceSchema = z.object({
    steps: z.array(ReasoningStepSchema),
    finalVerdict: z.string().describe("The final conclusion or recommendation"),
    auditHash: z.string().describe("SHA-256 hash of the reasoning chain for tamper-proofing"),
    timestamp: z.string().describe("ISO 8601 timestamp"),
});

/** Hotspot data as returned by Gemini structured output */
export const HotspotOutputSchema = z.object({
    id: z.string(),
    label: z.string(),
    category: z.enum(["carbon", "water", "waste", "energy", "compliance"]),
    severity: z.enum(["low", "medium", "high", "critical"]),
    riskScore: z.number().min(0).max(100),
    description: z.string(),
    suggestedAction: z.string().describe("AI-recommended remediation action"),
});

/** Verification result from multimodal analysis */
export const VerificationOutputSchema = z.object({
    claimId: z.string(),
    claim: z.string(),
    status: z.enum(["verified", "disputed", "inconclusive"]),
    confidence: z.number().min(0).max(1),
    evidence: z.array(
        z.object({
            type: z.enum(["satellite", "video", "sensor", "document"]),
            description: z.string(),
            relevance: z.number().min(0).max(1),
        })
    ),
    reasoning: z.string(),
});

/** Simulation result from What-If queries */
export const SimulationOutputSchema = z.object({
    scenarioSummary: z.string(),
    baselineEmissions: z.number(),
    projectedEmissions: z.number(),
    reductionPercent: z.number(),
    costImpactUSD: z.number(),
    timelineMonths: z.number(),
    confidence: z.number(),
    risks: z.array(z.string()).describe("Potential risks of the proposed change"),
    recommendations: z.array(z.string()),
});

/** Dashboard metrics update from Gemini */
export const DashboardMetricsSchema = z.object({
    facilityId: z.string(),
    energyEfficiency: z.number().min(0).max(100),
    carbonIntensity: z.number(),
    waterUsage: z.number(),
    wasteRecyclingRate: z.number().min(0).max(100),
    complianceScore: z.number().min(0).max(100),
    overallRiskScore: z.number().min(0).max(100),
    alerts: z.array(
        z.object({
            severity: z.enum(["info", "warning", "critical"]),
            message: z.string(),
        })
    ),
});

// Export inferred types
export type ReasoningStepOutput = z.infer<typeof ReasoningStepSchema>;
export type ReasoningTraceOutput = z.infer<typeof ReasoningTraceSchema>;
export type HotspotOutput = z.infer<typeof HotspotOutputSchema>;
export type VerificationOutput = z.infer<typeof VerificationOutputSchema>;
export type SimulationOutput = z.infer<typeof SimulationOutputSchema>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
