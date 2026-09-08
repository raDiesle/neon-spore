#!/usr/bin/env bun

/**
 * `bun run style-guide` — the specimen sheet for `docs/style-guide.md`.
 *
 * Every panel is drawn out of the values the game draws with: `PALETTE`,
 * `STROKE`, and the contours in `packages/content/src/silhouettes.ts` through
 * `livingPath`. Nothing here is a picture *of* the style — it is the style,
 * run once at a size an eye can read.
 *
 * That is the reason it is generated rather than hand-drawn. A hand-made style
 * guide is a promise about the code, and the promise goes stale on the first
 * commit nobody remembered it. This one cannot: a colour added to the palette
 * fails `test/style-guide.test.ts` until it has a place on the sheet, and a
 * contour that moves moves here too.
 *
 * It draws nothing that is not already on the field, so it is a tool and not a
 * look (`docs/looks.md`).
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { colourHeight, colourPanel, DIAL_HEIGHT, dialPanel } from "./colour.js";
import { DEPTH_HEIGHT, depthPanel } from "./depth.js";
import { KIND_HEIGHT, kindPanel, LINE_HEIGHT, linePanel, SIZE_HEIGHT, sizePanel } from "./form.js";
import { page } from "./page.js";

export function sheet(): string {
  const parts: string[] = [];
  let y = 86;
  parts.push(linePanel(y));
  y += LINE_HEIGHT;
  parts.push(sizePanel(y));
  y += SIZE_HEIGHT;
  parts.push(kindPanel(y));
  y += KIND_HEIGHT;
  parts.push(depthPanel(y));
  y += DEPTH_HEIGHT;
  parts.push(colourPanel(y));
  y += colourHeight();
  parts.push(dialPanel(y));
  y += DIAL_HEIGHT;
  return page("NEON SPORE · VISUAL SYSTEM", y + 20, parts.join("\n"));
}

if (import.meta.main) {
  const out = resolve(import.meta.dir, "../../../docs/reference/style-guide.svg");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, sheet(), "utf8");
  console.log(`wrote ${out}`);
}
