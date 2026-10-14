#!/usr/bin/env bun
import { WAVES, type Wave } from "@neon-spore/content";
import { beatSeconds, DEFAULT_CONFIG } from "@neon-spore/sim";
import { type Composed, composeBlock } from "./src/compose.js";
import { readBlock } from "./src/compose-block.js";
import { spanOf } from "./src/compose-check.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:compose <intro id> [--seed N] [--names "A|B|C"] [--write]`
 *
 * A block's regular waves, composed from the wave that introduces its thing
 * (`docs/spec/wave-curriculum.md` §6). Without `--write` it prints the waves it
 * would add and changes nothing; with it, they go into the act files straight
 * after the block's intro and its guided waves, as variants, through the same
 * save the director uses — so they open in the wave editor like any other.
 *
 * `--names` gives them their names, in step order: the composer cannot pass a
 * wave's one-sentence test (`.claude/skills/new-wave`), so whoever reads the
 * block names it. `--seed` draws the block again.
 */

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? undefined : args[at + 1];
};
const introId = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
if (!introId) {
  console.error('usage: bun run waves:compose <intro id> [--seed N] [--names "A|B|C"] [--write]');
  process.exit(2);
}

const block = readBlock(WAVES, introId);
if (typeof block === "string") {
  console.error(block);
  process.exit(1);
}
const composed = composeBlock(WAVES, block, introId, Number(flag("seed") ?? 0));
const names = flag("names")?.split("|") ?? [];
const seconds = (beats: number) => (beats * beatSeconds(DEFAULT_CONFIG)).toFixed(0);

function named(c: Composed, i: number): Wave | undefined {
  const name = names[i]?.trim();
  return c.wave && (name ? { ...c.wave, name } : c.wave);
}

console.log(
  `${introId} — block ${block.number}, new: ${block.x}, before it: ${block.y ?? "nothing"}` +
    `${block.tutorial ? ", tutorial arc (three steps)" : ""}, ${block.existing} regular already`,
);
console.log("step  id                       span  arrivals  pressure  AUTO clears  name");
for (const [i, c] of composed.entries()) {
  const wave = named(c, i);
  if (!wave) {
    console.log(`${c.step.id}    — ${c.faults.join("; ")}`);
    continue;
  }
  const n = wave.entries.length + (wave.pods?.length ?? 0);
  console.log(
    `${c.step.id.padEnd(6)}${wave.id.padEnd(25)}${String(spanOf(wave)).padEnd(6)}` +
      `${String(n).padEnd(10)}${String(c.pressure).padEnd(10)}` +
      `${`${c.cleared} beats, ${seconds(c.cleared ?? 0)} s`.padEnd(16)}${wave.name}`,
  );
}

const waves = composed.map(named);
if (composed.length === 0) console.log("nothing to compose: the block has its regular waves");
if (!args.includes("--write")) process.exit(waves.every(Boolean) ? 0 : 1);
if (!waves.every((w): w is Wave => w !== undefined)) {
  console.error("not written: a step found no wave");
  process.exit(1);
}
const taken = new Set(WAVES.map((w) => w.id));
const clash = waves.find((w) => taken.has(w.id));
if (clash) {
  console.error(`not written: ${clash.id} is already a wave — draw again with --seed, or rename`);
  process.exit(1);
}
const all = [...WAVES.slice(0, block.insertAt), ...waves, ...WAVES.slice(block.insertAt)];
const { complaint, rels } = await writeWaves(all);
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`wrote ${waves.length} waves into ${rels.join(", ")}`);
