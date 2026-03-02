"use client";
// ━━━ Reasoning Log – Chain-of-Thought Display ━━━
import { motion } from "framer-motion";
import type { ReasoningTrace } from "@/types";

interface ReasoningLogProps {
    traces: ReasoningTrace[];
}

const stepColors = [
    "#00ffaa", "#00bbff", "#aa77ff", "#ff77aa", "#ffaa00",
];

export default function ReasoningLog({ traces }: ReasoningLogProps) {
    if (traces.length === 0) {
        return (
            <div className="reasoning-empty">
                <div className="reasoning-empty-icon">🧠</div>
                <h3>No Reasoning Traces Yet</h3>
                <p>
                    Ask a question in the Chat tab to generate an AI reasoning trace.
                    Each response includes a Chain-of-Thought audit trail.
                </p>
            </div>
        );
    }

    return (
        <div className="reasoning-container">
            <div className="reasoning-header">
                <h3>🧠 Chain-of-Thought Audit Trail</h3>
                <p>Transparent AI reasoning for every sustainability assessment</p>
            </div>

            {traces.map((trace, traceIdx) => (
                <motion.div
                    key={traceIdx}
                    className="reasoning-trace"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: traceIdx * 0.1 }}
                >
                    <div className="trace-header">
                        <span className="trace-badge">Trace #{traceIdx + 1}</span>
                        <span className="trace-time">
                            {new Date(trace.timestamp).toLocaleString()}
                        </span>
                    </div>

                    {/* Steps */}
                    <div className="trace-steps">
                        {trace.steps.map((step, stepIdx) => (
                            <motion.div
                                key={stepIdx}
                                className="trace-step"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: stepIdx * 0.08 }}
                            >
                                <div
                                    className="step-connector"
                                    style={{
                                        borderColor: stepColors[stepIdx % stepColors.length],
                                    }}
                                >
                                    <div
                                        className="step-number"
                                        style={{
                                            background: stepColors[stepIdx % stepColors.length],
                                        }}
                                    >
                                        {step.stepNumber}
                                    </div>
                                </div>

                                <div className="step-content">
                                    <div className="step-action">
                                        <strong>Action:</strong> {step.action}
                                    </div>
                                    <div className="step-observation">
                                        <strong>Observation:</strong> {step.observation}
                                    </div>
                                    <div className="step-thought">
                                        <strong>Thought:</strong> {step.thought}
                                    </div>
                                    {step.toolUsed && (
                                        <div className="step-tool">
                                            🔧 Tool: <code>{step.toolUsed}</code>
                                        </div>
                                    )}
                                    {step.dataReferences && step.dataReferences.length > 0 && (
                                        <div className="step-refs">
                                            📎 References: {step.dataReferences.join(", ")}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Verdict */}
                    <div className="trace-verdict">
                        <div className="verdict-label">Final Verdict</div>
                        <div className="verdict-text">{trace.finalVerdict}</div>
                    </div>

                    {/* Audit Hash */}
                    <div className="trace-audit">
                        <span className="audit-icon">🔒</span>
                        <code className="audit-hash">{trace.auditHash}</code>
                        <span className="audit-label">Tamper-proof hash</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
