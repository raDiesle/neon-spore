#!/usr/bin/env bun
import { WAVES, wavePressure } from "@neon-spore/content";
import { CHARGES, playOut, standWave } from "./src/autopilot-play.js";
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
 * files are saved through the director's own save.
 */

/** AUTO clears the wave with no breach, at every charge it is tested at. */
const clears = (wave: Parameters<typeof standWave>[0], i: number): boolean =>
  CHARGES.every(([, cfg]) => {
    const { world, breaches } = playOut(standWave(wave, i, cfg));
    return world.balance.wavesCleared === 1 && breaches === 0;
  });

const before = hardHeads(WAVES);
const { waves, stuck } = softenHeads(WAVES, clears);
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
