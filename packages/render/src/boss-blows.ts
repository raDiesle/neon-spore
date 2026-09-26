import type { SimEvent } from "@neon-spore/sim";
import { BossHurt } from "./boss-hurt.js";

/**
 * **The blow, for the bosses that keep nothing else between frames.**
 *
 * Every boss the pair can get the better of shows it took the blow
 * (`boss-hurt.ts`), and most of them hold theirs in their own fx class next
 * to the bursts and jolts they already had. These four had no fx class at
 * all — their pictures are read straight off the world every frame — so
 * rather than four classes of one field each, their blows are kept here, one
 * field a boss, and dealt off one table of the events that mean *a sequence
 * landed*. A part of a sequence is in no row and deals nothing.
 */

/** The bosses kept here, one field each below. */
type Blowed = "throat" | "vane" | "cairn" | "baton";

const BLOW_OF: Partial<Record<SimEvent["type"], Blowed>> = {
  // A flung gum arrived at the mouth and a ring went slack, and the last one.
  throatChoke: "throat",
  throatEvert: "throat",
  // A unit hauled off the pile — once per seat that paid for the pull.
  cairnPulled: "cairn",
  // A struck bead came down a socket along and left one dark, and the last.
  batonLanded: "baton",
  batonDown: "baton",
  // A pin knocked out of the bearing, the last one too.
  vaneKnock: "vane",
};

export class BossBlows {
  /** The blow a choked ring deals THE THROAT (`throat-draw.ts`). */
  readonly throat = new BossHurt();
  /** The blow a knocked-out pin deals THE VANE (`vane-draw.ts`). */
  readonly vane = new BossHurt();
  /** The blow a pulled unit deals THE CAIRN (`cairn.ts`). */
  readonly cairn = new BossHurt();
  /** The blow a landed bead deals THE BATON (`baton-draw.ts`). */
  readonly baton = new BossHurt();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      const kind = BLOW_OF[e.type];
      if (kind !== undefined) this[kind].hit();
    }
  }

  update(dt: number): void {
    this.throat.update(dt);
    this.vane.update(dt);
    this.cairn.update(dt);
    this.baton.update(dt);
  }

  clear(): void {
    this.throat.clear();
    this.vane.clear();
    this.cairn.clear();
    this.baton.clear();
  }
}
