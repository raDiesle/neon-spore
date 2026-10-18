#!/usr/bin/env bun
import { WAVES, type Wave } from "@neon-spore/content";
import { OrderStopped, orderWaves } from "./src/curriculum-run.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:order [--write | --recut]`
 *
 * Every new thing after the tutorial arc taught again in curriculum order,
 * every block composed again, the bosses, reviews and fillers placed, and
 * every head softened (`src/curriculum-run.ts`, which says each step).
 * Without `--write` it prints the order and says whether anything would
 * change; a second run after `--write` changes nothing. A write cuts the act
 * files after the arc again in play order (`src/waves-recut.ts`), and
 * `--recut` does that alone to the list as it stands, composing nothing — so
 * it works on a day the composer stops (`docs/queue.md`, 16 October 2026).
 */

if (process.argv.includes("--recut") && !process.argv.includes("--write")) {
  const { complaint, rels, removed } = await writeWaves([...WAVES], undefined, { recut: true });
  if (complaint) {
    console.error(`stopped: ${complaint}`);
    process.exit(1);
  }
  console.log(
    `cut the acts after the arc again: wrote ${rels.length} files, deleted ${removed.length}`,
  );
  process.exit(0);
}

let waves: Wave[];
try {
  waves = orderWaves(WAVES, (line) => console.log(line));
} catch (e) {
  if (!(e instanceof OrderStopped)) throw e;
  console.error(`stopped: ${e.message}`);
  process.exit(1);
}

function stop(why: string): never {
  console.error(`stopped: ${why}`);
  process.exit(1);
}

const same = waves.length === WAVES.length && Bun.deepEquals(waves, [...WAVES]);
console.log(`\n${waves.length} waves; ${same ? "nothing changes" : "the list changes"}`);
if (!process.argv.includes("--write") || same) process.exit(0);
const { complaint, rels, removed } = await writeWaves(waves, undefined, { recut: true });
if (complaint) stop(complaint);
console.log(`wrote ${rels.length} files, deleted ${removed.length}`);
if (!same) console.log("then: waves:measure, briefings:renumber, baseline:blank");
