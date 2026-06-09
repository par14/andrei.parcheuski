import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface NgpLanguage {
  name: string;
  level: string;
}

@Component({
  selector: 'ngp-languages',
  template: ` <ng-content select="ngp-language" /> `,
  styleUrl: './languages.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Languages {}
