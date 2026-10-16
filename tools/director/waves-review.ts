#!/usr/bin/env bun
import { WAVES, type Wave } from "@neon-spore/content";
import { beatSeconds, DEFAULT_CONFIG } from "@neon-spore/sim";
import { composeBlockAt } from "./src/compose.js";
import { spanOf } from "./src/compose-check.js";
import { nameWaves } from "./src/compose-names.js";
import { nextReview } from "./src/compose-review.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:review [--count N] [--seed N] [--write]`
 *
 * The next review blocks (`src/compose-review.ts`): eight regular waves in
 * front of each boss that waits at the end, `--count` of them (one by
 * default), each composed on the list the one before it left — its first
 * wave rises from the block before's gentlest. Named from the theme's plural
 * (`REVIEW_NAMES`), the first one the block's head and the rest variants
 * under it. Without `--write` it prints them and changes nothing.
 */

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? undefined : args[at + 1];
};
const count = Number(flag("count") ?? 1);
const asked = Number(flag("seed") ?? 0);
const seconds = (beats: number) => (beats * beatSeconds(DEFAULT_CONFIG)).toFixed(0);

let waves: Wave[] = [...WAVES];
let written = 0;
for (let n = 0; n < count; n++) {
  const review = nextReview(waves);
  if (typeof review === "string") {
    console.log(`stopped: ${review}`);
    break;
  }
  const { block, composed, seed } = composeBlockAt(waves, review.block, review.prefix, asked);
  console.log(
    `\nreview ${review.k + 1} — ${review.theme}, before ${waves[block.insertAt]?.name}, ` +
      `floor ${block.floor ?? "none"}${seed === asked ? "" : `, drawn with seed ${seed}`}`,
  );
  console.log("step  id                            span  arrivals  pressure  AUTO clears  name");
  const out: Wave[] = [];
  for (const [i, c] of composed.entries()) {
    if (!c.wave) {
      console.log(`${c.step.id}    — ${c.faults.join("; ")}`);
      continue;
    }
    const { variant: _v, ...head } = c.wave;
    const wave: Wave = i === 0 ? head : c.wave;
    out.push(wave);
    console.log(
      `${c.step.id.padEnd(6)}${wave.id.padEnd(30)}${String(spanOf(wave)).padEnd(6)}` +
        `${String(wave.entries.length + (wave.pods?.length ?? 0)).padEnd(10)}` +
        `${String(c.pressure).padEnd(10)}` +
        `${`${c.cleared} beats, ${seconds(c.cleared ?? 0)} s`.padEnd(16)}${wave.name}`,
    );
  }
  if (out.length !== 8) {
    console.error("stopped: a step found no wave — draw again with --seed");
    break;
  }
  const ids = new Set(waves.map((w) => w.id));
  const clash = out.find((w) => ids.has(w.id));
  if (clash) {
    console.error(`stopped: ${clash.id} is already a wave`);
    break;
  }
  waves = [...waves.slice(0, block.insertAt), ...out, ...waves.slice(block.insertAt)];
  waves = nameWaves(waves, new Set(out.map((w) => w.id)));
  written++;
}

if (!args.includes("--write") || written === 0) process.exit(written === count ? 0 : 1);
const { complaint, rels } = await writeWaves(waves);
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`\nwrote ${written} review blocks into ${rels.join(", ")}`);
console.log("then: bun run waves:bosses --write, waves:measure, briefings:renumber");
process.exit(written === count ? 0 : 1);
