import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ThemeSwitcherComponent } from '../../ui/theme-switcher/theme-switcher';
import { CONTACT_INFO, STATUS_INFO } from '../../core/portfolio.data';

@Component({
  selector: 'ngp-header',
  template: `
    <header class="header">
      <a class="brand" href="/" aria-label="Andrei Parcheuski, home">
        <img src="favicon.svg" alt="" width="32" height="32" />
      </a>

      <p class="status">
        <span class="dot" aria-hidden="true"></span>
        {{ status }}
      </p>

      <nav class="nav" aria-label="Quick links">
        <a href="/cv.pdf" download aria-label="Download CV (PDF)">CV</a>
        <a href="mailto:{{ email }}">Email</a>
        <ngp-theme-switcher />
      </nav>
    </header>
  `,
  imports: [ThemeSwitcherComponent],
  styleUrl: 'header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly status = STATUS_INFO.text;
  protected readonly email =
    CONTACT_INFO.find((contact) => contact.heading === 'Email')?.body ?? '';
}
