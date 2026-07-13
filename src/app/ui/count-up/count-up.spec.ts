import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CountUp } from './count-up';

@Component({
  imports: [CountUp],
  template: `<span ngpCountUp>95%</span>`,
})
class HostComponent {}

/** IntersectionObserver stub that lets tests fire visibility manually. */
class FakeIntersectionObserver {
  static latest: FakeIntersectionObserver | undefined;
  readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    FakeIntersectionObserver.latest = this;
  }

  observe(): void {}
  disconnect(): void {}
  unobserve(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  intersect(): void {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('CountUp', () => {
  let fixture: ComponentFixture<HostComponent>;
  let reducedMotion = false;

  const render = async (): Promise<HTMLElement> => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable(); // flush afterNextRender
    return fixture.nativeElement.querySelector('span') as HTMLElement;
  };

  beforeEach(() => {
    reducedMotion = false;
    FakeIntersectionObserver.latest = undefined;
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({ matches: reducedMotion })),
    );
  });

  afterEach(() => {
    fixture?.destroy();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps the final value when reduced motion is preferred', async () => {
    reducedMotion = true;
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

    const span = await render();

    expect(span.textContent).toBe('95%');
    expect(FakeIntersectionObserver.latest).toBeUndefined();
  });

  it('keeps the final value when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    const span = await render();

    expect(span.textContent).toBe('95%');
  });

  it('counts from 0 to the final value with the suffix preserved', async () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    vi.spyOn(performance, 'now').mockReturnValue(0);

    // Run each frame synchronously, past the 1200ms duration on frame one.
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn().mockImplementation((cb: FrameRequestCallback) => {
        cb(5000);
        return 0;
      }),
    );

    const span = await render();
    expect(FakeIntersectionObserver.latest).toBeDefined();

    FakeIntersectionObserver.latest!.intersect();

    expect(span.textContent).toBe('95%');
  });
});
