"use client";
// ━━━ Three.js Scene Setup ━━━
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { Suspense, Component, type ReactNode, useState, useEffect } from "react";
import FacilityModel from "./FacilityModel";
import HotspotMarker from "./HotspotMarker";
import type { Hotspot } from "@/types";

interface SceneProps {
    hotspots: Hotspot[];
    onHotspotClick: (hotspot: Hotspot) => void;
    selectedHotspot: Hotspot | null;
}

// ━━━ Proactive WebGL detection ━━━
function isWebGLAvailable(): boolean {
    try {
        const canvas = document.createElement("canvas");
        const gl =
            canvas.getContext("webgl2") ||
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
        return gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext;
    } catch {
        return false;
    }
}

// ━━━ Fallback UI when WebGL is unavailable ━━━
function WebGLFallback() {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #eef2f7 0%, #dce4ec 100%)",
                color: "#4a5568",
                fontFamily: "inherit",
                gap: "12px",
                borderRadius: "12px",
            }}
        >
            <span style={{ fontSize: "2.5rem" }}>🌐</span>
            <strong style={{ fontSize: "1.1rem" }}>3D View Unavailable</strong>
            <span style={{ fontSize: "0.85rem", opacity: 0.7, maxWidth: 320, textAlign: "center" }}>
                WebGL could not be initialised. Try a different browser or enable hardware acceleration in your browser settings.
            </span>
        </div>
    );
}

// ━━━ Error Boundary (safety net for unexpected runtime errors) ━━━
interface ErrorBoundaryProps {
    children: ReactNode;
}
interface ErrorBoundaryState {
    hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <WebGLFallback />;
        }
        return this.props.children;
    }
}

function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#00ff88" wireframe />
        </mesh>
    );
}

export default function Scene({ hotspots, onHotspotClick, selectedHotspot }: SceneProps) {
    // Check WebGL availability *before* mounting Canvas to avoid THREE.js console errors
    const [webglStatus, setWebglStatus] = useState<"checking" | "available" | "unavailable">("checking");

    useEffect(() => {
        setWebglStatus(isWebGLAvailable() ? "available" : "unavailable");
    }, []);

    if (webglStatus === "checking") {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#eef2f7",
                }}
            >
                <span style={{ color: "#718096", fontSize: "0.9rem" }}>Loading 3D scene…</span>
            </div>
        );
    }

    if (webglStatus === "unavailable") {
        return <WebGLFallback />;
    }

    return (
        <WebGLErrorBoundary>
            <Canvas
                shadows
                gl={{ antialias: true, alpha: false, powerPreference: "default" }}
                style={{ background: "#eef2f7" }}
                camera={{ position: [15, 12, 15], fov: 50, near: 0.1, far: 200 }}
                onCreated={({ gl }) => {
                    gl.setClearColor("#eef2f7", 1);
                }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.9} color="#ffffff" />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={2.0}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                    color="#ffffff"
                />
                <pointLight position={[-10, 10, -10]} intensity={0.6} color="#00a86b" distance={30} />
                <pointLight position={[10, 5, -5]} intensity={0.4} color="#0077cc" distance={25} />
                <pointLight position={[0, 8, 0]} intensity={0.5} color="#ffffff" distance={20} />

                {/* Light fog for depth */}
                <fog attach="fog" args={["#eef2f7", 30, 60]} />

                <Suspense fallback={<LoadingFallback />}>
                    {/* Ground plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                        <planeGeometry args={[60, 60]} />
                        <meshStandardMaterial
                            color="#dce4ec"
                            metalness={0.1}
                            roughness={0.8}
                        />
                    </mesh>

                    {/* Grid overlay */}
                    <Grid
                        position={[0, 0.01, 0]}
                        args={[50, 50]}
                        cellSize={1}
                        cellThickness={0.5}
                        cellColor="#b0c4b8"
                        sectionSize={5}
                        sectionThickness={1}
                        sectionColor="#7fa890"
                        fadeDistance={40}
                        infiniteGrid={false}
                    />

                    {/* Facility Model */}
                    <FacilityModel />

                    {/* Hotspot Markers */}
                    {hotspots.map((hotspot) => (
                        <HotspotMarker
                            key={hotspot.id}
                            hotspot={hotspot}
                            isSelected={selectedHotspot?.id === hotspot.id}
                            onClick={() => onHotspotClick(hotspot)}
                        />
                    ))}
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    minDistance={5}
                    maxDistance={40}
                    maxPolarAngle={Math.PI / 2.1}
                    target={[0, 2, 0]}
                />
            </Canvas>
        </WebGLErrorBoundary>
    );
}
