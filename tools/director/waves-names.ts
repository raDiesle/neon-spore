#!/usr/bin/env bun
import { WAVES } from "@neon-spore/content";
import { nameWaves } from "./src/compose-names.js";
import { writeWaves } from "./src/waves-acts.js";

/**
 * `bun run waves:names [id …] [--write]`
 *
 * Every regular wave named again by the composer (`src/compose-names.ts`), or
 * only the ones whose ids are given. Without `--write` it prints each name
 * that would change and changes nothing; with it, the act files are saved
 * through the director's own save. An intro or a boss keeps its name — it is
 * the creature's, the lesson's or the boss's own.
 *
 * A name chosen by hand in the director is overwritten by a run over every
 * wave, so after the first one, name the ids.
 */

const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith("--"));
const unknown = ids.filter((id) => !WAVES.some((w) => w.id === id));
if (unknown.length > 0) {
  console.error(`no wave with the id ${unknown.join(", ")}`);
  process.exit(1);
}
const named = nameWaves(WAVES, ids.length > 0 ? new Set(ids) : undefined);
let changed = 0;
for (const [i, wave] of named.entries()) {
  const was = WAVES[i]?.name;
  if (wave.name === was) continue;
  changed++;
  console.log(`${String(i + 1).padStart(4)}  ${(was ?? "").padEnd(22)}${wave.name}`);
}
console.log(`${changed} names change`);
if (!args.includes("--write") || changed === 0) process.exit(0);
const { complaint, rels } = await writeWaves(named);
if (complaint) {
  console.error(complaint);
  process.exit(1);
}
console.log(`wrote ${rels.length} files`);
console.log("then: bun run waves:measure, briefings:renumber, baseline:blank");
