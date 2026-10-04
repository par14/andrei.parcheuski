import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PORTFOLIO_DATA } from '../core/portfolio.data';
import { CareerEntry } from '../ui/career-entry/career-entry';
import { Hero } from '../ui/hero/hero';
import { Highlights } from '../ui/highlights/highlights';
import { Language } from '../ui/language/language';
import { Languages } from '../ui/language/languages';
import { LinkComponent } from '../ui/link/link';
import { Section } from '../ui/section/section';
import { SkillComponent } from '../ui/skills/skill';
import { SkillsComponent } from '../ui/skills/skills';
import { ContactComponent } from '../ui/tuple/tuple';
import { Footer } from './footer/footer';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'layout',
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  imports: [
    HeaderComponent,
    Hero,
    Highlights,
    Section,
    CareerEntry,
    SkillsComponent,
    SkillComponent,
    LinkComponent,
    ContactComponent,
    Footer,
    Languages,
    Language,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  protected readonly data = PORTFOLIO_DATA;
  protected readonly featuredProject = PORTFOLIO_DATA.links.find(
    (link) => link.image,
  );
  protected readonly otherProjects = PORTFOLIO_DATA.links.filter(
    (link) => link !== this.featuredProject,
  );
}
