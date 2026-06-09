import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface NgpLink {
  text: string;
  link: string;
  description?: string;
}

@Component({
  selector: 'ngp-link',
  template: `
    <a
      class="link"
      [href]="link().link"
      target="_blank"
      rel="noopener noreferrer"
      [attr.aria-label]="link().text + ' - ' + link().description + ' (opens in a new tab)'"
    >
      <span class="link-text">{{ link().text }}</span>
      <span class="link-description">{{ link().description }}</span>
    </a>
  `,
  styleUrl: './link.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  link = input.required<NgpLink>();
}
