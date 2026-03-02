"use client";
// ━━━ Sidebar – Gemini Reasoning Chat & Controls ━━━
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Hotspot, GeminiChatMessage } from "@/types";
import ScenarioInput from "./ScenarioInput";
import ReasoningLog from "./ReasoningLog";
import { RainbowButton } from "./rainbow-button";

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    selectedHotspot: Hotspot | null;
    activeTab: "chat" | "reasoning" | "scenario";
    onTabChange: (tab: "chat" | "reasoning" | "scenario") => void;
}

export default function Sidebar({
    isOpen,
    onToggle,
    selectedHotspot,
    activeTab,
    onTabChange,
}: SidebarProps) {
    const [messages, setMessages] = useState<GeminiChatMessage[]>([
        {
            role: "assistant",
            content:
                "Welcome to EcoTwin Sentinal. I'm your AI sustainability analyst. Select a hotspot on the 3D model or ask me about ESG compliance, carbon emissions, or run a What-If scenario.",
            timestamp: new Date().toISOString(),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (selectedHotspot) {
            const hotspotMsg: GeminiChatMessage = {
                role: "assistant",
                content: `🔍 **Hotspot Selected: ${selectedHotspot.label}**\n\n• Category: ${selectedHotspot.category}\n• Severity: ${selectedHotspot.severity.toUpperCase()}\n• Risk Score: ${selectedHotspot.riskScore}/100\n\n${selectedHotspot.description}\n\nAsk me for a deeper analysis or run a What-If scenario to explore mitigation strategies.`,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, hotspotMsg]);
        }
    }, [selectedHotspot]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: GeminiChatMessage = {
            role: "user",
            content: input,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/gemini/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: input,
                    facilityId: selectedHotspot?.facilityId || "FAC-MONTERREY-001",
                    context: selectedHotspot
                        ? `Currently viewing hotspot: ${selectedHotspot.label} (${selectedHotspot.category}, risk: ${selectedHotspot.riskScore})`
                        : undefined,
                }),
            });

            const data = await res.json();

            // Extract content from response — handle errors, raw text, and structured data
            let responseContent = "";
            if (!res.ok || data.error) {
                responseContent = `⚠️ API Error: ${data.error || "Unknown error"}\n${data.details || ""}`;
            } else if (data.simulation?.rawResponse) {
                responseContent = data.simulation.rawResponse;
            } else if (data.simulation?.scenarioSummary) {
                responseContent = `📊 **${data.simulation.scenarioSummary}**`;
                if (data.simulation.metrics) {
                    const m = data.simulation.metrics;
                    responseContent += `\n\n• Baseline Emissions: ${m.baselineEmissions} tCO₂\n• Projected Emissions: ${m.projectedEmissions} tCO₂\n• Reduction: ${m.reductionPercent}%\n• Cost Impact: $${m.costImpactUSD?.toLocaleString()}\n• Timeline: ${m.timelineMonths} months\n• Confidence: ${(m.confidence * 100).toFixed(0)}%`;
                }
                if (data.simulation.recommendations?.length) {
                    responseContent += `\n\n💡 Recommendations:\n${data.simulation.recommendations.map((r: string) => `• ${r}`).join("\n")}`;
                }
            } else if (data.simulation) {
                responseContent = JSON.stringify(data.simulation, null, 2);
            } else {
                responseContent = "⚠️ Received empty response from AI. Please try again.";
            }

            // Also show tool calls if any
            if (data.toolCalls?.length) {
                responseContent += `\n\n🔧 Tools Used: ${data.toolCalls.map((t: { tool: string }) => t.tool).join(", ")}`;
            }

            const aiMsg: GeminiChatMessage = {
                role: "assistant",
                content: responseContent,
                reasoning: data.simulation?.reasoning
                    ? {
                        steps: data.simulation.reasoning.steps || [],
                        finalVerdict: data.simulation.reasoning.finalVerdict || "",
                        auditHash: `SHA256-${Date.now().toString(36)}`,
                        timestamp: new Date().toISOString(),
                    }
                    : undefined,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "⚠️ Connection error. Please check your API key in `.env.local` and try again.",
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "chat" as const, label: "💬 Chat", icon: "💬" },
        { id: "reasoning" as const, label: "🧠 Reasoning", icon: "🧠" },
        { id: "scenario" as const, label: "🔮 Scenario", icon: "🔮" },
    ];

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={onToggle}
                className="sidebar-toggle"
                aria-label="Toggle sidebar"
            >
                {isOpen ? "✕" : "☰"}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        className="sidebar"
                        initial={{ x: 420 }}
                        animate={{ x: 0 }}
                        exit={{ x: 420 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="sidebar-header">
                            <div className="sidebar-title">
                                <span className="sidebar-logo">🛡️</span>
                                <div>
                                    <h2>EcoTwin Sentinal</h2>
                                    <span className="sidebar-subtitle">AI Sustainability Analyst</span>
                                </div>
                            </div>
                            <div className="status-badge">
                                <span className="status-dot"></span>
                                Online
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="sidebar-tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`sidebar-tab ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => onTabChange(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="sidebar-content">
                            {activeTab === "chat" && (
                                <div className="chat-container">
                                    <div className="px-4 pt-4">
                                        <RainbowButton className="w-full text-sm h-10">
                                            ✨ Get Unlimited AI Analysis
                                        </RainbowButton>
                                    </div>
                                    <div className="chat-messages">
                                        {messages.map((msg, i) => (
                                            <motion.div
                                                key={i}
                                                className={`chat-message ${msg.role}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 }}
                                            >
                                                <div className="message-avatar">
                                                    {msg.role === "user" ? "👤" : "🤖"}
                                                </div>
                                                <div className="message-body">
                                                    <div className="message-content">{msg.content}</div>
                                                    <span className="message-time" suppressHydrationWarning>
                                                        {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                                                    </span>
                                                    {msg.reasoning && (
                                                        <button
                                                            className="view-reasoning-btn"
                                                            onClick={() => onTabChange("reasoning")}
                                                        >
                                                            🧠 View Reasoning Trace →
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {loading && (
                                            <div className="chat-message assistant">
                                                <div className="message-avatar">🤖</div>
                                                <div className="message-body">
                                                    <div className="typing-indicator">
                                                        <span></span><span></span><span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="chat-input-container">
                                        <input
                                            type="text"
                                            className="chat-input"
                                            placeholder="Ask about ESG compliance, emissions, or run a What-If..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                            disabled={loading}
                                        />
                                        <button
                                            className="chat-send-btn"
                                            onClick={handleSend}
                                            disabled={loading || !input.trim()}
                                        >
                                            ➤
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "reasoning" && (
                                <ReasoningLog
                                    traces={messages
                                        .filter((m) => m.reasoning)
                                        .map((m) => m.reasoning!)}
                                />
                            )}

                            {activeTab === "scenario" && (
                                <ScenarioInput
                                    onSubmit={(query) => {
                                        setInput(query);
                                        onTabChange("chat");
                                        setTimeout(() => {
                                            setInput(query);
                                            handleSend();
                                        }, 100);
                                    }}
                                />
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
