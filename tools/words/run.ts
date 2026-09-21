#!/usr/bin/env bun

/**
 * `bun run words` — every line a player reads, measured against the rules in
 * `.claude/skills/game-words`.
 *
 * The report is the working half of the tool: the test next door says whether
 * the tree is worse than it was, and this says *which line* and *which word*,
 * which is the only form the answer is useful in when the job is rewriting a
 * guide. It reads `packages/content` and touches nothing.
 *
 * ```
 * bun run words                 every subject that fails, worst first
 * bun run words "THE SHELL"     one subject, every line, passing ones too
 * bun run words --clean         the two values `clean.ts` should now hold
 * ```
 */

import { CEILING, CLEAN } from "./clean.js";
import { type Finding, findings } from "./measure.js";
import { playerText, type TextEntry } from "./text.js";

const arg = process.argv[2];
const entries = playerText();
const subject = (entry: TextEntry): string => entry.id.split(" · ")[0] ?? entry.id;

interface Row {
  entry: TextEntry;
  found: Finding[];
}

const rows: Row[] = entries.map((entry) => ({ entry, found: findings(entry.text, entry.kind) }));
const failing = rows.filter((r) => r.found.length > 0);

if (arg === "--clean") {
  const dirty = new Set(failing.map((r) => subject(r.entry)));
  const clean = [...new Set(entries.map(subject))].filter((s) => !dirty.has(s)).sort();
  console.log(`CEILING = ${failing.length};`);
  console.log(`CLEAN (${clean.length}):`);
  for (const s of clean) console.log(`  ${JSON.stringify(s)},`);
  process.exit(0);
}

if (arg !== undefined) {
  const wanted = rows.filter((r) => subject(r.entry).toLowerCase() === arg.toLowerCase());
  if (wanted.length === 0) {
    console.log(`no wave or mechanic called ${JSON.stringify(arg)}.`);
    process.exit(1);
  }
  for (const { entry, found } of wanted) {
    console.log(`${found.length === 0 ? "✓" : "✗"} ${entry.id}\n  ${entry.text}`);
    for (const f of found) console.log(`    ${f.rule}: ${f.detail}`);
  }
  process.exit(0);
}

const bySubject = new Map<string, Row[]>();
for (const row of failing) {
  const key = subject(row.entry);
  bySubject.set(key, [...(bySubject.get(key) ?? []), row]);
}
const worst = [...bySubject.entries()].sort((a, b) => b[1].length - a[1].length);

for (const [name, subjectRows] of worst) {
  console.log(`\n${name} — ${subjectRows.length} line${subjectRows.length === 1 ? "" : "s"}`);
  for (const { entry, found } of subjectRows) {
    console.log(`  ${entry.text}`);
    for (const f of found) console.log(`    ${f.rule}: ${f.detail}`);
  }
}

console.log(
  `\n${failing.length} of ${entries.length} lines fail, across ${bySubject.size} subjects.`,
);
console.log(`${CLEAN.length} subjects are held clean; the ceiling is ${CEILING}.`);
if (failing.length > CEILING) {
  console.log(`\n✗ that is ${failing.length - CEILING} more than the ceiling allows.`);
  process.exit(1);
}
