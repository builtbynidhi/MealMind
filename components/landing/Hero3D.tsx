"use client";

import { useRef } from"react";
import { Canvas, useFrame } from"@react-three/fiber";
import type { Group } from"three";
import {
 AdaptiveDpr,
 ContactShadows,
 Environment,
 Float,
 PresentationControls,
 Preload,
 Sparkles,
} from"@react-three/drei";

// A lightweight, asset-free 3D"fresh bowl"— floating produce-like shapes in the
// brand palette. Interactive (drag), auto-rotating, sparkles. Performant.
function Veg({
 position,
 color,
 geom,
 scale = 1,
}: {
 position: [number, number, number];
 color: string;
 geom:"sphere"|"torus"|"capsule"|"cone"|"icosahedron";
 scale?: number;
}) {
 return (
 <Float speed={2} rotationIntensity={0.9} floatIntensity={1.3}>
 <mesh position={position} scale={scale} castShadow>
 {geom ==="sphere"&& <sphereGeometry args={[0.6, 32, 32]} />}
 {geom ==="torus"&& <torusGeometry args={[0.55, 0.22, 24, 48]} />}
 {geom ==="capsule"&& <capsuleGeometry args={[0.28, 0.7, 8, 24]} />}
 {geom ==="cone"&& <coneGeometry args={[0.5, 1, 28]} />}
 {geom ==="icosahedron"&& <icosahedronGeometry args={[0.55, 0]} />}
 <meshStandardMaterial color={color} roughness={0.3} metalness={0.08} />
 </mesh>
 </Float>
 );
}

function Scene() {
 const ref = useRef<Group>(null);
 useFrame((_, delta) => {
 if (ref.current) ref.current.rotation.y += delta * 0.18;
 });
 return (
 <group ref={ref} rotation={[0.1, 0.3, 0]}>
 <Veg position={[0, 0.2, 0]} color="#22c55e"geom="torus"scale={1.5} />
 <Veg position={[-1.7, 0.8, 0.3]} color="#f97316"geom="sphere"scale={0.9} />
 <Veg position={[1.8, 0.5, -0.2]} color="#ef4444"geom="sphere"scale={0.85} />
 <Veg position={[0.9, -1.2, 0.4]} color="#84cc16"geom="capsule"scale={0.9} />
 <Veg position={[-1.3, -1.1, 0.2]} color="#fb923c"geom="cone"scale={0.8} />
 <Veg position={[0, 1.7, -0.4]} color="#16a34a"geom="sphere"scale={0.7} />
 <Veg position={[1.5, -0.9, 0.5]} color="#fbbf24"geom="icosahedron"scale={0.8} />
 <Veg position={[-1.9, -0.2, -0.3]} color="#a78bfa"geom="sphere"scale={0.6} />
 </group>
 );
}

export default function Hero3D() {
 return (
 <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 0, 6], fov: 45 }} aria-hidden style={{ touchAction:"pan-y"}}>
 <ambientLight intensity={0.7} />
 <directionalLight position={[5, 6, 4]} intensity={1.5} castShadow />
 <PresentationControls global polar={[-0.3, 0.3]} azimuth={[-0.6, 0.6]}>
 <Scene />
 </PresentationControls>
 <Sparkles count={50} scale={9} size={3} speed={0.4} opacity={0.6} color="#fde68a"/>
 <ContactShadows position={[0, -2, 0]} opacity={0.35} scale={10} blur={2.6} far={4} />
 <Environment preset="sunset"/>
 <AdaptiveDpr pixelated />
 <Preload all />
 </Canvas>
 );
}
