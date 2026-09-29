/**
 * The compaction trial's figures for one period, and the two periods side by
 * side: before the change of 29 September 2026 and after it. What each figure
 * is expected to do is in `EXPECT`, so a reader who was not there can say
 * whether the trial is working without reading the reasoning first.
 *
 * Pure: sessions and log lines in, text out.
 */

import type { Session } from "./transcript";

/** When the three changes were all on `main`: the window went to 120k last. */
export const CUTOVER = Date.parse("2026-09-29T20:30:00Z");

/** A compaction at or past this is the ceiling cutting an item, not a boundary. */
export const CEILING_HIT = 300_000;

export interface Decision {
  at: number;
  contextTokens: number;
  deferred: boolean;
}

export interface Period {
  sessions: number;
  items: number;
  minutesPerItem: number;
  secondsPerCall: number;
  context: number;
  compactions: number;
  midItem: number;
  ceilingHits: number;
  tooLong: number;
  checkpointReads: number;
  deferredTurns: number;
  deferredSessions: number;
  measuredMinutes: number;
}

function median(values: number[]): number {
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)] ?? 0;
}

/** Every figure for the events that fell in `[from, to)`. */
export function period(
  sessions: Session[],
  decisions: (Decision & { session: string })[],
  stamps: { at: number; minutes: number }[],
  from: number,
  to: number,
): Period {
  const inside = (at: number): boolean => at >= from && at < to;
  const minutes: number[] = [];
  const perCall: number[] = [];
  const contexts: number[] = [];
  let active = 0;
  let items = 0;
  let compactions = 0;
  let midItem = 0;
  let ceilingHits = 0;
  let tooLong = 0;
  let checkpointReads = 0;

  for (const s of sessions) {
    if (!s.calls.some((c) => inside(c.at))) continue;
    active++;
    let start = s.calls[0]?.at ?? 0;
    for (const land of s.landings) {
      const calls = s.calls.filter((c) => c.at > start && c.at <= land).length;
      if (inside(land) && calls > 0) {
        items++;
        minutes.push((land - start) / 60_000);
        perCall.push((land - start) / 1000 / calls);
      }
      start = land;
    }
    for (const c of s.calls) if (inside(c.at)) contexts.push(c.context);
    s.compactions.forEach((c, i) => {
      if (!inside(c.at)) return;
      compactions++;
      if (c.midItem) midItem++;
      if (c.pre >= CEILING_HIT) ceilingHits++;
      // Read within ten minutes of the cut and before the next one: the
      // pointer this cut's `after-compact.ts` printed was followed.
      const until = Math.min(c.at + 600_000, s.compactions[i + 1]?.at ?? Number.POSITIVE_INFINITY);
      if (s.checkpointReads.some((r) => r >= c.at && r < until)) checkpointReads++;
    });
    tooLong += s.tooLong.filter(inside).length;
  }

  const deferred = decisions.filter((d) => d.deferred && inside(d.at));
  return {
    sessions: active,
    items,
    minutesPerItem: median(minutes),
    secondsPerCall: median(perCall),
    context: median(contexts),
    compactions,
    midItem,
    ceilingHits,
    tooLong,
    checkpointReads,
    deferredTurns: deferred.length,
    deferredSessions: new Set(deferred.map((d) => d.session)).size,
    measuredMinutes: median(stamps.filter((s) => inside(s.at)).map((s) => s.minutes)),
  };
}

/** What each figure should do after the change, in the words a verdict needs. */
export const EXPECT: Readonly<Record<string, string>> = {
  "cut mid-item": "down from about a third (an edit since the last landing) to under 10%",
  "compactions per item":
    "down: before counts sessions that compacted and landed nothing; the model said 0.56 a queue item",
  "ceiling hits": "rare: over 10% of compactions means raise the ceiling to 400k",
  '"Prompt is too long"': "zero, always: one means lower the ceiling now",
  "checkpoint read after a cut": "most of them, or the pointer is being ignored",
  "median context per call": "down",
  "seconds per call": "down",
  "minutes per item / claim stamp": "flat or down; up means try a 150k window",
};

const pct = (n: number, of: number): string => (of === 0 ? "—" : `${Math.round((100 * n) / of)}%`);
const k = (n: number): string => (Number.isFinite(n) ? `${Math.round(n / 1000)}k` : "—");
const one = (n: number): string => (Number.isFinite(n) ? n.toFixed(1) : "—");

/** The two periods as one table, with what each row is expected to do. */
export function format(before: Period, after: Period): string {
  const row = (name: string, f: (p: Period) => string): string =>
    `| ${name} | ${f(before)} | ${f(after)} | ${EXPECT[name] ?? ""} |`;
  return [
    "| figure | before | after | expected after |",
    "|---|---|---|---|",
    row("sessions / items landed", (p) => `${p.sessions} / ${p.items}`),
    row(
      "cut mid-item",
      (p) => `${p.midItem} of ${p.compactions} (${pct(p.midItem, p.compactions)})`,
    ),
    row("compactions per item", (p) =>
      p.items === 0 ? "—" : (p.compactions / p.items).toFixed(2),
    ),
    row("ceiling hits", (p) => `${p.ceilingHits} (${pct(p.ceilingHits, p.compactions)})`),
    row('"Prompt is too long"', (p) => String(p.tooLong)),
    row("checkpoint read after a cut", (p) => pct(p.checkpointReads, p.compactions)),
    row("turns held back / sessions", (p) => `${p.deferredTurns} / ${p.deferredSessions}`),
    row("median context per call", (p) => k(p.context)),
    row("seconds per call", (p) => one(p.secondsPerCall)),
    row(
      "minutes per item / claim stamp",
      (p) => `${one(p.minutesPerItem)} / ${one(p.measuredMinutes)}`,
    ),
  ].join("\n");
}
