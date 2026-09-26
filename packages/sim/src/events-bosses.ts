import type { AntiphonEvent } from "./events-antiphon.js";
import type { BatonEvent } from "./events-baton.js";
import type { CurtainEvent } from "./events-curtain.js";
import type { CystEvent } from "./events-cyst.js";
import type { DavitEvent } from "./events-davit.js";
import type { FilamentEvent } from "./events-filament.js";
import type { GaugeEvent } from "./events-gauge.js";
import type { GimbalEvent } from "./events-gimbal.js";
import type { GorgeEvent } from "./events-gorge.js";
import type { GrindstoneEvent } from "./events-grindstone.js";
import type { HalterEvent } from "./events-halter.js";
import type { HaspEvent } from "./events-hasp.js";
import type { HiveEvent } from "./events-hive.js";
import type { InstarEvent } from "./events-instar.js";
import type { KeelEvent } from "./events-keel.js";
import type { LeadEvent } from "./events-lead.js";
import type { LedgerEvent } from "./events-ledger.js";
import type { MantleEvent } from "./events-mantle.js";
import type { OculusEvent } from "./events-oculus.js";
import type { PinballEvent } from "./events-pinball.js";
import type { PlumbEvent } from "./events-plumb.js";
import type { PulseEvent } from "./events-pulse.js";
import type { QueenEvent } from "./events-queen.js";
import type { RatchetEvent } from "./events-ratchet.js";
import type { RimeEvent } from "./events-rime.js";
import type { ScoutEvent } from "./events-scout.js";
import type { ScuttleEvent } from "./events-scuttle.js";
import type { SeamEvent } from "./events-seam.js";
import type { SinewEvent } from "./events-sinew.js";
import type { SlingEvent } from "./events-sling.js";
import type { SnakeEvent } from "./events-snake.js";
import type { SpliceEvent } from "./events-splice.js";
import type { SpoolEvent } from "./events-spool.js";
import type { StareEvent } from "./events-stare.js";
import type { SurgeEvent } from "./events-surge.js";
import type { TasterEvent } from "./events-taster.js";
import type { ThroatEvent } from "./events-throat.js";
import type { TrivetEvent } from "./events-trivet.js";
import type { UndertowEvent } from "./events-undertow.js";
import type { ValveEvent } from "./events-valve.js";
import type { VaneEvent } from "./events-vane.js";
import type { ViseEvent } from "./events-vise.js";
import type { WardenEvent } from "./events-warden.js";
import type { WellEvent } from "./events-well.js";

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
  | GorgeEvent
  | CurtainEvent
  | TasterEvent
  | LedgerEvent
  | SinewEvent
  | SurgeEvent
  | LeadEvent
  | ScuttleEvent
  | AntiphonEvent
  | HiveEvent
  | InstarEvent
  | FilamentEvent
  | GimbalEvent
  | MantleEvent
  | KeelEvent
  | ValveEvent
  | SeamEvent
  | OculusEvent
  | ViseEvent
  | RimeEvent
  | TrivetEvent
  | PlumbEvent
  | SlingEvent
  | GrindstoneEvent
  | CystEvent
  | DavitEvent
  | HalterEvent
  | SpoolEvent
  | HaspEvent
  | RatchetEvent
  | QueenEvent
  | WardenEvent
  | VaneEvent
  | SnakeEvent
  | PinballEvent
  | ScoutEvent
  | PulseEvent
  | ThroatEvent
  | GaugeEvent
  | WellEvent;

export type { AntiphonEvent } from "./events-antiphon.js";
export type { BatonEvent } from "./events-baton.js";
export type { CurtainEvent } from "./events-curtain.js";
export type { CystEvent } from "./events-cyst.js";
export type { DavitEvent } from "./events-davit.js";
export type { FilamentEvent } from "./events-filament.js";
export type { GaugeEvent } from "./events-gauge.js";
export type { GimbalEvent } from "./events-gimbal.js";
export type { GorgeEvent } from "./events-gorge.js";
export type { GrindstoneEvent } from "./events-grindstone.js";
export type { HalterEvent } from "./events-halter.js";
export type { HaspEvent } from "./events-hasp.js";
export type { HiveEvent } from "./events-hive.js";
export type { InstarEvent } from "./events-instar.js";
export type { KeelEvent } from "./events-keel.js";
export type { LeadEvent } from "./events-lead.js";
export type { LedgerEvent } from "./events-ledger.js";
export type { MantleEvent } from "./events-mantle.js";
export type { OculusEvent } from "./events-oculus.js";
export type { PinballEvent } from "./events-pinball.js";
export type { PlumbEvent } from "./events-plumb.js";
export type { PulseEvent } from "./events-pulse.js";
export type { QueenEvent } from "./events-queen.js";
export type { RatchetEvent } from "./events-ratchet.js";
export type { RimeEvent } from "./events-rime.js";
export type { ScoutEvent } from "./events-scout.js";
export type { ScuttleEvent } from "./events-scuttle.js";
export type { SeamEvent } from "./events-seam.js";
export type { SinewEvent } from "./events-sinew.js";
export type { SlingEvent } from "./events-sling.js";
export type { SnakeEvent } from "./events-snake.js";
export type { SpliceEvent } from "./events-splice.js";
export type { SpoolEvent } from "./events-spool.js";
export type { StareEvent } from "./events-stare.js";
export type { SurgeEvent } from "./events-surge.js";
export type { TasterEvent } from "./events-taster.js";
export type { ThroatEvent } from "./events-throat.js";
export type { TrivetEvent } from "./events-trivet.js";
export type { UndertowEvent } from "./events-undertow.js";
export type { ValveEvent } from "./events-valve.js";
export type { VaneEvent } from "./events-vane.js";
export type { ViseEvent } from "./events-vise.js";
export type { WardenEvent } from "./events-warden.js";
export type { WellEvent } from "./events-well.js";
