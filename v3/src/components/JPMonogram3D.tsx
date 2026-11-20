"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";

function shapeJ(): THREE.Shape {
  // Blocky J: stem on the RIGHT, bottom bar to the left with a small
  // upturn at the left end (a stem on the left + foot right reads as L).
  const s = new THREE.Shape();
  s.moveTo(0.6, 0);
  s.lineTo(1.15, 0);
  s.lineTo(1.15, -2.05);
  s.lineTo(0, -2.05);
  s.lineTo(0, -1.5);
  s.lineTo(0.6, -1.5);
  s.closePath();
  return s;
}

function shapeP(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(1.15, 0);
  s.lineTo(1.15, -0.85);
  s.lineTo(0.55, -0.85);
  s.lineTo(0.55, -2.05);
  s.lineTo(0, -2.05);
  s.closePath();
  // bowl hole
  const hole = new THREE.Path();
  hole.moveTo(0.55, -0.32);
  hole.lineTo(0.55, -0.55);
  hole.lineTo(0.85, -0.55);
  hole.lineTo(0.85, -0.32);
  hole.closePath();
  s.holes.push(hole);
  return s;
}

function Sculpture() {
  const g = useRef<THREE.Group>(null);
  const geoJ = useMemo(() => new THREE.ExtrudeGeometry(shapeJ(), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3 }), []);
  const geoP = useMemo(() => new THREE.ExtrudeGeometry(shapeP(), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3 }), []);
  useFrame((state) => {
    if (!g.current) return;
    g.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.35 + state.pointer.x * 0.45;
    g.current.rotation.x = state.pointer.y * -0.18;
  });
  return (
    <group ref={g} position={[-0.85, 1.0, 0]}>
      <mesh geometry={geoJ} position={[0, 0, 0]}>
        <meshStandardMaterial color="#e8e8e8" metalness={1} roughness={0.16} envMapIntensity={1.6} />
      </mesh>
      <mesh geometry={geoP} position={[1.25, 0, 0]}>
        <meshStandardMaterial color="#e8e8e8" metalness={1} roughness={0.16} envMapIntensity={1.6} />
      </mesh>
    </group>
  );
}

export default function JPMonogram3D() {
  return (
    <div className="relative h-[380px] w-full md:h-[480px]">
      <Canvas camera={{ position: [0, 0, 5.4], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.6} />
        <pointLight position={[-4, 1, 3]} intensity={14} color="#000aff" />
        <pointLight position={[4, -2, 3]} intensity={12} color="#ff9636" />
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
          <Sculpture />
        </Float>
        {/* Local env map (Lightformers) — no remote HDR fetch, so a blocked
            CDN can never unmount the page. */}
        <Environment resolution={256}>
          <Lightformer intensity={2.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} color="#ffffff" />
          <Lightformer intensity={1.6} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#000aff" />
          <Lightformer intensity={1.6} position={[5, -1, -1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#ff9636" />
          <Lightformer intensity={1.2} position={[0, 0, 5]} scale={[8, 3, 1]} color="#dfe8ff" />
        </Environment>
      </Canvas>
    </div>
  );
}
