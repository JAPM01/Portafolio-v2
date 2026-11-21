import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { pointer, scrollState } from "../../lib/pointer";
import { GlassBackdrop, GlassGroup, GlassLights, GlassMaterial, useLensGeometry } from "./glass";

const POS: [number, number, number][] = [
  [0, 0.6, 0.05], // product (top)
  [-0.7, -0.5, 0], // design
  [0.7, -0.5, -0.05], // code
];
const TILT = [[0.18, 0], [-0.1, -0.22], [-0.1, 0.22]] as const;

function Lenses({ lite, activeLens }: { lite: boolean; activeLens?: number | null }) {
  const group = useRef<THREE.Group>(null);
  const geo = useLensGeometry(1, 0.2, lite ? 48 : 96);
  useFrame((state, delta) => {
    const g = group.current; if (!g) return;
    const k = 1 - Math.exp(-3 * Math.min(delta, 0.05));
    const ty = (scrollState.manifesto - 0.5) * 0.7 + (pointer.sx - 0.5) * 0.6;
    const tx = (pointer.sy - 0.5) * 0.45;
    g.rotation.y += (ty - g.rotation.y) * k;
    g.rotation.x += (tx - g.rotation.x) * k;
    g.children.forEach((m, i) => {
      m.position.z = (POS[i]?.[2] ?? 0) + Math.sin(state.clock.elapsedTime * 0.6 + i * 2) * 0.06;
      const target = activeLens === i ? 1.08 : 1;
      m.scale.setScalar(m.scale.x + (target - m.scale.x) * k);
    });
  });
  return (
    <GlassGroup resolution={lite ? 512 : 1024}>
      <group ref={group}>
        {POS.map((p, i) => (
          <mesh key={i} geometry={geo} position={p} rotation={[TILT[i]?.[0] ?? 0, TILT[i]?.[1] ?? 0, 0]}>
            <GlassMaterial lite={lite} thickness={0.35} />
          </mesh>
        ))}
      </group>
    </GlassGroup>
  );
}

export default function VennLenses({ lite, active, activeLens }: { lite: boolean; active: boolean; activeLens?: number | null }) {
  return (
    <Canvas dpr={lite ? [0.7, 1] : [1, 1.5]} frameloop={active ? "always" : "never"} camera={{ position: [0, 0, 6.2], fov: 40 }} gl={{ alpha: true, antialias: true }} aria-hidden>
      <GlassLights lite={lite} />
      <GlassBackdrop size={[5, 5]} z={-1.6} />
      <Lenses lite={lite} activeLens={activeLens} />
    </Canvas>
  );
}
