import { ChangeDetectionStrategy, Component } from '@angular/core';

import {
  CONTACT_EMAIL,
  FOOTER_INFO,
  LINKEDIN_URL,
  PERSONAL_INFO,
} from '../../core/portfolio.data';

@Component({
  selector: 'ngp-footer',
  template: `
    <footer class="footer">
      <p class="lead">{{ footer.mainMessage }}</p>
      <a class="email" [href]="'mailto:' + email">{{ email }}</a>
      <div class="meta">
        <p class="status">
          <span class="dot" aria-hidden="true"></span>
          {{ availability }}
        </p>
        <ul class="links">
          <li>
            <a [href]="linkedIn" target="_blank" rel="noopener noreferrer"
              >LinkedIn<span class="visually-hidden">
                (opens in a new tab)</span
              ></a
            >
          </li>
          <li><a href="/cv.pdf" download>Download CV</a></li>
        </ul>
      </div>
      <p class="credit">
        3D model:
        <a
          href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlamVelvetSofa"
          target="_blank"
          rel="noopener noreferrer"
          >Glam Velvet Sofa</a
        >
        by Wayfair,
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          >CC BY 4.0</a
        >
      </p>
    </footer>
  `,
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly footer = FOOTER_INFO;
  protected readonly availability = PERSONAL_INFO.availability;
  protected readonly email = CONTACT_EMAIL;
  protected readonly linkedIn = LINKEDIN_URL;
}
