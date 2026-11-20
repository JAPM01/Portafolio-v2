import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function letterJ() {
  const s = new THREE.Shape();
  s.moveTo(0.35, 2); s.lineTo(1, 2); s.lineTo(1, 0.1);
  s.absarc(0.1, 0.1, 0.9, 0, -Math.PI / 2 - 0.0001, true);
  s.lineTo(-0.9, -0.8); s.lineTo(-0.9, -0.2); s.lineTo(0.1, -0.2);
  s.absarc(0.1, 0.1, 0.25, -Math.PI / 2, 0, false);
  s.lineTo(0.35, 2);
  return s;
}
function letterP() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.8); s.lineTo(0, 2); s.lineTo(0.9, 2);
  s.absarc(0.9, 1.25, 0.75, Math.PI / 2, -Math.PI / 2, true);
  s.lineTo(0.65, 0.5); s.lineTo(0.65, -0.8); s.lineTo(0, -0.8);
  const hole = new THREE.Path();
  hole.moveTo(0.65, 1.45); hole.lineTo(0.9, 1.45);
  hole.absarc(0.9, 1.25, 0.2, Math.PI / 2, -Math.PI / 2, true);
  hole.lineTo(0.65, 1.05); hole.lineTo(0.65, 1.45);
  s.holes.push(hole);
  return s;
}

function Monogram({ active }: { active: boolean }) {
  const g = useRef<THREE.Group>(null);
  const geos = useMemo(() => {
    const opts = { depth: 0.6, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 6, curveSegments: 32 };
    const j = new THREE.ExtrudeGeometry(letterJ(), opts);
    const p = new THREE.ExtrudeGeometry(letterP(), opts);
    return { j, p };
  }, []);
  useFrame((s) => { if (g.current && active) g.current.position.y = Math.sin(s.clock.elapsedTime * 0.8) * 0.06 - 0.5; });
  return (
    <group ref={g} position={[-0.55, -0.5, -0.3]}>
      <mesh geometry={geos.j} position={[-0.75, 0, 0]}>
        <meshStandardMaterial metalness={1} roughness={0.12} color="#e8ebf0" />
      </mesh>
      <mesh geometry={geos.p} position={[0.55, -0.4, 0.25]}>
        <meshStandardMaterial metalness={1} roughness={0.12} color="#e8ebf0" />
      </mesh>
    </group>
  );
}

export default function ChromeMonogram({ active, lite }: { active: boolean; lite: boolean }) {
  return (
    <Canvas dpr={lite ? [0.7, 1] : [1, 1.5]} frameloop={active ? "always" : "never"} camera={{ position: [0, 0, 6.5], fov: 38 }} gl={{ alpha: true }} aria-label="Monograma JP en cromo, arrastra para girarlo">
      <Environment resolution={lite ? 64 : 256}>
        <Lightformer intensity={4} position={[0, 5, 0]} scale={[10, 2, 1]} />
        <Lightformer intensity={2} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 0.6, 1]} />
        <Lightformer intensity={2} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[20, 0.4, 1]} />
        <Lightformer intensity={1.5} color="#FF9636" position={[0, -5, 2]} scale={[10, 2, 1]} />
        <Lightformer intensity={2} color="#000AFF" position={[0, -3, -5]} scale={[10, 4, 1]} />
      </Environment>
      <Monogram active={active} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
    </Canvas>
  );
}
