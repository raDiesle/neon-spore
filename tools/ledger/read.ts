/**
 * The reading `docs/lane-speed.md` makes of the ledger, as numbers: the
 * distribution, the rows' shares, the tail, the named bottlenecks, the
 * friction by cause and the measured stamps — for one period of entries.
 *
 * Pure, so the arithmetic is tested on a ledger written in the test.
 */

import { type Entry, ROWS, type Row, total } from "./parse.js";

/**
 * Friction by cause, by keyword over the friction row's own words. A
 * classification would be better and nobody has written one; the direction
 * between two periods is what these are read for, and a keyword holds that.
 */
export const CAUSES: Readonly<Record<string, RegExp>> = {
  "the 250-line ceiling": /250|ceiling|line limit/i,
  "a server or a port": /\bport\b|server|preview|4173|wrangler/i,
  "`land` refusing or stopping": /refus/i,
  "a test timing out or hanging": /time(d)? ?out|\bhung\b|\bhang/i,
  "shell quoting": /heredoc|quot|backslash|escap/i,
  "a rebase or a conflict": /conflict|rebase/i,
  "the browser": /browser|chrome|screenshot/i,
  "an install": /bun install|node_modules/i,
};

export interface Reading {
  lanes: number;
  minutes: number;
  mean: number;
  median: number;
  /** Each row's minutes and its share of all of them. */
  rows: Record<Row, { minutes: number; share: number }>;
  /** The share of all minutes the longest 14% of lanes carry — the figure `lane-speed.md` opened with. */
  tailShare: number;
  atLeast90: number;
  atMost25: number;
  bottlenecks: Record<string, number>;
  /** Per cause: lanes whose friction row names it, and those rows' minutes. */
  causes: Record<string, { lanes: number; minutes: number }>;
  /** Measured stamps by where their clock started. */
  stamps: Record<string, { lanes: number; median: number }>;
}

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/** The reading of a set of entries. An entry with no rows at all is not a lane and is left out. */
export function read(entries: readonly Entry[]): Reading {
  const lanes = entries.filter((e) => total(e) > 0);
  const totals = lanes.map(total);
  const minutes = totals.reduce((a, b) => a + b, 0);
  const share = (n: number) => (minutes > 0 ? n / minutes : 0);

  const rows = {} as Reading["rows"];
  for (const row of ROWS) {
    const sum = lanes.reduce((a, e) => a + (e.rows[row] ?? 0), 0);
    rows[row] = { minutes: sum, share: share(sum) };
  }
  const longest = [...totals].sort((a, b) => b - a);
  const tail = longest.slice(0, Math.ceil(lanes.length * 0.14)).reduce((a, b) => a + b, 0);

  const bottlenecks: Record<string, number> = {};
  for (const e of lanes) bottlenecks[e.bottleneck] = (bottlenecks[e.bottleneck] ?? 0) + 1;

  const causes: Reading["causes"] = {};
  for (const [cause, pattern] of Object.entries(CAUSES)) {
    const hit = lanes.filter((e) => (e.rows.friction ?? 0) > 0 && pattern.test(e.friction));
    causes[cause] = {
      lanes: hit.length,
      minutes: hit.reduce((a, e) => a + (e.rows.friction ?? 0), 0),
    };
  }

  const byStart: Record<string, number[]> = {};
  for (const e of lanes) {
    if (!e.stamp) continue;
    const list = byStart[e.stamp.from] ?? [];
    list.push(e.stamp.minutes);
    byStart[e.stamp.from] = list;
  }
  const stamps: Reading["stamps"] = {};
  for (const [from, list] of Object.entries(byStart))
    stamps[from] = { lanes: list.length, median: median(list) };

  return {
    lanes: lanes.length,
    minutes,
    mean: lanes.length > 0 ? minutes / lanes.length : 0,
    median: median(totals),
    rows,
    tailShare: share(tail),
    atLeast90: totals.filter((t) => t >= 90).length,
    atMost25: totals.filter((t) => t <= 25).length,
    bottlenecks,
    causes,
    stamps,
  };
}

/** The entries dated inside `[from, to]`, both `YYYY-MM-DD` and either open. */
export function between(entries: readonly Entry[], from?: string, to?: string): Entry[] {
  return entries.filter((e) => (!from || e.date >= from) && (!to || e.date <= to));
}
