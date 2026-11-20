"use client";
import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

function Lens({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshPhysicalMaterial
          color={color}
          transmission={0.95}
          thickness={2.5}
          roughness={0.03}
          ior={1.5}
          dispersion={0.8}
          attenuationDistance={2.5}
          attenuationColor="#ffffff"
          transparent
          opacity={0.4}
          clearcoat={1}
          clearcoatRoughness={0.08}
          specularIntensity={1}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function Rig({ scroll }: { scroll: { current: number } }) {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    g.current.rotation.y = state.pointer.x * 0.35 + scroll.current * 1.2;
    g.current.rotation.x = -state.pointer.y * 0.18 + scroll.current * 0.35;
  });
  return (
    <group ref={g}>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <Lens position={[0, 0.75, 0]} color="#9db4ff" />
        <Lens position={[-0.85, -0.55, 0.25]} color="#c9c9c9" />
        <Lens position={[0.85, -0.55, 0.25]} color="#7dd3fc" />
      </Float>
    </group>
  );
}

export default function Venn3D() {
  const scroll = useRef(0);
  useEffect(() => {
    // orbital rotation driven by the page scroll through the manifesto,
    // scrubbed: the Venn turns as the section crosses the viewport
    const st = ScrollTrigger.create({
      trigger: "#manifesto",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        scroll.current = (self.progress - 0.5) * 1.4;
      },
    });
    return () => {
      st.kill();
    };
  }, []);
  return (
    <div
      className="relative h-[420px] w-full md:h-[520px]"
      onWheel={(e) => {
        scroll.current = THREE.MathUtils.clamp(scroll.current + e.deltaY * 0.0004, -0.6, 0.6);
      }}
    >
      <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={["#121212"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 4, 4]} intensity={1.4} />
        <pointLight position={[-4, 2, 2]} intensity={12} color="#000aff" />
        <pointLight position={[4, -2, 2]} intensity={10} color="#ff9636" />
        {/* Light strips behind the lenses: the transmission refracts them,
            so the glass reads as glass instead of an empty dark panel.
            Kept inside the spheres' silhouette so they only show through
            the glass, never as bare rectangles. */}
        <mesh position={[-1.15, 0.1, -2.5]}>
          <boxGeometry args={[0.35, 2.4, 0.1]} />
          <meshBasicMaterial color="#000aff" />
        </mesh>
        <mesh position={[1.15, -0.1, -2.5]}>
          <boxGeometry args={[0.35, 2.4, 0.1]} />
          <meshBasicMaterial color="#ff9636" />
        </mesh>
        <mesh position={[0, 1.35, -2.8]}>
          <boxGeometry args={[3.0, 0.22, 0.1]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Rig scroll={scroll} />
      </Canvas>
      {/* Labels as plain DOM overlays: drei Html dropped the top (PRODUCT)
          label, so the labels live here and are always in the DOM. */}
      <span className="mono pointer-events-none absolute left-1/2 top-[16%] -translate-x-1/2 whitespace-nowrap text-[10px] tracking-widest text-white/85">
        PRODUCT
      </span>
      <span className="mono pointer-events-none absolute bottom-[22%] left-[22%] whitespace-nowrap text-[10px] tracking-widest text-white/85">
        DESIGN
      </span>
      <span className="mono pointer-events-none absolute bottom-[22%] right-[22%] whitespace-nowrap text-[10px] tracking-widest text-white/85">
        CODE
      </span>
      <span className="mono pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] tracking-widest text-white">
        Sweet spot
      </span>
    </div>
  );
}
