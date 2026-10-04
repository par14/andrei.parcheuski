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
