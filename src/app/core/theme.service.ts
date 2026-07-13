import {afterNextRender, DOCUMENT, inject, Injectable, PLATFORM_ID, signal,} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  #document = inject(DOCUMENT);
  #THEME_KEY = 'portfolio-theme';
  #platformId = inject(PLATFORM_ID);
  theme = signal<Theme>('dark');
  currentTheme = this.theme.asReadonly();

  #afterNextRenderRef = afterNextRender(() => {
    if (isPlatformBrowser(this.#platformId)) {
      this.#initTheme();
    }
  });

  #initTheme(): void {
    // index.html sets data-theme before first paint (no-flash bootstrap);
    // pick it up here so the signal and the DOM stay in sync.
    const domTheme = this.#document.documentElement.getAttribute('data-theme') as Theme | null;
    const savedTheme = localStorage.getItem(this.#THEME_KEY) as Theme | null;
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme ?? domTheme ?? (prefersDarkMode ? 'dark' : 'light');
    this.theme.set(initialTheme);
    this.setTheme(initialTheme);
  }

  toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      this.theme.set(next);
      this.setTheme(next);
    };

    // Progressive enhancement: cross-fade the whole page between themes.
    const doc = this.#document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };
    const reducedMotion =
      isPlatformBrowser(this.#platformId) &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (doc.startViewTransition && !reducedMotion) {
      doc.startViewTransition(apply);
    } else {
      apply();
    }
  }

  setTheme(theme: Theme): void {
    if (isPlatformBrowser(this.#platformId)) {
      this.#document.querySelector('html')?.setAttribute('data-theme', theme);
      localStorage.setItem(this.#THEME_KEY, theme);
    }
  }
}
