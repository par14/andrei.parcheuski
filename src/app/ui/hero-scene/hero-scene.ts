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
import { FinishId, SceneState } from './hero-scene.config';
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
 * The frame loop runs outside change detection (plain rAF, no signal
 * writes) and pauses while the tab is hidden or the hero is off-screen.
 */
@Component({
  selector: 'ngp-hero-scene',
  template: `
    <canvas
      #canvas
      aria-hidden="true"
      (click)="onCanvasClick($event)"
      (pointermove)="onCanvasHover($event)"
    ></canvas>
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

  protected onCanvasHover(event: PointerEvent): void {
    const canvas = event.currentTarget as HTMLCanvasElement;
    canvas.style.cursor = this.#hits(event) ? 'pointer' : '';
  }

  #hits(event: MouseEvent): boolean {
    const runtime = this.#runtime();
    if (!runtime) return false;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return runtime.hitTest(x, y);
  }

  #setState(state: SceneState): void {
    this.state.set(state);
    this.stateChange.emit(state);
  }

  #init(): void {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (!('WebGL2RenderingContext' in window) || connection?.saveData) {
      this.#setState('off');
      return;
    }

    const canvas = this.canvas().nativeElement;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let runtime: HeroRuntime;
    try {
      runtime = this.#factory(canvas, { reducedMotion });
    } catch {
      this.#setState('off');
      return;
    }

    const host = this.#host.nativeElement;
    const listeners = new AbortController();
    const { signal: abort } = listeners;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      runtime.resize(
        width,
        height,
        Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
      );
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

    const finePointer = window.matchMedia('(hover: hover)').matches;
    if (finePointer && !reducedMotion) {
      window.addEventListener(
        'pointermove',
        (event) => {
          runtime.setPointer(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
          );
        },
        { passive: true, signal: abort },
      );
    }

    const onScroll = () => {
      runtime.setScroll(window.scrollY / Math.max(window.innerHeight, 1));
      this.#requestFrame();
    };
    window.addEventListener('scroll', onScroll, {
      passive: true,
      signal: abort,
    });
    onScroll();

    canvas.addEventListener(
      'webglcontextlost',
      () => {
        cancelAnimationFrame(this.#frame);
        this.#frame = 0;
        this.#runtime.set(null);
        this.#setState('off');
      },
      { signal: abort },
    );

    this.#destroyRef.onDestroy(() => {
      cancelAnimationFrame(this.#frame);
      this.#frame = 0;
      listeners.abort();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      runtime.dispose();
    });

    this.#runtime.set(runtime);
    this.#setState('on');
  }

  readonly #tick = (time: number): void => {
    this.#frame = 0;
    const runtime = this.#runtime();
    if (runtime?.render(time)) this.#requestFrame();
  };

  #requestFrame(): void {
    if (this.#frame || !this.#runtime() || !this.#pageVisible || !this.#inView)
      return;
    this.#frame = requestAnimationFrame(this.#tick);
  }
}
