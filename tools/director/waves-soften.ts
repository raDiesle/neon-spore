#!/usr/bin/env bun
import { WAVES, wavePressure } from "@neon-spore/content";
import { playsClean } from "./src/autopilot-play.js";
import { hardHeads, softenHeads } from "./src/soften-intro.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:soften [--write]`
 *
 * Every group's head that is harder than its gentlest child, softened to it
 * (`src/soften-intro.ts`): its arrivals pulled toward the middle column and
 * spread apart, as little as that takes and only as far as AUTO still clears
 * it clean at every charge. Without `--write` it prints each head
 * and the pressure it would come to, and changes nothing; with it, the act
 * files are saved through the director's own save. `waves:order` ends with
 * the same pass (`src/curriculum-run.ts`), so an order written after this
 * keeps what it softened.
 */

const before = hardHeads(WAVES);
const { waves, stuck } = softenHeads(WAVES, playsClean);
for (const { i, head, child } of before) {
  const wave = WAVES[i];
  const to = stuck.includes(i) ? "stays — no softening reaches it" : wavePressure(waves[i]!);
  console.log(
    `${String(i + 1).padStart(4)}  ${(wave?.name ?? "").padEnd(22)}${head} → ${to}   (child ${child})`,
  );
}
console.log(`${before.length - stuck.length} heads soften, ${stuck.length} stay`);
if (!process.argv.includes("--write") || before.length === stuck.length) process.exit(0);
const { complaint, rels } = await writeWaves(waves);
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`wrote ${rels.length} files`);
console.log("then: bun run waves:measure, briefings:renumber, baseline:blank");
