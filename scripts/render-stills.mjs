// Renders still images of the hero model from the built site:
//   public/stills/sofa.webp          poster when WebGL is unavailable
//   public/stills/sofa-feature.webp  featured project card
//   public/og-image.png              social preview (1200×630)
// Usage: ng build && node scripts/render-stills.mjs   (needs `cwebp`)
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const PORT = 4174;
const ORIGIN = `http://localhost:${PORT}`;

const STILLS = [
  { file: "public/stills/sofa.webp", finish: "Navy velvet", turns: 0 },
  {
    file: "public/stills/sofa-feature.webp",
    finish: "Champagne velvet",
    turns: 1,
  },
];

async function waitForServer() {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(ORIGIN)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Static server did not start");
}

/** Crops transparent margins (keeps a little air); returns PNG or WebP. */
async function trim(page, png, padding = 0.06) {
  const dataUrl = await page.evaluate(
    async ({ src, padding }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, img.width, img.height);
      let [x0, y0, x1, y1] = [img.width, img.height, 0, 0];
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          if (data[(y * img.width + x) * 4 + 3] > 6) {
            x0 = Math.min(x0, x);
            y0 = Math.min(y0, y);
            x1 = Math.max(x1, x);
            y1 = Math.max(y1, y);
          }
        }
      }
      const pad = Math.round(Math.max(x1 - x0, y1 - y0) * padding);
      x0 = Math.max(0, x0 - pad);
      y0 = Math.max(0, y0 - pad);
      x1 = Math.min(img.width, x1 + pad);
      y1 = Math.min(img.height, y1 + pad);
      const out = document.createElement("canvas");
      out.width = x1 - x0;
      out.height = y1 - y0;
      out.getContext("2d").drawImage(canvas, -x0, -y0);
      return out.toDataURL("image/png");
    },
    { src: `data:image/png;base64,${png.toString("base64")}`, padding },
  );
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

async function renderStill(browser, { finish, turns }) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce", // snaps to the final pose, no idle sway
  });
  await context.addInitScript(() =>
    localStorage.setItem("portfolio-theme", "dark"),
  );
  const page = await context.newPage();
  await page.goto(ORIGIN, { waitUntil: "networkidle" });
  await page.waitForSelector('ngp-hero-scene[data-state="on"]');
  await page.getByRole("button", { name: finish }).click();
  for (let i = 0; i < turns; i++) {
    await page.getByRole("button", { name: "Rotate the sofa" }).click();
  }
  await page.addStyleTag({
    content: `html, body, .stage { background: transparent !important; }
      .configurator, .caption { display: none !important; }`,
  });
  await page.waitForTimeout(500);
  const png = await page
    .locator("ngp-hero-scene canvas")
    .screenshot({ omitBackground: true });
  const trimmed = await trim(page, png);
  await context.close();
  return trimmed;
}

async function renderOgImage(browser, still) {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
  });
  const page = await context.newPage();
  await page.route(`${ORIGIN}/__og`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><style>
        @font-face { font-family: "Instrument Sans"; font-weight: 400 700;
          src: url("/fonts/instrument-sans-var-latin.woff2") format("woff2"); }
        * { margin: 0; box-sizing: border-box; }
        body { width: 1200px; height: 630px; display: grid;
          grid-template-columns: 1fr 1fr; align-items: center; gap: 24px;
          padding: 0 72px; font-family: "Instrument Sans", sans-serif;
          color: #eceef1;
          background: radial-gradient(50% 70% at 76% 50%, #24303e, transparent 72%), #141a21; }
        .meta { color: #9aa4b2; font-size: 22px; }
        h1 { margin-top: 20px; font-size: 92px; font-weight: 600;
          line-height: .94; letter-spacing: -0.025em; }
        p.role { margin-top: 28px; font-size: 30px; font-weight: 500; }
        img { width: 100%; }
      </style></head><body>
        <div>
          <p class="meta">andreiparcheuski.com</p>
          <h1>Andrei<br>Parcheuski</h1>
          <p class="role">Senior Angular Developer<br>3D / WebGL</p>
        </div>
        <img src="data:image/png;base64,${still.toString("base64")}" alt="">
      </body></html>`,
    }),
  );
  await page.goto(`${ORIGIN}/__og`);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await context.close();
  return png;
}

mkdirSync("public/stills", { recursive: true });
mkdirSync("tmp/stills", { recursive: true });
const server = spawn(
  "npx",
  ["serve", "-s", "dist/ng-portfolio/browser", "-l", String(PORT)],
  { stdio: "ignore" },
);
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    channel: "chrome",
    args: ["--enable-unsafe-swiftshader"],
  });
  const rendered = [];
  for (const still of STILLS) {
    const png = await renderStill(browser, still);
    const tmp = still.file.replace(/^public/, "tmp").replace(/webp$/, "png");
    writeFileSync(tmp, png);
    execFileSync("cwebp", [
      "-quiet",
      "-q",
      "86",
      "-alpha_q",
      "90",
      tmp,
      "-o",
      still.file,
    ]);
    rendered.push(png);
    console.log(`wrote ${still.file}`);
  }
  writeFileSync(
    "public/og-image.png",
    await renderOgImage(browser, rendered[0]),
  );
  console.log("wrote public/og-image.png");
} finally {
  await browser?.close();
  server.kill();
}
