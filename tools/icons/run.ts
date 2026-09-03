#!/usr/bin/env bun

/**
 * `bun run icons` — the home-screen icons, from `apps/game/icon.svg`.
 *
 * A manifest names PNGs at fixed pixel sizes and a phone will not take an SVG
 * for them, so the one drawing is rasterised rather than kept in four hand-made
 * copies that drift. It borrows the headless Chrome `tools/frames/capture.ts`
 * already depends on, for the same reason `tools/frames/svg.ts` does: one more
 * image library to open a file we can simply open would be a dependency bought
 * for twenty lines.
 *
 * The maskable one is the same drawing inside a safe zone. Android crops an
 * icon to whatever shape the launcher is using — a circle, a squircle, a
 * rounded square — and anything outside the middle 80% is the launcher's to cut
 * off. Drawing at 72% of the frame means the cut never reaches the body.
 */

import { findChrome } from "@neon-spore/frames/capture.js";
import { chromium } from "playwright-core";

interface Target {
  file: string;
  size: number;
  /** How much of the frame the drawing fills. Below 1 leaves a launcher's crop room. */
  fill: number;
}

const TARGETS: Target[] = [
  { file: "icon-192.png", size: 192, fill: 1 },
  { file: "icon-512.png", size: 512, fill: 1 },
  { file: "icon-maskable.png", size: 512, fill: 0.72 },
  // iOS names its own and masks it itself, so this one is square and full.
  { file: "apple-touch-icon.png", size: 180, fill: 1 },
];

/** The field's own black, behind the crop room a maskable icon leaves. */
const GROUND = "#07060f";

const here = new URL("./", import.meta.url);
const source = Bun.fileURLToPath(new URL("../../apps/game/icon.svg", here));
const outDir = Bun.fileURLToPath(new URL("../../apps/game/public/", here));

const svg = await Bun.file(source).text();
if (!svg.includes("<svg")) throw new Error(`${source} has no <svg> in it`);

const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  for (const target of TARGETS) {
    const inner = Math.round(target.size * target.fill);
    await page.setContent(
      `<body style="margin:0">
         <div id="frame" style="width:${target.size}px;height:${target.size}px;
              background:${GROUND};display:grid;place-items:center">
           <div style="width:${inner}px;height:${inner}px;line-height:0">
             ${svg.replace(/width="512" height="512"/, 'width="100%" height="100%"')}
           </div>
         </div>
       </body>`,
      { waitUntil: "load" },
    );
    const frame = await page.$("#frame");
    if (!frame) throw new Error("the frame did not render");
    const out = `${outDir}${target.file}`;
    await frame.screenshot({ path: out });
    console.log(`icon ${target.size}px${target.fill < 1 ? " maskable" : ""}: ${out}`);
  }
} finally {
  await browser.close();
}
