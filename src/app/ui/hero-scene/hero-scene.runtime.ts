/**
 * The hero "studio" scene: three stacked slabs on a soft contact shadow,
 * lit by an environment map, a key light and an amber rim light.
 *
 * Plain three.js with no Angular imports, so it can be swapped for a fake
 * in unit tests (see HERO_RUNTIME_FACTORY). Everything that moves is a
 * frame-rate independent lerp towards a target; `render()` reports whether
 * anything is still moving so the caller can stop the frame loop.
 */
import {
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import type { Theme } from '../../core/theme.service';
import { findFinish, SceneConfig } from './hero-scene.config';

export interface HeroRuntimeOptions {
  /** Snap to targets, no intro, no idle sway, no pointer parallax. */
  reducedMotion: boolean;
}

export interface HeroRuntime {
  resize(width: number, height: number, pixelRatio: number): void;
  configure(config: SceneConfig): void;
  /** Pointer position in normalised device coordinates (-1..1). */
  setPointer(x: number, y: number): void;
  /** Hero scroll progress, 0 (top) to 1 (hero scrolled away). */
  setScroll(progress: number): void;
  /** True when the NDC point hits the model. */
  hitTest(x: number, y: number): boolean;
  /** Draws one frame; returns true while anything is still moving. */
  render(time: number): boolean;
  dispose(): void;
}

export type HeroRuntimeFactory = (
  canvas: HTMLCanvasElement,
  options: HeroRuntimeOptions,
) => HeroRuntime;

/** Studio lighting per theme: the light theme is a white cyclorama shoot. */
const LOOKS: Record<
  Theme,
  {
    base: string;
    chassis: string;
    key: number;
    rim: number;
    rimColor: string;
    env: number;
    shadow: number;
  }
> = {
  dark: {
    base: '#36404c',
    chassis: '#c9ced6',
    key: 1.6,
    rim: 2.4,
    rimColor: '#ffb154',
    env: 0.5,
    shadow: 0.7,
  },
  light: {
    base: '#d5d8d2',
    chassis: '#b9bec6',
    key: 1.9,
    rim: 1.3,
    rimColor: '#ff9a2e',
    env: 0.6,
    shadow: 0.36,
  },
};

/** Bottom → top: matte base, brushed chassis, configurable top shell. */
const SLABS = [
  { w: 2.5, h: 0.24, d: 1.7, y: 0.12, lift: 0, x: 0, spin: 0 },
  { w: 2.3, h: 0.08, d: 1.56, y: 0.32, lift: 0.4, x: 0.05, spin: 0.07 },
  { w: 2.16, h: 0.34, d: 1.44, y: 0.57, lift: 0.86, x: 0.14, spin: -0.1 },
] as const;

const BASE_YAW = -0.58;
const CAMERA_ELEVATION = 0.3; // radians, ~17°
const INTRO_MS = 1100;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

export const createHeroRuntime: HeroRuntimeFactory = (canvas, options) => {
  const { reducedMotion } = options;

  // Throws when WebGL is unavailable or software-rendered (blocklisted GPU):
  // the caller treats that as "off" and keeps the CSS-only hero.
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  });
  renderer.setClearAlpha(0);
  renderer.toneMapping = NeutralToneMapping;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  const camera = new PerspectiveCamera(28, 1, 0.1, 60);
  // Aimed above the model: the base sits low in frame like a product on a
  // studio floor, and the exploded layers rise into the free space above.
  const cameraTarget = new Vector3(0, 1.15, 0);
  let cameraDistance = 8;

  // ----- Model -----
  const model = new Group();
  const stand = new Group(); // receives pointer/scroll/intro rotation
  stand.add(model);
  scene.add(stand);

  const baseMaterial = new MeshStandardMaterial({ roughness: 0.9 });
  const chassisMaterial = new MeshStandardMaterial({
    metalness: 1,
    roughness: 0.32,
  });
  const shellMaterial = new MeshPhysicalMaterial({ clearcoatRoughness: 0.15 });
  const materials = [baseMaterial, chassisMaterial, shellMaterial];

  const slabs = SLABS.map((spec, i) => {
    const geometry = new RoundedBoxGeometry(spec.w, spec.h, spec.d, 4, 0.06);
    const mesh = new Mesh(geometry, materials[i]);
    mesh.position.y = spec.y;
    model.add(mesh);
    return mesh;
  });

  // Soft contact shadow: a blurred rounded rectangle under the base.
  const shadowTexture = createShadowTexture();
  const shadowMaterial = new MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
  });
  const shadowGeometry = new PlaneGeometry(4, 3);
  const shadow = new Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  model.add(shadow);

  // ----- Lights -----
  const key = new DirectionalLight('#ffffff', 0);
  key.position.set(-3, 5, 4);
  const rim = new DirectionalLight('#ffb154', 0);
  rim.position.set(3.5, 1.6, -4);
  scene.add(key, rim);

  // ----- Animated state: current values chase targets -----
  const target = {
    shell: new Color(),
    metalness: 0,
    roughness: 0.3,
    clearcoat: 1,
    base: new Color(),
    chassis: new Color(),
    rimColor: new Color(),
    key: 0,
    rim: 0,
    env: 0,
    shadow: 0,
    explode: 0,
    pointerX: 0,
    pointerY: 0,
    scroll: 0,
  };
  const current = {
    ...target,
    shell: new Color(),
    base: new Color(),
    chassis: new Color(),
    rimColor: new Color(),
  };
  let configured = false;
  let startTime = -1;
  let lastTime = -1;

  const raycaster = new Raycaster();
  const ndc = new Vector2();

  function fitCamera(aspect: number): void {
    camera.aspect = aspect;
    // Narrow viewports pull the camera back so the exploded stack still fits.
    cameraDistance = Math.max(7.4, 8.2 / Math.min(aspect, 1.35));
    camera.updateProjectionMatrix();
  }

  function placeCamera(): void {
    camera.position.set(
      cameraTarget.x,
      cameraTarget.y + cameraDistance * Math.sin(CAMERA_ELEVATION),
      cameraDistance * Math.cos(CAMERA_ELEVATION),
    );
    camera.lookAt(cameraTarget);
  }

  fitCamera(1);

  return {
    resize(width, height, pixelRatio) {
      if (!width || !height) return;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      fitCamera(width / height);
    },

    configure(config) {
      const look = LOOKS[config.theme];
      const finish = findFinish(config.finish);
      target.shell.set(finish.color);
      target.metalness = finish.metalness;
      target.roughness = finish.roughness;
      target.clearcoat = finish.clearcoat;
      target.base.set(look.base);
      target.chassis.set(look.chassis);
      target.rimColor.set(look.rimColor);
      target.key = look.key;
      target.rim = look.rim;
      target.env = look.env;
      target.shadow = look.shadow;
      target.explode = config.exploded ? 1 : 0;

      // First configuration (and reduced motion) snaps instead of easing.
      if (!configured || reducedMotion) {
        current.shell.copy(target.shell);
        current.base.copy(target.base);
        current.chassis.copy(target.chassis);
        current.rimColor.copy(target.rimColor);
        Object.assign(current, {
          metalness: target.metalness,
          roughness: target.roughness,
          clearcoat: target.clearcoat,
          key: target.key,
          rim: target.rim,
          env: target.env,
          shadow: target.shadow,
          explode: target.explode,
        });
        configured = true;
      }
    },

    setPointer(x, y) {
      if (reducedMotion) return;
      target.pointerX = x;
      target.pointerY = y;
    },

    setScroll(progress) {
      target.scroll = clamp01(progress);
      if (reducedMotion) current.scroll = target.scroll;
    },

    hitTest(x, y) {
      ndc.set(x, y);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects(slabs, false).length > 0;
    },

    render(time) {
      if (startTime < 0) startTime = time;
      const dt = lastTime < 0 ? 16 : Math.min(time - lastTime, 64);
      lastTime = time;

      const k = reducedMotion ? 1 : 1 - Math.exp(-dt / 140);
      const kSlow = reducedMotion ? 1 : 1 - Math.exp(-dt / 320);
      let moving = false;
      const approach = (from: number, to: number, rate = k) => {
        const next = from + (to - from) * rate;
        if (Math.abs(to - next) > 1e-3) moving = true;
        return Math.abs(to - next) > 1e-4 ? next : to;
      };
      const approachColor = (from: Color, to: Color) => {
        from.lerp(to, k);
        if (
          Math.abs(from.r - to.r) +
            Math.abs(from.g - to.g) +
            Math.abs(from.b - to.b) >
          3e-3
        ) {
          moving = true;
        }
      };

      // Materials and lights
      approachColor(current.shell, target.shell);
      approachColor(current.base, target.base);
      approachColor(current.chassis, target.chassis);
      approachColor(current.rimColor, target.rimColor);
      current.metalness = approach(current.metalness, target.metalness);
      current.roughness = approach(current.roughness, target.roughness);
      current.clearcoat = approach(current.clearcoat, target.clearcoat);
      current.key = approach(current.key, target.key);
      current.rim = approach(current.rim, target.rim);
      current.env = approach(current.env, target.env);
      current.shadow = approach(current.shadow, target.shadow);
      current.explode = approach(current.explode, target.explode, kSlow);
      current.pointerX = approach(current.pointerX, target.pointerX, kSlow);
      current.pointerY = approach(current.pointerY, target.pointerY, kSlow);
      current.scroll = approach(current.scroll, target.scroll);

      // Intro: the studio lights come up and the model settles.
      const intro = reducedMotion
        ? 1
        : easeOutCubic(clamp01((time - startTime) / INTRO_MS));
      if (intro < 1) moving = true;

      shellMaterial.color.copy(current.shell);
      shellMaterial.metalness = current.metalness;
      shellMaterial.roughness = current.roughness;
      shellMaterial.clearcoat = current.clearcoat;
      baseMaterial.color.copy(current.base);
      chassisMaterial.color.copy(current.chassis);
      rim.color.copy(current.rimColor);
      key.intensity = current.key * intro;
      rim.intensity = current.rim * intro;
      scene.environmentIntensity = current.env * (0.15 + 0.85 * intro);
      shadowMaterial.opacity = current.shadow * intro;

      // Exploded view: slabs lift, drift and fan out slightly.
      const e = easeOutCubic(current.explode);
      slabs.forEach((mesh, i) => {
        const spec = SLABS[i];
        mesh.position.y = spec.y + spec.lift * e;
        mesh.position.x = spec.x * e;
        mesh.rotation.y = spec.spin * e;
      });

      // Idle sway keeps the shot alive; pointer and scroll add parallax.
      const t = time / 1000;
      const sway = reducedMotion ? 0 : 1;
      const settle = 1 - intro;
      stand.rotation.y =
        BASE_YAW +
        current.pointerX * 0.16 +
        current.scroll * 0.44 +
        Math.sin(t * 0.35) * 0.05 * sway +
        settle * 0.3;
      stand.rotation.x =
        -current.pointerY * 0.05 +
        Math.sin(t * 0.27) * 0.012 * sway +
        settle * 0.14;
      stand.position.y = settle * 0.18;

      placeCamera();
      renderer.render(scene, camera);

      // Without reduced motion the idle sway runs while the hero is visible.
      return moving || !reducedMotion;
    },

    dispose() {
      slabs.forEach((mesh) => mesh.geometry.dispose());
      materials.forEach((material) => material.dispose());
      shadowGeometry.dispose();
      shadowMaterial.dispose();
      shadowTexture.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
};

/**
 * A blurred rounded rectangle. Drawn via shadowBlur (an off-canvas shape
 * casting its shadow into view), which works in every canvas-2D engine,
 * unlike ctx.filter.
 */
function createShadowTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const offset = 1000;
    ctx.shadowColor = 'rgba(0, 0, 0, 1)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetX = offset;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    // 160×108 px on a 256×192 texture ≈ the 2.5×1.7 base on a 4×3 plane
    ctx.roundRect(48 - offset, 42, 160, 108, 14);
    ctx.fill();
  }
  return new CanvasTexture(canvas);
}
