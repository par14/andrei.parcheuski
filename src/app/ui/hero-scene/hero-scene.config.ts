/**
 * Shared hero-scene configuration. Deliberately free of `three` imports so
 * the eager hero (swatch buttons) can use it without pulling the 3D chunk
 * into the initial bundle.
 */
import type { Theme } from '../../core/theme.service';

export type FinishId = 'navy' | 'champagne' | 'palepink' | 'gray' | 'black';

export interface Finish {
  id: FinishId;
  /** Human-readable fabric name, announced when it changes. */
  label: string;
  /** Swatch colour shown on the button (perceived velvet colour). */
  swatch: string;
  /** glTF material name of this KHR_materials_variants option. */
  material: string;
}

/** Fabric options of the Glam Velvet Sofa model (KHR_materials_variants). */
export const FINISHES: readonly Finish[] = [
  {
    id: 'navy',
    label: 'Navy velvet',
    swatch: '#2b3f70',
    material: 'GlamVelvetSofa_fabric_navy',
  },
  {
    id: 'champagne',
    label: 'Champagne velvet',
    swatch: '#a8917a',
    material: 'GlamVelvetSofa_fabric_champagne',
  },
  {
    id: 'palepink',
    label: 'Pale pink velvet',
    swatch: '#e6c6c7',
    material: 'GlamVelvetSofa_fabric_palepink',
  },
  {
    id: 'gray',
    label: 'Gray velvet',
    swatch: '#a3a49f',
    material: 'GlamVelvetSofa_fabric_gray',
  },
  {
    id: 'black',
    label: 'Black velvet',
    swatch: '#2b2b2e',
    material: 'GlamVelvetSofa_fabric_black',
  },
];

/**
 * "Glam Velvet Sofa" by Wayfair LLC, from the Khronos glTF Sample Assets,
 * CC BY 4.0. Optimised copy: WebP textures (512px), quantized geometry.
 */
export const MODEL_URL = 'models/sofa.glb';

export interface SceneConfig {
  theme: Theme;
  finish: FinishId;
}

/** idle: not started yet · on: rendering · off: unsupported or failed. */
export type SceneState = 'idle' | 'on' | 'off';

export function findFinish(id: FinishId): Finish {
  return FINISHES.find((finish) => finish.id === id) ?? FINISHES[0];
}

/**
 * Whether the 3D scene should load at all: a hardware WebGL 2 context can
 * be created and the visitor has not asked to save data. Checked before the lazy chunk is
 * requested, so declined visitors never download `three`.
 */
export function canRenderScene(): boolean {
  if (typeof window === 'undefined' || !('WebGL2RenderingContext' in window)) {
    return false;
  }
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData) return false;

  // The constructor can exist while context creation fails (blocklisted
  // GPU, WebGL disabled). Probe with the renderer's own requirements, then
  // release the context straight away.
  try {
    const gl = document
      .createElement('canvas')
      .getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
