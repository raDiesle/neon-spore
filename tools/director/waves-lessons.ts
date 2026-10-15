#!/usr/bin/env bun
import { WAVES, type Wave } from "@neon-spore/content";
import { beatSeconds, DEFAULT_CONFIG } from "@neon-spore/sim";
import { bossOrder } from "./src/boss-slots.js";
import { composeBlockAt } from "./src/compose.js";
import { spanOf } from "./src/compose-check.js";
import { LESSON_NAMES, lessonsAfterBlocks, nextLesson } from "./src/compose-lesson.js";
import { isReviewHead } from "./src/compose-starts.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:lessons [--seed N] [--write]`
 *
 * Every lesson after the arc — a wave that teaches a panel or a fault — moved
 * behind its block's regular waves and given eight of its own
 * (`src/compose-lesson.ts`); then every boss placed again (`bossOrder`), and
 * the review blocks at the end that no boss closes any more taken away.
 * Without `--write` it prints what it would do and changes nothing.
 */

const args = process.argv.slice(2);
const at = args.indexOf("--seed");
const asked = at === -1 ? 0 : Number(args[at + 1]);
const seconds = (beats: number) => (beats * beatSeconds(DEFAULT_CONFIG)).toFixed(0);

let waves: Wave[] = lessonsAfterBlocks(WAVES);
let written = 0;
for (;;) {
  const lesson = nextLesson(waves);
  if (typeof lesson === "string") {
    console.log(`\n${lesson}`);
    break;
  }
  const { block, composed, seed } = composeBlockAt(waves, lesson.block, lesson.prefix, asked);
  console.log(
    `\n${lesson.prefix} — the bodies of block ${block.number}, ` +
      `floor ${block.floor ?? "none"}${seed === asked ? "" : `, drawn with seed ${seed}`}`,
  );
  const out: Wave[] = [];
  for (const [i, c] of composed.entries()) {
    if (!c.wave) {
      console.log(`${c.step.id}    — ${c.faults.join("; ")}`);
      continue;
    }
    const wave: Wave = { ...c.wave, name: LESSON_NAMES[i]?.(lesson.word) ?? c.wave.name };
    out.push(wave);
    console.log(
      `${c.step.id.padEnd(6)}${wave.id.padEnd(26)}${String(spanOf(wave)).padEnd(6)}` +
        `${String(wave.entries.length + (wave.pods?.length ?? 0)).padEnd(5)}` +
        `${String(wave.faults?.length ?? 0).padEnd(4)}${String(c.pressure).padEnd(7)}` +
        `${`${seconds(c.cleared ?? 0)} s`.padEnd(7)}${wave.name}`,
    );
  }
  const ids = new Set(waves.map((w) => w.id));
  const names = new Set(waves.map((w) => w.name));
  const clash = out.find((w) => ids.has(w.id) || names.has(w.name) || w.name.length > 20);
  if (out.length !== 8 || clash) {
    console.error(
      `stopped: ${clash ? `${clash.name} is taken or too long` : "a step found no wave"}`,
    );
    process.exit(1);
  }
  waves = [...waves.slice(0, block.insertAt), ...out, ...waves.slice(block.insertAt)];
  written++;
}

waves = bossOrder(waves).order;
// A review block was written for a boss with no block of its own; one at the
// end that no boss closes now has nothing to stand in front of.
let dropped = 0;
for (;;) {
  let head = waves.length - 1;
  while (head > 0 && !isReviewHead(waves, head)) head--;
  if (head <= 0 || waves.slice(head).some((w) => w.boss)) break;
  dropped += waves.length - head;
  waves = waves.slice(0, head);
}
console.log(`\n${written} lesson blocks, ${dropped} review waves no boss closes taken away`);
if (!args.includes("--write")) process.exit(0);
const { complaint, rels } = await writeWaves(waves);
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`wrote ${rels.length} files; then: waves:measure, briefings:renumber`);
