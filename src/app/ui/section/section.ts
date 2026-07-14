import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'ngp-section',
  template: `
    <h3>{{ title() }}</h3>
    <div class="content">
      <ng-content />
    </div>
  `,
  styleUrl: 'section.css',
  host: { '[attr.id]': 'anchorId()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Section {
  title = input.required<string>();

  /** Slugified title so every section is deep-linkable (e.g. #contact). */
  anchorId = computed(() =>
    this.title()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
  );
}
