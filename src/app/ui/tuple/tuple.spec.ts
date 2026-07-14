import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { ContactComponent } from './tuple';

describe('ContactComponent (tuple)', () => {
  const create = (inputs: Record<string, unknown>): HTMLElement => {
    const fixture: ComponentFixture<ContactComponent> =
      TestBed.createComponent(ContactComponent);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('renders a safe external link when a URL is provided', () => {
    const el = create({
      heading: 'LinkedIn',
      body: 'andrewpar14',
      link: 'https://linkedin.com/in/andrewpar14',
    });

    const a = el.querySelector('a.body') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('https://linkedin.com/in/andrewpar14');
    expect(a.getAttribute('rel')).toContain('noopener');
    expect(a.textContent).toContain('andrewpar14');
  });

  it('renders plain text when no link is provided', () => {
    const el = create({ heading: 'Location', body: 'Warsaw, Poland' });

    expect(el.querySelector('a')).toBeNull();
    expect(el.querySelector('span.body')?.textContent).toContain(
      'Warsaw, Poland',
    );
  });

  it('keeps email links in the current browsing context', () => {
    const el = create({
      heading: 'Email',
      body: 'hello@example.com',
      link: 'mailto:hello@example.com',
    });

    const a = el.querySelector('a.body') as HTMLAnchorElement;
    expect(a.hasAttribute('target')).toBe(false);
    expect(a.getAttribute('aria-label')).toBe('Email: hello@example.com');
  });
});
