import { metColor } from "./balance.js";
import { colourIsArmoured } from "./colour-armour.js";
import type { SimConfig } from "./config.js";
import { removeCreature } from "./field.js";
import { breachHull } from "./hull.js";
import { nextInt } from "./rng.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE COUNT: a body that can only be hit on **zero**, and only the pilot can
 * read the count. It counts `countdownBeats` down, one fewer each beat (the
 * pilot sees the blades of an iris, `render/countdown-iris.ts`); on zero the
 * body is open for `countdownOpenBeats`, and then it starts again. The
 * navigator, who holds the triggers, is drawn an eye that never blinks — so
 * the sentence the pair already says for warding, "column four, on
 * the three", comes out of the other mouth and aims the cannon instead of the
 * shield (`docs/spec/ideas.md`, taken 11 September 2026).
 *
 * **The phase is rolled, not read off the clock.** THE THROB's turn is a pure
 * function of `world.tick` because both screens draw it and neither hides a
 * thing; here the whole creature is that one screen cannot see the count, and
 * a count that started on the beat the body entered would be a count the
 * navigator could keep from the arrival alone. `countPhase` comes off the
 * world's own stream on the beat the body spawns, so it is the same number on
 * both devices and a different one on every body, and nothing on player 2's
 * screen says where in the period this one is.
 *
 * **A shot off zero is a hit on the hull** — the wave is lost (`wave-fail.ts`)
 * — the lure's price and for the lure's reason: the mistake this creature
 * exists to punish is firing on sight. The count is not reset by
 * it — a reset was the owner's "punish that can strand a wave" — so the body
 * goes on falling and counting, and the next zero is still coming. A wrong
 * *colour* on zero is a colour miss like any other body's, in `bullet-hit.ts`'
 * generic tail; this file only decides whether the moment was right.
 */

/** How many marks a count is made of — the slots every dial draws. Never below one. */
export function countdownSlots(cfg: SimConfig): number {
  return Math.max(1, cfg.countdownBeats);
}

/** Beats from one count's start to the next: the marks, then the open beats. */
export function countdownPeriod(cfg: SimConfig): number {
  return countdownSlots(cfg) + Math.max(1, cfg.countdownOpenBeats);
}

/** Rolled on the beat the body enters, from the world's stream, so both
 * devices hold the same phase and the fingerprint already covers the roll. */
export function countdownOnSpawn(world: World): { countPhase: number } {
  return { countPhase: nextInt(world.rng, countdownPeriod(world.cfg)) };
}

/**
 * How many beats are left on `beat`: `countdownBeats` down to one, then
 * nought for the open beats, then `countdownBeats` again. The one copy of the
 * arithmetic, read by the shot below and by the picture
 * (`render/countdown-look.ts`), so the count the pilot reads off and the
 * beat the bullet is let in on are one fact
 * (`packages/sim/test/purity.test.ts`).
 */
export function countdownMarks(cfg: SimConfig, beat: number, c: Creature): number {
  const period = countdownPeriod(cfg);
  const at = (((beat + (c.countPhase ?? 0)) % period) + period) % period;
  return Math.max(0, countdownSlots(cfg) - at);
}

/** Whether a shot arriving on `beat` is let in at all. */
export function countdownIsOpen(cfg: SimConfig, beat: number, c: Creature): boolean {
  return countdownMarks(cfg, beat, c) === 0;
}

/**
 * A shot met the body. `"shut"` — off zero: a hit on the hull, and the body
 * stays. `"killed"` — on zero in its colour: gone.
 * `"open"` — on zero and not killed, for the caller's generic tail to book as
 * the colour miss (or the armoured refusal) it is.
 */
export function countdownStruck(
  world: World,
  b: Bullet,
  hit: Creature,
): "shut" | "killed" | "open" {
  if (!countdownIsOpen(world.cfg, world.beat, hit)) {
    // The body's own refusal first, then the price: the same two pictures a
    // lure makes, minus the body going up — it is still there, still counting.
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    breachHull(world, hit.col, hit.kind, hit.row, "heavy", hit.color);
    return "shut";
  }
  if (colourIsArmoured(world, hit) || hit.color !== b.color) return "open";
  metColor(world);
  world.events.push({
    type: "destroy",
    col: hit.col,
    row: hit.row,
    color: hit.color,
    kind: hit.kind,
  });
  removeCreature(world, hit.id);
  return "killed";
}
