#!/usr/bin/env bun

/**
 * `bun run orphans` — what is built and reached by nothing.
 *
 * A feature the game plays through says so through `bun test`; a feature
 * that is only *reachable* — a creature nothing spawns, an interlude no gap
 * carries — passed every one of those and still never showed up in front of a
 * pair. `packages/content/src/mechanics.ts` is the closed registry that can
 * finally be asked, and this is that question asked out loud, in the shape of
 * `bun run checks`.
 *
 * No repository half: unlike `tools/checks`, nothing here touches git or a
 * ledger — the whole answer is already a pure function over content the
 * package exports, so there is nothing for an IO layer to fetch.
 */

import { orphanReport } from "./orphans.js";

const orphans = orphanReport();

if (orphans.length === 0) {
  console.log("nothing orphaned — every mechanic that spawns or gaps is reached by one.");
  process.exit(0);
}

console.log(
  `${orphans.length} mechanic${orphans.length === 1 ? "" : "s"} built and reached by nothing:\n`,
);
for (const orphan of orphans) {
  console.log(`  ✗ ${orphan.id}  (${orphan.reach})`);
  console.log(`    ${orphan.what}`);
  console.log(`    fix: ${orphan.fix}\n`);
}
