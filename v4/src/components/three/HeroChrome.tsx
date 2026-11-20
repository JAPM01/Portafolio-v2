import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { pointer } from "../../lib/pointer";

const frag = /* glsl */ `
precision highp float;
uniform float uTime; uniform vec2 uMouse; uniform vec2 uRes; uniform float uLite;
varying vec2 vUv;
vec3 hash3(vec2 p){ vec3 q=vec3(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)),dot(p,vec2(419.2,371.9))); return fract(sin(q)*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  float a=hash3(i).x,b=hash3(i+vec2(1,0)).x,c=hash3(i+vec2(0,1)).x,d=hash3(i+vec2(1,1)).x;
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
float fbm(vec2 p){ float v=0., a=.5; int oct = uLite > .5 ? 3 : 5; for(int i=0;i<5;i++){ if(i>=oct) break; v+=a*noise(p); p*=2.02; a*=.5;} return v; }
float height(vec2 p){
  float t=uTime*.12;
  vec2 q=vec2(fbm(p+t), fbm(p+vec2(5.2,1.3)-t));
  vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.);
  float d=length(p*.35-m*1.2);
  float ripple = .35*exp(-d*2.2)*sin(d*14.-uTime*2.2);
  return fbm(p+2.2*q) + ripple;
}
vec3 chromeColor(vec2 uv){
  vec2 vUv = uv;
  vec2 asp=vec2(uRes.x/uRes.y,1.);
  vec2 p=(vUv-.5)*asp*2.6;
  float e=.01;
  float h=height(p);
  vec3 n=normalize(vec3(height(p-vec2(e,0))-height(p+vec2(e,0)), height(p-vec2(0,e))-height(p+vec2(0,e)), e*3.));
  vec3 v=vec3(0,0,1); vec3 r=reflect(-v,n);
  // studio chrome environment: stripes of light + dark horizon
  float band = smoothstep(.15,.0,abs(r.y-.35)) + .6*smoothstep(.1,.0,abs(r.x+.45));
  vec3 base = mix(vec3(.02), vec3(.78,.8,.84), pow(clamp(r.y*.5+.5,0.,1.),2.2));
  vec3 col = base*.55 + band*vec3(.95);
  // accent light pools: blue + amber reflections (never text)
  vec2 m=(uMouse-.5);
  col += vec3(0.,.04,1.)*.9*smoothstep(.9,.0,length(r.xy-vec2(.45+m.x*.4,-.2+m.y*.4)));
  col += vec3(1.,.59,.21)*.35*smoothstep(.7,.0,length(r.xy-vec2(-.6,-.55)));
  float fres=pow(1.-max(dot(n,v),0.),3.);
  col += fres*.25;
  col *= .55+.45*h;
  // vignette to keep the title legible on the left
  float vig = smoothstep(1.3,.2,length((vUv-vec2(.62,.45))*vec2(1.4,1.)));
  col *= mix(.18,1.,vig);
  return col;
}
void main(){
  // Optical overlay only: the original metal function above stays intact.
  float aspect = uRes.x / uRes.y;
  vec2 mouse = vec2(uMouse.x, uMouse.y);
  vec2 distanceToCursor = (vUv - mouse) * vec2(aspect, 1.);
  float influence = exp(-dot(distanceToCursor, distanceToCursor) * 9.);
  // Wide cylindrical flutes: each column is a vertical lens that compresses and mirrors the metal.
  float ribs = clamp(uRes.x / 150., 4., 11.);
  float fx = vUv.x * ribs + influence * .18 * sin(uTime * .5);
  float t = fract(fx) * 2. - 1.;
  float profile = sqrt(max(0., 1. - t * t));
  float strength = mix(.35, 1., smoothstep(.0, .55, vUv.x));
  float power = (.055 + influence * .07) * strength;
  vec2 bend = vec2(-t * power, (1. - profile) * influence * .03 * strength);
  vec2 uv = clamp(vUv + bend, vec2(.001), vec2(.999));
  float dispersion = t * (.004 + influence * .008) * strength;
  vec3 glass = vec3(chromeColor(uv + vec2(dispersion, 0.)).r,
                    chromeColor(uv).g,
                    chromeColor(uv - vec2(dispersion, 0.)).b);
  float edge = smoothstep(.72, 1., abs(t));
  glass *= 1. - .42 * edge * strength;
  float spec = pow(max(0., 1. - abs(t + .38) * 3.2), 3.) * (.10 + influence * .18);
  float rim = smoothstep(.94, 1., abs(t)) * .10;
  glass += vec3(spec + rim) * strength;
  gl_FragColor = vec4(glass, 1.);
}`;
const vert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;

function Surface({ lite, onReady }: { lite: boolean; onReady?: () => void }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const reported = useRef(false);
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(.5, .5) }, uRes: { value: new THREE.Vector2(1, 1) }, uLite: { value: lite ? 1 : 0 } }),
    [lite],
  );
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-4 * dt));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-4 * dt));
    const u = mat.current?.uniforms; if (!u) return;
    const time = u['uTime'], mouse = u['uMouse'], res = u['uRes'];
    if (!time || !mouse || !res) return;
    time.value += dt;
    (mouse.value as THREE.Vector2).set(pointer.sx, 1 - pointer.sy);
    (res.value as THREE.Vector2).set(size.width, size.height);
    if (!reported.current) { reported.current = true; requestAnimationFrame(() => onReady?.()); }
  });
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} depthWrite={false} />
    </mesh>
  );
}

export default function HeroChrome({ lite, active, onReady }: { lite: boolean; active: boolean; onReady?: () => void }) {
  return (
    <Canvas
      dpr={lite ? [0.6, 1] : [1, 1.5]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      aria-hidden
    >
      <Surface lite={lite} {...(onReady ? { onReady } : {})} />
    </Canvas>
  );
}
