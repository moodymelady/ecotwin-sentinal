// ━━━ Gemini Multimodal – Video / Image Verification ━━━
import { NextRequest, NextResponse } from "next/server";
import genAI, { GEMINI_FLASH } from "@/lib/geminiClient";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, claim, imageDescription, facilityId } = body;

        switch (action) {
            case "verify_claim": {
                // Use Gemini to cross-reference sustainability claims with visual evidence
                const prompt = `You are an ESG Verification AI Agent performing multimodal sustainability claim verification.

CLAIM TO VERIFY: "${claim}"
FACILITY ID: ${facilityId || "FACILITY-001"}
VISUAL EVIDENCE DESCRIPTION: ${imageDescription || "No visual evidence provided"}

Analyze this sustainability claim by:
1. Evaluating the plausibility of the claim based on industry benchmarks
2. Cross-referencing with the visual evidence described
3. Identifying inconsistencies or potential greenwashing indicators
4. Providing a confidence score (0.0-1.0) for the claim's validity

Respond in this exact JSON format:
{
  "claimId": "CLM-${Date.now()}",
  "claim": "<the original claim>",
  "status": "verified" | "disputed" | "inconclusive",
  "confidence": <0.0-1.0>,
  "evidence": [
    {
      "type": "satellite" | "video" | "sensor" | "document",
      "description": "<what evidence shows>",
      "relevance": <0.0-1.0>
    }
  ],
  "reasoning": "<detailed chain-of-thought explaining the verdict>",
  "redFlags": ["<any greenwashing indicators found>"],
  "recommendation": "<suggested next steps for compliance>"
}`;

                const result = await genAI.models.generateContent({
                    model: GEMINI_FLASH,
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    config: {
                        responseMimeType: "application/json",
                    },
                });

                let parsed;
                try {
                    parsed = JSON.parse(result.text ?? "{}");
                } catch {
                    parsed = { raw: result.text, parseError: true };
                }

                return NextResponse.json({
                    success: true,
                    verification: parsed,
                    model: GEMINI_FLASH,
                    timestamp: new Date().toISOString(),
                });
            }

            case "analyze_satellite": {
                const prompt = `You are a remote sensing analyst. Analyze the following satellite observation data for environmental compliance:

FACILITY LOCATION: ${body.latitude ?? "19.076"}°N, ${body.longitude ?? "72.877"}°E
OBSERVATION PERIOD: Last 30 days
REPORTED DATA:
- NDVI (Vegetation Index): ${body.ndvi ?? 0.45}
- Methane Levels: ${body.methane ?? 1850} ppm
- Thermal Anomalies Detected: ${body.thermalAnomaly ?? false}
- Land Use Change: ${body.landUseChange ?? -1.2}%

COMPANY CLAIM: "${claim || "Our facility maintains a green buffer zone and has zero methane leaks"}"

Provide analysis in JSON format:
{
  "analysisId": "SAT-${Date.now()}",
  "overallAssessment": "compliant" | "non-compliant" | "needs_investigation",
  "findings": [
    { "indicator": "<what was checked>", "result": "<finding>", "concern_level": "low" | "medium" | "high" }
  ],
  "claimAlignment": "<how well the data aligns with the claim>",
  "confidence": <0.0-1.0>
}`;

                const result = await genAI.models.generateContent({
                    model: GEMINI_FLASH,
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    config: {
                        responseMimeType: "application/json",
                    },
                });

                let parsed;
                try {
                    parsed = JSON.parse(result.text ?? "{}");
                } catch {
                    parsed = { raw: result.text, parseError: true };
                }

                return NextResponse.json({
                    success: true,
                    analysis: parsed,
                    model: GEMINI_FLASH,
                });
            }

            default:
                return NextResponse.json(
                    { error: "Invalid action. Use 'verify_claim' or 'analyze_satellite'" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Multimodal API error:", error);
        return NextResponse.json(
            { error: "Multimodal verification failed", details: String(error) },
            { status: 500 }
        );
    }
}
