import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HERO_RUNTIME_FACTORY, HeroScene } from './hero-scene';
import { HeroRuntime } from './hero-scene.runtime';

/** jsdom has no WebGL: the real runtime is replaced with a recording fake. */
function fakeRuntime(ready: Promise<void> = Promise.resolve()): HeroRuntime {
  return {
    ready,
    resize: vi.fn(),
    configure: vi.fn(),
    setPointer: vi.fn(),
    setScroll: vi.fn(),
    rotateBy: vi.fn(),
    render: vi.fn(() => false),
    dispose: vi.fn(),
  };
}

class FakeObserver {
  static instances: FakeObserver[] = [];
  observe = vi.fn();
  disconnect = vi.fn();
  constructor() {
    FakeObserver.instances.push(this);
  }
}

describe('HeroScene', () => {
  let fixture: ComponentFixture<HeroScene>;
  let factory: ReturnType<typeof vi.fn>;
  let runtime: HeroRuntime;

  async function create(): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [{ provide: HERO_RUNTIME_FACTORY, useValue: factory }],
    });
    fixture = TestBed.createComponent(HeroScene);
    fixture.componentRef.setInput('theme', 'dark');
    fixture.componentRef.setInput('finish', 'navy');
    fixture.detectChanges();
    await flush();
    return fixture.nativeElement as HTMLElement;
  }

  /** Lets `runtime.ready` callbacks run, then renders. */
  async function flush(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  beforeEach(() => {
    runtime = fakeRuntime();
    factory = vi.fn(() => runtime);
    FakeObserver.instances = [];
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({ matches: false })),
    );
    vi.stubGlobal('ResizeObserver', FakeObserver);
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stays off without WebGL 2 and never builds the scene', async () => {
    const el = await create();
    expect(factory).not.toHaveBeenCalled();
    expect(el.getAttribute('data-state')).toBe('off');
  });

  describe('with WebGL 2', () => {
    beforeEach(() => {
      vi.stubGlobal('WebGL2RenderingContext', class {});
      // canRenderScene() probes for a real context; jsdom has none.
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
        getExtension: () => null,
      } as unknown as RenderingContext);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('stays off when the visitor asked to save data', async () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        connection: { saveData: true },
      });
      const el = await create();
      expect(factory).not.toHaveBeenCalled();
      expect(el.getAttribute('data-state')).toBe('off');
    });

    it('stays off when no hardware WebGL 2 context can be created', async () => {
      vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
      const el = await create();
      expect(factory).not.toHaveBeenCalled();
      expect(el.getAttribute('data-state')).toBe('off');
    });

    it('stays off when the renderer cannot be created', async () => {
      factory.mockImplementation(() => {
        throw new Error('Error creating WebGL context.');
      });
      const el = await create();
      expect(el.getAttribute('data-state')).toBe('off');
    });

    it('builds the scene and forwards inputs as scene config', async () => {
      const el = await create();
      expect(factory).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), {
        modelUrl: 'models/sofa.glb',
        reducedMotion: false,
      });
      expect(el.getAttribute('data-state')).toBe('on');
      expect(runtime.configure).toHaveBeenLastCalledWith({
        theme: 'dark',
        finish: 'navy',
      });

      fixture.componentRef.setInput('finish', 'champagne');
      fixture.componentRef.setInput('theme', 'light');
      await fixture.whenStable();
      expect(runtime.configure).toHaveBeenLastCalledWith({
        theme: 'light',
        finish: 'champagne',
      });
    });

    it('stays idle until the model loads, then turns on', async () => {
      let resolve!: () => void;
      runtime = fakeRuntime(new Promise<void>((r) => (resolve = r)));
      factory.mockImplementation(() => runtime);
      const el = await create();
      expect(el.getAttribute('data-state')).toBe('idle');

      resolve();
      await flush();
      expect(el.getAttribute('data-state')).toBe('on');
    });

    it('falls back when the model fails to load', async () => {
      runtime = fakeRuntime(Promise.reject(new Error('404')));
      factory.mockImplementation(() => runtime);
      const el = await create();
      await fixture.whenStable();
      expect(el.getAttribute('data-state')).toBe('off');
      expect(runtime.dispose).toHaveBeenCalled();
    });

    it('turns the product one step per rotate press', async () => {
      await create();
      fixture.componentRef.setInput('turns', 2);
      await fixture.whenStable();
      expect(runtime.rotateBy).toHaveBeenCalledWith((2 * Math.PI) / 3);
    });

    it('shows the fallback on context loss and rebuilds on restore', async () => {
      const el = await create();
      const canvas = el.querySelector('canvas') as HTMLCanvasElement;
      const first = runtime;

      canvas.dispatchEvent(new Event('webglcontextlost'));
      fixture.detectChanges();
      expect(el.getAttribute('data-state')).toBe('off');

      runtime = fakeRuntime();
      factory.mockImplementation(() => runtime);
      canvas.dispatchEvent(new Event('webglcontextrestored'));
      await fixture.whenStable();

      expect(first.dispose).toHaveBeenCalledWith({ loseContext: false });
      expect(factory).toHaveBeenCalledTimes(2);
      expect(el.getAttribute('data-state')).toBe('on');
      expect(runtime.configure).toHaveBeenCalled();
    });

    it('releases GPU resources and observers on destroy', async () => {
      await create();
      fixture.destroy();
      expect(runtime.dispose).toHaveBeenCalledOnce();
      expect(FakeObserver.instances).toHaveLength(2);
      FakeObserver.instances.forEach((observer) =>
        expect(observer.disconnect).toHaveBeenCalled(),
      );
    });
  });
});
