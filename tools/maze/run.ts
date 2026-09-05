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

import { mazeFault, mazeReachesCore, mazeSweep, mazeWheel } from "@neon-spore/sim";
import { drawSheet } from "./draw.js";

/**
 * How far the shot travels round its rings, how often it is sent back out, and
 * how long the dead ends are.
 *
 * A sheet is refused outright unless **exactly one** way in reaches the middle.
 * `sever` in `draw.ts` is what arranges that, and it reasons over cells while
 * the shot reasons over *arcs* — two sectors of a ring with no wall between
 * them are one room — so on some seeds a wall meant to close a way in leaves
 * it open through its neighbour. Checking the solver's own answer rather than
 * the carving's intent is what makes that harmless: such a seed does not print.
 */
function walk(rings: number, ways: number, seed: number) {
  const sheet = drawSheet(rings, ways, seed);
  const wheel = mazeWheel(sheet, 180_000);
  if (mazeFault(wheel) !== null) return null;
  if (wheel.entrances.filter(mazeReachesCore).length !== 1) return null;
  let leastSweep = Number.POSITIVE_INFINITY;
  let backs = 0;
  let shortestDud = Number.POSITIVE_INFINITY;
  for (const way of wheel.entrances) {
    let sweep = 0;
    for (const [i, cell] of way.route.entries()) {
      const next = way.route[i + 1];
      if (next === undefined) break;
      sweep += Math.abs(mazeSweep(wheel, cell.ring, cell.angleMilli, next.angleMilli));
      if (next.ring > cell.ring) backs += 1;
    }
    if (mazeReachesCore(way)) leastSweep = Math.min(leastSweep, sweep / 1000);
    else shortestDud = Math.min(shortestDud, way.route.length);
  }
  const walls = sheet.walls.reduce((n, list) => n + list.length, 0);
  const doors = sheet.openings[0]?.length ?? 0;
  return {
    sheet,
    wheel,
    leastSweep,
    backs,
    walls,
    doors,
    shortestDud: Number.isFinite(shortestDud) ? shortestDud : 0,
  };
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
      // A short dead end is the one thing that spoils a sheet outright: a shot
      // that turns twice and stops has not been anywhere, so the pair cannot
      // tell a wrong guess from a bug. It is weighted above everything else.
      score:
        found.leastSweep +
        found.shortestDud * 400 +
        found.backs * 120 +
        found.doors * 20 +
        found.walls * 4,
      line:
        `seed ${String(seed).padStart(3)}  walls ${found.walls}  doors into the middle ` +
        `${found.doors}  sent back out ${found.backs}  least sweep ` +
        `${found.leastSweep.toFixed(0)}deg  shortest dead end ${found.shortestDud}  ` +
        `crossings ` +
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
    `${found.wheel.entrances.map((e) => e.route.length).join(", ")} crossings. ` +
    `Way ${found.wheel.entrances.findIndex(mazeReachesCore)} is the one that arrives.`,
);
