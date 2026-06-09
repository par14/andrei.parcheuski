import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ngp-skills',
  template: ` <ng-content select="ngp-skill" /> `,
  styleUrl: './skills.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {}
