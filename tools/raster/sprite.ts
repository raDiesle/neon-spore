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
 * in `src/sprite-demos.ts` and a row in `BYTES` below.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { closeBrowser, launchBrowser } from "@neon-spore/frames/capture.js";

/** Per sprite: the shipped drawing's module and export, and the baked one's. */
const BYTES: Record<string, { shipped: [string, string]; baked: [string, string] }> = {
  "instar-egg": {
    shipped: ["instar-eggs.ts", "drawEgg"],
    baked: ["instar-egg-baked.ts", "drawBakedEgg"],
  },
  "instar-nest": {
    shipped: ["instar-eggs.ts", "drawNests"],
    baked: ["instar-nest-baked.ts", "drawBakedNests"],
  },
};

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const only = args.find((a) => !a.endsWith(".png"));
const out = resolve(
  args.find((a) => a.endsWith(".png")) ?? `.claude/tmp/sprite-${only ?? "sheet"}.png`,
);
const src = resolve(import.meta.dir, "../../packages/render/src");

/** Minified and gzipped bytes of a bundle that uses `uses`, render's own imports included. */
async function weigh(dir: string, uses: [string, string][]): Promise<[number, number]> {
  const entry = join(dir, `e${Math.random().toString(36).slice(2)}.ts`);
  const lines = uses.map(
    ([file, name], i) => `import { ${name} as u${i} } from "${join(src, file)}";`,
  );
  await Bun.write(
    entry,
    `${lines.join("\n")}\n(globalThis as any).__u = [${uses.map((_, i) => `u${i}`).join(", ")}];\n`,
  );
  const built = await Bun.build({ entrypoints: [entry], target: "browser", minify: true });
  if (!built.success) throw new Error(built.logs.join("\n"));
  const text = await (built.outputs[0] as Blob).text();
  return [text.length, Bun.gzipSync(text).length];
}

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

const dir = await mkdtemp(join(tmpdir(), "sprite-"));
try {
  for (const m of metrics) {
    console.log(`\n${m.name}`);
    const pair = BYTES[m.name];
    if (pair) {
      const [minS, gzS] = await weigh(dir, [pair.shipped]);
      const [minB, gzB] = await weigh(dir, [pair.shipped, pair.baked]);
      console.log(
        `  code       +${minB - minS} B minified, +${gzB - gzS} B gzipped (beside the shipped drawing)`,
      );
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
} finally {
  await rm(dir, { recursive: true, force: true });
}
console.log(`\n${out}`);
