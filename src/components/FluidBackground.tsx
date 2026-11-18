"use client";

import { useEffect, useRef } from "react";
import { readBrandPalette, brandRgb01 } from "../lib/brand-palette";

/** Tinta líquida viva: simulación de fluido WebGL (stable fluids, Jos Stam)
    a pantalla completa, sin zoom ni recorte. El puntero perturba el líquido
    (empuja la tinta y deja estela) y unos splats ambientales suaves lo
    mantienen vivo sin interacción. La tinta usa la paleta de identidad de
    Jafet: gris oscuro de fondo, azul como masa principal, naranja de acento
    y azules claros para brillos. El canvas se expone con preserveDrawingBuffer para que el
    fluted glass lo capture en vivo. */

type GL = WebGL2RenderingContext;

const CONFIG = {
  SIM_RESOLUTION: 144,
  DYE_RESOLUTION: 1024,
  DENSITY_DISSIPATION: 0.02, // el gradiente base casi no se desvanece: persiste y fluye
  VELOCITY_DISSIPATION: 0.2,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,
  SPLAT_RADIUS: 0.0008, // pincel del puntero (en UV²)
  SPLAT_FORCE: 6000,
};


const BASE_VERTEX = `precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const COPY_FRAG = `precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
void main () { gl_FragColor = texture2D(uTexture, vUv); }`;

const CLEAR_FRAG = `precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

const SPLAT_FRAG = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}`;

const ADVECTION_FRAG = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform float dissipation;
vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}
void main () {
#ifdef MANUAL_FILTERING
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
  vec4 result = bilerp(uSource, coord, dyeTexelSize);
#else
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  vec4 result = texture2D(uSource, coord);
#endif
  float decay = 1.0 + dissipation * dt;
  gl_FragColor = result / decay;
}`;

const DIVERGENCE_FRAG = `precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const CURL_FRAG = `precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}`;

const VORTICITY_FRAG = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * dt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

const PRESSURE_FRAG = `precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT_FRAG = `precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

// Sombreado suave para dar relieve al líquido (la luz viene de frente).
const DISPLAY_FRAG = `precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uTexture;
uniform vec2 texelSize;
void main () {
  vec3 c = texture2D(uTexture, vUv).rgb;
  vec3 lc = texture2D(uTexture, vL).rgb;
  vec3 rc = texture2D(uTexture, vR).rgb;
  vec3 tc = texture2D(uTexture, vT).rgb;
  vec3 bc = texture2D(uTexture, vB).rgb;
  float dx = length(rc) - length(lc);
  float dy = length(tc) - length(bc);
  vec3 n = normalize(vec3(dx, dy, length(texelSize)));
  vec3 l = vec3(0.0, 0.0, 1.0);
  float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
  c *= diffuse;
  gl_FragColor = vec4(c, 1.0);
}`;

interface Program {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  bind: () => void;
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

function compileShader(gl: GL, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("No se pudo crear el shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error("Error de shader: " + gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl: GL, vs: WebGLShader, fs: WebGLShader): Program {
  const program = gl.createProgram();
  if (!program) throw new Error("No se pudo crear el programa WebGL");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Error de link: " + gl.getProgramInfoLog(program));
  }
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  for (let i = 0; i < uniformCount; i++) {
    const name = gl.getActiveUniform(program, i)?.name;
    if (name) uniforms[name] = gl.getUniformLocation(program, name);
  }
  return {
    program,
    uniforms,
    bind() {
      gl.useProgram(program);
    },
  };
}

export default function FluidBackground({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const brand = readBrandPalette();
    // La tinta recibe exactamente las bases calculadas por el CSS.
    const PALETTE: Array<[number, number, number]> = [
      brandRgb01(brand.blue),
      brandRgb01(brand.blue),
      brandRgb01(brand.orange),
      brandRgb01(brand.cyan),
    ];
    const canvasOrNull = canvasRef.current;
    if (!canvasOrNull) return;
    const canvas = canvasOrNull;
    const glOrNull = canvas.getContext("webgl2", {
      antialias: false,
      depth: false,
      stencil: false,
      alpha: false,
      preserveDrawingBuffer: true, // el glass captura este canvas
      powerPreference: "high-performance",
    });
    if (!glOrNull) return; // sin WebGL2 no hay fluido; queda el fondo oscuro
    const gl: GL = glOrNull;

    const extFloat = gl.getExtension("EXT_color_buffer_float");
    const extHalfFloatLinear = gl.getExtension("OES_texture_half_float_linear");
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dyeRes = coarse ? 512 : CONFIG.DYE_RESOLUTION;
    const pressureIterations = coarse ? 16 : CONFIG.PRESSURE_ITERATIONS;

    // Formato de textura: half float si se puede renderizar en él.
    let texType: number;
    let rgbaFormat: number;
    let supportLinearFiltering: boolean;
    if (extFloat) {
      texType = gl.HALF_FLOAT;
      rgbaFormat = gl.RGBA16F;
      supportLinearFiltering = !!extHalfFloatLinear;
    } else {
      texType = gl.UNSIGNED_BYTE;
      rgbaFormat = gl.RGBA8;
      supportLinearFiltering = true;
    }

    const blit = (() => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW,
      );
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      return (target: FBO | null, clear = false) => {
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear) {
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
      gl.activeTexture(gl.TEXTURE0);
      const texture = gl.createTexture();
      if (!texture) throw new Error("No se pudo crear la textura");
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      if (!fbo) throw new Error("No se pudo crear el framebuffer");
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const texelSizeX = 1 / w;
      const texelSizeY = 1 / h;
      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX,
        texelSizeY,
        attach(id: number) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() {
          return fbo1;
        },
        set read(value: FBO) {
          fbo1 = value;
        },
        get write() {
          return fbo2;
        },
        set write(value: FBO) {
          fbo2 = value;
        },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
      };
    }

    function getResolution(resolution: number) {
      let aspect = gl.drawingBufferWidth / Math.max(1, gl.drawingBufferHeight);
      if (aspect < 1) aspect = 1 / aspect;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspect);
      if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
        return { width: max, height: min };
      }
      return { width: min, height: max };
    }

    const baseVertexShader = compileShader(gl, gl.VERTEX_SHADER, BASE_VERTEX);
    const copyProgram = createProgram(gl, baseVertexShader, compileShader(gl, gl.FRAGMENT_SHADER, COPY_FRAG));
    const clearProgram = createProgram(gl, baseVertexShader, compileShader(gl, gl.FRAGMENT_SHADER, CLEAR_FRAG));
    const splatProgram = createProgram(gl, baseVertexShader, compileShader(gl, gl.FRAGMENT_SHADER, SPLAT_FRAG));
    const advectionProgram = createProgram(
      gl,
      baseVertexShader,
      compileShader(
        gl,
        gl.FRAGMENT_SHADER,
        supportLinearFiltering ? ADVECTION_FRAG : "#define MANUAL_FILTERING\n" + ADVECTION_FRAG,
      ),
    );
    const divergenceProgram = createProgram(gl, baseVertexShader, compileShader(gl, gl.FRAGMENT_SHADER, DIVERGENCE_FRAG));
    const curlProgram = createProgram(gl, baseVertexShader, compileShader(gl, gl.FRAGMENT_SHADER, CURL_FRAG));
    const vorticityProgram = createProgram(gl, baseVertexShader, compileShader(gl, gl.FRAGMENT_SHADER, VORTICITY_FRAG));
    const pressureProgram = createProgram(gl, baseVertexShader, compileShader(gl, gl.FRAGMENT_SHADER, PRESSURE_FRAG));
    const gradientSubtractProgram = createProgram(gl, baseVertexShader, compileShader(gl, gl.FRAGMENT_SHADER, GRADIENT_SUBTRACT_FRAG));
    const displayProgram = createProgram(gl, baseVertexShader, compileShader(gl, gl.FRAGMENT_SHADER, DISPLAY_FRAG));

    function initFramebuffers() {
      const simRes = getResolution(CONFIG.SIM_RESOLUTION);
      const dyeResCalc = getResolution(dyeRes);
      const texTypeF = texType;
      const rgbaF = rgbaFormat;
      const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);
      dye = createDoubleFBO(dyeResCalc.width, dyeResCalc.height, rgbaF, gl.RGBA, texTypeF, filtering);
      velocity = createDoubleFBO(simRes.width, simRes.height, rgbaF, gl.RGBA, texTypeF, filtering);
      divergence = createFBO(simRes.width, simRes.height, rgbaF, gl.RGBA, texTypeF, gl.NEAREST);
      curl = createFBO(simRes.width, simRes.height, rgbaF, gl.RGBA, texTypeF, gl.NEAREST);
      pressure = createDoubleFBO(simRes.width, simRes.height, rgbaF, gl.RGBA, texTypeF, gl.NEAREST);
    }

    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergence: FBO;
    let curl: FBO;
    let pressure: DoubleFBO;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    function correctRadius(radius: number) {
      const aspect = canvas.width / Math.max(1, canvas.height);
      if (aspect > 1) return radius * aspect;
      return radius;
    }

    function splat(x: number, y: number, dx: number, dy: number, color: [number, number, number], radius: number) {
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / Math.max(1, canvas.height));
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      gl.uniform1f(splatProgram.uniforms.radius, correctRadius(radius));
      blit(velocity.write);
      velocity.swap();

      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProgram.uniforms.color, color[0], color[1], color[2]);
      blit(dye.write);
      dye.swap();
    }

    function step(dt: number) {
      gl.disable(gl.BLEND);
      // Curl
      curlProgram.bind();
      gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);
      // Vorticity
      vorticityProgram.bind();
      gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      gl.uniform1f(vorticityProgram.uniforms.curl, CONFIG.CURL);
      gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();
      // Divergence
      divergenceProgram.bind();
      gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);
      // Clear pressure
      clearProgram.bind();
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearProgram.uniforms.value, CONFIG.PRESSURE);
      blit(pressure.write);
      pressure.swap();
      // Pressure solve
      pressureProgram.bind();
      gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < pressureIterations; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }
      // Gradient subtract
      gradientSubtractProgram.bind();
      gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();
      // Advect velocity
      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!supportLinearFiltering) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      }
      const velocityId = velocity.read.attach(0);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, CONFIG.VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();
      // Advect dye
      if (!supportLinearFiltering) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      }
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(advectionProgram.uniforms.dissipation, CONFIG.DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function render() {
      displayProgram.bind();
      gl.uniform2f(displayProgram.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
      gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    // UN solo gradiente continuo (como el mesh que ya estaba): se dibuja en
    // un canvas 2D — negro de fondo, azul como masa principal, rojo a la
    // izquierda, cian a la derecha — y se sube como la tinta inicial. El
    // fluido después lo deforma y lo mueve, pero nunca son manchas
    // separadas: el campo de color cubre toda la pantalla, sin zoom.
    function uploadGradient() {
      const gw = 512;
      const gh = 288;
      const g = document.createElement("canvas");
      g.width = gw;
      g.height = gh;
      const ctx = g.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = brand.black;
      ctx.fillRect(0, 0, gw, gh);
      ctx.globalCompositeOperation = "lighter";
      const radial = (x: number, y: number, r: number, color: string) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, gw, gh);
      };
      radial(gw * 0.55, gh * 0.45, gw * 0.55, brand.blue); // azul, masa principal
      radial(gw * 0.3, gh * 0.8, gw * 0.3, brand.blue); // azul abajo
      radial(gw * 0.1, gh * 0.4, gw * 0.3, brand.orange); // rojo a la izquierda
      radial(gw * 0.75, gh * 0.2, gw * 0.2, brand.orange); // rojo arriba a la derecha
      radial(gw * 0.9, gh * 0.6, gw * 0.25, brand.cyan); // cian a la derecha
      const tex = gl.createTexture();
      if (!tex) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, g);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      copyProgram.bind();
      gl.uniform1i(copyProgram.uniforms.uTexture, 0);
      blit(dye.write);
      dye.swap();
      gl.deleteTexture(tex);
    }

    // Corriente inicial: remueve el gradiente en grande para que fluya
    // desde el primer frame (solo velocidad, sin añadir manchas de color).
    function initialFlow() {
      const currents: Array<{ x: number; y: number; vx: number; vy: number }> = [
        { x: 0.3, y: 0.5, vx: 60, vy: 30 },
        { x: 0.7, y: 0.5, vx: -60, vy: -30 },
        { x: 0.5, y: 0.3, vx: 30, vy: 60 },
        { x: 0.5, y: 0.7, vx: -30, vy: -60 },
      ];
      for (const c of currents) {
        splat(c.x, c.y, c.vx, c.vy, [0, 0, 0], 0.01);
      }
    }

    let colorIndex = 0;
    function nextColor(intensity: number): [number, number, number] {
      const c = PALETTE[colorIndex % PALETTE.length];
      colorIndex += 1;
      return [c[0] * intensity, c[1] * intensity, c[2] * intensity];
    }

    resizeCanvas();
    initFramebuffers();
    uploadGradient();
    initialFlow();
    render();

    // --- puntero: el mouse perturba el líquido ---
    const pointer = { x: 0, y: 0, moved: false };
    function pointerPos(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(1, rect.width);
      const y = 1 - (e.clientY - rect.top) / Math.max(1, rect.height);
      return { x, y };
    }
    const onPointerMove = (e: PointerEvent) => {
      const pos = pointerPos(e);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const dx = (pos.x - pointer.x) * dpr;
      const dy = (pos.y - pointer.y) * dpr;
      if (!pointer.moved) {
        pointer.moved = true;
        pointer.x = pos.x;
        pointer.y = pos.y;
        return;
      }
      // Solo perturbar si el puntero se movió de verdad.
      if (Math.abs(dx) < 0.0005 && Math.abs(dy) < 0.0005) return;
      // El mouse EMPUJA el gradiente (velocidad fuerte) y deja solo una
      // estela tenue de color: si pintara a intensidad completa, el tinte
      // se sumaría sobre un campo ya lleno y saldrían nubes pálidas.
      splat(pos.x, pos.y, dx * CONFIG.SPLAT_FORCE, dy * CONFIG.SPLAT_FORCE, nextColor(0.3), CONFIG.SPLAT_RADIUS);
      pointer.x = pos.x;
      pointer.y = pos.y;
    };
    const onPointerDown = (e: PointerEvent) => {
      const pos = pointerPos(e);
      pointer.x = pos.x;
      pointer.y = pos.y;
      splat(pos.x, pos.y, 0, 0, nextColor(0.4), CONFIG.SPLAT_RADIUS * 2.5);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    // --- splats ambientales: remueven el gradiente sin añadir manchas ---
    const ambientTimer = window.setInterval(() => {
      if (document.hidden) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const x = 0.15 + Math.random() * 0.7;
      const y = 0.2 + Math.random() * 0.6;
      const angle = Math.random() * Math.PI * 2;
      const force = 25 + Math.random() * 40;
      splat(x, y, Math.cos(angle) * force, Math.sin(angle) * force, nextColor(0.12), 0.004);
    }, 2400);

    // --- loop principal ---
    let raf = 0;
    let lastTime = performance.now();
    let running = true;
    const update = () => {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0), 1 / 30);
      lastTime = now;
      resizeCanvas();
      step(dt);
      render();
      raf = requestAnimationFrame(update);
    };

    // Pausa cuando el hero no se ve o la pestaña está oculta.
    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        if (visible && !document.hidden && !reducedMotion && !running) {
          running = true;
          lastTime = performance.now();
          raf = requestAnimationFrame(update);
        } else if ((!visible || document.hidden) && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (visible && !reducedMotion && !running) {
        running = true;
        lastTime = performance.now();
        raf = requestAnimationFrame(update);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Resize: re-inicializar los framebuffers y recomponer.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (resizeCanvas()) {
          initFramebuffers();
          uploadGradient();
          initialFlow();
          render();
        }
      }, 200);
    };
    window.addEventListener("resize", onResize);

    if (reducedMotion) {
      // Sin movimiento: avanzar la simulación unos pasos y dejar un frame fijo.
      for (let i = 0; i < 60; i++) step(1 / 60);
      render();
    } else {
      raf = requestAnimationFrame(update);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearInterval(ambientTimer);
      clearTimeout(resizeTimer);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      const loseExt = gl.getExtension("WEBGL_lose_context");
      loseExt?.loseContext();
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
      aria-hidden="true"
    />
  );
}
