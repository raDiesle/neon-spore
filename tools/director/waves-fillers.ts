#!/usr/bin/env bun
import { WAVES, type Wave } from "@neon-spore/content";
import { bossOrder } from "./src/boss-slots.js";
import { addFillers } from "./src/compose-filler.js";
import { nameWaves } from "./src/compose-names.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:fillers [--write]`
 *
 * A filler (`src/compose-filler.ts`) in front of every boss past the arc
 * that still closes a block which teaches: three regular waves of things
 * already taught, the first the head the boss folds under. Nothing else in
 * the list moves, so a hand edit elsewhere survives — `waves:order` writes
 * the fillers too, after the bosses and the reviews. Without `--write` it
 * prints them and changes nothing.
 */

let waves: Wave[] = [...WAVES];
const composedIds = new Set<string>();

console.log("filler                  pressure/talk, step by step");
const got = addFillers(waves, composedIds);
if (typeof got === "string") {
  console.error(`stopped: ${got}`);
  process.exit(1);
}
waves = got;
if (bossOrder(waves).order.some((w, i) => w.id !== waves[i]?.id)) {
  console.error("stopped: the bosses move once the fillers are in");
  process.exit(1);
}
waves = nameWaves(waves, composedIds);
console.log(`\n${composedIds.size / 3} fillers, ${waves.length} waves`);
if (!process.argv.includes("--write") || composedIds.size === 0) process.exit(0);
const { complaint, rels, removed } = await writeWaves(waves, undefined, { recut: true });
if (complaint) {
  console.error(`stopped: ${complaint}`);
  process.exit(1);
}
console.log(`wrote ${rels.length} files, deleted ${removed.length}`);
console.log("then: waves:measure, briefings:renumber, baseline:blank");
