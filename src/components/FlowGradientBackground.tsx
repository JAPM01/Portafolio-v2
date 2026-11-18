// Flow Gradient Background by Made for Award: https://www.madeforaward.com/ui/backgrounds/flow-gradient-background
// Free and open source (MIT). If it helped, a star means a lot: https://github.com/shivc868/madeforaward-ui
'use client'

import {useEffect, useRef} from 'react'
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

// a soft ellipse; edges blur more toward the middle of the frame
float blob(vec2 p, vec2 c, vec2 r, float soft) {
  float d = length((p - c) / r);
  return 1.0 - smoothstep(1.0 - soft, 1.0 + soft, d);
}

vec3 paint(vec2 uv) {
  // keep the shapes' proportions on any screen (designed at ~3:2)
  // zoom out on narrow screens and on desktop: on a narrow screen the
  // blobs look huge (too much zoom), and on desktop (landscape) the
  // cyan wash was too big/pale. Portrait 4.0x, landscape 2.0x — el mesh
  // en móvil seguía muy cerca a 3.5x (Jafet 17 Nov 2026); 4.5x se pasó
  // (quedaba casi todo negro, las ondas muy chicas), así que 4.0x es el
  // punto medio: ondas más extendidas como en Sentos sin perder el azul
  // dominante. Naranja solo en la esquina superior derecha.
  float zoom = 2.0;
  if (u_res.x < u_res.y) zoom = 4.0;
  vec2 p = (uv - 0.5) * vec2(u_res.x / u_res.y / 1.54, 1.0) * zoom + 0.5;
  float soft = clamp(0.06 + 0.5 * (1.32 - 1.64 * distance(uv, vec2(0.5))), 0.06, 0.5);
  vec3 c = u_bg;
  // La pantalla debe ser MÁS azul brand que negro (Jafet 17 Nov 2026):
  // el blob deep (azul) mucho más grande para que domine, y los
  // pliegues oscuros mucho más débiles (solo dan profundidad, no
  // grandes zonas negras). Sin nuevos colores, solo cantidades.
  // El deep es más grande SOLO en portrait: en móvil (zoom 4.0x) el
  // azul se quedaba corto y se veía negro arriba y abajo; en desktop
  // (zoom 2.0x) el deep grande lavaba el texto con el óvalo blanco.
  vec2 deepR = u_res.x < u_res.y ? vec2(1.05, 1.3) : vec2(0.9, 1.1);
  c = mix(c, u_deep, blob(p, vec2(0.52, 0.62), deepR, soft));
  // Onda cian ancha y suave como en Sentos (comparación 2 pestañas):
  // en Sentos las ondas son anchas, suaves y en capas, con un gran
  // óvalo blanco-cian en el centro-derecha; el naranja es una banda
  // diagonal ancha arriba a la derecha. Más blanco protagónico.
  c = mix(c, u_body, blob(p, vec2(0.58, 0.8), vec2(0.7, 0.4), soft) * 0.95);
  // hot spot: a corner accent (top-right), not a band across the top —
  // like the orange corner in the Sentos reference.
  c = mix(c, u_hot, blob(p, vec2(0.88, 1.05), vec2(0.28, 0.2), soft) * 0.75);
  // dark folds cut back into the colour
  c = mix(c, u_bg, blob(p, vec2(0.14, 0.42), vec2(0.24, 0.7), soft) * 0.5);
  c = mix(c, u_bg, blob(p, vec2(0.42, 0.18), vec2(0.36, 0.22), soft) * 0.35);
  c = mix(c, u_bg * 0.6, blob(p, vec2(0.9, 0.36), vec2(0.16, 0.5), soft) * 0.4);
  // bright wave on the right side (more visible than a thin edge glint).
  c += u_accent * blob(p, vec2(0.88, 0.62), vec2(0.18, 0.35), soft) * 0.75;
  return c;
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

  useEffect(() => {
    live.current = {flow, speed, follow}
  }, [flow, speed, follow])

  useEffect(() => {
    const canvas = canvasRef.current!
    const brandColors = readMeshPalette()
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
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none block size-full ${className}`} />
}
