"use client";
// ━━━ Hotspot Marker – Clickable 3D Risk Indicator ━━━
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Hotspot } from "@/types";

const severityColors: Record<string, string> = {
    low: "#22c55e",
    medium: "#f59e0b",
    high: "#f97316",
    critical: "#ef4444",
};

const categoryIcons: Record<string, string> = {
    carbon: "🏭",
    water: "💧",
    waste: "♻️",
    energy: "⚡",
    compliance: "📋",
};

interface HotspotMarkerProps {
    hotspot: Hotspot;
    isSelected: boolean;
    onClick: () => void;
}

export default function HotspotMarker({ hotspot, isSelected, onClick }: HotspotMarkerProps) {
    const markerRef = useRef<THREE.Group>(null);
    const pulseRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const color = severityColors[hotspot.severity] || "#ffffff";

    useFrame(({ clock }) => {
        if (markerRef.current) {
            // Gentle float animation
            markerRef.current.position.y =
                hotspot.position[1] + Math.sin(clock.elapsedTime * 1.5 + hotspot.position[0]) * 0.1;
        }

        if (pulseRef.current) {
            const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.3;
            pulseRef.current.scale.set(pulse, pulse, pulse);
            (pulseRef.current.material as THREE.MeshStandardMaterial).opacity =
                0.4 - Math.sin(clock.elapsedTime * 3) * 0.2;
        }

        if (glowRef.current) {
            const glow = 1 + Math.sin(clock.elapsedTime * 2) * 0.15;
            glowRef.current.scale.set(glow, glow, glow);
        }
    });

    return (
        <group
            ref={markerRef}
            position={hotspot.position}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = "default";
            }}
        >
            {/* Inner sphere */}
            <mesh castShadow>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={isSelected ? 1.5 : 0.8}
                    metalness={0.3}
                    roughness={0.2}
                />
            </mesh>

            {/* Outer glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={hovered || isSelected ? 0.4 : 0.15}
                    emissive={color}
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Pulse ring */}
            <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 0.6, 32]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Vertical beam */}
            <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.4}
                    emissive={color}
                    emissiveIntensity={0.8}
                />
            </mesh>

            {/* Label (HTML overlay) */}
            {(hovered || isSelected) && (
                <Html
                    position={[0, 1.8, 0]}
                    center
                    distanceFactor={12}
                    style={{ pointerEvents: "none" }}
                >
                    <div
                        style={{
                            background: "rgba(10, 15, 28, 0.92)",
                            border: `1px solid ${color}`,
                            borderRadius: "10px",
                            padding: "10px 14px",
                            color: "#e2e8f0",
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "12px",
                            whiteSpace: "nowrap",
                            backdropFilter: "blur(12px)",
                            boxShadow: `0 0 20px ${color}33`,
                            minWidth: "160px",
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>
                            {categoryIcons[hotspot.category]} {hotspot.label}
                        </div>
                        <div style={{ color: color, fontWeight: 600, fontSize: "11px" }}>
                            Risk Score: {hotspot.riskScore}/100 • {hotspot.severity.toUpperCase()}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "4px" }}>
                            {hotspot.description}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}
