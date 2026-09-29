#!/usr/bin/env bun

/**
 * `bun run lane-speed` — the time log's reading, printed.
 *
 *   bun run lane-speed                          the whole ledger
 *   bun run lane-speed --from 2026-09-23        one period, either end open
 *   bun run lane-speed --from … --to …
 *   bun run lane-speed --split 2026-09-23       before and after a day, side by side
 *
 * What `docs/lane-speed.md` quotes is what this prints; a figure there that
 * this cannot reproduce was typed by hand.
 */

import { join } from "node:path";
import { parseLedger, ROWS } from "./parse.js";
import { between, type Reading, read } from "./read.js";

const ROOT = join(import.meta.dirname, "..", "..");

function flag(name: string): string | undefined {
  const at = process.argv.indexOf(name);
  return at >= 0 ? process.argv[at + 1] : undefined;
}

const pct = (share: number) => `${(100 * share).toFixed(1)}%`;

function print(label: string, r: Reading): void {
  console.log(`\n${label} — ${r.lanes} lanes, ${r.minutes} logged minutes`);
  console.log(`  mean ${r.mean.toFixed(1)}, median ${r.median}`);
  console.log(
    `  longest 14% carry ${pct(r.tailShare)}; ${r.atLeast90} at 90 min or more, ${r.atMost25} at 25 or under`,
  );
  for (const row of ROWS) {
    const { minutes, share } = r.rows[row];
    console.log(
      `  ${row.padEnd(9)} ${String(minutes).padStart(6)}  ${pct(share).padStart(6)}  ${(minutes / Math.max(1, r.lanes)).toFixed(1)}/lane`,
    );
  }
  const named = Object.entries(r.bottlenecks).sort((a, b) => b[1] - a[1]);
  console.log(`  bottleneck  ${named.map(([k, n]) => `${k} ${n}`).join(", ")}`);
  console.log("  friction by cause, by keyword:");
  for (const [cause, { lanes, minutes }] of Object.entries(r.causes).sort(
    (a, b) => b[1].minutes - a[1].minutes,
  )) {
    if (lanes > 0)
      console.log(
        `    ${cause.padEnd(30)} ${String(lanes).padStart(4)} lanes ${String(minutes).padStart(5)} min  ${(minutes / Math.max(1, r.lanes)).toFixed(2)}/lane`,
      );
  }
  for (const [from, { lanes, median }] of Object.entries(r.stamps)) {
    console.log(`  measured from ${from}: ${lanes} lanes, median ${median} min`);
  }
}

const entries = parseLedger(await Bun.file(join(ROOT, "docs/time-log.md")).text());
const split = flag("--split");
if (split) {
  const day = new Date(`${split}T00:00:00Z`);
  const before = new Date(day.getTime() - 86_400_000).toISOString().slice(0, 10);
  print(`before ${split}`, read(between(entries, undefined, before)));
  print(`from ${split}`, read(between(entries, split)));
} else {
  const from = flag("--from");
  const to = flag("--to");
  const label = from || to ? `${from ?? "the start"} to ${to ?? "today"}` : "the whole ledger";
  print(label, read(between(entries, from, to)));
}
