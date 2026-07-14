import { TestBed, ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { CareerEntry } from './career-entry';

describe('CareerEntry', () => {
  let fixture: ComponentFixture<CareerEntry>;

  const create = (inputs: Record<string, unknown>): HTMLElement => {
    fixture = TestBed.createComponent(CareerEntry);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  const baseInputs = {
    company: '3D Source',
    location: 'Warsaw, Poland',
    startYear: 2023,
    role: 'Senior Front-End Developer',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CareerEntry] });
  });

  it('renders role, company and an open-ended timespan', () => {
    const el = create(baseInputs);

    expect(el.querySelector('.role')?.textContent).toContain(
      'Senior Front-End Developer',
    );
    expect(el.textContent).toContain('3D Source');
    expect(el.textContent).toContain('2023 - Present');
  });

  it('renders a closed timespan when endYear is set', () => {
    const el = create({ ...baseInputs, endYear: 2025 });

    expect(el.textContent).toContain('2023 - 2025');
  });

  it('wraps standalone numbers and percentages in <strong>', () => {
    const el = create({
      ...baseInputs,
      achievements: ['Reached 95% test coverage across 30 projects.'],
    });

    const li = el.querySelector('.achievements li') as HTMLElement;
    const emphasized = Array.from(li.querySelectorAll('strong')).map(
      (node) => node.textContent,
    );
    expect(emphasized).toEqual(['95%', '30']);
  });

  it('does not emphasize numbers glued to words and escapes HTML', () => {
    const el = create({
      ...baseInputs,
      achievements: ['Migrated to Angular2 with <b>zero</b> downtime'],
    });

    const li = el.querySelector('.achievements li') as HTMLElement;
    expect(li.querySelector('strong')).toBeNull();
    expect(li.querySelector('b')).toBeNull(); // markup rendered as text, not HTML
    expect(li.textContent).toContain('Angular2');
    expect(li.textContent).toContain('<b>zero</b>');
  });
});
