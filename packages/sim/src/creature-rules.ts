import type { SimConfig } from "./config.js";

/**
 * The two state machines the bestiary's Runt and Throb ask for
 * (docs/spec/bestiary.md 10.1). Neither needs a fall speed of its own —
 * `fallTilesPerBeat` already answers 1 tile a beat for any kind it does not
 * name — so this file holds only the part that is actually new.
 *
 * The Runt has no cycle at all: it is always exactly as vulnerable as any
 * other aim target, which is precisely the trap — the state machine is
 * `bullet-hit.ts`'s branch on `hit.kind === "runt"`, not a function here.
 *
 * The Throb does have one: it swells and shrinks on the shared beat, and
 * `throbIsOpen` is the whole of it.
 */

/**
 * Whether a Throb can be hit on this beat. A fixed cycle read straight off
 * `world.beat` — the same shared clock both players already read off the HUD
 * and the accent tone (docs/spec/systems.md 5.3) — rather than a phase of its
 * own, so two Throbs never drift apart and neither device has to store one.
 *
 * `beat.ts` calls this once a beat and stores the answer on the creature
 * (`Creature.throbOpen`); nothing else may ask `world.beat` this question a
 * second time, or a bullet resolved between two calls could read a different
 * answer than the one render/ drew.
 */
export function throbIsOpen(cfg: SimConfig, beat: number): boolean {
  return beat % cfg.throbPeriodBeats < cfg.throbOpenBeats;
}
