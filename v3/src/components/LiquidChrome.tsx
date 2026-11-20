"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Hero canvas: liquid chrome / fluid metal reacting to the pointer.
 * Plain Three.js shader plane (no R3F here so the hero never blocks on it).
 * Pointer is smoothed with lerp; blue #000AFF + amber #FF9636 only as light.
 */
export default function LiquidChrome({ onPointer }: { onPointer?: (x: number, y: number) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: 0.66, y: 0.58, tx: 0.66, ty: 0.58 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
      uPointer: { value: new THREE.Vector2(0.66, 0.58) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uRes;
        uniform vec2 uPointer;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x),
                     mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y);
        }
        float fbm(vec2 p){
          float v = 0.0; float a = 0.5;
          for(int i=0;i<5;i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
          return v;
        }
        void main(){
          vec2 uv = vUv;
          vec2 asp = vec2(uRes.x / uRes.y, 1.0);
          vec2 p = (uv - 0.5) * asp;
          vec2 m = (uPointer - 0.5) * asp;
          float t = uTime * 0.08;
          // fluted-glass refraction: vertical ribs bend the sampling
          // horizontally, stronger near the pointer, like real ribbed glass
          float rib = sin(p.x * 150.0 + sin(p.y * 6.0) * 1.5);
          float bend = rib * 0.006 * (0.55 + 0.45 * exp(-distance(p, m) * distance(p, m) * 4.0));
          vec2 q = p + vec2(bend, 0.0) + (m * 0.12);
          // liquid chrome: ridged noise stretched vertically, slow flow
          float warp = fbm(q * vec2(2.0, 1.0) + vec2(t, -t * 0.5));
          float ridge = abs(sin((q.x * 9.0 + warp * 4.0) * 3.14159));
          ridge = pow(1.0 - ridge, 2.0);
          float flow = fbm(vec2(q.x * 3.0 + warp * 2.0, q.y * 1.2 - t * 0.8));
          float chrome = clamp(ridge * 0.75 + flow * 0.45, 0.0, 1.0);
          // metal: deep black valleys, steel mid, near-white silver peaks
          vec3 deep = vec3(0.004, 0.004, 0.004);
          vec3 steel = vec3(0.16, 0.18, 0.24);
          vec3 silver = vec3(0.92, 0.95, 1.0);
          vec3 col = mix(deep, steel, smoothstep(0.05, 0.55, chrome));
          col = mix(col, silver, pow(smoothstep(0.45, 0.95, chrome), 2.0));
          // thin bright rib lines on top of the metal
          float line = smoothstep(0.92, 1.0, ridge);
          col += vec3(0.35) * line * 0.5;
          // cyan glow spot that follows the pointer (blue light, never text)
          float dGlow = distance(p, m);
          col += vec3(0.10, 0.55, 1.0) * exp(-dGlow * dGlow * 5.0) * 0.55;
          // electric blue light, top-right corner
          float dBlue = distance(p, vec2(0.62, 0.45));
          col += vec3(0.0, 0.04, 1.0) * exp(-dBlue * dBlue * 2.6) * 0.5;
          // warm amber glow, low and faint, bottom edge
          float dAmber = distance(p, vec2(-0.25 + m.x * 0.15, -0.62));
          col += vec3(1.0, 0.59, 0.21) * exp(-dAmber * dAmber * 2.2) * 0.16;
          // vertical flute shading to reinforce the ribs
          float flute = sin(p.x * 150.0 + warp * 5.0) * 0.5 + 0.5;
          col *= 0.90 + flute * 0.12;
          // vignette
          float vig = smoothstep(1.2, 0.4, length(p));
          col *= mix(0.6, 1.0, vig);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      pointerRef.current.tx = (e.clientX - r.left) / Math.max(1, r.width);
      pointerRef.current.ty = 1 - (e.clientY - r.top) / Math.max(1, r.height);
    };
    const onResize = () => {
      renderer?.setSize(mount.clientWidth, mount.clientHeight);
      uniforms.uRes.value.set(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      const pr = pointerRef.current;
      pr.x += (pr.tx - pr.x) * 0.06;
      pr.y += (pr.ty - pr.y) * 0.06;
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uPointer.value.set(pr.x, pr.y);
      onPointer?.(pr.x, pr.y);
      renderer?.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      material.dispose();
      renderer?.dispose();
      if (renderer?.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [onPointer]);

  return <div ref={mountRef} className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" aria-hidden="true" />;
}
