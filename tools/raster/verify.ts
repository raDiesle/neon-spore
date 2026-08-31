#!/usr/bin/env bun

/**
 * `bun run raster:verify` — opens the generated assets in a real browser and
 * says whether they decode.
 *
 * It is a script rather than a test on purpose. `bun test` runs on every
 * change and must not need a browser on the machine; this needs one, takes a
 * second, and answers a question that only changes when the encoder does.
 * `tools/raster/test/` covers the containers as bytes — the frame counts, the
 * delays, the chunk order — and this covers the only thing those cannot: that
 * a decoder nobody in this repository wrote agrees with them.
 *
 * `ImageDecoder` is what makes it more than a load check: it reports the frame
 * count a decoder actually found, so an APNG whose sequence numbers were
 * wrong fails here rather than by animating strangely on somebody's phone.
 */

import { findChrome } from "@neon-spore/frames/capture.js";
import { chromium } from "playwright-core";
import { BURST } from "./src/spec.js";

const assets = new URL("../../assets/raster/", import.meta.url);
const file = (name: string): string => Bun.fileURLToPath(new URL(name, assets));
const TYPES: Record<string, string> = {
  ".apng": "image/apng",
  ".webp": "image/webp",
};

/**
 * The assets are served over `127.0.0.1` rather than handed to the page as
 * data URLs, for a reason worth writing down: `ImageDecoder` is WebCodecs, and
 * WebCodecs is only exposed in a **secure context**. `about:blank` is not one,
 * so the first version of this script reported "no ImageDecoder" on a browser
 * that has had it for years. Localhost is a secure context, and serving the
 * files also puts the MIME types through a real response header on the way.
 */
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === "/")
      return new Response("<!doctype html><meta charset=utf-8><title>verify</title>");
    const name = path.slice(1);
    if (!name.startsWith("burst")) return new Response("not found", { status: 404 });
    const type = TYPES[name.slice(name.lastIndexOf("."))] ?? "application/octet-stream";
    return new Response(Bun.file(file(name)), { headers: { "content-type": type } });
  },
});
const origin = `http://127.0.0.1:${server.port}`;

const probeModule = await import("../../packages/render/src/raster-probe.js");

const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
const page = await browser.newPage();
await page.goto(`${origin}/`);

const result = await page.evaluate(
  async (input: { origin: string; apngProbe: string; webpProbe: string }) => {
    const size = (src: string): Promise<[number, number] | null> =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    const frameCount = async (name: string, type: string): Promise<number> => {
      const Decoder = (globalThis as { ImageDecoder?: typeof ImageDecoder }).ImageDecoder;
      if (!Decoder) return -1;
      const data = await (await fetch(`${input.origin}/${name}`)).arrayBuffer();
      const decoder = new Decoder({ data: new Uint8Array(data), type });
      await decoder.completed;
      await decoder.tracks.ready;
      return decoder.tracks.selectedTrack?.frameCount ?? -2;
    };

    // The same probe `packages/render/src/raster-caps.ts` uses, run here so a
    // broken probe fails the encoder's own check rather than a browser's.
    const apngProbePasses = await (async () => {
      const img = new Image();
      const loaded = await new Promise<boolean>((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = input.apngProbe;
      });
      if (!loaded) return false;
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 2;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return false;
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 1, 1, 1).data[3] === 0;
    })();

    return {
      apngSize: await size(`${input.origin}/burst.apng`),
      webpSize: await size(`${input.origin}/burst.webp`),
      stripSize: await size(`${input.origin}/burst-strip.webp`),
      apngFrames: await frameCount("burst.apng", "image/png"),
      webpFrames: await frameCount("burst.webp", "image/webp"),
      apngProbePasses,
      webpProbeSize: await size(input.webpProbe),
    };
  },
  { origin, apngProbe: probeModule.APNG_PROBE, webpProbe: probeModule.ANIMATED_WEBP_PROBE },
);

await browser.close();
await server.stop(true);

const square: [number, number] = [BURST.size, BURST.size];
const same = (a: [number, number] | null, b: [number, number]): boolean =>
  a !== null && a[0] === b[0] && a[1] === b[1];

const checks: [string, boolean, string][] = [
  ["burst.apng decodes at frame size", same(result.apngSize, square), String(result.apngSize)],
  ["burst.webp decodes at frame size", same(result.webpSize, square), String(result.webpSize)],
  [
    "burst-strip.webp is the whole strip",
    same(result.stripSize, [BURST.size * BURST.frames, BURST.size]),
    String(result.stripSize),
  ],
  ["burst.apng carries every frame", result.apngFrames === BURST.frames, `${result.apngFrames}`],
  ["burst.webp carries every frame", result.webpFrames === BURST.frames, `${result.webpFrames}`],
  ["the APNG probe tells the two decoders apart", result.apngProbePasses, ""],
  [
    "the animated WebP probe decodes",
    same(result.webpProbeSize, [8, 8]),
    String(result.webpProbeSize),
  ],
];

let failed = 0;
for (const [name, ok, detail] of checks) {
  if (!ok) failed++;
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}${ok || !detail ? "" : `  (${detail})`}`);
}
console.log(failed === 0 ? "\nevery asset decodes in Chromium." : `\n${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);
