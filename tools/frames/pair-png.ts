#!/usr/bin/env bun
/**
 * `bun run pair <before.png> <after.png> <out.png> [--stack|--beside]
 * [--gutter n]` — two pictures as one, *before* on the left or on top, so a
 * look change is sent as one PNG (`pair.ts` says which way and why).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { type Direction, pair } from "./pair.js";
import { encodePng } from "./picture.js";
import { decodePng } from "./pixels.js";

const USAGE =
  "usage: bun run pair <before.png> <after.png> <out.png> [--stack|--beside] [--gutter n]";

const files: string[] = [];
let direction: Direction | undefined;
let gutter = 8;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i] ?? "";
  if (arg === "--stack") direction = "stack";
  else if (arg === "--beside") direction = "beside";
  else if (arg === "--gutter") gutter = Number(argv[++i]);
  else if (arg.startsWith("--")) {
    console.error(`${arg}: not a flag this takes\n${USAGE}`);
    process.exit(2);
  } else files.push(arg);
}
const [before, after, output] = files;
if (!before || !after || !output || files.length !== 3) {
  console.error(USAGE);
  process.exit(2);
}
const read = (path: string) => decodePng(new Uint8Array(readFileSync(path)));
const out = pair(read(before), read(after), gutter, direction);
writeFileSync(output, encodePng(out, 4));
console.log(`wrote ${output} — ${out.width}x${out.height}`);
