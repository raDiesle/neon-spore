#!/usr/bin/env bun

/**
 * `bun run drop-sheet` — a moment of a PULL LAB pull, up close, with no browser.
 *
 * ```
 * bun run drop-sheet down                         every moment of AUTO's loop
 * bun run drop-sheet curve --at 2.2,2.3 --crop knob --size 400
 * bun run drop-sheet s --wait --at 0.4,1.35,2 --crop start
 * bun run drop-sheet down --looks out.png         a row per VERSUS look
 * ```
 *
 * `--at` is seconds of AUTO's loop, or with `--wait` seconds since the drop
 * came in with AUTO off and no thumb on it. `--crop knob` frames the knob where
 * it is drawn, `start` the path's first point, `wide` (the default) the
 * shape's whole travel; `--size` is a cell's width in pixels.
 *
 * Seven lanes between 10 and 12 October 2026 wrote a throwaway for this — a
 * Playwright script that stubbed `requestAnimationFrame`, a canvas inlined
 * into HTML, and five Skia scratch files driving `paintLab` — because the
 * EVERY LOOK sheet's cells are 150 px for a whole track and the hidden browser
 * pane pauses the lab's clock. This is the last of those, kept: the lab's own
 * frame (`drop-sheet-paint.ts`), at a fixed step from a fresh pull.
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { type DropCrop, dropSheet } from "./drop-sheet-paint.js";
import { MOMENTS } from "./src/pull-lab-moment.js";
import { LAB_SHAPES, type LabShape } from "./src/pull-lab-shapes.js";

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i < 0 ? undefined : argv[i + 1];
};
const has = (name: string): boolean => argv.includes(`--${name}`);
const valued = new Set(["--at", "--crop", "--size"]);
const words = argv.filter((a, i) => !a.startsWith("--") && !valued.has(argv[i - 1] ?? ""));

const named = words.find((w) => !w.endsWith(".png"))?.toLowerCase() ?? "down";
const shape: LabShape | undefined = LAB_SHAPES.find(
  (s) => s.key === named || s.label.toLowerCase() === named,
);
if (shape === undefined) {
  console.error(`no shape "${named}" — one of ${LAB_SHAPES.map((s) => s.key).join(", ")}`);
  process.exit(1);
}
const crop = (flag("crop") ?? "wide") as DropCrop;
if (!["knob", "start", "wide"].includes(crop)) {
  console.error(`--crop is knob, start or wide, not "${crop}"`);
  process.exit(1);
}
const wait = has("wait");
const at = flag("at")
  ?.split(",")
  .map(Number)
  .map((s) => ({ at: s, label: `${wait ? "WAITING " : ""}${s.toFixed(2)} s` }));
const fallback = wait
  ? [0.4, 0.8, 1.2, 1.35, 1.6, 2, 2.4, 3.2].map((s) => ({ at: s, label: `WAITING ${s} s` }))
  : MOMENTS;
const out = resolve(
  words.find((w) => w.endsWith(".png")) ?? `.claude/tmp/drop-sheet-${shape.key}.png`,
);

const png = dropSheet({
  shape,
  at: at ?? fallback,
  wait,
  crop,
  size: Number(flag("size") ?? (crop === "wide" ? 200 : 320)),
  looks: has("looks"),
});
await writeFile(out, png);
console.log(`${out} — ${(png.length / 1024).toFixed(0)} kB`);
