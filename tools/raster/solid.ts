#!/usr/bin/env bun

/**
 * `bun run solid [out.png]` — the solid sheet: a test rig turned from the side
 * to the front, at eye level and looked down on, and one angle across time.
 *
 * The render-and-look loop for `packages/content/src/solid.ts` and the
 * `solid-*.ts` drawing in render: change a part, run this, look at the PNG.
 * The page is bundled from `src/solid-page.ts` and drawn by a real browser's
 * canvas, the one the game draws on.
 */

import { resolve } from "node:path";
import { closeBrowser, launchBrowser } from "@neon-spore/frames/capture.js";

const out = resolve(process.argv[2] ?? ".claude/tmp/solid-sheet.png");

const built = await Bun.build({
  entrypoints: [resolve(import.meta.dir, "src/solid-page.ts")],
  target: "browser",
  format: "iife",
});
if (!built.success) {
  for (const log of built.logs) console.error(log);
  process.exit(1);
}
const script = await (built.outputs[0] as Blob).text();

const browser = await launchBrowser();
try {
  const page = await browser.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent("<!doctype html><meta charset=utf-8><title>solid</title>");
  await page.addScriptTag({ content: script });
  const url = await page.evaluate(() => (window as unknown as { __sheet?: string }).__sheet);
  if (!url)
    throw new Error(`the page drew nothing${errors.length ? `: ${errors.join("; ")}` : ""}`);
  await Bun.write(out, Buffer.from(url.slice(url.indexOf(",") + 1), "base64"));
  console.log(out);
} finally {
  await closeBrowser(browser);
}
