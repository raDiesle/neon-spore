#!/usr/bin/env bun

/**
 * `bun run sprite [name] [out.png]` — the sprite sheet: every sprite baked at
 * load (`packages/render/src/sprite-bake.ts`), its strips, and the shipped
 * drawing beside it at play size and magnified — then its costs, printed:
 *
 * - **code**: what the sprite adds to the game's bundle, minified and
 *   gzipped — the only bytes a baked sprite ships;
 * - **bake**: how long painting it at load took;
 * - **as a picture**: what its grey strips would weigh as PNG and as lossy
 *   WebP, had they been shipped instead of painted (`docs/raster.md`);
 * - **per draw**: canvas calls and microseconds for one shipped drawing and one
 *   baked, in headless Chromium — its software canvas, so the ratio is the
 *   reading, not the figure.
 *
 * The loop for authoring one: `.claude/skills/sprite`. A new sprite is an entry
 * in `src/sprite-demos.ts` and a row in `src/sprite-bytes.ts`, whose test
 * holds each sprite's code under 3 kB gzipped.
 */

import { resolve } from "node:path";
import { closeBrowser, launchBrowser } from "@neon-spore/frames/capture.js";
import { allSpriteBytes, BYTES, spriteBytes } from "./src/sprite-bytes.js";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const only = args.find((a) => !a.endsWith(".png"));
const out = resolve(
  args.find((a) => a.endsWith(".png")) ?? `.claude/tmp/sprite-${only ?? "sheet"}.png`,
);

const built = await Bun.build({
  entrypoints: [resolve(import.meta.dir, "src/sprite-page.ts")],
  target: "browser",
  format: "iife",
});
if (!built.success) {
  for (const log of built.logs) console.error(log);
  process.exit(1);
}
const script = await (built.outputs[0] as Blob).text();

interface Metrics {
  name: string;
  bakeMs: number;
  atlas: string;
  pngBytes: number;
  webpBytes: number;
  opsShipped: Record<string, number>;
  opsBaked: Record<string, number>;
  usShipped: number;
  usBaked: number;
}

const browser = await launchBrowser();
let metrics: Metrics[];
try {
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent("<!doctype html><meta charset=utf-8><title>sprite</title>");
  await page.addScriptTag({ content: `window.__only = ${JSON.stringify(only ?? "")};\n${script}` });
  const shot = await page.evaluate(() => {
    const w = window as unknown as { __sheet?: string; __metrics?: Metrics[] };
    return { url: w.__sheet, metrics: w.__metrics ?? [] };
  });
  if (!shot.url)
    throw new Error(`the page drew nothing${errors.length ? `: ${errors.join("; ")}` : ""}`);
  await Bun.write(out, Buffer.from(shot.url.slice(shot.url.indexOf(",") + 1), "base64"));
  metrics = shot.metrics;
} finally {
  await closeBrowser(browser);
}

const kb = (n: number): string => `${(n / 1024).toFixed(1)} kB`;
const total = (o: Record<string, number>): number => Object.values(o).reduce((s, n) => s + n, 0);
const top = (o: Record<string, number>): string =>
  Object.entries(o)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, n]) => `${k} ${n}`)
    .join(", ");

for (const m of metrics) {
  console.log(`\n${m.name}`);
  if (BYTES[m.name]) {
    const [min, gz] = await spriteBytes(m.name);
    console.log(`  code       +${min} B minified, +${gz} B gzipped (beside the shipped drawing)`);
  }
  console.log(`  bake       ${m.bakeMs.toFixed(1)} ms once, atlas ${m.atlas} px`);
  console.log(
    `  as picture ${kb(m.pngBytes)} PNG, ${kb(m.webpBytes)} WebP q85 — what painting it saves shipping`,
  );
  console.log(
    `  per draw   shipped ${total(m.opsShipped)} calls, ${m.usShipped.toFixed(1)} µs  (${top(m.opsShipped)})`,
  );
  console.log(
    `             baked   ${total(m.opsBaked)} calls, ${m.usBaked.toFixed(1)} µs  (${top(m.opsBaked)})`,
  );
}
if (metrics.length > 1) {
  const [min, gz] = await allSpriteBytes();
  console.log(
    `\nall together  +${min} B minified, +${gz} B gzipped (the shared baker counted once)`,
  );
}
console.log(`\n${out}`);
