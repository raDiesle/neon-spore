import {
  type HaspState,
  haspBurning,
  haspWorking,
  NO_BEARING,
  NO_LATCH,
  type SimConfig,
} from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { haspWorkIndex } from "./hasp-pose.js";
import { haspBarAt, haspCentre, haspHubRadius } from "./hasp-shape.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsHaspLatch, showsHaspWheel } from "./view-role-clocks-c.js";

/**
 * **The two thumbs on THE HASP** — half two of the look lane, and the half
 * that makes the door answer a hand at all.
 *
 * Its own page beside `hasp-parts.ts` for `spool-grip.ts`' reason: the bar
 * and the hub a finger is answered at are the same `haspBarAt` and
 * `haspCentre` the drawing paints, and all this file adds is *whether* the
 * press counts. A seat is answered on its own half and on no other — the
 * split the drawing keeps (`showsHaspLatch`, `showsHaspWheel`) — so a thumb
 * that lands where the other seat's control would be finds whatever is behind
 * it, and the simulation refuses the wrong seat regardless (`sim/hasp-hand.ts`).
 *
 * **The latch is carried; the wheel is turned.** His press is the bar at rest
 * and every move after it a depth down the rail in thousandths of a tile,
 * which is the rail's own length (`haspRail`), so the bar stays under the
 * thumb. Her press is anywhere on the working wheel, and the hold carries the
 * hub's centre with `turns` set, so the move is read the crank's way about it
 * — THE GAUGE's dial did it first (`gauge-grip.ts`) and `touch.ts` needed no
 * new branch. There is no fold to undo, unlike THE GIMBAL's rims: the wheel is
 * wound by travel either way round, and the spokes are drawn turning the way
 * the thumb goes on whichever face it is.
 *
 * **What each refuses is what the simulation refuses**, and they are not the
 * same: the latch takes no hand while it is burnt or while no clasp is lit;
 * the rim takes hers whenever a clasp is lit, including every beat the wheel
 * will not move — a seized wheel still keeps her place on it, and the thumb
 * already on the rim is what makes *go* one word rather than two.
 */

/** A thumb's worth round the hub, past the knurl — the whole wheel is the handle. */
const RIM_REACH = 1.35;

/** Whether the latch will take a hand at all: `latchHeard`'s two refusals. */
export function haspLatchTakes(s: HaspState): boolean {
  return haspWorking(s) && !haspBurning(s);
}

/**
 * The bar where it stands: at rest with no hand on it, and at the thumb's
 * depth with one — the rest is what a press is answered at, because by the
 * time a hand has carried it anywhere the pointer is captured and nothing is
 * hit-tested again (`handles.ts`).
 */
export function haspLatchCircle(l: Layout, cfg: SimConfig, s: HaspState): Circle {
  const depth = s.latchMilli === NO_LATCH ? 0 : s.latchMilli;
  const bar = haspBarAt(l, cfg, haspWorkIndex(s), depth);
  return { x: bar.x, y: bar.y, r: handleRadius(l, cfg) };
}

/** The working wheel, as far out as a thumb still has it. */
export function haspWheelCircle(l: Layout, cfg: SimConfig, s: HaspState): Circle {
  const at = haspCentre(l, cfg, haspWorkIndex(s));
  return { x: at.x, y: at.y, r: haspHubRadius(l) * RIM_REACH };
}

/**
 * The pilot's press on the latch. `bossOf(field, "hasp")` is `null` on every
 * wave without the door, and the press then falls through as if no rail were
 * drawn. The grab reports no depth: the latch is a level, and a hand that
 * landed already reporting one would be holding by touching.
 */
export function haspHandleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "hasp");
  if (s === null || field.seat !== 1 || !showsHaspLatch(l.role) || !haspLatchTakes(s)) {
    return null;
  }
  const rest = haspLatchCircle(l, field.cfg, { ...s, latchMilli: NO_LATCH });
  if (!hitCircle(rest, x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "haspLatch", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "haspLatch", player: 1, originX: x, originY: y },
  };
}

/**
 * The navigator's press on the rim. The grab carries no bearing — the first
 * sample is a starting point, and a grab claiming to be at the top would wind
 * the wheel by however far round the finger happened to land.
 */
export function haspRimUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "hasp");
  if (s === null || field.seat !== 2 || !showsHaspWheel(l.role) || !haspWorking(s)) return null;
  const wheel = haspWheelCircle(l, field.cfg, s);
  if (!hitCircle(wheel, x, y)) return null;
  return {
    player: 2,
    command: { kind: "drag", target: "haspWheel", on: true, fromMilli: NO_BEARING },
    hold: {
      kind: "drag",
      target: "haspWheel",
      player: 2,
      originX: wheel.x,
      originY: wheel.y,
      turns: true,
    },
  };
}
