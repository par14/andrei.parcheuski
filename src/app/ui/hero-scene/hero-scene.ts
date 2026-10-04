import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  InjectionToken,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import type { Theme } from '../../core/theme.service';
import {
  canRenderScene,
  FinishId,
  MODEL_URL,
  SceneState,
} from './hero-scene.config';
import {
  createHeroRuntime,
  HeroRuntime,
  HeroRuntimeFactory,
} from './hero-scene.runtime';

/** Swappable so unit tests can run without WebGL. */
export const HERO_RUNTIME_FACTORY = new InjectionToken<HeroRuntimeFactory>(
  'HERO_RUNTIME_FACTORY',
  { providedIn: 'root', factory: () => createHeroRuntime },
);

const MAX_PIXEL_RATIO = 1.5;
/** One press of the "rotate" button turns the product by 60°. */
const TURN = Math.PI / 3;
const DRAG_RADIANS_PER_PX = 0.008;

/**
 * WebGL product shot for the hero. Loaded through `@defer`, so `three` lives
 * in a lazy chunk and nothing here runs during prerender.
 *
 * High-frequency input (pointer, drag, scroll) and the frame loop use native
 * listeners and plain rAF, so they never trigger change detection. The loop
 * stops once the scene is still, and pauses while the tab is hidden or the
 * hero is off-screen.
 */
@Component({
  selector: 'ngp-hero-scene',
  template: `<canvas #canvas aria-hidden="true"></canvas>`,
  styleUrl: './hero-scene.css',
  host: { '[attr.data-state]': 'state()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroScene {
  readonly theme = input.required<Theme>();
  readonly finish = input.required<FinishId>();
  /** Incremented by the "rotate" button; each step turns the product. */
  readonly turns = input(0);

  readonly stateChange = output<SceneState>();

  protected readonly state = signal<SceneState>('idle');

  private readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #factory = inject(HERO_RUNTIME_FACTORY);
  readonly #destroyRef = inject(DestroyRef);
  readonly #runtime = signal<HeroRuntime | null>(null);

  #frame = 0;
  #pageVisible = true;
  #inView = true;
  #size = { width: 0, height: 0 };
  #appliedTurns = 0;

  constructor() {
    afterNextRender(() => this.#init());

    // Inputs → scene targets. The runtime eases towards them.
    effect(() => {
      const runtime = this.#runtime();
      const config = { theme: this.theme(), finish: this.finish() };
      if (!runtime) return;
      runtime.configure(config);
      this.#requestFrame();
    });

    effect(() => {
      const turns = this.turns();
      const runtime = this.#runtime();
      if (!runtime || turns === this.#appliedTurns) return;
      runtime.rotateBy((turns - this.#appliedTurns) * TURN);
      this.#appliedTurns = turns;
      this.#requestFrame();
    });
  }

  #setState(state: SceneState): void {
    this.state.set(state);
    this.stateChange.emit(state);
  }

  /** Creates a runtime; the scene turns "on" once the model has loaded. */
  #build(reducedMotion: boolean): boolean {
    let runtime: HeroRuntime;
    try {
      runtime = this.#factory(this.canvas().nativeElement, {
        modelUrl: MODEL_URL,
        reducedMotion,
      });
    } catch {
      this.#runtime.set(null);
      this.#setState('off');
      return false;
    }

    const { width, height } = this.#size;
    if (width && height) runtime.resize(width, height, this.#pixelRatio());
    this.#runtime.set(runtime);
    runtime.ready.then(
      () => {
        if (this.#runtime() !== runtime) return;
        this.#setState('on');
        this.#requestFrame();
      },
      () => {
        if (this.#runtime() !== runtime) return;
        runtime.dispose();
        this.#runtime.set(null);
        this.#setState('off');
      },
    );
    return true;
  }

  #pixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  }

  #init(): void {
    if (!canRenderScene()) {
      this.#setState('off');
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!this.#build(reducedMotion)) return;

    const canvas = this.canvas().nativeElement;
    const host = this.#host.nativeElement;
    const listeners = new AbortController();
    const { signal: abort } = listeners;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      this.#size = { width, height };
      this.#runtime()?.resize(width, height, this.#pixelRatio());
      this.#requestFrame();
    });
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      this.#inView = entry.isIntersecting;
      this.#requestFrame();
    });
    intersectionObserver.observe(host);

    document.addEventListener(
      'visibilitychange',
      () => {
        this.#pageVisible = !document.hidden;
        this.#requestFrame();
      },
      { signal: abort },
    );

    if (window.matchMedia('(hover: hover)').matches && !reducedMotion) {
      window.addEventListener(
        'pointermove',
        (event) => {
          this.#runtime()?.setPointer(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
          );
          this.#requestFrame();
        },
        { passive: true, signal: abort },
      );
    }

    // Drag to turn the product, like any product configurator. Vertical
    // swipes still scroll the page (touch-action: pan-y in CSS).
    let dragX: number | null = null;
    const endDrag = () => {
      dragX = null;
      delete canvas.dataset['dragging'];
    };
    canvas.addEventListener(
      'pointerdown',
      (event) => {
        if (event.button !== 0) return;
        dragX = event.clientX;
        canvas.dataset['dragging'] = '';
        canvas.setPointerCapture?.(event.pointerId);
      },
      { signal: abort },
    );
    canvas.addEventListener(
      'pointermove',
      (event) => {
        if (dragX === null) return;
        this.#runtime()?.rotateBy(
          (event.clientX - dragX) * DRAG_RADIANS_PER_PX,
        );
        dragX = event.clientX;
        this.#requestFrame();
      },
      { passive: true, signal: abort },
    );
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      canvas.addEventListener(type, endDrag, { signal: abort });
    }

    const onScroll = () => {
      this.#runtime()?.setScroll(
        window.scrollY / Math.max(window.innerHeight, 1),
      );
      this.#requestFrame();
    };
    window.addEventListener('scroll', onScroll, {
      passive: true,
      signal: abort,
    });
    onScroll();

    // A lost context (app switch, GPU reset) shows the still; when the
    // browser restores it, the scene is rebuilt on the same canvas.
    canvas.addEventListener(
      'webglcontextlost',
      () => {
        cancelAnimationFrame(this.#frame);
        this.#frame = 0;
        this.#setState('off');
      },
      { signal: abort },
    );
    canvas.addEventListener(
      'webglcontextrestored',
      () => {
        const previous = this.#runtime();
        this.#runtime.set(null);
        try {
          previous?.dispose({ loseContext: false });
        } catch {
          // Handles from the lost context are already invalid.
        }
        this.#appliedTurns = 0;
        if (this.#build(reducedMotion)) onScroll();
      },
      { signal: abort },
    );

    this.#destroyRef.onDestroy(() => {
      cancelAnimationFrame(this.#frame);
      this.#frame = 0;
      listeners.abort();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      this.#runtime()?.dispose();
      this.#runtime.set(null);
    });
  }

  readonly #tick = (time: number): void => {
    this.#frame = 0;
    if (this.#runtime()?.render(time)) this.#requestFrame();
  };

  #requestFrame(): void {
    if (
      this.#frame ||
      !this.#runtime() ||
      this.state() !== 'on' ||
      !this.#pageVisible ||
      !this.#inView
    ) {
      return;
    }
    this.#frame = requestAnimationFrame(this.#tick);
  }
}
