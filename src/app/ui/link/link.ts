import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

export interface NgpLink {
  text: string;
  link: string;
  description: string;
  /** Optional still for the featured layout. */
  image?: string;
}

@Component({
  selector: 'ngp-link',
  template: `
    <a
      class="link"
      [class.featured]="featured()"
      [href]="link().link"
      target="_blank"
      rel="noopener noreferrer"
    >
      @if (featured() && link().image) {
        <span class="media">
          <img
            [src]="link().image"
            alt=""
            width="1200"
            height="900"
            loading="lazy"
            decoding="async"
          />
        </span>
      }
      <span class="text">
        <span class="title">{{ link().text }}</span>
        <span class="description">{{ link().description }}</span>
      </span>
      <span class="arrow" aria-hidden="true">↗</span>
      <span class="visually-hidden">(opens in a new tab)</span>
    </a>
  `,
  styleUrl: './link.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  link = input.required<NgpLink>();
  /** Large card with an image; otherwise a compact row. */
  featured = input(false, { transform: booleanAttribute });
}
