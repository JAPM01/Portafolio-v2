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
 *  - Flat rim lighting and unbounded specular whiten light backgrounds.
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

/** Also upgrades an already patched node_modules from earlier previews. */
function replaceOneOf(label, originals, replacement) {
  if (source.includes(replacement)) return;
  for (const original of originals) {
    const at = source.indexOf(original);
    if (at < 0) continue;
    if (source.indexOf(original, at + original.length) >= 0) {
      throw new Error("Non-unique liquidGL source: " + label);
    }
    source = source.slice(0, at) + replacement + source.slice(at + original.length);
    modified++;
    return;
  }
  throw new Error("liquidGL 3.0.0 source mismatch: " + label);
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
replaceOneOf(
  "GLSL optical bevel and rim",
  ["final.rgb = mix(final.rgb, final.rgb * u_tint.rgb, u_tint.a);\nfloat rimLum = dot(final.rgb, vec3(0.2126, 0.7152, 0.0722));\nfloat rimWeight = pow(edge, 8.0) * 0.28;\nfinal.rgb = clamp(final.rgb + vec3(0.45 - rimLum) * rimWeight, vec3(0.0), vec3(1.0));", "final.rgb = mix(final.rgb, final.rgb * u_tint.rgb, u_tint.a);"],
  "final.rgb = mix(final.rgb, final.rgb * u_tint.rgb, u_tint.a);\nfloat rimLum = dot(final.rgb, vec3(0.2126, 0.7152, 0.0722));\nfloat rimTarget = mix(0.80, 0.43, smoothstep(0.24, 0.86, rimLum));\nfloat rimWeight = pow(edge, 2.2) * 0.34 + pow(edge, 7.0) * 0.13;\nfinal.rgb = clamp(mix(final.rgb, vec3(rimTarget), rimWeight), vec3(0.0), vec3(1.0));",
);
replaceOneOf(
  "WGSL optical bevel and rim",
  ["finalCol = vec4<f32>(mix(finalCol.rgb, finalCol.rgb * u.tint.rgb, u.tint.a), finalCol.a);\nlet rimLum = dot(finalCol.rgb, vec3<f32>(0.2126, 0.7152, 0.0722));\nlet rimWeight = pow(edge, 8.0) * 0.28;\nfinalCol = vec4<f32>(clamp(finalCol.rgb + vec3<f32>(0.45 - rimLum) * rimWeight, vec3<f32>(0.0), vec3<f32>(1.0)), finalCol.a);", "finalCol = vec4<f32>(mix(finalCol.rgb, finalCol.rgb * u.tint.rgb, u.tint.a), finalCol.a);"],
  "finalCol = vec4<f32>(mix(finalCol.rgb, finalCol.rgb * u.tint.rgb, u.tint.a), finalCol.a);\nlet rimLum = dot(finalCol.rgb, vec3<f32>(0.2126, 0.7152, 0.0722));\nlet rimTarget = mix(0.80, 0.43, smoothstep(0.24, 0.86, rimLum));\nlet rimWeight = pow(edge, 2.2) * 0.34 + pow(edge, 7.0) * 0.13;\nfinalCol = vec4<f32>(clamp(mix(finalCol.rgb, vec3<f32>(rimTarget), rimWeight), vec3<f32>(0.0), vec3<f32>(1.0)), finalCol.a);",
);

// Respect the current background luminance: strong reflections over dark
// mesh, restrained reflections over light panels. This keeps one lens.
replaceOnce(
  "GLSL adaptive specular",
  "final.rgb += h;",
  [
    "float surfaceLum = dot(final.rgb, vec3(0.2126, 0.7152, 0.0722));",
    "float reflectionStrength = 0.18 + 0.82 * (1.0 - smoothstep(0.32, 0.86, surfaceLum));",
    "final.rgb = clamp(final.rgb + (vec3(1.0) - final.rgb) * h * reflectionStrength * 1.15, vec3(0.0), vec3(1.0));",
  ].join("\n            "),
);
replaceOnce(
  "WGSL adaptive specular",
  "finalCol = vec4<f32>(finalCol.rgb + vec3<f32>(h), finalCol.a);",
  [
    "let surfaceLum = dot(finalCol.rgb, vec3<f32>(0.2126, 0.7152, 0.0722));",
    "let reflectionStrength = 0.18 + 0.82 * (1.0 - smoothstep(0.32, 0.86, surfaceLum));",
    "finalCol = vec4<f32>(clamp(finalCol.rgb + (vec3<f32>(1.0) - finalCol.rgb) * h * reflectionStrength * 1.15, vec3<f32>(0.0), vec3<f32>(1.0)), finalCol.a);",
  ].join("\n    "),
);

await writeFile(modulePath, source, "utf8");
console.log("liquidGL optical patch verified (GLSL + WGSL; " + modified + " replacements).");
