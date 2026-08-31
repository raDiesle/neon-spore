#!/usr/bin/env bun

/**
 * `bun run raster:pack <dir> [--size N] [--quality Q] [--stills N]` —
 * shrink a folder of hand-painted frames and pack them into one strip the
 * game can draw.
 *
 * `run.ts` beside this generates its asset from code; this one takes art that
 * came from outside the repository and makes it shippable. The two halves of
 * `docs/raster.md` — a picture the game does not compute, and a strip rather
 * than an animated file so the frame number stays arithmetic — apply to both,
 * and only the source differs.
 *
 * **Why a browser again.** `src/png.ts` says it deliberately carries no codec:
 * it rearranges chunks a browser already encoded. Resampling is the same
 * argument one step further — the pixels have to be decoded, scaled with a
 * decent filter and re-encoded, and Chromium does all three well, so the
 * alternative is a dependency that would exist to do this once per asset.
 *
 * **What comes out.** A lossy WebP strip with an alpha plane, `frames * size`
 * wide and `size` tall, next to the source folder's own name in
 * `assets/raster/`. Optionally the stills are rewritten in place at a smaller
 * size too (`--stills`), which is what makes the gallery cheap: the
 * hand-painted masters at full resolution stay in git history, which is the
 * only copy anything needs once the strip exists.
 *
 * Reproducible in the sense that matters: same input files, same flags, same
 * bytes out.
 */

import { readdir, unlink, writeFile } from "node:fs/promises";
import { findChrome } from "@neon-spore/frames/capture.js";
import { chromium } from "playwright-core";

interface Options {
  dir: string;
  /** Side of one square frame in the strip, in pixels. */
  size: number;
  /** WebP quality for the strip, 0..1. */
  quality: number;
  /** If set, re-encode each source frame at this size. 0 leaves them alone. */
  stills: number;
}

function parseArgs(argv: readonly string[]): Options {
  const positional = argv.filter((a) => !a.startsWith("--"));
  const flag = (name: string, fallback: number): number => {
    const at = argv.indexOf(`--${name}`);
    if (at === -1) return fallback;
    const value = Number(argv[at + 1]);
    if (!Number.isFinite(value)) throw new Error(`--${name} needs a number`);
    return value;
  };
  const dir = positional[0];
  if (dir === undefined) throw new Error("usage: bun run raster:pack <dir> [--size N]");
  return {
    dir,
    size: flag("size", 128),
    quality: flag("quality", 0.86),
    stills: flag("stills", 0),
  };
}

const dataUrlToBytes = (url: string): Uint8Array =>
  Uint8Array.from(atob(url.slice(url.indexOf(",") + 1)), (c) => c.charCodeAt(0));

/**
 * The frames, in filename order. Numeric names are padded in this repository
 * (`00.png`), so a plain sort is the right one — but it is asserted rather
 * than assumed, because a folder that ever holds `9.png` and `10.png` would
 * sort into the wrong order silently and the animation would simply look
 * wrong rather than fail.
 */
async function frameFiles(dir: string): Promise<string[]> {
  const names = (await readdir(dir)).filter((n) => n.toLowerCase().endsWith(".png")).sort();
  if (names.length === 0) throw new Error(`no PNGs in ${dir}`);
  const widths = new Set(names.map((n) => n.length));
  if (widths.size !== 1) {
    throw new Error(
      `frame names in ${dir} are not equal width, so sorting them is not their order`,
    );
  }
  return names;
}

async function main(): Promise<void> {
  const opts = parseArgs(Bun.argv.slice(2));
  const names = await frameFiles(opts.dir);
  const sources = await Promise.all(
    names.map(async (n) => {
      const bytes = await Bun.file(`${opts.dir}/${n}`).bytes();
      return `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
    }),
  );

  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  let out: { strip: string; stills: string[] };
  try {
    const page = await browser.newPage();
    await page.setContent("<!doctype html><meta charset=utf-8><title>pack</title>");
    out = await page.evaluate(
      async (input: { sources: string[]; size: number; quality: number; stills: number }) => {
        const make = (w: number, h: number): CanvasRenderingContext2D => {
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("no 2d context");
          // The whole job is a downscale, so the filter is the asset.
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          return ctx;
        };
        const load = (src: string): Promise<HTMLImageElement> =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("decode failed"));
            img.src = src;
          });

        const images = await Promise.all(input.sources.map(load));
        const strip = make(input.size * images.length, input.size);
        const stills: string[] = [];
        for (const [i, img] of images.entries()) {
          strip.drawImage(img, i * input.size, 0, input.size, input.size);
          if (input.stills > 0) {
            const still = make(input.stills, input.stills);
            still.drawImage(img, 0, 0, input.stills, input.stills);
            // WebP, not PNG. These frames are smooth gradients under an alpha
            // plane, which is the case PNG is worst at: at 256 px the same
            // picture is thirty times the bytes as a lossless PNG as it is as
            // a lossy WebP nobody can tell apart on a gallery card. The
            // full-resolution masters stay in git history, which is the only
            // copy anything needs once the strip exists.
            stills.push(still.canvas.toDataURL("image/webp", input.quality));
          }
        }
        return { strip: strip.canvas.toDataURL("image/webp", input.quality), stills };
      },
      { sources, size: opts.size, quality: opts.quality, stills: opts.stills },
    );
  } finally {
    await browser.close();
  }

  const id = opts.dir
    .replace(/[\\/]+$/, "")
    .split(/[\\/]/)
    .pop();
  const stripPath = Bun.fileURLToPath(
    new URL(`../../assets/raster/${id}-strip.webp`, import.meta.url),
  );
  const strip = dataUrlToBytes(out.strip);
  await writeFile(stripPath, strip);

  const before = (await Promise.all(names.map((n) => Bun.file(`${opts.dir}/${n}`).bytes()))).reduce(
    (sum, b) => sum + b.length,
    0,
  );

  let after = strip.length;
  for (const [i, url] of out.stills.entries()) {
    const bytes = dataUrlToBytes(url);
    const name = names[i];
    if (name === undefined) continue;
    await writeFile(`${opts.dir}/${name.replace(/\.png$/i, ".webp")}`, bytes);
    await unlink(`${opts.dir}/${name}`);
    after += bytes.length;
  }

  const kb = (n: number): string => `${(n / 1024).toFixed(0)} KB`;
  console.log(`${names.length} frames from ${opts.dir}`);
  console.log(`  strip   ${stripPath}  ${opts.size}px/frame  ${kb(strip.length)}`);
  if (opts.stills > 0) console.log(`  stills  re-encoded as WebP at ${opts.stills}px`);
  console.log(`  ${kb(before)} in, ${kb(after)} out — ${(before / after).toFixed(1)}x smaller`);
}

await main();
