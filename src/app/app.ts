import {afterNextRender, ChangeDetectionStrategy, Component} from '@angular/core';
import {inject as injectAnalytics} from '@vercel/analytics';

import {Layout} from './layout/layout';

@Component({
  selector: 'app-root',
  imports: [
    Layout,
  ],
  template: `
    <layout/>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  constructor() {
    // Vercel Web Analytics — browser-only so it never runs during SSR/prerender.
    afterNextRender(() => injectAnalytics());
  }
}
