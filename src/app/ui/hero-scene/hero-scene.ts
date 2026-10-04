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
import { canRenderScene, FinishId, SceneState } from './hero-scene.config';
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

/**
 * WebGL product shot for the hero. Loaded through `@defer`, so `three` lives
 * in a lazy chunk and nothing here runs during prerender.
 *
 * High-frequency input (pointer, scroll) and the frame loop use native
 * listeners and plain rAF, so they never trigger change detection. The loop
 * stops once the scene is still, and pauses while the tab is hidden or the
 * hero is off-screen.
 */
@Component({
  selector: 'ngp-hero-scene',
  template: `
    <canvas #canvas aria-hidden="true" (click)="onCanvasClick($event)"></canvas>
  `,
  styleUrl: './hero-scene.css',
  host: { '[attr.data-state]': 'state()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroScene {
  readonly theme = input.required<Theme>();
  readonly finish = input.required<FinishId>();
  readonly exploded = input(false);

  readonly stateChange = output<SceneState>();
  /** The visitor clicked the model itself. */
  readonly modelClick = output<void>();

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

  constructor() {
    afterNextRender(() => this.#init());

    // Inputs → scene targets. The runtime eases towards them.
    effect(() => {
      const runtime = this.#runtime();
      const config = {
        theme: this.theme(),
        finish: this.finish(),
        exploded: this.exploded(),
      };
      if (!runtime) return;
      runtime.configure(config);
      this.#requestFrame();
    });
  }

  protected onCanvasClick(event: MouseEvent): void {
    if (this.#hits(event)) this.modelClick.emit();
  }

  #hits(event: MouseEvent): boolean {
    const runtime = this.#runtime();
    if (!runtime) return false;
    const rect = this.canvas().nativeElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return runtime.hitTest(x, y);
  }

  #setState(state: SceneState): void {
    this.state.set(state);
    this.stateChange.emit(state);
  }

  /** Creates a runtime on the canvas; reports "off" when that fails. */
  #build(reducedMotion: boolean): boolean {
    try {
      const runtime = this.#factory(this.canvas().nativeElement, {
        reducedMotion,
      });
      const { width, height } = this.#size;
      if (width && height) runtime.resize(width, height, this.#pixelRatio());
      this.#runtime.set(runtime);
      this.#setState('on');
      return true;
    } catch {
      this.#runtime.set(null);
      this.#setState('off');
      return false;
    }
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

    if (window.matchMedia('(hover: hover)').matches) {
      if (!reducedMotion) {
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
      // Pointer cursor only over the model itself.
      canvas.addEventListener(
        'pointermove',
        (event) => {
          canvas.style.cursor = this.#hits(event) ? 'pointer' : '';
        },
        { passive: true, signal: abort },
      );
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

    // A lost context (app switch, GPU reset) shows the poster; when the
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
