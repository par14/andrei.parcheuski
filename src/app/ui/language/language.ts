import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpLanguage } from './languages';

@Component({
  selector: 'ngp-language',
  template: `
    <div class="language">
      <span class="name">{{ language().name }}</span>
      <span class="level">{{ language().level }}</span>
    </div>
  `,
  styleUrl: './language.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Language {
  language = input.required<NgpLanguage>();
}
