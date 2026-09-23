import { metColor, missedColor } from "./balance.js";
import { colourIsArmoured } from "./colour-armour.js";
import type { SimConfig } from "./config.js";
import { removeCreature } from "./field.js";
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
 * **A shot off zero shuts the body**, for `countdownShutBeats`, and so does a
 * wrong colour on zero — the owner, 20 September 2026: it *should not lose the
 * wave, but have some armoured state*. It was a hit on the hull, the lure's
 * price, and a reflex shot ended the run. Now the price is the beats: the
 * window is `colourIsArmoured`'s (`colour-armour.ts`), grey on both screens,
 * and three of them from the beat before zero is the zero gone. The count is
 * not reset by it — a reset was the owner's "punish that can strand a wave" —
 * so the body goes on falling and counting, and the next zero is still coming.
 * Only the wrong colour is booked as a colour miss: off zero the ammunition
 * may have been right and the moment was not.
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
 * A shot met the body. `true` — on zero, in its colour, not shut: gone.
 * Anything else is refused and the body stays; off zero or in the wrong
 * colour it is shut for `countdownShutBeats` as well, and a shot into the
 * shut body opens nothing more.
 */
export function countdownStruck(world: World, b: Bullet, hit: Creature): boolean {
  const onZero = countdownIsOpen(world.cfg, world.beat, hit);
  const shut = colourIsArmoured(world, hit);
  if (onZero && !shut && hit.color === b.color) {
    metColor(world);
    world.events.push({
      type: "destroy",
      col: hit.col,
      row: hit.row,
      color: hit.color,
      kind: hit.kind,
    });
    removeCreature(world, hit.id);
    return true;
  }
  world.events.push({ type: "reject", col: hit.col, row: hit.row });
  if (shut) return false;
  if (onZero) missedColor(world);
  hit.colourStruckTick = world.tick;
  return false;
}
