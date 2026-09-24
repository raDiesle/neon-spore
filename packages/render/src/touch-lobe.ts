import { type ControlId, type ControlSet, controlPress } from "@neon-spore/content";
import type { Command } from "@neon-spore/sim";
import { bandLobes, type Circle, hitCircle, type Layout } from "./layout.js";
import { assertNever } from "./never.js";
import type { Hold, Touch } from "./touch.js";

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
 * `lobeUnder` ever asks about them. Both say so here rather than falling
 * through a `default` that could not tell "decided" from "forgotten" apart
 * from a real lobe.
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
    // THE SCOUT's mouth, player 2's one press: a moment, not a hold — it
    // stands open for `scoutMawTicks` from the press and shuts on its own
    // (`sim/scout-round.ts`).
    case "scoutMaw":
    // SNAKE's four, on the band since the owner asked for its buttons to look
    // like the others. None is held: a turn is queued and stands until the
    // body takes it, the shot is one press and the mouth is a window that
    // shuts on its own (`sim/snake-controls.ts`).
    case "snakeLeft":
    case "snakeRight":
    case "snakeFire":
    case "snakeMaw":
      return { command: controlPress(id).down, hold: null };
    // THE SCOUT's three that fly, and **all three are held**: the nose keeps
    // swinging and the burn keeps pushing until the thumb comes off, which is
    // the round's whole feel — a heading said out loud is a heading somebody
    // has to *hold* (`sim/scout-fly.ts`). They stand on the band because the
    // design put them where THE CLAW's crank and REACH stand, and that panel
    // is the band; the lift sends the control's own release, as the two
    // colours' does.
    case "scoutTurnLeft":
    case "scoutTurnRight":
    case "scoutBurn":
      return { command: controlPress(id).down, hold: { kind: "held", control: id, player: 1 } };
    // THE GAUGE's three, on the band since the owner asked for its buttons to
    // fit the ship's (20 September 2026). The two turns are **held** — the
    // claw swings for as long as the thumb stays and stops when it lifts
    // (`sim/gauge-hand.ts`) — and the call is one press by the other seat.
    case "gaugeLeft":
    case "gaugeRight":
      return { command: controlPress(id).down, hold: { kind: "held", control: id, player: 1 } };
    case "gaugeCall":
      return { command: controlPress(id).down, hold: null };
    case "cannon":
    case "shield":
      return null;
    default:
      return assertNever(id);
  }
}

/**
 * A finger against one seat's lobes, and there is no list of them in here.
 *
 * `bandLobes` is asked for the circles with the wave's own set, which is the
 * same call `band.ts` makes to draw them — so a button is answered exactly
 * where it was drawn, and a control the set left out has no circle to be
 * answered at. That is the whole reason this is a call and not five `if`s
 * against named fields of the layout: five `if`s were a second, older list of
 * what is on a panel, and it went on including the lance after the panel
 * stopped. Moved here from `touch.ts` on that file's line limit, beside
 * what a lobe *says*.
 */
export function lobeUnder(
  l: Layout,
  set: ControlSet,
  player: 1 | 2,
  x: number,
  y: number,
): Touch | null {
  // The nearest button whose reach holds the press, never the first in the
  // row: two reaches may overlap now that they run well past the drawn edge
  // (`hitReach`), and the thumb meant the one it is closer to.
  let best: Touch | null = null;
  let bestDist = Infinity;
  for (const lobe of bandLobes(l, set, player)) {
    if (!hitCircle(lobe.circle, x, y)) continue;
    const d = Math.hypot(x - lobe.circle.x, y - lobe.circle.y);
    if (d >= bestDist) continue;
    const said = lobeMeans(lobe.control.id, lobe.circle);
    if (!said) continue;
    best = { player: lobe.control.player, ...said };
    bestDist = d;
  }
  return best;
}
