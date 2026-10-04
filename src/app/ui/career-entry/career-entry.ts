import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'ngp-career-entry',
  template: `
    <p class="when">
      <span class="start">{{ startYear() }}</span>
      <span class="end">– {{ endYear() ?? 'Present' }}</span>
    </p>
    <div class="body">
      <h3 class="role">{{ role() }}</h3>
      <p class="where">
        <span>{{ company() }}</span>
        <span>{{ location() }}</span>
      </p>
      @if (description()) {
        <p class="description">{{ description() }}</p>
      }
      @if (emphasized().length) {
        <ul class="achievements">
          @for (achievement of emphasized(); track $index) {
            <li [innerHTML]="achievement"></li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: 'career-entry.css',
  host: { '[class.current]': 'endYear() === undefined' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerEntry {
  company = input.required<string>();
  location = input.required<string>();
  startYear = input.required<number>();
  endYear = input<number>();
  role = input.required<string>();
  description = input<string>();
  achievements = input<string[]>([]);

  /** Achievements with numbers highlighted — computed once, not on every CD cycle. */
  protected readonly emphasized = computed(() =>
    this.achievements().map((achievement) => this.#emphasize(achievement)),
  );

  /** Escapes the text, then wraps standalone numbers/percentages in <strong> for skimmability. */
  #emphasize(text: string): string {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(
      /(?<![A-Za-z])(\d[\d,.]*\+?%?)(?![A-Za-z])/g,
      '<strong>$1</strong>',
    );
  }
}
