import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ngp-tuple',
  template: `
    <div class="tuple-container">
      <div class="content">
        <span class="heading">{{ heading() }}</span>
        @if (link()) {
          <a
            [href]="link()"
            class="body"
            [attr.target]="isExternalLink() ? '_blank' : null"
            [attr.rel]="isExternalLink() ? 'noopener noreferrer' : null"
            [attr.aria-label]="heading() + ': ' + body() + externalLinkSuffix()"
          >
            {{ body() }}
          </a>
        } @else {
          <span class="body">{{ body() }}</span>
        }
      </div>
    </div>
  `,
  styleUrl: './tuple.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  heading = input.required<string>();
  body = input.required<string>();
  link = input<string>('');

  protected isExternalLink(): boolean {
    return /^https?:\/\//i.test(this.link());
  }

  protected externalLinkSuffix(): string {
    return this.isExternalLink() ? ' (opens in a new tab)' : '';
  }
}
