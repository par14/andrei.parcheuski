import {
  afterNextRender,
  ApplicationRef,
  DOCUMENT,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

/** Browser UI colour per theme; mirrors --color-bg in styles.css. */
const THEME_COLOR: Record<Theme, string> = {
  dark: '#141a21',
  light: '#eeefea',
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  #document = inject(DOCUMENT);
  #THEME_KEY = 'portfolio-theme';
  #platformId = inject(PLATFORM_ID);
  #appRef = inject(ApplicationRef);
  theme = signal<Theme>('dark');
  currentTheme = this.theme.asReadonly();

  #afterNextRenderRef = afterNextRender(() => {
    if (isPlatformBrowser(this.#platformId)) {
      this.#initTheme();
    }
  });

  #initTheme(): void {
    // index.html sets a validated data-theme before first paint (no-flash
    // bootstrap); trust it first, then storage, then the OS preference.
    // Stored values are validated — old builds or other scripts may have
    // written something outside the Theme union.
    const domTheme = this.#document.documentElement.getAttribute('data-theme');
    let savedTheme: string | null = null;
    try {
      savedTheme = localStorage.getItem(this.#THEME_KEY);
    } catch {
      // Storage blocked (cookies disabled, locked-down webview).
    }
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    this.setTheme(
      this.#isTheme(domTheme)
        ? domTheme
        : this.#isTheme(savedTheme)
          ? savedTheme
          : prefersDarkMode
            ? 'dark'
            : 'light',
    );
  }

  #isTheme(value: string | null): value is Theme {
    return value === 'light' || value === 'dark';
  }

  toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    const apply = () => this.setTheme(next);

    // Progressive enhancement: animate the whole page between themes.
    const doc = this.#document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };
    const reducedMotion =
      isPlatformBrowser(this.#platformId) &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (doc.startViewTransition && !reducedMotion) {
      // Zoneless: render synchronously so the "new" snapshot already shows
      // the finished state (e.g. the toggle icon). whenStable() would also
      // wait for unrelated pending work such as a lazy chunk download.
      doc.startViewTransition(() => {
        apply();
        this.#appRef.tick();
      });
    } else {
      apply();
    }
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    if (isPlatformBrowser(this.#platformId)) {
      this.#document.documentElement.setAttribute('data-theme', theme);
      // index.html ships OS-based theme-color tags; follow the chosen theme.
      this.#document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((meta) => {
          meta.removeAttribute('media');
          meta.setAttribute('content', THEME_COLOR[theme]);
        });
      try {
        localStorage.setItem(this.#THEME_KEY, theme);
      } catch {
        // Storage blocked — the theme still applies for this visit.
      }
    }
  }
}
