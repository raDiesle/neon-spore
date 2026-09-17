import type { BatonEvent } from "./events-baton.js";
import type { CandleEvent } from "./events-candle.js";
import type { CurtainEvent } from "./events-curtain.js";
import type { GorgeEvent } from "./events-gorge.js";
import type { LeadEvent } from "./events-lead.js";
import type { LedgerEvent } from "./events-ledger.js";
import type { ScuttleEvent } from "./events-scuttle.js";
import type { SinewEvent } from "./events-sinew.js";
import type { SpliceEvent } from "./events-splice.js";
import type { StareEvent } from "./events-stare.js";
import type { SurgeEvent } from "./events-surge.js";
import type { TasterEvent } from "./events-taster.js";
import type { UndertowEvent } from "./events-undertow.js";

/**
 * **The choreographed bosses' arms of `SimEvent`**, as one union.
 *
 * `events.ts` has been at its 250-line limit for four bosses running, and
 * each one costs it three lines there — an import, an arm and a re-export —
 * for nothing but the privilege of being named in the same file as the field's
 * own events. The seam is the one that file's own comment had already found
 * (*the bosses' own arms, next door: this file keeps hitting its 250-line
 * limit*): next door is what the **field** reports — a shot, a breach, a body,
 * a pod, a wave opening — and everything here belongs to a mechanism a wave
 * installed over one, on `docs/spec/bosses-choreographed.md`'s page.
 *
 * It is one import, one arm and one line per boss from here, and `events.ts`
 * does not grow at all.
 *
 * **`packages/audio/test/bind.test.ts` reads each of these files by name**
 * rather than through this barrel, which is deliberate and is that test's own
 * rule: a file it cannot find is a file whose events go silently unheard, so
 * the list has to be one somebody adds to on purpose.
 */
export type BossEvent =
  | SpliceEvent
  | StareEvent
  | BatonEvent
  | UndertowEvent
  | CandleEvent
  | GorgeEvent
  | CurtainEvent
  | TasterEvent
  | LedgerEvent
  | SinewEvent
  | SurgeEvent
  | LeadEvent
  | ScuttleEvent;

export type { BatonEvent } from "./events-baton.js";
export type { CandleEvent } from "./events-candle.js";
export type { CurtainEvent } from "./events-curtain.js";
export type { GorgeEvent } from "./events-gorge.js";
export type { LeadEvent } from "./events-lead.js";
export type { LedgerEvent } from "./events-ledger.js";
export type { ScuttleEvent } from "./events-scuttle.js";
export type { SinewEvent } from "./events-sinew.js";
export type { SpliceEvent } from "./events-splice.js";
export type { StareEvent } from "./events-stare.js";
export type { SurgeEvent } from "./events-surge.js";
export type { TasterEvent } from "./events-taster.js";
export type { UndertowEvent } from "./events-undertow.js";
