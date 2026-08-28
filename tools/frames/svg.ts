#!/usr/bin/env bun

/**
 * `bun run png <in.svg> <out.png>` — turn a sheet into something a phone shows.
 *
 * The owner reads results on Android, where an SVG attachment is a file to open
 * rather than a picture to glance at. A picture that has to be opened is not a
 * glance, which was the whole reason for sending one, so anything going to them
 * is a PNG. `bun run frames` already writes one; the shape sheets do not, and
 * SVG is the right output for those tools and the wrong one for the chat.
 *
 * It borrows the headless Chrome `capture.ts` already depends on rather than
 * adding a rasteriser: one more image library to convert a file we can simply
 * open would be a dependency bought for twenty lines.
 *
 * The `<svg>` element is screenshotted rather than the page, so the output is
 * cropped to the drawing itself with no margin to trim.
 */

import { chromium } from "playwright-core";
import { findChrome } from "./capture.js";

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error("usage: bun run png <in.svg> <out.png>");
  process.exit(1);
}

const svg = await Bun.file(src).text();
if (!svg.includes("<svg")) throw new Error(`${src} has no <svg> in it`);

const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  // The field's own black, so a sheet drawn for a dark page is not sent on white.
  await page.setContent(`<body style="margin:0;background:#07060f">${svg}</body>`, {
    waitUntil: "load",
  });
  const el = await page.$("svg");
  if (!el) throw new Error(`no <svg> element rendered from ${src}`);
  await el.screenshot({ path: out });
  console.log(`wrote ${out}`);
} finally {
  await browser.close();
}
