# andreiparcheuski.com

Personal portfolio of **Andrei Parcheuski** — Senior Angular Developer (3D / WebGL).

**Live:** https://andreiparcheuski.com

## Stack

- **Angular 22** — zoneless, standalone components, signals, OnPush everywhere
- **SSR + prerender** via `@angular/ssr` (static output, deployed on Vercel)
- **WebGL hero** — a configurable three.js product shot (finish swatches,
  exploded view) loaded via `@defer (on idle)`, so `three` ships in a lazy
  chunk; falls back to a still image without WebGL or with Save-Data
- **CSS-first motion** — scroll-driven progress bar and section reveals,
  one orchestrated hero entrance, circular View Transition on theme toggle,
  `prefers-reduced-motion` respected globally (the 3D scene renders a static
  frame)
- **Vitest** unit tests via `@angular/build:unit-test`

## Highlights worth reading

- `src/app/ui/hero-scene/hero-scene.runtime.ts` — the studio scene: plain
  three.js, frame-rate independent easing, disposes everything it creates
- `src/app/ui/hero-scene/hero-scene.ts` — zoneless rAF loop that pauses when
  the tab is hidden or the hero is off-screen; WebGL feature detection
- `src/app/ui/count-up/count-up.ts` — zoneless-safe count-up directive
  (IntersectionObserver + rAF, SSR renders final values for SEO)
- `src/app/core/theme.service.ts` — no-flash theme bootstrap + View Transitions

## Design

One typeface (Instrument Sans, self-hosted), a graphite / paper palette with a
single ultramarine accent for interactive elements, and green reserved for the
availability status. Tokens live in `src/styles.css`.

## Commands

| Task             | Command                |
| ---------------- | ---------------------- |
| Dev server       | `npm start`            |
| Production build | `npm run build`        |
| Unit tests       | `npm test`             |
| Format           | `npm run format:write` |
| Screenshots      | `npm run shots`        |

`npm run shots` builds the site and captures both themes at mobile, tablet
and desktop sizes into `tmp/shots/` (uses the system Chrome). The 3D stills
and `og-image.png` are regenerated with `node scripts/render-stills.mjs`
after a build (needs `cwebp`).

Content lives in `src/app/core/portfolio.data.ts`; the downloadable CV is
`public/cv.pdf`. Its reproducible source is `scripts/generate_cv.py`:

```bash
python3 -m pip install -r scripts/requirements.txt
python3 scripts/generate_cv.py
```
