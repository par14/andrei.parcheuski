import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ngp-skill',
  template: ` <span class="skill">{{ skill() }}</span> `,
  styleUrl: './skill.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillComponent {
  skill = input.required<string>();
}
