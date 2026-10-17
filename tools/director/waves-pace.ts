#!/usr/bin/env bun
import { WAVES, waveFastSlides } from "@neon-spore/content";
import { CHARGES, playOut, standWave } from "./src/autopilot-play.js";
import { TUTORIAL_LAST_ID } from "./src/compose-steps.js";
import { stretchPace } from "./src/pace-stretch.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:pace <wave id>… [--write]`
 *
 * The named waves with their fast slides stretched out (`src/pace-stretch.ts`):
 * none kept in the tutorial arc, one after it, and a rest after the one kept.
 * The composer places by the rule already; this is for a wave written before
 * it. Named by id, never all at once — a hand-written wave is its author's to
 * change. Without `--write` it prints what would change; a stretched wave
 * AUTO cannot clear clean at every charge is left as it was.
 */

const ids = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (ids.length === 0) {
  console.error("usage: bun run waves:pace <wave id>… [--write]");
  process.exit(2);
}
const finale = WAVES.findIndex((w) => w.id === TUTORIAL_LAST_ID);
const clears = (wave: Parameters<typeof standWave>[0], i: number): boolean =>
  CHARGES.every(([, cfg]) => {
    const { world, breaches } = playOut(standWave(wave, i, cfg));
    return world.balance.wavesCleared === 1 && breaches === 0;
  });
const waves = [...WAVES];
let changed = 0;
for (const id of ids) {
  const i = waves.findIndex((w) => w.id === id);
  const wave = waves[i];
  if (!wave) {
    console.error(`no wave with the id ${id}`);
    process.exit(1);
  }
  const stretched = stretchPace(wave, i <= finale ? 0 : 1);
  const [from, to] = [waveFastSlides(wave).length, waveFastSlides(stretched).length];
  const ok = clears(stretched, i);
  console.log(
    `${String(i + 1).padStart(4)}  ${wave.name.padEnd(22)}${from} → ${to} fast slides${ok ? "" : " — AUTO loses it, left as it was"}`,
  );
  if (ok && stretched !== wave) {
    waves[i] = stretched;
    changed++;
  }
}
if (!process.argv.includes("--write") || changed === 0) process.exit(0);
const { complaint, rels } = await writeWaves(waves);
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`wrote ${rels.length} files`);
console.log("then: bun run waves:measure, baseline:blank");
