#!/usr/bin/env bun
/**
 * `bun run crop <in.png> <out.png> x,y,w,h [zoom]` — a rectangle of a picture
 * already taken, drawn bigger by whole pixels. `--at x,y,w,h` and `--zoom n`
 * say the same two numbers in `versus:shot`'s words (`parseCropArgs`).
 *
 * For the lane that has a screenshot and cannot get a closer one: `bun run
 * shot --at` paints the frame again at a higher resolution and is the better
 * instrument whenever it works, and this is what to reach for when it does
 * not, instead of a script written and deleted (`picture.ts` has the count).
 * The rectangle is in the picture's own pixels, read off the file as it is —
 * a screenshot taken at device scale 2 is twice the size of the page it shows.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { type CropArgs, parseAt, parseCropArgs } from "./crop.js";
import { clipWindow, encodePng, magnify } from "./picture.js";
import { decodePng } from "./pixels.js";

let args: CropArgs;
try {
  args = parseCropArgs(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error("usage: bun run crop <in.png> <out.png> x,y,w,h [zoom]");
  console.error("       bun run crop <in.png> <out.png> --at x,y,w,h [--zoom n]");
  console.error("       x,y,w,h in the picture's own pixels; zoom a whole number, default 4");
  process.exit(2);
}
const { input, output, zoom } = args;
const at = parseAt(args.rect);
const pic = decodePng(new Uint8Array(readFileSync(input)));
const channels = pic.pixels.length / (pic.width * pic.height);
let kept: ReturnType<typeof clipWindow>;
try {
  kept = clipWindow(pic, at);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
const out = magnify(pic, channels, kept, zoom);
writeFileSync(output, encodePng(out, channels));
// A window that ran past an edge is said, so a crop smaller than asked is never a surprise.
const clipped =
  kept.width === at.width && kept.height === at.height
    ? ""
    : ` — clipped to ${kept.x},${kept.y},${kept.width},${kept.height}, the rest was past the edge`;
console.log(
  `wrote ${output} — ${out.width}x${out.height}, ${kept.width}x${kept.height} of ${pic.width}x${pic.height} at ${zoom}x${clipped}`,
);
