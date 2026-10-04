/**
 * The hero "studio" scene: a velvet sofa (a real e-commerce glTF asset with
 * KHR_materials_variants fabric options) on a soft studio floor, lit by an
 * environment map, a key light and an amber rim light.
 *
 * Plain three.js with no Angular imports, so it can be swapped for a fake
 * in unit tests (see HERO_RUNTIME_FACTORY). Everything that moves is a
 * frame-rate independent ease towards a target; `render()` reports whether
 * anything is still moving so the caller can stop the frame loop.
 */
import {
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Light,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import type { Theme } from '../../core/theme.service';
import { FINISHES, findFinish, SceneConfig } from './hero-scene.config';

export interface HeroRuntimeOptions {
  /** URL of the glTF model to load. */
  modelUrl: string;
  /** Snap to targets: no intro, no pointer parallax, no scroll rotation. */
  reducedMotion: boolean;
}

export interface HeroRuntime {
  /** Resolves once the model is loaded and placed; rejects on failure. */
  readonly ready: Promise<void>;
  resize(width: number, height: number, pixelRatio: number): void;
  configure(config: SceneConfig): void;
  /** Pointer position in normalised device coordinates (-1..1). */
  setPointer(x: number, y: number): void;
  /** Hero scroll progress, 0 (top) to 1 (hero scrolled away). */
  setScroll(progress: number): void;
  /** Turns the product around its vertical axis (radians, eased). */
  rotateBy(radians: number): void;
  /** Draws one frame; returns true while anything is still moving. */
  render(time: number): boolean;
  /**
   * Frees GPU resources. `loseContext: false` keeps the WebGL context alive
   * so a new runtime can reuse the canvas (after a context restore).
   */
  dispose(options?: { loseContext?: boolean }): void;
}

export type HeroRuntimeFactory = (
  canvas: HTMLCanvasElement,
  options: HeroRuntimeOptions,
) => HeroRuntime;

/** Studio lighting per theme: the light theme is a white cyclorama shoot. */
const LOOKS: Record<
  Theme,
  {
    key: number;
    rim: number;
    rimColor: string;
    env: number;
    shadow: number;
    contact: number;
  }
> = {
  dark: {
    key: 2.6,
    rim: 3.2,
    rimColor: '#ffb154',
    env: 0.55,
    shadow: 0.45,
    contact: 0.75,
  },
  light: {
    key: 2.4,
    rim: 1.6,
    rimColor: '#ff9a2e',
    env: 0.8,
    shadow: 0.22,
    contact: 0.45,
  },
};

/** Fabric properties eased between variants. */
interface Fabric {
  color: Color;
  sheenColor: Color;
  specularColor: Color;
  roughness: number;
  sheenRoughness: number;
  specularIntensity: number;
}

const MODEL_WIDTH = 3.2; // world units after normalising the model
const BASE_YAW = -0.5;
const CAMERA_ELEVATION = 0.26; // radians, ~15°
const CAMERA_TARGET_Y = 0.85;
const INTRO_MS = 1100;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);

export const createHeroRuntime: HeroRuntimeFactory = (canvas, options) => {
  // Throws when WebGL is unavailable or software-rendered (blocklisted GPU):
  // the caller treats that as "off" and keeps the still image.
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  });
  renderer.setClearAlpha(0);
  renderer.toneMapping = NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  // Anything below that throws must not leak the live context.
  try {
    return buildScene(renderer, options);
  } catch (error) {
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }
};

function buildScene(
  renderer: WebGLRenderer,
  { modelUrl, reducedMotion }: HeroRuntimeOptions,
): HeroRuntime {
  const scene = new Scene();
  const room = new RoomEnvironment();
  const pmrem = new PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  scene.environment = envTarget.texture;

  const camera = new PerspectiveCamera(26, 1, 0.1, 80);
  const cameraTarget = new Vector3(0, CAMERA_TARGET_Y, 0);
  let cameraDistance = 9;

  // ----- Stage -----
  const stand = new Group(); // receives intro / pointer / drag / scroll yaw
  scene.add(stand);

  // Real shadow from the key light (legs, arms) on an invisible floor...
  const floorGeometry = new PlaneGeometry(12, 12);
  const floorMaterial = new ShadowMaterial({ opacity: 0 });
  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // ...plus a soft contact blob that grounds the model.
  const contactTexture = createContactTexture();
  const contactMaterial = new MeshBasicMaterial({
    map: contactTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const contactGeometry = new PlaneGeometry(1, 1);
  const contact = new Mesh(contactGeometry, contactMaterial);
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.003;
  stand.add(contact);

  const key = new DirectionalLight('#ffffff', 0);
  key.position.set(-3.5, 6, 4.5);
  key.castShadow = true;
  // Shadow frustum must cover the floor shadow at any turn of the model,
  // or the shadow is cut by a straight edge.
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  const rim = new DirectionalLight('#ffb154', 0);
  rim.position.set(4, 2.2, -4.5);
  scene.add(key, rim);

  // ----- Animated state: current values chase targets -----
  const newFabric = (): Fabric => ({
    color: new Color(),
    sheenColor: new Color(),
    specularColor: new Color(1, 1, 1),
    roughness: 0.7,
    sheenRoughness: 0.6,
    specularIntensity: 1,
  });
  const target = {
    fabric: newFabric(),
    rimColor: new Color(),
    key: 0,
    rim: 0,
    env: 0,
    shadow: 0,
    contact: 0,
    pointerX: 0,
    pointerY: 0,
    scroll: 0,
    yaw: 0,
  };
  const current = {
    ...target,
    fabric: newFabric(),
    rimColor: new Color(),
  };
  let lastConfig: SceneConfig | null = null;
  let configured = false;
  let startTime = -1;
  let lastTime = -1;

  // ----- Model (async) -----
  const fabricMaterials = new Map<string, MeshPhysicalMaterial>();
  const ownedMaterials = new Set<Material>();
  const ownedMeshes: Mesh[] = [];
  let liveFabric: MeshPhysicalMaterial | null = null;
  let loaded = false;
  let disposed = false;

  /** Copies the chosen variant's fabric into `into`; false until loaded. */
  function readFabric(config: SceneConfig, into: Fabric): boolean {
    const source = fabricMaterials.get(findFinish(config.finish).material);
    if (!source) return false;
    into.color.copy(source.color);
    into.sheenColor.copy(source.sheenColor);
    into.specularColor.copy(source.specularColor);
    into.roughness = source.roughness;
    into.sheenRoughness = source.sheenRoughness;
    into.specularIntensity = source.specularIntensity;
    return true;
  }

  function applyFabric(value: Fabric): void {
    if (!liveFabric) return;
    liveFabric.color.copy(value.color);
    liveFabric.sheenColor.copy(value.sheenColor);
    liveFabric.specularColor.copy(value.specularColor);
    liveFabric.roughness = value.roughness;
    liveFabric.sheenRoughness = value.sheenRoughness;
    liveFabric.specularIntensity = value.specularIntensity;
  }

  const ready = new GLTFLoader().loadAsync(modelUrl).then(async (gltf) => {
    if (disposed) return;

    // The asset ships its own key light; the studio lights replace it.
    const embeddedLights: Object3D[] = [];
    const found: { fabric?: Mesh } = {};
    gltf.scene.traverse((object) => {
      if ((object as Light).isLight) embeddedLights.push(object);
      const mesh = object as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        ownedMeshes.push(mesh);
        ownedMaterials.add(mesh.material as Material);
        if (mesh.name.includes('fabric')) found.fabric = mesh;
      }
    });
    embeddedLights.forEach((light) => light.removeFromParent());

    // Every fabric option of KHR_materials_variants, as a material.
    const json = gltf.parser.json as { materials?: { name?: string }[] };
    await Promise.all(
      (json.materials ?? []).map(async (definition, index) => {
        const name = definition.name ?? '';
        if (!FINISHES.some((finish) => finish.material === name)) return;
        const material = (await gltf.parser.getDependency(
          'material',
          index,
        )) as MeshPhysicalMaterial;
        fabricMaterials.set(name, material);
        ownedMaterials.add(material);
      }),
    );
    if (disposed) return;
    const fabricMesh = found.fabric;
    if (!fabricMesh || fabricMaterials.size === 0) {
      throw new Error('The model has no fabric variants');
    }

    // One live material whose properties ease between the variants.
    liveFabric = (fabricMesh.material as MeshPhysicalMaterial).clone();
    ownedMaterials.add(liveFabric);
    fabricMesh.material = liveFabric;

    // Normalise: fixed width, centred, standing on the floor.
    gltf.scene.updateMatrixWorld(true);
    const box = boundsOf(gltf.scene);
    const scale = MODEL_WIDTH / (box.max.x - box.min.x);
    gltf.scene.scale.setScalar(scale);
    gltf.scene.position.set(
      -((box.min.x + box.max.x) / 2) * scale,
      -box.min.y * scale,
      -((box.min.z + box.max.z) / 2) * scale,
    );
    contact.scale.set(
      (box.max.x - box.min.x) * scale * 1.2,
      (box.max.z - box.min.z) * scale * 1.5,
      1,
    );
    stand.add(gltf.scene);

    // Show the configured fabric straight away (no ease from black).
    if (lastConfig && readFabric(lastConfig, target.fabric)) {
      copyFabric(target.fabric, current.fabric);
    }
    applyFabric(current.fabric);
    loaded = true;
  });

  function fitCamera(aspect: number): void {
    camera.aspect = aspect;
    // Wide model: fit its width on narrow canvases, keep a floor on wide.
    cameraDistance = Math.max(6.6, 10.4 / Math.min(aspect, 1.6));
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
    ready,

    resize(width, height, pixelRatio) {
      if (!width || !height) return;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      fitCamera(width / height);
    },

    configure(config) {
      lastConfig = config;
      const look = LOOKS[config.theme];
      readFabric(config, target.fabric);
      target.rimColor.set(look.rimColor);
      target.key = look.key;
      target.rim = look.rim;
      target.env = look.env;
      target.shadow = look.shadow;
      target.contact = look.contact;

      // First configuration (and reduced motion) snaps instead of easing.
      if (!configured || reducedMotion) {
        copyFabric(target.fabric, current.fabric);
        current.rimColor.copy(target.rimColor);
        current.key = target.key;
        current.rim = target.rim;
        current.env = target.env;
        current.shadow = target.shadow;
        current.contact = target.contact;
        configured = true;
      }
    },

    setPointer(x, y) {
      if (reducedMotion) return;
      target.pointerX = x;
      target.pointerY = y;
    },

    setScroll(progress) {
      // Scroll-linked rotation is motion too: skip it under reduced motion.
      if (reducedMotion) return;
      target.scroll = clamp01(progress);
    },

    rotateBy(radians) {
      target.yaw += radians;
    },

    render(time) {
      // Nothing to show until the model is in; the intro starts with it.
      if (!loaded) return false;
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
          2e-3
        ) {
          moving = true;
        }
      };

      // Fabric variant and studio lights
      const f = current.fabric;
      const t = target.fabric;
      approachColor(f.color, t.color);
      approachColor(f.sheenColor, t.sheenColor);
      approachColor(f.specularColor, t.specularColor);
      f.roughness = approach(f.roughness, t.roughness);
      f.sheenRoughness = approach(f.sheenRoughness, t.sheenRoughness);
      f.specularIntensity = approach(f.specularIntensity, t.specularIntensity);
      approachColor(current.rimColor, target.rimColor);
      current.key = approach(current.key, target.key);
      current.rim = approach(current.rim, target.rim);
      current.env = approach(current.env, target.env);
      current.shadow = approach(current.shadow, target.shadow);
      current.contact = approach(current.contact, target.contact);
      current.pointerX = approach(current.pointerX, target.pointerX, kSlow);
      current.pointerY = approach(current.pointerY, target.pointerY, kSlow);
      current.scroll = approach(current.scroll, target.scroll);
      current.yaw = approach(current.yaw, target.yaw, kSlow);

      // Intro: the studio lights come up and the model settles.
      const intro = reducedMotion
        ? 1
        : easeOutCubic(clamp01((time - startTime) / INTRO_MS));
      if (intro < 1) moving = true;

      applyFabric(f);
      rim.color.copy(current.rimColor);
      key.intensity = current.key * intro;
      rim.intensity = current.rim * intro;
      scene.environmentIntensity = current.env * (0.15 + 0.85 * intro);
      floorMaterial.opacity = current.shadow * intro;
      contactMaterial.opacity = current.contact * intro;

      const settle = 1 - intro;
      stand.rotation.y =
        BASE_YAW +
        current.yaw +
        current.pointerX * 0.14 +
        current.scroll * 0.44 +
        settle * 0.35;
      stand.rotation.x = -current.pointerY * 0.03 + settle * 0.06;

      placeCamera();
      renderer.render(scene, camera);

      // Once every value has converged the caller stops the frame loop;
      // the next pointer, scroll, drag or config change starts it again.
      return moving;
    },

    dispose({ loseContext = true } = {}) {
      disposed = true;
      const textures = new Set<Texture>();
      ownedMaterials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if ((value as Texture | null)?.isTexture) {
            textures.add(value as Texture);
          }
        });
        material.dispose();
      });
      textures.forEach((texture) => texture.dispose());
      ownedMeshes.forEach((mesh) => mesh.geometry.dispose());
      floorGeometry.dispose();
      floorMaterial.dispose();
      contactGeometry.dispose();
      contactMaterial.dispose();
      contactTexture.dispose();
      key.shadow.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (loseContext) renderer.forceContextLoss();
    },
  };
}

function copyFabric(from: Fabric, to: Fabric): void {
  to.color.copy(from.color);
  to.sheenColor.copy(from.sheenColor);
  to.specularColor.copy(from.specularColor);
  to.roughness = from.roughness;
  to.sheenRoughness = from.sheenRoughness;
  to.specularIntensity = from.specularIntensity;
}

/** World-space bounds of all meshes, from their geometry boxes. */
function boundsOf(object: Object3D): { min: Vector3; max: Vector3 } {
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  const point = new Vector3();
  object.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;
    for (const x of [box.min.x, box.max.x]) {
      for (const y of [box.min.y, box.max.y]) {
        for (const z of [box.min.z, box.max.z]) {
          point.set(x, y, z).applyMatrix4(mesh.matrixWorld);
          min.min(point);
          max.max(point);
        }
      }
    }
  });
  return { min, max };
}

/** A soft elliptical contact shadow (radial gradient, any canvas engine). */
function createContactTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    gradient.addColorStop(0.45, 'rgba(0, 0, 0, 0.32)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
  }
  return new CanvasTexture(canvas);
}
