// Flow Gradient Background by Made for Award: https://www.madeforaward.com/ui/backgrounds/flow-gradient-background
// Free and open source (MIT). If it helped, a star means a lot: https://github.com/shivc868/madeforaward-ui
'use client'

import {useEffect, useRef, useState} from 'react'
import {readMeshPalette, brandRgb01} from '../lib/brand-palette'

export type FlowGradientBackgroundProps = {
  /** background, deep body, bright body, hot spot, cool accent */
  /** how far the flow field drags the colour, 0–2 */
  flow?: number
  /** drift speed */
  speed?: number
  /** how closely the field follows the cursor, 0–1 per frame */
  follow?: number
  className?: string
}

const VERT = `attribute vec2 a_pos; varying vec2 v_uv;
void main() { v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_res, u_mouse;
uniform float u_time, u_flow;
uniform vec3 u_bg, u_deep, u_body, u_hot, u_accent;

vec3 hash3(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1137, 0.1379));
  p += dot(p, p.yxz + 19.19);
  return -1.0 + 2.0 * fract(vec3((p.x + p.y) * p.z, (p.x + p.z) * p.y, (p.y + p.z) * p.x));
}
// gradient noise, -0.5..0.5-ish
float noise(vec3 p) {
  vec3 i = floor(p), f = p - i, w = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(dot(f, hash3(i)), dot(f - vec3(1, 0, 0), hash3(i + vec3(1, 0, 0))), w.x),
        mix(dot(f - vec3(0, 1, 0), hash3(i + vec3(0, 1, 0))), dot(f - vec3(1, 1, 0), hash3(i + vec3(1, 1, 0))), w.x), w.y),
    mix(mix(dot(f - vec3(0, 0, 1), hash3(i + vec3(0, 0, 1))), dot(f - vec3(1, 0, 1), hash3(i + vec3(1, 0, 1))), w.x),
        mix(dot(f - vec3(0, 1, 1), hash3(i + vec3(0, 1, 1))), dot(f - vec3(1, 1, 1), hash3(i + vec3(1, 1, 1))), w.x), w.y),
    w.z);
}

// walk each pixel a few steps along a noise flow field anchored on the cursor
// Se probó un warp más fuerte (0.028/0.58 y 0.035/0.65) y lavaba la
// composición en desktop: el óvalo blanco-cian se extendía por media
// pantalla y tapaba el texto. Se regresa a los valores originales
// (0.02/0.51) con los que el mesh quedó 1:1 con Sentos; el flujo ya es
// visible y el "poder WebGL" ahora viene de la interacción (brillo del
// cursor, reacción al tacto) sin romper la composición.
vec2 flowUV(vec2 uv) {
  float aspect = u_res.x / u_res.y;
  vec2 ar = vec2(aspect, 1.0);
  vec2 st = uv;
  float freq = 5.0 * 0.168 / ((aspect + 1.0) * 0.5);
  float t = 0.95 + u_time;
  for (int i = 0; i < 8; i++) {
    vec2 q = (clamp(st, -1.0, 2.0) - 0.5) * ar + (1.0 - u_mouse);
    float a = (noise(vec3((q - 0.5) * freq, t)) - 0.5) * 37.7;
    st += vec2(cos(a), sin(a)) * 0.02 * u_flow;
  }
  return mix(uv, clamp(st, 0.0, 1.0), 0.51);
}

// Soft falloff for wide atmospheric volumes. These shapes use only
// the five brand colours supplied through the CSS-backed uniforms.
float blob(vec2 p, vec2 c, vec2 r, float feather) {
  float d = length((p - c) / r);
  return 1.0 - smoothstep(1.0 - feather, 1.0 + feather, d);
}

// One connected serpentine spine from the top-right to the lower-right.
// Parallel contours follow the same curve, creating the smooth folded
// ribbons of flowing silk rather than separate round glows.
float ribbon(vec2 uv, float shift, float halfWidth, float feather) {
  bool portrait = u_res.x < u_res.y;
  float centerX = (portrait ? 0.79 : 0.73)
    - (portrait ? 0.15 : 0.19) * sin((uv.y - 0.12) * 5.2)
    + 0.017 * sin(uv.y * 10.0 + u_time * 0.12);
  float distanceFromSpine = abs(uv.x - centerX - shift);
  return 1.0 - smoothstep(
    halfWidth - feather, halfWidth + feather, distanceFromSpine
  );
}

vec3 paint(vec2 uv) {
  bool portrait = u_res.x < u_res.y;

  // Dominant brand blue with deep black on the left/lower edges.
  // Reducing the unbroken blue field makes space for actual cyan
  // and orange, while preserving contrast behind the heading.
  float blueField = 0.66 + 0.27 * blob(
    uv, vec2(0.54, 0.58), vec2(0.76, 0.78), 0.64
  );
  vec3 c = mix(u_bg, u_deep, blueField);

  // Black folds wrap around the illuminated current; they remain
  // broad and continuous instead of becoming isolated circles.
  c = mix(c, u_bg,
    blob(uv, vec2(0.02, 0.02), vec2(0.57, 0.43), 0.62) * 0.92
  );
  c = mix(c, u_bg,
    blob(uv, vec2(-0.06, 0.98), vec2(0.48, 0.29), 0.58) * 0.47
  );
  c = mix(c, u_bg, ribbon(uv, -0.24, 0.105, 0.10) * 0.75);
  c = mix(c, u_deep, ribbon(uv, -0.14, 0.17, 0.11) * 0.71);
  c = mix(c, u_bg, ribbon(uv, 0.23, 0.085, 0.08) * 0.49);

  // A visible, saturated cyan river follows the SAME spine.
  // Full-strength pigment near its centre prevents blue dominance.
  float cyanRiver = ribbon(
    uv, -0.012, portrait ? 0.133 : 0.145, 0.088
  );
  c = mix(c, u_body, cyanRiver * 0.96);

  // Light glancing off the cyan ribbon: a slim white-cyan core,
  // not a large independent elliptical white patch.
  float glint = ribbon(uv, 0.045, 0.040, 0.049);
  glint *= smoothstep(0.19, 0.44, uv.y);
  c = mix(c, u_accent, glint * (portrait ? 0.78 : 0.88));

  // The warm corner occupies a recognisable area (not just a faint
  // beige tint). Its centre remains outside the title zone.
  vec2 warmCentre = portrait ? vec2(1.02, 1.02) : vec2(1.00, 1.01);
  vec2 warmRadius = portrait ? vec2(0.34, 0.32) : vec2(0.37, 0.35);
  float orangeCorner = blob(uv, warmCentre, warmRadius, 0.54);
  c = mix(c, u_hot, orangeCorner * 0.93);

  return clamp(c, 0.0, 1.0);
}

float rand(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec3 c = paint(flowUV(v_uv));
  // Brillo suave que sigue al cursor/tacto: hace visible que el mesh
  // reacciona (el cursor "remueve" el líquido). Cian del mesh, pequeño
  // y sutil para no romper la composición Sentos ni lavar el texto.
  c += u_body * 0.18 * smoothstep(0.16, 0.0, distance(v_uv, u_mouse));
  c += (rand(gl_FragCoord.xy) - 0.5) / 255.0; // deband
  gl_FragColor = vec4(c, 1.0);
}`

// the gradient is all soft shapes, so it renders below screen resolution
const SCALE = 0.75

// A hero background of glowing colour folds that slowly flow: soft shapes
// are painted in the shader and every pixel is pulled a few steps along a
// gradient-noise flow field before it is coloured, so the colour streams
// like silk. The field is anchored on the cursor (eased), so moving the
// mouse stirs it; it also drifts on its own. Edges soften toward the
// middle of the frame like a depth blur. One WebGL pass, no dependencies;
// it pauses off screen and holds still for reduced motion.
export default function FlowGradientBackground({
  flow = 1,
  speed = 1,
  follow = 0.05,
  className = '',
}: FlowGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const live = useRef({flow, speed, follow})
  const [paletteAttempt, setPaletteAttempt] = useState(0)

  useEffect(() => {
    live.current = {flow, speed, follow}
  }, [flow, speed, follow])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let brandColors: ReturnType<typeof readMeshPalette>
    try {
      brandColors = readMeshPalette()
    } catch (error) {
      // Un token momentáneamente indisponible nunca debe derribar React.
      // Reintentar cuando las hojas de estilo terminen de aplicarse.
      if (paletteAttempt < 24) {
        const retry = window.setTimeout(() => setPaletteAttempt((attempt) => attempt + 1), 250)
        return () => window.clearTimeout(retry)
      }
      console.warn('Mesh omitido: no se pudo leer la paleta CSS oficial', error)
      return
    }
    const gl = canvas.getContext('webgl')
    if (!gl) return
    const prog = gl.createProgram()!
    for (const [type, src] of [
      [gl.VERTEX_SHADER, VERT],
      [gl.FRAGMENT_SHADER, FRAG],
    ] as const) {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      gl.attachShader(prog, s)
    }
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = (name: string) => gl.getUniformLocation(prog, name)
    const uRes = u('u_res')
    const uMouse = u('u_mouse')
    const uTime = u('u_time')
    const uFlow = u('u_flow')
    const uColors = ['u_bg', 'u_deep', 'u_body', 'u_hot', 'u_accent'].map(u)

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = {x: 0.5, y: 0.5, tx: 0.5, ty: 0.5}
    // Impulso del flujo por velocidad del puntero: al mover el mouse o
    // deslizar el dedo, el líquido se remueve más (el flujo se
    // intensifica) y te sigue; al parar, decae a lo normal. Funciona
    // IGUAL en mouse y touch porque ambos llegan por PointerEvent.
    let boost = 0
    let lastPX = 0.5
    let lastPY = 0.5
    let lastPT = 0
    let drift = 0
    let last = 0
    let frame = 0
    let visible = true

    const draw = (now: number) => {
      frame = 0
      const s = live.current
      const dt = Math.min(now - last || 16.7, 50)
      last = now
      const k = 1 - Math.pow(1 - s.follow, dt / 16.7)
      mouse.x += (mouse.tx - mouse.x) * k
      mouse.y += (mouse.ty - mouse.y) * k
      // El impulso decae ~10% por frame hasta volver a lo normal.
      boost *= Math.pow(0.9, dt / 16.7)
      if (!still) drift += (dt / 1000) * 0.06 * s.speed
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uTime, drift)
      gl.uniform1f(uFlow, s.flow * (1 + boost))
      uColors.forEach((loc, i) => gl.uniform3f(loc, ...brandRgb01(brandColors[i])))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (visible && !still) frame = requestAnimationFrame(draw)
    }
    const start = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }

    const resize = () => {
      // DPR tope 1.5 (antes 2): el mesh es un degradado suave, a 1.5x ya
      // se ve nítido y el costo de relleno de GPU baja mucho en móviles
      // con pantalla de alta densidad.
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * Math.min(devicePixelRatio, 1.5) * SCALE))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * Math.min(devicePixelRatio, 1.5) * SCALE))
      gl.viewport(0, 0, canvas.width, canvas.height)
      start()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) start()
    })
    io.observe(canvas)

    // the cursor anywhere over the canvas (read off the window, so content on top stays clickable)
    // Mouse y touch usan LA MISMA lógica (updatePointer): no hay
    // divergencia de efectos entre modos. La velocidad del puntero
    // (mouse o dedo) impulsa el flujo: al deslizar, el líquido se
    // remueve y te sigue; al parar, vuelve a lo normal.
    const updatePointer = (px: number, py: number, instant: boolean) => {
      const now = performance.now()
      if (lastPT !== 0) {
        const dt = Math.max(now - lastPT, 1)
        const v = Math.hypot(px - lastPX, py - lastPY) / dt // unidades UV por ms
        boost = Math.min(v * 220, 1.6)
      }
      lastPX = px
      lastPY = py
      lastPT = now
      mouse.tx = px
      mouse.ty = py
      if (instant) {
        mouse.x = mouse.tx
        mouse.y = mouse.ty
      }
      if (still) start()
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      updatePointer(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height,
        false,
      )
    }
    // En touch, un tap debe reaccionar al instante (no solo al arrastrar):
    // pointerdown mueve el objetivo del brillo al punto tocado de inmediato.
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      updatePointer(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height,
        true,
      )
    }
    // CAUSA del bug en Android (diagnosticado 17 Nov 2026): al deslizar
    // el dedo, el navegador dispara pointermove 1 sola vez y luego
    // pointercancel (empieza el scroll nativo), así que el impulso del
    // líquido se cortaba. touchmove SÍ sigue disparándose durante todo
    // el arrastre (12 eventos en la prueba vs 1 pointermove). Por eso
    // el touch usa touchmove/touchstart, con la misma lógica que el
    // mouse, para que el líquido siga al dedo sin cortarse.
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      const r = canvas.getBoundingClientRect()
      updatePointer(
        (t.clientX - r.left) / r.width,
        1 - (t.clientY - r.top) / r.height,
        false,
      )
    }
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      const r = canvas.getBoundingClientRect()
      updatePointer(
        (t.clientX - r.left) / r.width,
        1 - (t.clientY - r.top) / r.height,
        true,
      )
    }
    window.addEventListener('pointermove', onMove, {passive: true})
    window.addEventListener('pointerdown', onDown, {passive: true})
    window.addEventListener('touchmove', onTouch, {passive: true})
    window.addEventListener('touchstart', onTouchStart, {passive: true})

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchstart', onTouchStart)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [paletteAttempt])

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none block size-full ${className}`} />
}
