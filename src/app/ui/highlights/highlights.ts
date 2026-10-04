import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HIGHLIGHTS } from '../../core/portfolio.data';
import { CountUp } from '../count-up/count-up';

@Component({
  selector: 'ngp-highlights',
  template: `
    <ul class="highlights" aria-label="Career highlights">
      @for (highlight of highlights; track highlight.label) {
        <li class="highlight">
          <span class="highlight-value" ngpCountUp>{{ highlight.value }}</span>
          <span class="highlight-label">{{ highlight.label }}</span>
        </li>
      }
    </ul>
  `,
  styleUrl: './highlights.css',
  imports: [CountUp],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Highlights {
  protected readonly highlights = HIGHLIGHTS;
}
