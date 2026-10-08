import {
  antiphonBoss,
  antiphonChooser,
  antiphonDown,
  antiphonHeld,
  antiphonStanding,
} from "./antiphon.js";
import { antiphonArrive } from "./antiphon-step.js";
import { springAntiphonTurn } from "./antiphon-turn.js";
import { antiphonAlongVein } from "./antiphon-vein.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE ANTIPHON's two hands** — the explainer's thumb resting on the organ,
 * and the chooser's carrying a candidate down its vein — off the wire, on
 * the tick.
 *
 * The turn is the first, and an aid rather than an action: while a thumb
 * rests on the organ it **turns slowly in place**, a whole turn in
 * `antiphonTurnBeats`, and stops where it is the moment the thumb lifts. What
 * the pair buys is a second viewing angle and nothing about the fight
 * changes for it — on a level whose organ rests at a turn of its own the
 * turn springs back when the thumb lifts, so it still changes nothing
 * (`antiphon-turn.ts`). The organ is drawn on the explainer's screen alone, so his
 * is the thumb that reaches it (`render/antiphon-grip.ts`); the simulation
 * keeps both seats, for THE SURGE's reason. On the tick, because a turn a
 * beat at a time would be a shape snapping rather than turning.
 *
 * **The carry is the answer, and it is the chooser's** — the seat the rail is
 * drawn for this level (`antiphonChooser`), the other seat's press dropped
 * without a sound as `queenMark` drops it. The thumb grabs a candidate on the
 * rail, and its displacement from the grab, in thousandths of a tile, is
 * read along that candidate's vein (`antiphon-vein.ts`): the candidate moves
 * down it as far as the thumb has, back up if the thumb goes back, and stays
 * put while the thumb is off the line. Let go short of the organ and it
 * springs back to the rail, nothing said. Carried `antiphonReachMilli` of the
 * way, it **arrives** and is judged there (`antiphonArrive`): the one THE
 * FILAMENT's line taught, a path to drag along and a place to drop at.
 *
 * Nothing may be carried before the organ has pushed all the way out: a
 * carry against a contour still resolving is a guess, and so is one while
 * another candidate is in hand.
 */

/** One seat's thumb on or off the organ. A hand is kept through the rest between levels: the next organ turns under it from nought. */
export function antiphonHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "antiphonOrgan") return;
  const s = antiphonBoss(world);
  if (s === null || antiphonDown(s)) return;
  if (player === 1) s.heldP1 = command.on;
  else s.heldP2 = command.on;
}

/** The turn, a tick at a time, while a thumb rests and an organ stands to be turned — and the spring back once none does. */
export function stepAntiphonTurn(world: World): void {
  const s = antiphonBoss(world);
  if (s === null || s.organ === null) return;
  if (antiphonHeld(s, 1) || antiphonHeld(s, 2)) s.turnTicks += 1;
  else springAntiphonTurn(s, world.cfg);
}

/** The chooser's thumb on, along or off a candidate's vein. */
export function antiphonCarried(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "antiphonRail") return;
  const s = antiphonBoss(world);
  if (s === null || antiphonDown(s) || player !== antiphonChooser(s)) return;
  const i = command.id ?? -1;
  if (!command.on) {
    // Lifting off a candidate the thumb is not carrying says nothing: it is
    // an old press letting go behind a new one (`scuttle-hand.ts`).
    if (s.carried === i) {
      s.carried = -1;
      s.carryMilli = 0;
    }
    return;
  }
  if (s.rail[i] === undefined || !antiphonStanding(s, world.cfg, world.beat)) return;
  if (s.carried >= 0 && s.carried !== i) return;
  s.carried = i;
  const along = antiphonAlongVein(world.cfg, s, i, command.fromMilli, command.fromYMilli ?? 0);
  if (along === null) return;
  s.carryMilli = along;
  if (along >= world.cfg.antiphonReachMilli) antiphonArrive(world, s, i);
}
