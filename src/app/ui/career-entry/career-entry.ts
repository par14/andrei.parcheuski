import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ngp-career-entry',
  template: `
    <h4 class="role">{{ role() }}</h4>
    <div class="heading">
      <span>{{ company() }} ● </span>
      <span>{{ location() }} ●</span>
      <span>{{ timespan() }}</span>
    </div>
    @if (description()) {
      <span class="description">
        {{ description() }}
      </span>
    }
    @if (achievements().length) {
      <ul class="achievements">
        @for (achievement of achievements(); track $index) {
          <li>{{ achievement }}</li>
        }
      </ul>
    }
  `,
  styleUrl: 'career-entry.css',
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

  timespan = computed(() => {
    const end = this.endYear();
    return `${this.startYear()} - ${end ?? 'Present'}`;
  });
}
