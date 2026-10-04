import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  inject,
} from '@angular/core';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'ngp-theme-switcher',
  template: `
    <button
      class="theme-toggle"
      type="button"
      (click)="toggleTheme($event)"
      [attr.aria-label]="
        'Switch to ' + (isDarkTheme() ? 'light' : 'dark') + ' theme'
      "
    >
      <span class="icon">
        @if (isDarkTheme()) {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        } @else {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        }
      </span>
    </button>
  `,
  styleUrl: './theme-switcher.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherComponent {
  #themeService = inject(ThemeService);
  #document = inject(DOCUMENT);

  protected readonly isDarkTheme = computed(
    () => this.#themeService.currentTheme() === 'dark',
  );

  toggleTheme(event?: MouseEvent): void {
    // The new theme is revealed as a circle growing from this button
    // (see ::view-transition-new(root) in styles.css).
    const button = event?.currentTarget as HTMLElement | undefined;
    const view = this.#document.defaultView;
    if (button && view) {
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.hypot(
        Math.max(x, view.innerWidth - x),
        Math.max(y, view.innerHeight - y),
      );
      const style = this.#document.documentElement.style;
      style.setProperty('--vt-x', `${x}px`);
      style.setProperty('--vt-y', `${y}px`);
      style.setProperty('--vt-r', `${radius}px`);
    }
    this.#themeService.toggleTheme();
  }
}
