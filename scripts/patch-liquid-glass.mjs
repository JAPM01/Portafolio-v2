#!/usr/bin/env node
/**
 * Reproducible liquid-gl@3.0.0 shader fix.
 * npm ci/install runs this after installing dependencies. No custom shader fork
 * and no modification of node_modules is committed.
 *
 * Root causes addressed:
 *  - Upstream displacement is expressed in whole-snapshot UV coordinates,
 *    so identical settings warp farther as the document grows.
 *  - Upstream applies a five-tap box blur even when frost === 0.
 *
 * Both GLSL/WebGL and WGSL/WebGPU are patched; fail closed if upstream
 * changes, rather than silently shipping the original artifacts.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const modulePath = fileURLToPath(new URL("../node_modules/liquid-gl/liquidGL.js", import.meta.url));
let source = await readFile(modulePath, "utf8");
let modified = 0;

function replaceOnce(label, original, replacement) {
  if (source.includes(replacement)) return; // npm rebuilds are idempotent
  const i = source.indexOf(original);
  if (i < 0 || source.indexOf(original, i + original.length) >= 0) {
    throw new Error("liquidGL 3.0.0 source mismatch: " + label);
  }
  source = source.slice(0, i) + replacement + source.slice(i + original.length);
  modified++;
}

replaceOnce(
  "GLSL displacement",
  "vec2 offset = refractDir * offsetAmt * centreBlend;",
  "vec2 offset = refractDir * offsetAmt * centreBlend * min(u_boxSize.x, u_boxSize.y) * (u_bounds.zw / max(u_boxSize, vec2(1.0)));",
);
replaceOnce(
  "WGSL displacement",
  "let offset = refractDir * offsetAmt * centreBlend;",
  "let offset = refractDir * offsetAmt * centreBlend * min(u.boxSize.x, u.boxSize.y) * (u.bounds.zw / max(u.boxSize, vec2<f32>(1.0)));",
);

replaceOnce(
  "GLSL five-tap sampling with frost=0",
  [
    "refrCol = sampleSource(sampleUV);",
    "              refrCol += sampleSource(sampleUV + vec2( texel.x, 0.0));",
    "              refrCol += sampleSource(sampleUV + vec2(-texel.x, 0.0));",
    "              refrCol += sampleSource(sampleUV + vec2(0.0,  texel.y));",
    "              refrCol += sampleSource(sampleUV + vec2(0.0, -texel.y));",
    "              refrCol /= 5.0;",
  ].join("\n"),
  "refrCol = sampleSource(sampleUV); // JPM: sharp transparent glass, no five-tap blur",
);
replaceOnce(
  "WGSL five-tap sampling with frost=0",
  [
    "refrCol = sampleSource(sampleUV);",
    "    refrCol = refrCol + sampleSource(sampleUV + vec2<f32>(texel.x, 0.0));",
    "    refrCol = refrCol + sampleSource(sampleUV + vec2<f32>(-texel.x, 0.0));",
    "    refrCol = refrCol + sampleSource(sampleUV + vec2<f32>(0.0, texel.y));",
    "    refrCol = refrCol + sampleSource(sampleUV + vec2<f32>(0.0, -texel.y));",
    "    refrCol = refrCol / 5.0;",
  ].join("\n"),
  "refrCol = sampleSource(sampleUV); // JPM: WGSL single-tap sampling without frost blur",
);

// Preserve one high-contrast glyph edge rather than showing both the
// original stroke and a refracted second stroke. Smooth backgrounds retain
// the complete optical displacement; high-contrast edges blend back toward
// the undistorted sample. This is not chromatic aberration.
replaceOnce(
  "GLSL high-contrast edge guard",
  "vec4 final    = refrCol;",
  [
    "float glyphDelta = max(max(abs(refrCol.r - baseCol.r), abs(refrCol.g - baseCol.g)), abs(refrCol.b - baseCol.b));",
    "float glyphMix = 1.0 - 0.82 * smoothstep(0.12, 0.42, glyphDelta);",
    "vec4 final = mix(baseCol, refrCol, glyphMix);",
  ].join("\n          "),
);
replaceOnce(
  "WGSL high-contrast edge guard",
  "var finalCol = refrCol;",
  [
    "let glyphDelta = max(max(abs(refrCol.r - baseCol.r), abs(refrCol.g - baseCol.g)), abs(refrCol.b - baseCol.b));",
    "let glyphMix = 1.0 - 0.82 * smoothstep(0.12, 0.42, glyphDelta);",
    "var finalCol = mix(baseCol, refrCol, glyphMix);",
  ].join("\n  "),
);

// Use the GPU's *deformed silhouette*, not a second static CSS outline,
// to show a delicate rim over both white and black surfaces.
replaceOnce(
  "GLSL adaptive rim",
  "final.rgb = mix(final.rgb, final.rgb * u_tint.rgb, u_tint.a);",
  [
    "final.rgb = mix(final.rgb, final.rgb * u_tint.rgb, u_tint.a);",
    "float rimLum = dot(final.rgb, vec3(0.2126, 0.7152, 0.0722));",
    "float rimWeight = pow(edge, 8.0) * 0.28;",
    "final.rgb = clamp(final.rgb + vec3(0.45 - rimLum) * rimWeight, vec3(0.0), vec3(1.0));",
  ].join("\n"),
);
replaceOnce(
  "WGSL adaptive rim",
  "finalCol = vec4<f32>(mix(finalCol.rgb, finalCol.rgb * u.tint.rgb, u.tint.a), finalCol.a);",
  [
    "finalCol = vec4<f32>(mix(finalCol.rgb, finalCol.rgb * u.tint.rgb, u.tint.a), finalCol.a);",
    "let rimLum = dot(finalCol.rgb, vec3<f32>(0.2126, 0.7152, 0.0722));",
    "let rimWeight = pow(edge, 8.0) * 0.28;",
    "finalCol = vec4<f32>(clamp(finalCol.rgb + vec3<f32>(0.45 - rimLum) * rimWeight, vec3<f32>(0.0), vec3<f32>(1.0)), finalCol.a);",
  ].join("\n"),
);

await writeFile(modulePath, source, "utf8");
console.log("liquidGL optical patch verified (GLSL + WGSL; " + modified + " replacements).");
