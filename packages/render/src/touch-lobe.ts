import { type ControlId, controlPress } from "@neon-spore/content";
import type { Command } from "@neon-spore/sim";
import type { Circle } from "./layout.js";
import { assertNever } from "./never.js";
import type { Hold } from "./touch.js";

/**
 * Which lobes a finger can press, and what each of them says.
 *
 * The *saying* is not here any more: `content/src/control-command.ts` is the
 * one copy of what every control on every panel sends, because there used to
 * be four of them and a guide's rehearsal could not reach any of the round
 * ones. What is left here is the half that is genuinely this file's — which
 * ids a lobe answers at all, and which of them a thumb stays on.
 *
 * Split out of `touch.ts` on line count.
 *
 * The switch is exhaustive over `ControlId`, on purpose: two strips
 * (`cannon`, `shield`) are answered directly by `touchDown` before
 * `lobeUnder` ever asks about them, and a round's own slabs — THE GAUGE's
 * three and SNAKE's four — are read by their own listener in `apps/game`
 * instead. All of them say so here rather than falling through a `default`
 * that could not tell "decided" from "forgotten" apart from a real lobe.
 */
export function lobeMeans(
  id: ControlId,
  /**
   * Where this button *is* — needed by exactly one control, and it is the
   * reason this argument exists at all: a crank is turned about its own
   * middle, so what the hold has to carry is that middle rather than the point
   * the finger landed on (`touchMove`). Every other lobe ignores it.
   */
  circle: Circle,
): { command: Command; hold: Hold | null } | null {
  switch (id) {
    case "guard":
    case "intake":
    // THE CLAW's two. Both are on a *band* rather than on slabs — the panel is
    // a control set on the ordinary field, so its lobes are answered here like
    // every other lobe in the game and no listener of its own exists.
    case "reach":
    case "mawTake":
      return { command: controlPress(id).down, hold: null };
    // **The crank is turned, not pressed.** The press says only that a hand
    // has gone on and carries no bearing with it, because the first sample is
    // a starting point and a grab that claimed to be at the top of the circle
    // would wind rope the finger never travelled (`sim/crank.ts`). What the
    // hold carries is the button's own centre: every move after this reports
    // where round *that* the finger now is, and the origin a drag usually
    // keeps — where the hand grabbed — is worth nothing to a circle.
    case "crank":
      return {
        command: controlPress(id).down,
        hold: { kind: "drag", target: "crank", player: 1, originX: circle.x, originY: circle.y },
      };
    // **The two colours are held.** The press says only that a thumb is there;
    // the lift is the ordinary shot, and a thumb that stays fills the cannon
    // lobe and fires a lance by itself (`sim/lance.ts`). The hold carries the
    // id rather than the colour because what lifting sends is the control's
    // own release, asked for where every other control's is
    // (`content/src/control-command.ts`).
    case "fireRed":
    case "fireCyan":
      return { command: controlPress(id).down, hold: { kind: "held", control: id, player: 2 } };
    // THE FLEET's five. The salvo is one press and is over the moment it
    // happens; each arrow is one square and is over just as fast — there is
    // nothing held here, which is why a hold would be wrong: a thumb resting
    // on an arrow that walked the sights would take the counting out of the
    // fight, and the counting is the fight (`sim/fleet.ts`).
    case "salvo":
    case "aimLeft":
    case "aimRight":
    case "aimUp":
    case "aimDown":
    // THE PULSE's eight, and they are lobes rather than slabs because the
    // owner asked for that round to be the game it is part of: the ship is on
    // the screen and the four lanes stand in the band's own sockets. None of
    // them is held — a rhythm is a sequence of instants, and a control that
    // did anything on release would put a second event a hundred milliseconds
    // after the one the pair meant (`sim/pulse-round.ts`).
    case "pulse1Slick":
    case "pulse1Bulb":
    case "pulse1Meteor":
    case "pulse1Pod":
    case "pulse2Slick":
    case "pulse2Bulb":
    case "pulse2Meteor":
    case "pulse2Pod":
    // PINBALL's two, on the band for THE PULSE's reason — the owner asked for
    // that round to be the game it is part of. Neither is held: SET stops a
    // needle on the tick it arrives and FIRE is a strength taken off a bar at
    // one moment, and a thumb that stayed on either would be asking for a
    // second one (`sim/pinball-controls.ts`). What used to slide its bucket is
    // the ship's own cannon strip, answered above like any other wave's.
    case "pinLatch":
    case "pinLaunch":
      return { command: controlPress(id).down, hold: null };
    case "cannon":
    case "shield":
    case "gaugeLeft":
    case "gaugeRight":
    case "gaugeCall":
    case "snakeLeft":
    case "snakeRight":
    case "snakeFire":
    case "snakeMaw":
      return null;
    default:
      return assertNever(id);
  }
}
