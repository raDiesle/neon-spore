import type { SimConfig } from "./config.js";
import { livingKindForColor } from "./kinds.js";
import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CHUTE: the slick or the bulb thrown clear of a cracked carom, and the
 * only body in this game that goes **up**.
 *
 * It is not a creature a wave has. Nothing authors one and nothing can — it
 * exists because a carom was opened, the way a mount exists because a wheel
 * arrived and a tether because THE WARDEN lowered one. What it *is* is the
 * second half of THE CAROM, and `carom.ts` next door is where the argument
 * for both halves lives.
 *
 * **The shot that cracks a carom does not kill anything.** It splits one
 * arrival into two problems, and they are answered by different people. The
 * crust becomes a rock and falls at a row a beat — player 2's column and
 * player 1's trigger. The body inside is blown out of the hatch, climbs
 * `chuteRiseRows` a beat to the top of the field, opens a canopy there and
 * comes back down at half the speed of a slick, still wearing the colour it
 * always had — player 1's column and player 2's trigger, all over again. So
 * one shot turns one thing the pair were watching into two things they have to
 * divide between them, and the seat that has just finished is the seat that
 * has to start.
 *
 * **`chuteOpen` is the whole of its state, and it is the picture as well as
 * the rule.** False means the canopy is stowed and the body is still being
 * thrown upward; true means it is out and the body is coming down. There is no
 * second flag saying which way it is going and no stored countdown — the
 * moment it touches row zero the canopy opens, and that is the only transition
 * this creature has. Read it through `chuteIsOpen`, never directly.
 *
 * **It is killed by the ordinary rule.** A chute carries a colour and reaches
 * no branch of its own in `bullet-hit.ts`, so the matching cannon takes it
 * exactly the way it takes a slick, for exactly what a slick pays. That is
 * deliberate rather than an omission: the pair has already been charged
 * something new for this arrival, and the second half has to be a sentence
 * they already know how to say.
 */

/** Whether the canopy is out — which is also whether it is coming down. */
export function chuteIsOpen(c: Creature): boolean {
  return c.chuteOpen === true;
}

/**
 * The body a chute is drawn as, from the colour it kept when the crust came
 * off. Reached through `wornKind` and never at a draw site, for the reason
 * every other worn body has one: what a thing is and what it looks like are
 * two questions, and a second copy of the pairing is how a body comes to be
 * drawn in a colour a shot does not match.
 */
export function chuteBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * Whether a chute takes its step down on this beat. It comes down one row
 * every `chuteFallBeats`, so on the beats in between it does not move at all —
 * THE ECHO's mechanism exactly (`echoFalls`), and for its reason: the
 * simulation stores integers, so there is no half a tile for it to travel.
 *
 * Read off the shared clock rather than off a counter on the body, so two
 * chutes never drift apart and neither device has to store a phase.
 */
export function chuteFalls(cfg: SimConfig, beat: number): boolean {
  return cfg.chuteFallBeats <= 1 || beat % cfg.chuteFallBeats === 0;
}

/**
 * One beat of a chute, in place of the fall every other body takes.
 *
 * Two phases and they are read in order: the climb, and the descent. The
 * canopy opens at the top of the field and the same beat is the last one of
 * the climb — deliberately not a beat spent hanging there, because the one
 * thing this body must not do is look finished.
 */
export function stepChute(world: World, c: Creature): void {
  const cfg = world.cfg;
  if (!chuteIsOpen(c)) {
    c.row -= cfg.chuteRiseRows;
    if (c.row > 0) return;
    // It has reached the top. The row is clamped rather than allowed past it,
    // so the body is on the field for the whole of the climb and the frame the
    // canopy opens in is one both players are looking at.
    c.row = 0;
    c.chuteOpen = true;
    world.events.push({
      type: "chuteOpen",
      col: c.col,
      row: c.row,
      // Not null: a chute is only ever made by `caromStruck`, which has
      // already matched a bullet's colour against the body inside.
      color: c.color ?? "cyan",
    });
    return;
  }
  if (chuteFalls(cfg, world.beat)) c.row += 1;
}
