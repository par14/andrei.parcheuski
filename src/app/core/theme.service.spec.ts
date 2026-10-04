import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let doc: Document;

  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({ matches: false })),
    );
    localStorage.clear();
    service = TestBed.inject(ThemeService);
    doc = TestBed.inject(DOCUMENT);
  });

  const mockViewTransition = () => {
    const startViewTransition = vi.fn((callback: () => void) => {
      callback();
      return {} as ViewTransition;
    });
    Object.defineProperty(doc, 'startViewTransition', {
      value: startViewTransition,
      configurable: true,
      writable: true,
    });
    return startViewTransition;
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(doc, 'startViewTransition');
  });

  it('defaults to the dark theme', () => {
    expect(service.currentTheme()).toBe('dark');
  });

  it('applies the theme to the DOM and persists it', () => {
    service.setTheme('light');

    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('light');
    expect(service.currentTheme()).toBe('light');
  });

  it('makes the browser UI colour follow the chosen theme', () => {
    const meta = doc.createElement('meta');
    meta.name = 'theme-color';
    meta.media = '(prefers-color-scheme: dark)';
    meta.content = '#141a21';
    doc.head.appendChild(meta);

    service.setTheme('light');
    expect(meta.content).toBe('#eeefea');
    expect(meta.hasAttribute('media')).toBe(false);
    meta.remove();
  });

  it('toggles between dark and light', () => {
    service.toggleTheme();
    expect(service.currentTheme()).toBe('light');

    service.toggleTheme();
    expect(service.currentTheme()).toBe('dark');
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('wraps the toggle in a View Transition when available', () => {
    const startViewTransition = mockViewTransition();

    service.toggleTheme();

    expect(startViewTransition).toHaveBeenCalledOnce();
    expect(service.currentTheme()).toBe('light');
  });

  it('skips the View Transition when reduced motion is preferred', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({ matches: true })),
    );
    const startViewTransition = mockViewTransition();

    service.toggleTheme();

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(service.currentTheme()).toBe('light');
  });
});
