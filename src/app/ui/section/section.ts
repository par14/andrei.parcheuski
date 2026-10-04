import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * A page section: title in a sticky left column, content on the right.
 * Content marked with the `sectionAside` attribute is placed under the
 * title (e.g. the portrait in About).
 */
@Component({
  selector: 'ngp-section',
  template: `
    <div class="head">
      <h2 [id]="headingId()">{{ title() }}</h2>
      <ng-content select="[sectionAside]" />
    </div>
    <div class="content">
      <ng-content />
    </div>
  `,
  styleUrl: 'section.css',
  host: {
    '[attr.id]': 'anchorId()',
    '[attr.aria-labelledby]': 'headingId()',
    role: 'region',
  },
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

  protected headingId = computed(() => `${this.anchorId()}-title`);
}
