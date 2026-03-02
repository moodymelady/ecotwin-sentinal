// ━━━ Gemini Simulation – What-If Scenario Engine with Function Calling ━━━
// Includes: auto-retry on rate limits + demo fallback for hackathon
import { NextRequest, NextResponse } from "next/server";
import genAI, { GEMINI_FLASH } from "@/lib/geminiClient";
import {
    allToolDeclarations,
    executeScope3Calculation,
    executeSatelliteQuery,
    executeComplianceAnalysis,
} from "@/lib/tools";
import type { Content } from "@google/genai";

// Map function names to executors
const toolExecutors: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
    calculate_scope3_impact: executeScope3Calculation,
    query_satellite_imagery: executeSatelliteQuery,
    analyze_compliance_gap: executeComplianceAnalysis,
};

// ━━━ Demo Fallback Responses (when API quota is exhausted) ━━━
function generateDemoResponse(query: string) {
    const q = query.toLowerCase();

    if (q.includes("aluminum") || q.includes("material") || q.includes("switch")) {
        const toolResult = {
            current_material: "virgin aluminum",
            proposed_material: "recycled aluminum",
            annual_volume_tons: 5000,
            baseline_emissions_tco2: 59450,
            projected_emissions_tco2: 2600,
            reduction_percent: 95.6,
            cost_impact_usd: -2415625,
            confidence: 0.87,
            data_source: "GHG Protocol Scope 3 Category 1 (Purchased Goods)",
            methodology: "Cradle-to-gate LCA with regional grid factors",
        };

        return {
            simulation: {
                scenarioSummary: "Switching from virgin to recycled aluminum for packaging",
                reasoning: {
                    steps: [
                        { stepNumber: 1, action: "Called calculate_scope3_impact tool", observation: `Baseline: ${toolResult.baseline_emissions_tco2} tCO₂/yr using virgin aluminum (11.89 tCO₂/ton)`, thought: "Virgin aluminum is extremely carbon-intensive due to electrolysis in primary smelting" },
                        { stepNumber: 2, action: "Computed projected emissions", observation: `Projected: ${toolResult.projected_emissions_tco2} tCO₂/yr using recycled aluminum (0.52 tCO₂/ton)`, thought: "Recycled aluminum requires only ~5% of the energy of primary production" },
                        { stepNumber: 3, action: "Assessed cost and timeline", observation: `${toolResult.reduction_percent}% emission reduction with cost savings of $${Math.abs(toolResult.cost_impact_usd).toLocaleString()}`, thought: "Recycled aluminum is both cheaper and lower-carbon — a strong sustainability play" },
                    ],
                    finalVerdict: "STRONGLY RECOMMENDED: Switching to recycled aluminum yields a 95.6% reduction in Scope 3 emissions (56,850 tCO₂/yr savings) with significant cost savings. This aligns with the 2026 EU CSRD requirements for supply chain decarbonization.",
                },
                metrics: {
                    baselineEmissions: toolResult.baseline_emissions_tco2,
                    projectedEmissions: toolResult.projected_emissions_tco2,
                    reductionPercent: toolResult.reduction_percent,
                    costImpactUSD: toolResult.cost_impact_usd,
                    timelineMonths: 8,
                    confidence: 0.87,
                },
                risks: [
                    "Recycled aluminum supply chain may face shortages during demand spikes",
                    "Quality consistency must be verified for food-grade packaging requirements",
                ],
                recommendations: [
                    "Secure long-term contracts with 2-3 recycled aluminum suppliers",
                    "Run a 3-month pilot at the Monterrey facility before full rollout",
                    "Update CSRD Scope 3 reporting to reflect the material switch",
                ],
            },
            toolCalls: [{ tool: "calculate_scope3_impact", args: { current_material: "virgin aluminum", proposed_material: "recycled aluminum", annual_volume_tons: 5000 }, result: toolResult }],
            iterationsUsed: 1,
            model: `${GEMINI_FLASH} (demo-fallback)`,
            timestamp: new Date().toISOString(),
        };
    }

    if (q.includes("solar") || q.includes("energy") || q.includes("panel")) {
        return {
            simulation: {
                scenarioSummary: "Expanding solar panel coverage from 30% to 80%",
                reasoning: {
                    steps: [
                        { stepNumber: 1, action: "Assessed current energy profile", observation: "Current solar coverage at 30% offsets ~420 MWh/yr", thought: "Expanding to 80% coverage would offset ~1,120 MWh/yr" },
                        { stepNumber: 2, action: "Calculated emission impact", observation: "Grid emission factor: 0.42 tCO₂/MWh. Additional offset: 294 tCO₂/yr", thought: "Combined with current offset, total grid independence reaches ~65%" },
                        { stepNumber: 3, action: "Evaluated financial ROI", observation: "Upfront cost: $180,000. Annual savings: $67,200. Payback: 2.7 years", thought: "Strong ROI with additional carbon credit potential under EU ETS" },
                    ],
                    finalVerdict: "RECOMMENDED: Solar expansion to 80% coverage reduces grid dependency by 65%, saves 294 tCO₂/yr, and achieves ROI payback in 2.7 years. Aligns with RE100 commitment pathway.",
                },
                metrics: { baselineEmissions: 504, projectedEmissions: 210, reductionPercent: 58.3, costImpactUSD: -67200, timelineMonths: 6, confidence: 0.91 },
                risks: ["Weather variability may affect actual generation", "Roof structural assessment required for additional panels"],
                recommendations: ["Apply for grid-tied solar incentives under local energy policy", "Install battery storage (50 kWh) for peak shaving"],
            },
            toolCalls: [],
            model: `${GEMINI_FLASH} (demo-fallback)`,
            timestamp: new Date().toISOString(),
        };
    }

    if (q.includes("compliance") || q.includes("csrd") || q.includes("esg") || q.includes("gap")) {
        return {
            simulation: {
                scenarioSummary: "CSRD 2026 Compliance Gap Analysis",
                reasoning: {
                    steps: [
                        { stepNumber: 1, action: "Analyzed current ESG reporting", observation: "3 out of 12 CSRD disclosure requirements have gaps", thought: "Most critical gaps are in Scope 3 supply chain data and biodiversity impact reporting" },
                        { stepNumber: 2, action: "Cross-referenced EU Green Claims Directive Art. 5", observation: "Company uses industry averages instead of primary data", thought: "Article 5.1 requires substantiation with primary facility-level data" },
                        { stepNumber: 3, action: "Checked third-party verification status", observation: "No accredited verifier engaged yet", thought: "Article 8.2 requires third-party verification under EU Accreditation Framework" },
                    ],
                    finalVerdict: "ACTION REQUIRED: 3 critical gaps identified — (1) Scope 3 primary data collection for 3 suppliers, (2) Biodiversity impact assessment missing, (3) No third-party verifier engaged. Non-compliance risk: up to 4% of annual EU turnover.",
                },
                metrics: { baselineEmissions: 0, projectedEmissions: 0, reductionPercent: 0, costImpactUSD: -45000, timelineMonths: 4, confidence: 0.82 },
                risks: ["Penalties of up to 4% EU turnover for CSRD non-compliance", "Greenwashing litigation risk under Art. 10"],
                recommendations: ["Engage an accredited verifier within 30 days", "Request primary emission data from top 3 suppliers", "Commission biodiversity impact assessment for all facilities"],
            },
            toolCalls: [{ tool: "analyze_compliance_gap", args: { claim_text: query }, result: { compliance_status: "partial", gaps: 3 } }],
            model: `${GEMINI_FLASH} (demo-fallback)`,
            timestamp: new Date().toISOString(),
        };
    }

    // Generic fallback
    return {
        simulation: {
            scenarioSummary: "Sustainability Scenario Analysis",
            reasoning: {
                steps: [
                    { stepNumber: 1, action: "Analyzed the scenario query", observation: `User asked: "${query}"`, thought: "Processing against facility baseline data for Monterrey Manufacturing Complex" },
                    { stepNumber: 2, action: "Evaluated environmental impact", observation: "Estimated 15-30% emission reduction potential based on similar industry case studies", thought: "Actual impact depends on implementation specifics and supply chain factors" },
                ],
                finalVerdict: `Based on current facility data, this scenario shows potential for meaningful sustainability improvement. Recommend a detailed feasibility study with primary data collection. The Monterrey facility's current risk score of 68/100 indicates room for significant optimization.`,
            },
            metrics: { baselineEmissions: 4200, projectedEmissions: 3150, reductionPercent: 25, costImpactUSD: -85000, timelineMonths: 12, confidence: 0.72 },
            risks: ["Implementation timeline may exceed estimates", "Requires stakeholder alignment across multiple departments"],
            recommendations: ["Conduct detailed feasibility study with primary data", "Identify quick wins for immediate emission reduction", "Align with Paris Agreement 1.5°C pathway targets"],
        },
        toolCalls: [],
        model: `${GEMINI_FLASH} (demo-fallback)`,
        timestamp: new Date().toISOString(),
    };
}

// ━━━ Helper: call Gemini with retry ━━━
async function callGeminiWithRetry(
    params: Parameters<typeof genAI.models.generateContent>[0],
    maxRetries = 2
) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await genAI.models.generateContent(params);
        } catch (err: unknown) {
            const errStr = String(err);
            const isRateLimit = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota");
            if (isRateLimit) {
                // Immediately throw — demo fallback will handle it
                throw err;
            }
            if (attempt < maxRetries) {
                await new Promise((r) => setTimeout(r, 2000));
                continue;
            }
            throw err;
        }
    }
    throw new Error("Max retries exceeded");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, facilityId, context } = body;

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const systemPrompt = `You are the EcoTwin Sentinal AI — a sustainability simulation engine.
You help users explore "What-If" scenarios for their facilities' environmental impact.

Current Facility: ${facilityId || "FAC-MONTERREY-001"}
${context ? `Additional Context: ${context}` : ""}

When the user asks a what-if question, you MUST:
1. Use the available tools to get accurate data (don't guess)
2. Provide a Chain-of-Thought reasoning trace
3. Cite specific numbers and data sources
4. Present results with confidence intervals

Available tools:
- calculate_scope3_impact: For material/supply chain changes
- query_satellite_imagery: For environmental monitoring data
- analyze_compliance_gap: For regulatory compliance checks

After using tools, synthesize results into this JSON format:
{
  "scenarioSummary": "<brief description of the scenario>",
  "reasoning": {
    "steps": [
      { "stepNumber": 1, "action": "<what you did>", "observation": "<what you found>", "thought": "<your analysis>" }
    ],
    "finalVerdict": "<conclusion with recommendation>"
  },
  "metrics": {
    "baselineEmissions": <number>,
    "projectedEmissions": <number>,
    "reductionPercent": <number>,
    "costImpactUSD": <number>,
    "timelineMonths": <number>,
    "confidence": <0-1>
  },
  "risks": ["<potential risk 1>", "<potential risk 2>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}`;

        const messages: Content[] = [
            {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nUser Scenario Query: ${query}` }],
            },
        ];

        try {
            // Try Gemini API with retry
            let response = await callGeminiWithRetry({
                model: GEMINI_FLASH,
                contents: messages,
                config: {
                    tools: [{ functionDeclarations: allToolDeclarations }],
                },
            });

            // Handle function calling loop
            let iterations = 0;
            const maxIterations = 5;
            const toolCallLog: Array<{ tool: string; args: unknown; result: unknown }> = [];

            while (iterations < maxIterations) {
                const candidate = response!.candidates?.[0];
                const parts = candidate?.content?.parts;

                if (!parts) break;

                const functionCall = parts.find((p) => p.functionCall);
                if (!functionCall?.functionCall) break;

                const { name, args } = functionCall.functionCall;
                if (!name || !toolExecutors[name]) break;

                // Execute the tool
                const toolResult = await toolExecutors[name](
                    (args as Record<string, unknown>) ?? {}
                );
                toolCallLog.push({ tool: name, args, result: toolResult });

                // Send tool result back to Gemini
                messages.push({
                    role: "model",
                    parts: [{ functionCall: { name, args: args ?? {} } }],
                });
                messages.push({
                    role: "user",
                    parts: [
                        {
                            functionResponse: {
                                name,
                                response: toolResult as Record<string, unknown>,
                            },
                        },
                    ],
                });

                response = await callGeminiWithRetry({
                    model: GEMINI_FLASH,
                    contents: messages,
                    config: {
                        tools: [{ functionDeclarations: allToolDeclarations }],
                    },
                });

                iterations++;
            }

            const finalText = response!.text ?? "";
            let parsed;
            try {
                const jsonMatch = finalText.match(/\{[\s\S]*\}/);
                parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { rawResponse: finalText };
            } catch {
                parsed = { rawResponse: finalText };
            }

            return NextResponse.json({
                success: true,
                simulation: parsed,
                toolCalls: toolCallLog,
                iterationsUsed: iterations,
                model: GEMINI_FLASH,
                timestamp: new Date().toISOString(),
            });
        } catch (apiError: unknown) {
            // ━━━ Fallback to demo responses on rate limit ━━━
            const errStr = String(apiError);
            if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
                console.log("Gemini API quota exhausted — using demo fallback response");
                const demo = generateDemoResponse(query);
                return NextResponse.json({ success: true, ...demo, demoMode: true });
            }
            throw apiError;
        }
    } catch (error) {
        console.error("Simulation API error:", error);
        return NextResponse.json(
            { error: "Simulation failed", details: String(error) },
            { status: 500 }
        );
    }
}
