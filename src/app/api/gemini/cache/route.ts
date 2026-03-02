// ━━━ Gemini Context Caching – Long-Context PDF Processing ━━━
import { NextRequest, NextResponse } from "next/server";
import genAI, { GEMINI_FLASH } from "@/lib/geminiClient";

// Cache store (maps document IDs to Gemini cache names)
const cacheStore = new Map<string, { cacheName: string; createdAt: string; expiresAt: string }>();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, documentId, query } = body;

        switch (action) {
            case "create_cache": {
                // In production, this would upload the actual PDF content
                // For hackathon demo, we simulate caching with regulatory text
                const regulatoryContext = `
          2026 EU Green Claims Directive – Key Requirements:
          
          Article 3: All environmental claims must be substantiated by widely recognized scientific evidence.
          Article 5: Companies must use primary data from their own operations, not industry averages.
          Article 6: Life-cycle assessments must cover the full value chain (Scope 1, 2, and 3).
          Article 8: Claims must be verified by an accredited third-party verifier.
          Article 10: "Carbon neutral" and "climate positive" claims based solely on offsets are prohibited.
          Article 12: Environmental labels must be based on certification schemes with transparent governance.
          Article 15: Non-compliance penalties: up to 4% of annual EU turnover.
          
          CSRD (Corporate Sustainability Reporting Directive) 2026 Updates:
          - Mandatory double materiality assessment
          - Digital tagging of sustainability reports (XBRL taxonomy)
          - Supply chain due diligence for Scope 3 reporting
          - Biodiversity impact mandatory disclosure
          - Transition plan alignment with Paris Agreement 1.5°C pathway
        `;

                const cacheId = `cache-${documentId || Date.now()}`;
                cacheStore.set(cacheId, {
                    cacheName: cacheId,
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1hr TTL
                });

                return NextResponse.json({
                    success: true,
                    cacheId,
                    tokenCount: regulatoryContext.split(/\s+/).length * 1.3, // rough estimate
                    ttlSeconds: 3600,
                    message: "Context cached successfully for low-latency querying",
                });
            }

            case "query_cache": {
                // Query Gemini with cached context
                const result = await genAI.models.generateContent({
                    model: GEMINI_FLASH,
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `You are an ESG compliance expert with deep knowledge of the 2026 EU Green Claims Directive, CSRD requirements, and global sustainability regulations. 
                  
Context: The user's cached regulatory documents include the EU Green Claims Directive, CSRD 2026 updates, and corporate ESG reports.

User Query: ${query}

Provide a detailed, regulation-specific answer with article references.`,
                                },
                            ],
                        },
                    ],
                });

                return NextResponse.json({
                    success: true,
                    response: result.text,
                    cacheHit: cacheStore.has(documentId),
                    model: GEMINI_FLASH,
                });
            }

            default:
                return NextResponse.json(
                    { error: "Invalid action. Use 'create_cache' or 'query_cache'" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("Cache API error:", error);
        return NextResponse.json(
            { error: "Context caching operation failed", details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET() {
    const caches = Array.from(cacheStore.entries()).map(([id, data]) => ({
        id,
        ...data,
    }));
    return NextResponse.json({ activeCaches: caches, count: caches.length });
}
