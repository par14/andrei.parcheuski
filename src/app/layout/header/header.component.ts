import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeSwitcherComponent } from '../../ui/theme-switcher/theme-switcher';
import { CONTACT_INFO, PORTFOLIO_DATA } from '../../core/portfolio.data';

@Component({
  selector: 'ngp-header',
  template: `
    <header>
      <div class="left-header-content">
        <a class="brand" href="/" aria-label="Andrei Parcheuski — home">
          <img src="favicon.svg" alt="" class="brand-mark" width="36" height="36" />
        </a>
        <div class="pulse-circle" aria-hidden="true"></div>
        <span class="status" role="status">{{ PORTFOLIO_DATA.statusInfo.text }}</span>
      </div>

      <div class="right-header-content">
        <ngp-theme-switcher></ngp-theme-switcher>
        <a href="/cv.pdf" download aria-label="Download CV in PDF format">Download CV</a>
        <a href="mailto:{{ emailContact?.body || 'contact@example.com' }}" aria-label="Send email to contact me">Contact me</a>
      </div>
    </header>
  `,
  imports: [ThemeSwitcherComponent],
  styleUrl: 'header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  PORTFOLIO_DATA = PORTFOLIO_DATA;
  emailContact = CONTACT_INFO.find(
    (contact) => contact.heading === 'Email',
  );
}
