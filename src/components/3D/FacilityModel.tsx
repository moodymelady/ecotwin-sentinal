"use client";
// ━━━ Facility 3D Model – Procedurally Generated Factory Complex ━━━
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Building({
    position,
    size,
    color,
    emissive,
}: {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
    emissive?: string;
}) {
    return (
        <mesh position={position} castShadow receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial
                color={color}
                metalness={0.3}
                roughness={0.5}
                emissive={emissive || "#000000"}
                emissiveIntensity={emissive ? 0.15 : 0}
            />
        </mesh>
    );
}

function Chimney({ position }: { position: [number, number, number] }) {
    const smokeRef = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (smokeRef.current) {
            smokeRef.current.position.y = 5 + Math.sin(clock.elapsedTime * 0.5) * 0.3;
            smokeRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.8) * 0.1);
        }
    });

    return (
        <group position={position}>
            <mesh castShadow>
                <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
                <meshStandardMaterial color="#7a8090" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* Smoke particle */}
            <mesh ref={smokeRef} position={[0, 2, 0]}>
                <sphereGeometry args={[0.4, 8, 8]} />
                <meshStandardMaterial
                    color="#99aabb"
                    transparent
                    opacity={0.2}
                />
            </mesh>
        </group>
    );
}

function SolarPanel({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
    return (
        <mesh position={position} rotation={rotation || [-0.3, 0, 0]} castShadow>
            <boxGeometry args={[1.8, 0.05, 1]} />
            <meshStandardMaterial
                color="#1a237e"
                metalness={0.9}
                roughness={0.1}
                emissive="#0d47a1"
                emissiveIntensity={0.15}
            />
        </mesh>
    );
}

function DataPulse({ position }: { position: [number, number, number] }) {
    const ringRef = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (ringRef.current) {
            const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.5;
            ringRef.current.scale.set(scale, scale, 1);
            (ringRef.current.material as THREE.MeshStandardMaterial).opacity =
                0.5 - Math.sin(clock.elapsedTime * 2) * 0.3;
        }
    });

    return (
        <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshStandardMaterial
                color="#00a86b"
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
                emissive="#00a86b"
                emissiveIntensity={0.3}
            />
        </mesh>
    );
}

export default function FacilityModel() {
    return (
        <group position={[0, 0, 0]}>
            {/* Main factory building */}
            <Building position={[0, 1.5, 0]} size={[6, 3, 4]} color="#4a6fa5" emissive="#2a8a5a" />

            {/* Warehouses */}
            <Building position={[-5, 1, 2]} size={[3, 2, 3]} color="#5a7faa" emissive="#3a6d8a" />
            <Building position={[5, 0.8, -1]} size={[3, 1.6, 2.5]} color="#5a7faa" />

            {/* Processing unit */}
            <Building position={[2, 1.2, -4]} size={[4, 2.4, 2]} color="#8a5a5a" emissive="#aa4a4a" />

            {/* Office building */}
            <Building position={[-4, 1.8, -3]} size={[2.5, 3.6, 2.5]} color="#5a6a8a" emissive="#4a5a8a" />

            {/* Chimneys */}
            <Chimney position={[1.5, 3, -0.5]} />
            <Chimney position={[3, 2.4, -4]} />

            {/* Solar panels on roof */}
            <SolarPanel position={[-1.5, 3.1, 0.5]} />
            <SolarPanel position={[-1.5, 3.1, -0.7]} />
            <SolarPanel position={[0, 3.1, 0.5]} />
            <SolarPanel position={[0, 3.1, -0.7]} />

            {/* Data pulse effects */}
            <DataPulse position={[0, 0.05, 0]} />
            <DataPulse position={[-5, 0.05, 2]} />
            <DataPulse position={[5, 0.05, -1]} />

            {/* Pipes connecting buildings */}
            <mesh position={[3.5, 2, -2]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.12, 0.12, 4, 8]} />
                <meshStandardMaterial color="#7a8a9a" metalness={0.5} roughness={0.3} />
            </mesh>

            {/* Water treatment tank */}
            <mesh position={[7, 0.8, 3]} castShadow>
                <cylinderGeometry args={[1.2, 1.2, 1.6, 16]} />
                <meshStandardMaterial
                    color="#4a7a8a"
                    metalness={0.3}
                    roughness={0.5}
                    emissive="#2a6a7a"
                    emissiveIntensity={0.1}
                />
            </mesh>

            {/* Conveyor belt */}
            <mesh position={[-1.5, 0.3, 3.5]} rotation={[0, 0.4, 0]}>
                <boxGeometry args={[5, 0.1, 0.6]} />
                <meshStandardMaterial color="#5a5a5a" metalness={0.4} roughness={0.5} />
            </mesh>
        </group>
    );
}
