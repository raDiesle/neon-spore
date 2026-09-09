/**
 * `bun run versus` — which slots are open, and what deciding one would reach.
 *
 * The pair itself is a browser: one `World`, stepped once, drawn twice, at
 * phone size and at tempo. This is the half a browser cannot do. A candidate
 * patches a record, and every *other* reader of that record draws something
 * the two phones never put on screen — five files read `METEOR`, and a look
 * that showed neither of them was a look judged blind. So the blast radius is
 * derived here, where a filesystem exists, by grep.
 *
 * With no predicted answer, deliberately. The command is printed beside its
 * output so it can be run again, and nothing here says "nothing else reads
 * this" — a survey that asserted exactly that turned out to be wrong about
 * five files.
 *
 * Cut out of `run.ts` when that file became a dispatcher for five commands
 * rather than the one it started as.
 */

import { ROOT } from "./root.js";
import { declaration, patchedFields, type Slot, type Where } from "./variant.js";

export async function listing(open: readonly Slot[]): Promise<string[]> {
  if (open.length === 0) {
    return [
      "no slots open.",
      "",
      "  A slot is a shape the game already draws and a second answer to it.",
      "  `bun run versus new <slot> <name>` prints one; write it under",
      "  tools/versus/candidates/, run `bun run versus index`, and the",
      "  director's VERSUS tab will pair it against what ships.",
    ];
  }

  const out = [`${open.length} ${open.length === 1 ? "slot" : "slots"} open:`, ""];
  for (const { slot, candidates } of open) {
    out.push(`  ${slot}`);
    out.push(`    current  ${"—"} what the game draws today`);
    for (const c of candidates) out.push(`    ${c.name.padEnd(8)} ${c.sentence}`);

    // Every candidate in a slot patches the same records and the same fields —
    // `test/variants.test.ts` refuses the registry otherwise — so the first one
    // names the whole blast radius.
    const first = candidates[0];
    if (!first) continue;

    out.push("");
    for (const p of first.patches) {
      out.push(`    patches  ${declaration(p.where)}`);
      out.push(`             ${patchedFields(p).join(", ")}`);
      const { command, files } = await readers(p.where);
      out.push(`    readers  ${command}`);
      if (files.length === 0) out.push("             (none — grep found nothing, which is odd)");
      for (const f of files) out.push(`             ${f.hits.toString().padStart(3)}  ${f.file}`);
      out.push("");
    }
    out.push(`    decide   bun run versus adopt ${slot} <name> "<why>"`);
    out.push(`             bun run versus drop ${slot} "<why not>"`);
    out.push("");
  }
  out.push("  Look at the pair first: bun run dev, the VERSUS tab, one candidate per door.");
  return out;
}

/** Every file that names this symbol, by git's own reckoning, with hit counts. */
async function readers(where: Where): Promise<{
  command: string;
  files: { file: string; hits: number }[];
}> {
  const pattern = `\\b${where.symbol}\\b`;
  const args = ["grep", "-n", pattern, "--", "packages", "apps", "tools"];
  const command = `git grep -n "${pattern}" -- packages apps tools`;
  const proc = Bun.spawn(["git", ...args], { cwd: ROOT, stdout: "pipe", stderr: "pipe" });
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
