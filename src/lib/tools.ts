// ━━━ Gemini Function Calling – Tool Declarations ━━━
// These declarations tell Gemini what external tools it can invoke.

import { Type, type FunctionDeclaration } from "@google/genai";

export const calculateScope3Impact: FunctionDeclaration = {
    name: "calculate_scope3_impact",
    description:
        "Calculates the projected Scope 3 carbon emission impact of switching materials, suppliers, or logistics in the supply chain. Returns baseline vs. projected emissions with cost impact estimates.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            current_material: {
                type: Type.STRING,
                description: "The current material or input being used (e.g., 'virgin aluminum')",
            },
            proposed_material: {
                type: Type.STRING,
                description: "The proposed replacement material (e.g., 'recycled aluminum')",
            },
            annual_volume_tons: {
                type: Type.NUMBER,
                description: "Annual volume in metric tons",
            },
            facility_id: {
                type: Type.STRING,
                description: "The ID of the facility running the scenario",
            },
            region: {
                type: Type.STRING,
                description: "Geographic region for carbon intensity factors (e.g., 'EU', 'APAC', 'NA')",
            },
        },
        required: ["current_material", "proposed_material", "annual_volume_tons"],
    },
};

export const querySatelliteImagery: FunctionDeclaration = {
    name: "query_satellite_imagery",
    description:
        "Fetches recent satellite imagery and environmental indices (NDVI, methane, thermal anomalies) for a given geographic region using Google Earth Engine.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            latitude: {
                type: Type.NUMBER,
                description: "Latitude of the center point",
            },
            longitude: {
                type: Type.NUMBER,
                description: "Longitude of the center point",
            },
            radius_km: {
                type: Type.NUMBER,
                description: "Radius in kilometers around the center point",
            },
            date_range_days: {
                type: Type.NUMBER,
                description: "Number of days to look back for imagery (default: 30)",
            },
            indices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Environmental indices to compute: 'ndvi', 'methane', 'thermal', 'land_use'",
            },
        },
        required: ["latitude", "longitude", "radius_km"],
    },
};

export const analyzeComplianceGap: FunctionDeclaration = {
    name: "analyze_compliance_gap",
    description:
        "Compares a company's ESG claims against the 2026 EU Green Claims Directive requirements and identifies gaps or potential greenwashing indicators.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            claim_text: {
                type: Type.STRING,
                description: "The sustainability claim made by the company",
            },
            regulation_reference: {
                type: Type.STRING,
                description: "The specific regulation or directive to check against",
            },
            supporting_evidence_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "IDs of uploaded evidence documents to cross-reference",
            },
        },
        required: ["claim_text"],
    },
};

/** Collect all tool declarations for registration with Gemini */
export const allToolDeclarations: FunctionDeclaration[] = [
    calculateScope3Impact,
    querySatelliteImagery,
    analyzeComplianceGap,
];

// ━━━ Mock Tool Executors (for hackathon demo) ━━━

export async function executeScope3Calculation(args: Record<string, unknown>) {
    // Simulate carbon intensity lookup
    const carbonFactors: Record<string, number> = {
        "virgin aluminum": 11.89,
        "recycled aluminum": 0.52,
        "virgin steel": 1.85,
        "recycled steel": 0.42,
        "virgin plastic": 3.14,
        "recycled plastic": 1.02,
        "conventional concrete": 0.91,
        "green concrete": 0.35,
    };

    const current = String(args.current_material).toLowerCase();
    const proposed = String(args.proposed_material).toLowerCase();
    const volume = Number(args.annual_volume_tons) || 1000;

    const baselineIntensity = carbonFactors[current] ?? 5.0;
    const projectedIntensity = carbonFactors[proposed] ?? 2.0;

    const baselineEmissions = baselineIntensity * volume;
    const projectedEmissions = projectedIntensity * volume;
    const reductionPercent =
        ((baselineEmissions - projectedEmissions) / baselineEmissions) * 100;

    return {
        current_material: current,
        proposed_material: proposed,
        annual_volume_tons: volume,
        baseline_emissions_tco2: Math.round(baselineEmissions * 100) / 100,
        projected_emissions_tco2: Math.round(projectedEmissions * 100) / 100,
        reduction_percent: Math.round(reductionPercent * 10) / 10,
        cost_impact_usd: Math.round(volume * (projectedIntensity - baselineIntensity) * 42.5),
        confidence: 0.87,
        data_source: "GHG Protocol Scope 3 Category 1 (Purchased Goods)",
        methodology: "Cradle-to-gate LCA with regional grid factors",
    };
}

export async function executeSatelliteQuery(args: Record<string, unknown>) {
    return {
        latitude: args.latitude,
        longitude: args.longitude,
        capture_date: new Date().toISOString().split("T")[0],
        indices: {
            ndvi: 0.42 + Math.random() * 0.3,
            methane_ppm: 1800 + Math.random() * 200,
            thermal_anomaly: Math.random() > 0.7,
            land_use_change: -2.3 + Math.random() * 5,
        },
        source: "sentinel_2",
        resolution_m: 10,
    };
}

export async function executeComplianceAnalysis(args: Record<string, unknown>) {
    return {
        claim: args.claim_text,
        compliance_status: "partial",
        gaps: [
            {
                requirement: "Article 5.1 – Substantiation with primary data",
                status: "missing",
                recommendation:
                    "Provide facility-level emission data instead of industry averages",
            },
            {
                requirement: "Article 8.2 – Third-party verification",
                status: "incomplete",
                recommendation:
                    "Engage an accredited verifier under the EU Accreditation Framework",
            },
        ],
        risk_level: "medium",
        greenwashing_probability: 0.34,
    };
}
