import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { gaugeCue } from "./bind-gauge.js";
import { leadCue } from "./bind-lead.js";
import { ledgerCue } from "./bind-ledger.js";
import { tasterCue } from "./bind-taster.js";
import { throatCue } from "./bind-throat.js";

/**
 * **The bosses whose every event one cue takes**, routed by the event's
 * prefix rather than named one by one.
 *
 * Cut on 29 September 2026, when `bind-choreographed-b.ts` stood a line under
 * its limit and the mark-feedback roll-out still had events to add to three
 * of these. Each of them already had a page of its own answering *where* a
 * sound stands, so its names were being written three times: in its page, in
 * a union there and in a set there — and THE TASTER, THE LEDGER and THE LEAD
 * a fourth time, as the cases in `bind-choreographed.ts` for the events they
 * shipped with. Now each cue takes its whole prefix, and an event a boss
 * gains is one `case` on its own page.
 *
 * **The check is the cue's own switch.** It takes `taster${string}`, so a
 * `tasterX` added to the simulation and not given a `case` there leaves that
 * switch without a return for it, which is a type error — the thing naming
 * each event here used to buy, bought once. The prefixes are safe because
 * no other event starts with one of them; `ledger` and `lead` part at the
 * third letter.
 */
const PREFIXES = ["taster", "ledger", "lead", "gauge", "throat"] as const;

type Prefix = (typeof PREFIXES)[number];

type Of<P extends Prefix> = Extract<SimEvent, { type: `${P}${string}` }>;

export type PrefixedEvent = Of<Prefix>;

function of<P extends Prefix>(e: { type: string }, p: P): e is Of<P> {
  return e.type.startsWith(p);
}

/** Whether one of the pages here takes this event. */
export function isPrefixed(e: { type: string }): e is PrefixedEvent {
  return PREFIXES.some((p) => e.type.startsWith(p));
}

export function prefixedCue(e: PrefixedEvent, cols: number): Cue | null {
  if (of(e, "taster")) return tasterCue(e, cols);
  if (of(e, "ledger")) return ledgerCue(e, cols);
  if (of(e, "lead")) return leadCue(e, cols);
  // No `cols`: the needle and the band are drawn on the plate and stand in
  // no column (`bind-gauge.ts`).
  if (of(e, "gauge")) return gaugeCue(e);
  return throatCue(e, cols);
}
