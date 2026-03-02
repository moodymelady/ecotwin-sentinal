"use client";
// ━━━ Scenario Input – What-If Query Builder ━━━
import { useState } from "react";
import { motion } from "framer-motion";

interface ScenarioInputProps {
    onSubmit: (query: string) => void;
}

const presetScenarios = [
    {
        icon: "♻️",
        label: "Recycled Aluminum Switch",
        query: "What if we switch from virgin aluminum to recycled aluminum for our packaging line? Annual volume: 5000 tons.",
    },
    {
        icon: "☀️",
        label: "Solar Panel Expansion",
        query: "What if we expand solar panel coverage to 80% of our rooftop? Current coverage is 30%.",
    },
    {
        icon: "🚛",
        label: "Local Supplier Shift",
        query: "What if we switch to local suppliers within 200km radius instead of importing from overseas?",
    },
    {
        icon: "💧",
        label: "Water Recycling System",
        query: "What if we install a closed-loop water recycling system to reduce freshwater intake by 60%?",
    },
    {
        icon: "🏭",
        label: "Green Concrete Transition",
        query: "What if we replace conventional concrete with green concrete for our new warehouse construction?",
    },
    {
        icon: "📊",
        label: "CSRD Compliance Check",
        query: "Analyze our current ESG reporting against the 2026 CSRD requirements. What gaps exist?",
    },
];

export default function ScenarioInput({ onSubmit }: ScenarioInputProps) {
    const [customQuery, setCustomQuery] = useState("");

    return (
        <div className="scenario-container">
            <div className="scenario-header">
                <h3>🔮 What-If Simulation Engine</h3>
                <p>Explore sustainability scenarios with AI-powered predictions backed by real carbon-intensity data.</p>
            </div>

            {/* Preset scenarios */}
            <div className="scenario-presets">
                <h4>Quick Scenarios</h4>
                {presetScenarios.map((scenario, i) => (
                    <motion.button
                        key={i}
                        className="scenario-preset-btn"
                        onClick={() => onSubmit(scenario.query)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                    >
                        <span className="scenario-icon">{scenario.icon}</span>
                        <div className="scenario-text">
                            <span className="scenario-label">{scenario.label}</span>
                            <span className="scenario-desc">{scenario.query.slice(0, 60)}...</span>
                        </div>
                        <span className="scenario-arrow">→</span>
                    </motion.button>
                ))}
            </div>

            {/* Custom query */}
            <div className="scenario-custom">
                <h4>Custom Scenario</h4>
                <textarea
                    className="scenario-textarea"
                    placeholder="Describe your sustainability what-if scenario in natural language..."
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    rows={4}
                />
                <motion.button
                    className="scenario-submit-btn"
                    onClick={() => {
                        if (customQuery.trim()) {
                            onSubmit(customQuery);
                            setCustomQuery("");
                        }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={!customQuery.trim()}
                >
                    🚀 Run Simulation
                </motion.button>
            </div>

            {/* Info box */}
            <div className="scenario-info">
                <span className="info-icon">ℹ️</span>
                <p>
                    Simulations use Gemini Function Calling to invoke <code>calculate_scope3_impact()</code> with
                    real carbon-intensity factors from the GHG Protocol database.
                </p>
            </div>
        </div>
    );
}
