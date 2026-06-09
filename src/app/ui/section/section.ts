import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ngp-section',
  template: `
    <h3>{{ title() }}</h3>
    <div class="content">
      <ng-content />
    </div>
  `,
  styleUrl: 'section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Section {
  title = input.required<string>();
}
