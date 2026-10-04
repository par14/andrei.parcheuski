/**
 * Shared hero-scene configuration. Deliberately free of `three` imports so
 * the eager hero (swatch buttons) can use it without pulling the 3D chunk
 * into the initial bundle.
 */
import type { Theme } from '../../core/theme.service';

export type FinishId = 'ultramarine' | 'amber' | 'graphite';

export interface Finish {
  id: FinishId;
  /** Human-readable material name, announced when it changes. */
  label: string;
  /** Swatch colour shown on the button. */
  swatch: string;
  /** Physical material of the top slab. */
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
}

export const FINISHES: readonly Finish[] = [
  {
    id: 'ultramarine',
    label: 'Ultramarine gloss',
    swatch: '#4f6df0',
    color: '#3d5ce6',
    metalness: 0,
    roughness: 0.34,
    clearcoat: 1,
  },
  {
    id: 'amber',
    label: 'Amber anodised',
    swatch: '#e08a2e',
    color: '#e8952f',
    metalness: 0.4,
    roughness: 0.3,
    clearcoat: 0.5,
  },
  {
    id: 'graphite',
    label: 'Graphite metal',
    swatch: '#8c949e',
    color: '#6b737d',
    metalness: 0.9,
    roughness: 0.36,
    clearcoat: 0,
  },
];

export interface SceneConfig {
  theme: Theme;
  finish: FinishId;
  exploded: boolean;
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
