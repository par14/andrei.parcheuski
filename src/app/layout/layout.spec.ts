import {
  ComponentFixture,
  DeferBlockBehavior,
  TestBed,
} from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PORTFOLIO_DATA } from '../core/portfolio.data';
import { Layout } from './layout';

/** Full-page smoke test: the whole portfolio renders from data. */
describe('Layout (smoke)', () => {
  let fixture: ComponentFixture<Layout>;
  let el: HTMLElement;

  beforeEach(async () => {
    // jsdom has no matchMedia / IntersectionObserver; the CountUp directive
    // must degrade gracefully behind these stubs.
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({ matches: false })),
    );
    // Never load the WebGL hero scene (and `three`) in jsdom.
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
    });
    fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
  });

  it('renders the hero with name and role', () => {
    expect(el.querySelector('h1')?.textContent).toContain('Andrei');
    expect(el.querySelector('h1')?.textContent).toContain('Parcheuski');
    expect(el.querySelector('.role')?.textContent).toContain(
      'Senior Angular Developer',
    );
  });

  it('renders every content section', () => {
    const titles = Array.from(el.querySelectorAll('ngp-section h2')).map((h) =>
      h.textContent?.trim(),
    );
    expect(titles).toEqual([
      'About',
      'Experience',
      'Education',
      'Skills',
      'Languages',
      'Projects',
      'Contact',
    ]);
  });

  it('renders all career and education entries from data', () => {
    const expected =
      PORTFOLIO_DATA.careerEntries.length + PORTFOLIO_DATA.education.length;
    expect(el.querySelectorAll('ngp-career-entry').length).toBe(expected);
  });

  it('renders all highlights with final values (no-JS safety)', () => {
    const values = Array.from(el.querySelectorAll('.highlight-value')).map(
      (v) => v.textContent?.trim(),
    );
    expect(values).toEqual(PORTFOLIO_DATA.highlights.map((h) => h.value));
  });

  it('offers the CV download in the header', () => {
    const cv = el.querySelector('a[href="/cv.pdf"]');
    expect(cv).not.toBeNull();
    expect(cv?.hasAttribute('download')).toBe(true);
  });

  it('shows the career span up to the current year', () => {
    const span = `${PORTFOLIO_DATA.experienceOverview.startYear}–${new Date().getFullYear()}`;
    expect(el.querySelector('ngp-hero .meta')?.textContent).toContain(span);
  });

  it('renders the 3D configurator controls without loading the scene', () => {
    const swatches = el.querySelectorAll('.configurator .swatch');
    expect(swatches.length).toBe(3);
    expect(swatches[0].getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('ngp-hero-scene')).toBeNull();
  });

  it('features the first project with an image', () => {
    expect(el.querySelectorAll('ngp-link .featured').length).toBe(1);
    expect(el.querySelectorAll('ngp-link').length).toBe(
      PORTFOLIO_DATA.links.length,
    );
  });
});
