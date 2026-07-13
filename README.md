# andreiparcheuski.com

Personal portfolio of **Andrei Parcheuski** — Senior Angular Developer (3D / WebGL).

**Live:** https://andreiparcheuski.com

## Stack

- **Angular 22** — zoneless, standalone components, signals, OnPush everywhere
- **SSR + prerender** via `@angular/ssr` (static output, deployed on Vercel)
- **CSS-first motion** — scroll-driven animations (`animation-timeline`) with
  `@supports` fallbacks, orchestrated hero entrance, View Transitions on theme
  toggle, `prefers-reduced-motion` respected globally
- **Vitest** unit tests via `@angular/build:unit-test`

## Highlights worth reading

- `src/app/ui/count-up/count-up.ts` — zoneless-safe count-up directive
  (IntersectionObserver + rAF, SSR renders final values for SEO)
- `src/app/layout/layout.css` — scroll progress bar and section reveals with
  zero JavaScript
- `src/app/core/theme.service.ts` — no-flash theme bootstrap + View Transitions

## Commands

| Task            | Command          |
| --------------- | ---------------- |
| Dev server      | `npm start`      |
| Production build| `npm run build`  |
| Unit tests      | `npm test`       |
| Format          | `npm run format:write` |

Content lives in `src/app/core/portfolio.data.ts`; the downloadable CV is
`public/cv.pdf`.
