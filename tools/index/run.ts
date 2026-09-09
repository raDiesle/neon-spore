#!/usr/bin/env bun

/**
 * `bun run index` — makes `docs/INDEX.md`'s "## Code" table match the tree in
 * one pass: every in-scope source file gets a row, every row whose file has
 * been deleted goes, and a surviving row's hand-written text is left exactly
 * as it is. Run it after adding or deleting a file; edit the new row's text in
 * place afterwards, the generator will keep whatever is there on the next run.
 *
 * It says which rows it added and which it dropped, because those are the two
 * things worth reading afterwards — an added row wants its text written and a
 * dropped row is the tool doing the hand edit somebody used to do.
 *
 * `bun run index --check` writes nothing and exits non-zero when the table
 * has drifted from the tree, which is what the test runs.
 *
 * The work itself is in `generate.ts`, because `tools/land` resolves a rebase
 * conflict in the file map by asking the same question.
 */

import { join } from "node:path";
import { regenerate, writeIndex } from "./generate.js";

const ROOT = join(import.meta.dirname, "..", "..");

if (process.argv.includes("--check")) {
  const out = regenerate(ROOT);
  if (out.text !== out.was) {
    console.error(`docs/INDEX.md has drifted from the tree (${out.scope} in-scope files).`);
    console.error("Run `bun run index`; it adds and drops rows, and says which.");
    process.exit(1);
  }
  console.log(`docs/INDEX.md: up to date, ${out.scope} in-scope files`);
} else {
  const out = writeIndex(ROOT);
  console.log(`docs/INDEX.md: ${out.scope} in-scope files checked`);
  for (const path of out.added) console.log(`  added    ${path} — write its line`);
  for (const path of out.dropped) console.log(`  dropped  ${path} — no such file`);
}
