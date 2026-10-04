import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HERO_RUNTIME_FACTORY, HeroScene } from './hero-scene';
import { HeroRuntime } from './hero-scene.runtime';

/** jsdom has no WebGL: the real runtime is replaced with a recording fake. */
function fakeRuntime(): HeroRuntime {
  return {
    resize: vi.fn(),
    configure: vi.fn(),
    setPointer: vi.fn(),
    setScroll: vi.fn(),
    hitTest: vi.fn(() => true),
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
    fixture.componentRef.setInput('finish', 'ultramarine');
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
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
      expect(el.getAttribute('data-state')).toBe('on');
      expect(runtime.configure).toHaveBeenLastCalledWith({
        theme: 'dark',
        finish: 'ultramarine',
        exploded: false,
      });

      fixture.componentRef.setInput('finish', 'amber');
      fixture.componentRef.setInput('exploded', true);
      fixture.componentRef.setInput('theme', 'light');
      await fixture.whenStable();
      expect(runtime.configure).toHaveBeenLastCalledWith({
        theme: 'light',
        finish: 'amber',
        exploded: true,
      });
    });

    it('emits modelClick only when the click hits the model', async () => {
      const el = await create();
      const clicks = vi.fn();
      fixture.componentInstance.modelClick.subscribe(clicks);
      const canvas = el.querySelector('canvas') as HTMLCanvasElement;

      canvas.dispatchEvent(new MouseEvent('click', { clientX: 1, clientY: 1 }));
      expect(clicks).toHaveBeenCalledOnce();

      vi.mocked(runtime.hitTest).mockReturnValue(false);
      canvas.dispatchEvent(new MouseEvent('click', { clientX: 1, clientY: 1 }));
      expect(clicks).toHaveBeenCalledOnce();
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
