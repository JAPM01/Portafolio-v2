import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, useFBO } from "@react-three/drei";
import * as THREE from "three";

/**
 * Shared liquid-glass language for every 3D section (Venn lenses, skill map).
 * One refraction buffer per canvas, one material preset, one backdrop, one light rig.
 */
const BufferCtx = createContext<THREE.Texture | null>(null);

export function GlassGroup({ children, resolution = 1024 }: { children: ReactNode; resolution?: number }) {
  const group = useRef<THREE.Group>(null);
  const fbo = useFBO(resolution, resolution);
  useFrame(({ gl, scene, camera }) => {
    const g = group.current; if (!g) return;
    g.visible = false;
    gl.setRenderTarget(fbo);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    g.visible = true;
  }, -1);
  return <BufferCtx.Provider value={fbo.texture}><group ref={group}>{children}</group></BufferCtx.Provider>;
}

export function GlassMaterial({ lite = false, thickness = 0.6 }: { lite?: boolean; thickness?: number }) {
  const buffer = useContext(BufferCtx);
  return (
    <MeshTransmissionMaterial
      {...(buffer ? { buffer } : {})}
      transmission={1}
      thickness={thickness}
      roughness={0.04}
      ior={1.38}
      chromaticAberration={lite ? 0.15 : 0.35}
      anisotropicBlur={0.15}
      distortion={0.2}
      distortionScale={0.25}
      temporalDistortion={0.08}
      clearcoat={1}
      clearcoatRoughness={0.05}
      envMapIntensity={0.7}
      color="#f4f7ff"
      attenuationColor="#ffffff"
      attenuationDistance={4}
    />
  );
}

/** Biconvex lens: thin centre bulge with a rounded rim, facing the camera (+Z). */
export function useLensGeometry(radius: number, depth: number, segments = 64) {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const n = 32;
    for (let i = 0; i <= n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI;
      const c = Math.cos(a);
      pts.push(new THREE.Vector2(radius * Math.pow(Math.max(c, 0), 0.45) + 1e-4, depth * Math.sin(a)));
    }
    const g = new THREE.LatheGeometry(pts, segments);
    g.rotateX(Math.PI / 2);
    g.computeVertexNormals();
    return g;
  }, [radius, depth, segments]);
}

function makeBackdropTexture() {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const x = c.getContext("2d");
  if (!x) return new THREE.Texture();
  const glow = (cx: number, cy: number, r: number, col: string) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, s, s);
  };
  glow(s * 0.62, s * 0.42, s * 0.42, "rgba(0,10,255,0.85)");
  glow(s * 0.34, s * 0.66, s * 0.3, "rgba(255,150,54,0.55)");
  glow(s * 0.5, s * 0.5, s * 0.16, "rgba(254,254,254,0.35)");
  x.strokeStyle = "rgba(254,254,254,0.08)"; x.lineWidth = 1.5;
  for (let i = 0; i <= s; i += 32) {
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i, s); x.stroke();
    x.beginPath(); x.moveTo(0, i); x.lineTo(s, i); x.stroke();
  }
  // vignette so the plane melts into the page background
  x.globalCompositeOperation = "destination-in";
  const v = x.createRadialGradient(s / 2, s / 2, s * 0.15, s / 2, s / 2, s / 2);
  v.addColorStop(0, "rgba(0,0,0,1)"); v.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = v; x.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Light field behind the glass: the only place the blue/amber accents live. */
export function GlassBackdrop({ size, z }: { size: [number, number]; z: number }) {
  const tex = useMemo(makeBackdropTexture, []);
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export function GlassLights({ lite = false }: { lite?: boolean }) {
  return (
    <Environment resolution={lite ? 64 : 256}>
      <Lightformer form="rect" intensity={2.4} position={[0, 5, 3]} scale={[10, 0.6, 1]} />
      <Lightformer form="rect" intensity={1.6} position={[-5, 0, 3]} rotation-y={Math.PI / 2} scale={[0.5, 8, 1]} />
      <Lightformer form="ring" intensity={1.4} color="#000AFF" position={[4, -2, -2]} scale={3} />
      <Lightformer form="rect" intensity={0.8} color="#FF9636" position={[-3, -4, 1]} scale={[4, 0.4, 1]} />
    </Environment>
  );
}
