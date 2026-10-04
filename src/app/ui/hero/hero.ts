import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { EXPERIENCE_OVERVIEW, PERSONAL_INFO } from '../../core/portfolio.data';
import { ThemeService } from '../../core/theme.service';
import { HeroScene } from '../hero-scene/hero-scene';
import {
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
  imports: [HeroScene],
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

  constructor() {
    afterNextRender(() => this.currentYear.set(new Date().getFullYear()));
  }

  protected toggleExploded(): void {
    this.exploded.update((exploded) => !exploded);
  }
}
