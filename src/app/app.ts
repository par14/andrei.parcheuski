import {ChangeDetectionStrategy, Component} from '@angular/core';

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
export class App {}
