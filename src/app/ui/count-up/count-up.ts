import { afterNextRender, DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * Animates the numeric part of the host's text content (e.g. "11+", "95%", "30")
 * from 0 to its final value the first time the element scrolls into view.
 *
 * - Browser-only: `afterNextRender` never fires during SSR/prerender, so the
 *   server-rendered HTML always contains the final value (SEO-safe).
 * - Zoneless-safe: writes straight to the DOM inside requestAnimationFrame,
 *   no change detection involved.
 * - Respects `prefers-reduced-motion` and missing IntersectionObserver by
 *   leaving the final value untouched.
 */
@Directive({ selector: '[ngpCountUp]' })
export class CountUp {
  #el = inject<ElementRef<HTMLElement>>(ElementRef);
  #destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => this.#init());
  }

  #init(): void {
    const host = this.#el.nativeElement;
    const original = host.textContent?.trim() ?? '';
    const match = original.match(/^(\D*?)(\d+)(\D*)$/);
    if (!match) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) return;

    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits, 10);
    const duration = 1200;

    let frameId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number): void => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          host.textContent = `${prefix}${Math.round(eased * target)}${suffix}`;
          if (progress < 1) frameId = requestAnimationFrame(tick);
        };

        host.textContent = `${prefix}0${suffix}`;
        frameId = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    observer.observe(host);
    this.#destroyRef.onDestroy(() => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    });
  }
}
