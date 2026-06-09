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
    const savedTheme = localStorage.getItem(this.#THEME_KEY) as Theme | null;
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = savedTheme || (prefersDarkMode ? 'dark' : 'light');
    this.theme.set(initialTheme);
    this.setTheme(initialTheme);
  }

  toggleTheme(): void {
    this.theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
    this.setTheme(this.theme());
  }

  setTheme(theme: Theme): void {
    if (isPlatformBrowser(this.#platformId)) {
      this.#document.querySelector('html')?.setAttribute('data-theme', theme);
      localStorage.setItem(this.#THEME_KEY, theme);
    }
  }
}
