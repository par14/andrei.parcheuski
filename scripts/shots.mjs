// Visual check: screenshots of the built site in both themes at three
// viewports. Output goes to tmp/shots/ (gitignored).
//   npm run shots       -> build + shoot
//   npm run shots:only  -> shoot the existing build
//   MOTION=1 npm run shots:only -> keep animations (inspect the 3D scene)
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium, devices } from "@playwright/test";

const PORT = 4173;
const URL = `http://localhost:${PORT}/`;
const OUT = "tmp/shots";
const SECTIONS = ["about", "experience", "skills", "projects", "contact"];
const VIEWPORTS = {
  mobile: devices["iPhone 13"],
  tablet: { viewport: { width: 768, height: 1024 } },
  desktop: { viewport: { width: 1440, height: 900 } },
};
const THEMES = ["dark", "light"];
const only = process.env.ONLY?.split(",");

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(URL)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server did not start on ${URL}`);
}

mkdirSync(OUT, { recursive: true });
const server = spawn(
  "npx",
  ["serve", "-s", "dist/ng-portfolio/browser", "-l", String(PORT)],
  { stdio: "ignore" },
);

let browser;
try {
  await waitForServer();
  // System Chrome: Playwright's bundled browser download is not required.
  browser = await chromium.launch({
    channel: "chrome",
    args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
  });

  for (const [vp, device] of Object.entries(VIEWPORTS)) {
    if (only && !only.includes(vp)) continue;
    for (const theme of THEMES) {
      const context = await browser.newContext({
        ...device,
        reducedMotion: process.env.MOTION ? "no-preference" : "reduce",
      });
      await context.addInitScript((t) => {
        localStorage.setItem("portfolio-theme", t);
      }, theme);
      const page = await context.newPage();
      page.on("pageerror", (e) => console.error(`[${vp}/${theme}]`, e.message));
      await page.goto(URL, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      // The WebGL scene loads on idle; wait until it is running or gave up.
      await page
        .waitForSelector(
          'ngp-hero-scene[data-state="on"], ngp-hero-scene[data-state="off"]',
          { timeout: 10000 },
        )
        .catch(() => console.warn(`[${vp}/${theme}] hero scene not ready`));
      await page.waitForTimeout(1500);

      const base = `${OUT}/${theme}-${vp}`;
      await page.screenshot({ path: `${base}-top.png` });
      await page.screenshot({ path: `${base}-full.png`, fullPage: true });
      for (const id of SECTIONS) {
        const el = page.locator(`#${id}`);
        if (!(await el.count())) continue;
        await el.evaluate((n) => n.scrollIntoView({ block: "start" }));
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${base}-${id}.png` });
      }
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (overflow > 0)
        console.warn(`[${vp}/${theme}] horizontal overflow: ${overflow}px`);
      await context.close();
    }
  }
  console.log(`Screenshots saved to ${OUT}/`);
} finally {
  await browser?.close();
  server.kill();
}
