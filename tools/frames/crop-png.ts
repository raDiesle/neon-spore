#!/usr/bin/env bun
/**
 * `bun run crop <in.png> <out.png> x,y,w,h [zoom]` — a rectangle of a picture
 * already taken, drawn bigger by whole pixels.
 *
 * For the lane that has a screenshot and cannot get a closer one: `bun run
 * shot --at` paints the frame again at a higher resolution and is the better
 * instrument whenever it works, and this is what to reach for when it does
 * not, instead of a script written and deleted (`picture.ts` has the count).
 * The rectangle is in the picture's own pixels, read off the file as it is —
 * a screenshot taken at device scale 2 is twice the size of the page it shows.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseAt } from "./crop.js";
import { encodePng, magnify } from "./picture.js";
import { decodePng } from "./pixels.js";

const [input, output, rect, zoomArg] = process.argv.slice(2);
if (input === undefined || output === undefined || rect === undefined) {
  console.error("usage: bun run crop <in.png> <out.png> x,y,w,h [zoom]");
  console.error("       x,y,w,h in the picture's own pixels; zoom a whole number, default 4");
  process.exit(2);
}
const at = parseAt(rect);
const zoom = zoomArg === undefined ? 4 : Number(zoomArg);
const pic = decodePng(new Uint8Array(readFileSync(input)));
const channels = pic.pixels.length / (pic.width * pic.height);
const out = magnify(pic, channels, at, zoom);
writeFileSync(output, encodePng(out, channels));
console.log(
  `wrote ${output} — ${out.width}x${out.height}, ${at.width}x${at.height} of ${pic.width}x${pic.height} at ${zoom}x`,
);
