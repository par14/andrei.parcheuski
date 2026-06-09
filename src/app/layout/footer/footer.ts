import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PORTFOLIO_DATA } from '../../core/portfolio.data';

@Component({
  selector: 'ngp-footer',
  template: `
    <span class="footer-main-message"> {{ PORTFOLIO_DATA.footerInfo.mainMessage }} </span>
    <span class="footer-sub-message"> {{ PORTFOLIO_DATA.footerInfo.subMessage }} </span>
  `,
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  PORTFOLIO_DATA = PORTFOLIO_DATA;
}
