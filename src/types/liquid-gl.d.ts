declare module "liquid-gl" {
  export type LiquidGLEngine = "auto" | "webgpu" | "webgl2" | "webgl";
  export interface LiquidGLLens {
    destroy(): void;
    renderer?: {
      backend?: { constructor?: { name?: string }; maxTextureSize?: number };
      scaleFactor?: number;
      staticSnapshotCanvas?: HTMLCanvasElement;
      snapshotTarget?: HTMLElement;
      captureSnapshot(): Promise<boolean>;
    };
  }
  export interface LiquidGLSettings {
    target: string;
    snapshot?: string;
    engine?: LiquidGLEngine;
    resolution?: number;
    magnify?: number;
    zIndex?: number;
    content?: string | false;
    refraction?: number;
    aberration?: number;
    bevelDepth?: number;
    bevelWidth?: number;
    frost?: number;
    shadow?: boolean;
    specular?: boolean;
    reveal?: "fade" | "none";
    tilt?: boolean;
    draggable?: boolean;
    interaction?: "none" | "fluid";
    interactionStrength?: number;
    interactionRadius?: number;
    interactionViscosity?: number;
    tint?: string | null;
    on?: {
      init?: (instance: LiquidGLLens) => void;
    };
  }
  export default function liquidGL(
    options: LiquidGLSettings
  ): LiquidGLLens | LiquidGLLens[] | undefined;
}
