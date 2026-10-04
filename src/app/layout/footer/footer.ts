import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CONTACT_INFO, FOOTER_INFO } from '../../core/portfolio.data';

@Component({
  selector: 'ngp-footer',
  template: `
    <footer class="footer">
      <p class="lead">{{ footer.mainMessage }}</p>
      <a class="email" [href]="'mailto:' + email">{{ email }}</a>
      <div class="meta">
        <p class="status">
          <span class="dot" aria-hidden="true"></span>
          {{ footer.subMessage }}
        </p>
        <ul class="links">
          @if (linkedIn) {
            <li>
              <a [href]="linkedIn" target="_blank" rel="noopener noreferrer"
                >LinkedIn<span class="visually-hidden">
                  (opens in a new tab)</span
                ></a
              >
            </li>
          }
          <li><a href="/cv.pdf" download>Download CV</a></li>
        </ul>
      </div>
    </footer>
  `,
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly footer = FOOTER_INFO;
  protected readonly email =
    CONTACT_INFO.find((contact) => contact.heading === 'Email')?.body ?? '';
  protected readonly linkedIn = CONTACT_INFO.find(
    (contact) => contact.heading === 'LinkedIn',
  )?.link;
}
