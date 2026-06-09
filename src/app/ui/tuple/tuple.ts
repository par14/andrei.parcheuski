import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {LowerCasePipe} from '@angular/common';

@Component({
  selector: 'ngp-tuple',
  template: `
    <div class="tuple-container" [class.clickable]="link()">
      <div class="content">
        <span class="heading" id="heading-{{ heading() | lowercase }}">{{ heading() }}</span>
        @if (link()) {
          <a
            [href]="link()"
            class="body"
            target="_blank"
            rel="noopener noreferrer"
            [attr.aria-labelledby]="'heading-' + (heading() | lowercase)"
            [attr.aria-label]="heading() + ': ' + body() + ' (opens in a new tab)'"
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
  imports: [
    LowerCasePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent {
  heading = input.required<string>();
  body = input.required<string>();
  link = input<string>('');
}
