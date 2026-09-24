#!/usr/bin/env bun

/**
 * `bun run imports` — drop the names a file split stranded in an import list.
 *
 * Eleven files were split to get under the 250-line limit in one sitting, and
 * on five of them the same minutes went the same way: a move strands names in
 * the lists either side of it, `bun run format` will not touch them because
 * biome offers only an *unsafe* fix, and `tools/hooks/guard.ts` blocks
 * `--write --unsafe` — rightly, because that fix deletes a statement together
 * with the doc comment above it. This is the half of the fix that is safe to
 * run: a specifier comes out of a list, the statement and its comment stay,
 * and a statement that would go entirely is deleted only when no comment
 * stands directly above it — one that has one is printed instead.
 *
 * biome chooses the files and has the last word on the result; `imports.ts`
 * only decides where to cut. With no argument it asks about the whole
 * repository, and with paths it asks about those.
 */

import { pruneImports } from "./imports.js";

type Diagnostic = { readonly path: string; readonly line: number; readonly message: string };

async function biome(args: readonly string[]): Promise<Diagnostic[]> {
  const child = Bun.spawn(["bunx", "biome", ...args, "--reporter=json"], {
    stdout: "pipe",
    stderr: "ignore",
  });
  const out = await new Response(child.stdout).text();
  await child.exited;
  try {
    const report = JSON.parse(out) as {
      diagnostics?: { location?: { path?: string; start?: { line?: number } }; message?: string }[];
    };
    return (report.diagnostics ?? []).map((d) => ({
      path: d.location?.path ?? "",
      line: d.location?.start?.line ?? 0,
      message: d.message ?? "",
    }));
  } catch {
    return [];
  }
}

const unusedIn = (targets: readonly string[]) =>
  biome(["lint", "--only=correctness/noUnusedImports", ...targets]);

/**
 * The one thing biome can still catch after the cut: a value left with nothing
 * declaring it. A type is not covered — `imports.ts` keeps a name that occurs
 * anywhere outside a comment for exactly that reason — but a name dropped out
 * from under live code shows up here, and the file goes back as it was.
 */
const undeclaredIn = (targets: readonly string[]) =>
  biome(["lint", "--only=correctness/noUndeclaredVariables", ...targets]);

const targets = Bun.argv.slice(2).filter((a) => !a.startsWith("-"));
const where = targets.length > 0 ? targets : ["."];

const flagged = [...new Set((await unusedIn(where)).map((d) => d.path))].filter(Boolean);
if (flagged.length === 0) {
  console.log("no unused import anywhere in", where.join(" "));
  process.exit(0);
}

const undeclaredBefore = new Set(
  (await undeclaredIn(flagged)).map((d) => `${d.path}:${d.line}:${d.message}`),
);

const originals = new Map<string, string>();
const changed: string[] = [];
let cuts = 0;
for (const path of flagged) {
  const source = await Bun.file(path).text();
  const { text, dropped } = pruneImports(source);
  if (text === source) continue;
  originals.set(path, source);
  await Bun.write(path, text);
  changed.push(path);
  cuts += dropped.length;
  for (const drop of dropped) console.log(`  − ${path}:${drop.line}  ${drop.name}`);
}

if (changed.length > 0) {
  // The formatter alone, which puts the shortened list back on one line.
  // Never `check --write`: that also runs the organize-imports assist, and
  // sorting a file's statements moves a doc comment off the statement it was
  // written above — the harm this command exists to avoid. Never `--unsafe`
  // either, which is the other half of the same harm.
  const format = Bun.spawn(["bunx", "biome", "format", "--write", ...changed], {
    stdout: "ignore",
    stderr: "ignore",
  });
  await format.exited;

  const broke = (await undeclaredIn(changed)).filter(
    (d) => !undeclaredBefore.has(`${d.path}:${d.line}:${d.message}`),
  );
  if (broke.length > 0) {
    for (const [path, source] of originals) await Bun.write(path, source);
    console.error("\nput back: the cut left a name with nothing declaring it.");
    for (const d of broke) console.error(`  ✗ ${d.path}:${d.line}  ${d.message}`);
    process.exit(1);
  }
}

const remaining = await unusedIn(flagged);
console.log(
  `\n${cuts} name${cuts === 1 ? "" : "s"} dropped from ${changed.length} file${
    changed.length === 1 ? "" : "s"
  }.`,
);
if (remaining.length > 0) {
  console.log(
    `\n${remaining.length} left for somebody to read — each would take a whole statement,\n` +
      "and the comment above a statement is often the only place a decision is written:",
  );
  for (const d of remaining) console.log(`  · ${d.path}:${d.line}  ${d.message}`);
}
