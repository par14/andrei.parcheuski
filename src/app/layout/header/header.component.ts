import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemeSwitcherComponent } from '../../ui/theme-switcher/theme-switcher';
import { CONTACT_INFO, PORTFOLIO_DATA } from '../../core/portfolio.data';

@Component({
  selector: 'ngp-header',
  template: `
    <header>
      <a class="brand" href="/" aria-label="Andrei Parcheuski — home">
        <img src="favicon.svg" alt="" class="brand-mark" width="36" height="36" />
      </a>

      <span class="status">
        <span class="pulse-circle" aria-hidden="true"></span>
        {{ PORTFOLIO_DATA.statusInfo.text }}
      </span>

      <div class="right-header-content">
        <ngp-theme-switcher></ngp-theme-switcher>
        <a href="/cv.pdf" download aria-label="Download CV in PDF format">Download CV</a>
        <a href="mailto:{{ email }}" aria-label="Send email to contact me">Contact me</a>
      </div>
    </header>
  `,
  imports: [ThemeSwitcherComponent],
  styleUrl: 'header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  PORTFOLIO_DATA = PORTFOLIO_DATA;
  protected readonly email =
    CONTACT_INFO.find((contact) => contact.heading === 'Email')?.body ?? '';
}
