import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {ThemeService} from '../../core/theme.service';

@Component({
  selector: 'ngp-theme-switcher',
  standalone: true,
  template: `
    <button
      class="theme-toggle"
      (click)="toggleTheme()"
      [attr.aria-label]="
        'Switch to ' + (isDarkTheme ? 'light' : 'dark') + ' theme'
      "
    >
      <span class="icon">
        @if(isDarkTheme){
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
          role="img"
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
        }
        @else {
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
          role="img"
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

  get isDarkTheme(): boolean {
    return this.#themeService.currentTheme() === 'dark';
  }

  toggleTheme(): void {
    this.#themeService.toggleTheme();
  }
}
