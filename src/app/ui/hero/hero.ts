import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';

import { EXPERIENCE_OVERVIEW, PERSONAL_INFO } from '../../core/portfolio.data';
import { ThemeService } from '../../core/theme.service';
import { HeroScene } from '../hero-scene/hero-scene';
import {
  canRenderScene,
  findFinish,
  FINISHES,
  FinishId,
  SceneState,
} from '../hero-scene/hero-scene.config';

@Component({
  selector: 'ngp-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  // HeroScene is referenced only inside @defer, so it and `three` stay lazy.
  imports: [HeroScene, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly info = PERSONAL_INFO;
  protected readonly startYear = EXPERIENCE_OVERVIEW.startYear;
  protected readonly finishes = FINISHES;
  protected readonly theme = inject(ThemeService).currentTheme;

  // Baked in at prerender time; refreshed after hydration so the career
  // span never shows a stale year from an old build.
  protected readonly currentYear = signal(new Date().getFullYear());

  protected readonly finish = signal<FinishId>('ultramarine');
  protected readonly exploded = signal(false);
  protected readonly sceneState = signal<SceneState>('idle');
  protected readonly currentFinish = computed(() => findFinish(this.finish()));
  /** Flips once the browser is idle; triggers the deferred 3D chunk. */
  protected readonly loadScene = signal(false);

  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.currentYear.set(new Date().getFullYear());

      // Decide before requesting the lazy chunk: visitors without WebGL 2
      // or with Save-Data get the still and never download `three`.
      if (!canRenderScene()) {
        this.sceneState.set('off');
        return;
      }
      const start = () => this.loadScene.set(true);
      if ('requestIdleCallback' in window) {
        const id = requestIdleCallback(start, { timeout: 2000 });
        this.#destroyRef.onDestroy(() => cancelIdleCallback(id));
      } else {
        const id = setTimeout(start, 200);
        this.#destroyRef.onDestroy(() => clearTimeout(id));
      }
    });
  }

  protected toggleExploded(): void {
    this.exploded.update((exploded) => !exploded);
  }
}
