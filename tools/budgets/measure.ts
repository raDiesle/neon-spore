#!/usr/bin/env bun

/**
 * `bun run budgets:measure [file…]` — remeasure the op-count budgets and raise
 * every row that rose, in place.
 *
 * With no file, every budget file in `packages/render/test` (each one with a
 * `MEASURE` switch that prints through `budgetRow`). For each: the switch is
 * thrown, the file is run on its own, the switch is put back — in a `finally`,
 * and on ^C — and the rows it printed are written into its tables by `rows.ts`,
 * raising only what rose. Then `biome format` on what changed, because one
 * more digit can push a row past the line.
 *
 * A legitimate change that raises a row is remeasured and moved, with a
 * sentence saying why (CLAUDE.md); this is the moving. The sentence is still
 * the lane's to write.
 */

import { readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { printedRows, raise, withMeasure } from "./rows.js";

const root = resolve(import.meta.dir, "..", "..");
const TESTS = join(root, "packages", "render", "test");

/** The budget files: a `MEASURE` switch and `budgetRow` to print through. */
async function budgetFiles(): Promise<string[]> {
  const out: string[] = [];
  for (const name of readdirSync(TESTS).sort()) {
    if (!name.endsWith(".test.ts")) continue;
    const text = await Bun.file(join(TESTS, name)).text();
    if (/^const MEASURE = false;$/m.test(text) && text.includes("budgetRow(")) {
      out.push(join(TESTS, name));
    }
  }
  return out;
}

/** The file's printed rows, with its switch on for exactly the run. */
async function measure(file: string): Promise<string> {
  const original = await Bun.file(file).text();
  const restore = () => Bun.write(file, original);
  const onSignal = () => {
    Bun.write(file, original).then(() => process.exit(130));
  };
  process.once("SIGINT", onSignal);
  try {
    await Bun.write(file, withMeasure(original, true));
    const proc = Bun.spawn(["bun", "test", file], { cwd: root, stdout: "pipe", stderr: "pipe" });
    const [out, err] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);
    return `${out}\n${err}`;
  } finally {
    await restore();
    process.off("SIGINT", onSignal);
  }
}

const asked = process.argv.slice(2).map((f) => resolve(f));
const files = asked.length > 0 ? asked : await budgetFiles();
const changed: string[] = [];
let failed = false;

for (const file of files) {
  const name = relative(root, file);
  try {
    const source = await Bun.file(file).text();
    withMeasure(source, false);
    const printed = printedRows(await measure(file));
    if (printed.length === 0) throw new Error("printed no rows — did every test run?");
    const { text, changes } = raise(source, printed);
    if (changes.length === 0) {
      console.log(`${name}: ${printed.length} rows, none rose`);
      continue;
    }
    await Bun.write(file, text);
    changed.push(file);
    console.log(
      `${name}: ${printed.length} rows, ${changes.length} value${changes.length === 1 ? "" : "s"} raised`,
    );
    for (const c of changes) console.log(`  line ${c.line}  ${c.key}  ${c.from} → ${c.to}`);
  } catch (e) {
    failed = true;
    console.error(`${name}: ${(e as Error).message}`);
  }
}

if (changed.length > 0) {
  await Bun.spawn(["bunx", "biome", "format", "--write", ...changed], {
    cwd: root,
    stdout: "ignore",
    stderr: "inherit",
  }).exited;
}
if (failed) process.exitCode = 1;
