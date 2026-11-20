import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { SKILLS, radarPoint } from "../../lib/portfolio-sections";
import { pointer } from "../../lib/pointer";
import { GlassBackdrop, GlassGroup, GlassLights, useLensGeometry } from "./glass";

// SVG viewBox (1200×800, y down) → world units (y up, centred).
const toWorld = (x: number, y: number) => new THREE.Vector2(x - 600, 400 - y);

function Fit() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.zoom = size.width / 1200;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Grid() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    [25, 50, 75, 100].forEach(v => {
      for (let i = 0; i < 6; i++) {
        const a = toWorld(radarPoint(i, v).x, radarPoint(i, v).y);
        const b = toWorld(radarPoint((i + 1) % 6, v).x, radarPoint((i + 1) % 6, v).y);
        pts.push(a.x, a.y, 0, b.x, b.y, 0);
      }
    });
    for (let i = 0; i < 6; i++) {
      const e = radarPoint(i, 128); const w = toWorld(e.x, e.y);
      pts.push(0, 0, 0, w.x, w.y, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return <lineSegments geometry={geo} position={[0, 0, -60]}><lineBasicMaterial color="#FEFEFE" transparent opacity={0.3} /></lineSegments>;
}

function Radar({ active, visible, lite }: { active: number | null; visible: boolean; lite: boolean }) {
  const tilt = useRef<THREE.Group>(null);
  const shape = useRef<THREE.Group>(null);
  const nodes = useRef<(THREE.Mesh | null)[]>([]);
  const lens = useLensGeometry(18, 7, 48);
  const shapeGeo = useMemo(() => {
    const s = new THREE.Shape(SKILLS.map((k, i) => { const p = radarPoint(i, k.value); return toWorld(p.x, p.y); }));
    return new THREE.ShapeGeometry(s);
  }, []);
  const outlineGeo = useMemo(() => {
    const pts = SKILLS.map((k, i) => { const p = radarPoint(i, k.value); const w = toWorld(p.x, p.y); return new THREE.Vector3(w.x, w.y, 0); });
    return new THREE.BufferGeometry().setFromPoints([...pts, pts[0]!]);
  }, []);
  useFrame((state, delta) => {
    const k = 1 - Math.exp(-4 * Math.min(delta, 0.05));
    const t = tilt.current;
    if (t) {
      t.rotation.y += ((pointer.sx - 0.5) * 0.35 - t.rotation.y) * k;
      t.rotation.x += ((pointer.sy - 0.5) * 0.25 - t.rotation.x) * k;
    }
    const sh = shape.current;
    if (sh) { const target = visible ? 1 : 0.6; sh.scale.setScalar(sh.scale.x + (target - sh.scale.x) * k * 0.6); }
    nodes.current.forEach((n, i) => {
      if (!n) return;
      const on = active === i;
      const s = (on ? 1.7 : 1) + Math.sin(state.clock.elapsedTime * 2 + i) * (on ? 0.08 : 0.03);
      n.scale.setScalar(n.scale.x + (s - n.scale.x) * k);
      n.position.z = 40 + (on ? 30 : 0);
    });
  });
  return (
    <group ref={tilt}>
      <Grid />
      <GlassGroup resolution={lite ? 512 : 1024}>
        <group ref={shape} scale={0.6}>
          <mesh geometry={shapeGeo}><meshBasicMaterial color="#000AFF" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} /></mesh>
          <lineLoop geometry={outlineGeo}><lineBasicMaterial color="#000AFF" transparent opacity={0.85} /></lineLoop>
        </group>
        {SKILLS.map((k, i) => {
          const p = radarPoint(i, k.value); const w = toWorld(p.x, p.y);
          return <mesh key={k.axis} ref={el => { nodes.current[i] = el; }} geometry={lens} position={[w.x, w.y, 40]}><meshStandardMaterial color="#FEFEFE" roughness={0.25} metalness={0} /></mesh>;
        })}
      </GlassGroup>
    </group>
  );
}

export default function SkillGlass({ active, visible, running, lite }: { active: number | null; visible: boolean; running: boolean; lite: boolean }) {
  return (
    <Canvas orthographic dpr={lite ? [0.7, 1] : [1, 1.5]} frameloop={running ? "always" : "never"} camera={{ position: [0, 0, 1000], near: 1, far: 3000, zoom: 1 }} gl={{ alpha: true, antialias: true }} aria-hidden>
      <Fit />
      <GlassLights lite={lite} />
      <GlassBackdrop size={[1200, 800]} z={-300} />
      <Radar active={active} visible={visible} lite={lite} />
    </Canvas>
  );
}
