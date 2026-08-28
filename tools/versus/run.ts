#!/usr/bin/env bun

/**
 * `bun run versus` — which slots are open, and what a vote on each one would
 * reach.
 *
 * The pair itself is a browser: one `World`, stepped once, drawn twice, at
 * phone size and at tempo. This is the half a browser cannot do. A candidate
 * patches a record, and every *other* reader of that record draws something
 * the two phones never put on screen — five files read `METEOR`, and a vote
 * that showed neither of them is a vote cast blind. So the blast radius is
 * derived here, where a filesystem exists, by grep.
 *
 * With no predicted answer, deliberately. The command is printed beside its
 * output so it can be run again, and nothing here says "nothing else reads
 * this" — a survey that asserted exactly that turned out to be wrong about
 * five files.
 */

import { VARIANTS } from "./candidates/index.js";
import { declaration, patchedFields, slots, type Where } from "./variant.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));

const open = slots(VARIANTS);

if (open.length === 0) {
  console.log("no slots open.");
  console.log(
    "\n  A slot is a shape the game already draws and a second answer to it.\n" +
      "  Write one under tools/versus/candidates/, register it in\n" +
      "  candidates/index.ts, and the director's VERSUS tab will pair it\n" +
      "  against what ships. tools/versus/README.md has the shape of one.",
  );
  process.exit(0);
}

console.log(`${open.length} ${open.length === 1 ? "slot" : "slots"} open:\n`);

for (const { slot, candidates } of open) {
  console.log(`  ${slot}`);
  console.log(`    current  ${"—"} what the game draws today`);
  for (const c of candidates) console.log(`    ${c.name.padEnd(8)} ${c.sentence}`);

  // Every candidate in a slot patches the same records and the same fields —
  // `test/variants.test.ts` refuses the registry otherwise — so the first one
  // names the whole blast radius.
  const first = candidates[0];
  if (!first) continue;

  console.log("");
  for (const p of first.patches) {
    console.log(`    patches  ${declaration(p.where)}`);
    console.log(`             ${patchedFields(p).join(", ")}`);
    const { command, files } = await readers(p.where);
    console.log(`    readers  ${command}`);
    if (files.length === 0) console.log("             (none — grep found nothing, which is odd)");
    for (const f of files) console.log(`             ${f.hits.toString().padStart(3)}  ${f.file}`);
    console.log("");
  }

  for (const c of candidates) console.log(`    remove   git rm -r ${c.dir}`);
  console.log("");
}

console.log("  A vote is cast at the pair, not here: bun run dev, the VERSUS tab.");

/** Every file that names this symbol, by git's own reckoning, with hit counts. */
async function readers(where: Where): Promise<{
  command: string;
  files: { file: string; hits: number }[];
}> {
  const pattern = `\\b${where.symbol}\\b`;
  const args = ["grep", "-n", pattern, "--", "packages", "apps", "tools"];
  const command = `git grep -n "${pattern}" -- packages apps tools`;
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const out = await new Response(proc.stdout).text();
  await proc.exited;

  const counts = new Map<string, number>();
  for (const line of out.split("\n")) {
    const file = line.slice(0, line.indexOf(":"));
    if (!file) continue;
    counts.set(file, (counts.get(file) ?? 0) + 1);
  }
  return { command, files: [...counts].map(([file, hits]) => ({ file, hits })) };
}
