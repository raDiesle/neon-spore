import {
  type AntiphonState,
  antiphonBoss,
  antiphonCrossed,
  antiphonDown,
  antiphonGrown,
  antiphonHeld,
  antiphonIsOrgan,
} from "./antiphon.js";
import { antiphonHarden } from "./antiphon-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE ANTIPHON's two hands** — the pilot's thumb resting on the organ, and
 * the navigator's pulling a candidate off her rail — off the wire, on the
 * tick.
 *
 * The turn is the first, and the one place on that page where a hand on
 * the boss is an aid rather than an action: while either seat rests a thumb
 * on the organ it **turns slowly in place**, a whole turn in
 * `antiphonTurnBeats`, and it stops where it is the moment the thumb lifts
 * (`docs/spec/bosses-choreographed.md` §12, *neither, and it is the one
 * concept that wants no time effect at all*). What the pair buys is a
 * second viewing angle — a shape being described can be looked at from
 * more than one — and nothing about the fight changes for it: no event, no
 * sound, no window shortened. The pilot's screen is where the organ is,
 * so his is the thumb that reaches it (`render/antiphon-grip.ts`); the
 * command carries `player` and the simulation keeps both, for THE SURGE's
 * reason — which seat sent it is the wire's fact, not the glass's.
 *
 * On the tick and not the beat, because the turn is a rotation a finger is
 * watching, and one that advanced a beat at a time would be a shape
 * snapping between eight orientations rather than turning.
 *
 * **The pull is the second, and it is hers.** She carries a candidate down
 * off the rail, `antiphonPullMilli` of a tile, and it stops counting: a bolt
 * into its column and colour is nothing rather than a hardening, and it
 * cannot fall on them when the cycle ends. The rule is one sentence in any
 * language: *pull off the ones you know are wrong.* The cost is the same one
 * a bolt pays — **pull off the one he is describing and the cycle hardens**,
 * exactly as firing a decoy does — so crossing off three candidates is three
 * risks where a bolt is one, and there is nothing to work out and no
 * dominant way to play it.
 *
 * **Hers and only hers**, and decided the way THE LEAD's stalk was, by what
 * each seat is drawn: `showsAntiphonRail` puts the rail on her screen alone,
 * and a handle a seat cannot see is not a handle. The pilot's press is
 * dropped without a sound, as `queenMark`'s is. It never reaches his ear
 * either — the sound is seated (`audio/bind-antiphon.ts`), because a pan on
 * his phone would tell him a column she had eliminated, which is the one
 * thing this boss is built to make them say out loud.
 *
 * Nothing may be pulled before the organ has pushed all the way out, for
 * `antiphon-shot.ts`' reason: a pull against a contour still resolving is a
 * guess, exactly as a bolt into one is.
 */

/** One seat's thumb on or off the organ. A hand is kept through the rest between cycles: the next organ turns under it from nought. */
export function antiphonHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "antiphonOrgan") return;
  const s = antiphonBoss(world);
  if (s === null || antiphonDown(s)) return;
  if (player === 1) s.heldP1 = command.on;
  else s.heldP2 = command.on;
}

/** The turn, a tick at a time, while a thumb rests and an organ stands to be turned. */
export function stepAntiphonTurn(world: World): void {
  const s = antiphonBoss(world);
  if (s === null || s.organs.length === 0) return;
  if (antiphonHeld(s, 1) || antiphonHeld(s, 2)) s.turnTicks += 1;
}

/** The navigator's thumb on or off a candidate, and the one pull it may make. */
export function antiphonPulled(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "antiphonRail") return;
  if (player !== 2) return;
  const s = antiphonBoss(world);
  if (s === null || antiphonDown(s)) return;
  const i = command.id ?? -1;
  if (!command.on) {
    // Lifting off a candidate her thumb has already left says nothing: it is
    // the old one letting go behind the new one (`scuttle-hand.ts`).
    if (s.heldRail === i) s.heldRail = -1;
    return;
  }
  const c = s.rail[i];
  if (c === undefined || antiphonCrossed(s, i)) return;
  s.heldRail = i;
  if (!standing(world, s)) return;
  if (command.fromYMilli === undefined || command.fromYMilli < world.cfg.antiphonPullMilli) return;
  if (antiphonIsOrgan(s, c)) {
    antiphonHarden(world, s, c.col);
    return;
  }
  s.crossed.push(i);
  world.events.push({
    type: "antiphonPull",
    col: c.col,
    left: s.rail.length - s.crossed.length,
  });
}

/** Whether an organ stands grown all the way out, so an answer is an answer and not a guess. */
function standing(world: World, s: AntiphonState): boolean {
  const o = s.organs[0];
  return o !== undefined && antiphonGrown(o, world.cfg, world.beat);
}
