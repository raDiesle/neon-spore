#!/usr/bin/env bun

/**
 * `bun run maze` — draw a sheet for THE MAZE, ready to paste into
 * `packages/content/src/maze-rounds.ts`.
 *
 * The drum is authored data and must stay that way (`maze-rounds.ts` has why),
 * so this prints numbers rather than writing a file: a sheet reaches the game
 * by being read, judged and committed, never by being generated at load. It
 * refuses a sheet `mazeFault` would refuse, which is the same check content's
 * own test runs, so nothing unplayable can be pasted in by accident.
 *
 *   bun run maze                 seven corridors, one way in, seed 1
 *   bun run maze 7 3 161         three ways in, a particular drawing
 *   bun run maze scan 3          the seeds worth looking at, best first
 *
 * **`scan` is how a seed is chosen**, and it exists because most of them are
 * dull in a way the numbers say plainly: a sheet whose walk runs straight in
 * without going round, or whose middle has one door, is a legal maze and a
 * boring picture. It ranks by how far the shot has to travel round its rings,
 * how often it is sent back outward, how many doors the middle has and how
 * much wall there is to look at. The eye still decides — `bun run frames`
 * takes the picture — but this narrows two hundred seeds to eight.
 */

import { mazeFault, mazeSweep, mazeWheel } from "@neon-spore/sim";
import { drawSheet } from "./draw.js";

/** How far the shot travels round its rings, and how often it is sent back out. */
function walk(rings: number, ways: number, seed: number) {
  const sheet = drawSheet(rings, ways, seed);
  const wheel = mazeWheel(sheet, 180_000);
  if (mazeFault(wheel) !== null) return null;
  let leastSweep = Number.POSITIVE_INFINITY;
  let backs = 0;
  for (const way of wheel.entrances) {
    let sweep = 0;
    for (const [i, cell] of way.route.entries()) {
      const next = way.route[i + 1];
      if (next === undefined) break;
      sweep += Math.abs(mazeSweep(wheel, cell.ring, cell.angleMilli, next.angleMilli));
      if (next.ring > cell.ring) backs += 1;
    }
    leastSweep = Math.min(leastSweep, sweep / 1000);
  }
  const walls = sheet.walls.reduce((n, list) => n + list.length, 0);
  const doors = sheet.openings[0]?.length ?? 0;
  return { sheet, wheel, leastSweep, backs, walls, doors };
}

const args = process.argv.slice(2);

if (args[0] === "scan") {
  const ways = Number(args[1]) || 1;
  const rings = Number(args[2]) || 7;
  const rows: { score: number; line: string }[] = [];
  for (let seed = 1; seed <= 200; seed++) {
    const found = walk(rings, ways, seed);
    if (found === null) continue;
    rows.push({
      score: found.leastSweep + found.backs * 120 + found.doors * 20 + found.walls * 4,
      line:
        `seed ${String(seed).padStart(3)}  walls ${found.walls}  doors into the middle ` +
        `${found.doors}  sent back out ${found.backs}  least sweep ` +
        `${found.leastSweep.toFixed(0)}deg  crossings ` +
        found.wheel.entrances.map((e) => e.route.length).join(","),
    });
  }
  rows.sort((a, b) => b.score - a.score);
  console.log(
    rows
      .slice(0, 8)
      .map((r) => r.line)
      .join("\n") || "no seed drew a legal sheet",
  );
  process.exit(0);
}

const [rings, ways, seed] = args.map((a) => Number(a));
const found = walk(rings || 7, ways || 1, seed || 1);
if (found === null) {
  console.error("that seed draws a sheet the game would refuse");
  process.exit(1);
}

const list = (xs: readonly number[]) =>
  `[${xs.map((n) => n.toLocaleString("en-US").replace(/,/g, "_")).join(", ")}]`;

const { sheet } = found;
console.log(`  rings: ${sheet.rings},`);
console.log(`  coreMilli: ${sheet.coreMilli},`);
console.log(`  openMilli: ${sheet.openMilli},`);
console.log(`  walls: [\n${sheet.walls.map((w) => `    ${list(w)},`).join("\n")}\n  ],`);
console.log(`  openings: [\n${sheet.openings.map((o) => `    ${list(o)},`).join("\n")}\n  ],`);
console.error(
  `\n${found.wheel.entrances.length} way(s) in; walks of ` +
    `${found.wheel.entrances.map((e) => e.route.length).join(", ")} crossings.`,
);
