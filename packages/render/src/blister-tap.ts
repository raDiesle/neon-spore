import { blisterGestureOf, blisterIsUp, blisterMayTap, NO_BEARING } from "@neon-spore/sim";
import { flatCenter, flatRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";

/**
 * **A tap on THE BLISTER**, answered only where the simulation would count it:
 * on a blister that is up, from a seat its `by` allows (`blisterMayTap`).
 *
 * The soundbox's arrangement (`beatbox-tap.ts`) and its reason: a press
 * answered here and refused by `blisterTapped` would be a control that looks
 * live and does nothing. A blister under its pore is nothing to press, so a
 * finger there falls through to whatever else the field answers. A blister
 * refuses a hand (`sim/grippable.ts`), so `creatureAt` never finds one and
 * this is the only test that does.
 */

/** The grip's own reach, for the soundbox's reason (`beatbox-tap.ts`). */
const REACH_MUL = 1.6;

export function blisterUnder(l: Layout, field: Field, x: number, y: number): Touch | null {
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  let centre = { x, y };
  for (const c of field.creatures) {
    if (!blisterIsUp(c) || !blisterMayTap(c, field.seat)) continue;
    const { x: cx, y: cy } = flatCenter(l, c, field.beatPhase);
    const reach = flatRadius(l, field.cfg, c, field.beatPhase) * REACH_MUL;
    const d = Math.hypot(x - cx, y - cy);
    if (d > reach || d >= bestDist) continue;
    best = c.id;
    bestDist = d;
    centre = { x: cx, y: cy };
  }
  if (best === null) return null;
  // A HOLD blister's press is the ordinary `grip`, kept until the lift lets go
  // (`touch.ts`, `sim/blister-hold.ts`) — a mouse's press as a thumb's.
  const body = field.creatures.find((c) => c.id === best);
  // A SWIPE blister's press is a `drag` on `blisterSwipe`, carried from where
  // it landed; the lift says where it ended and the simulation judges the
  // stroke (`touch.ts` `touchUp`, `sim/blister-swipe.ts`).
  if (body !== undefined && blisterGestureOf(body) === "swipe") {
    const target = "blisterSwipe";
    return {
      player: field.seat,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id: best },
      hold: { kind: "drag", target, player: field.seat, originX: x, originY: y, id: best },
    };
  }
  // A TURN blister's press is a `drag` on `blisterTurn` with no bearing yet,
  // and its hold keeps the *body's centre* as its origin, flagged `turns`, so
  // every move reports a bearing round it — THE INSTAR's turn mark's reading
  // (`touch-drag.ts` `turnAbout`, `sim/blister-turn.ts`).
  if (body !== undefined && blisterGestureOf(body) === "turn") {
    const target = "blisterTurn";
    return {
      player: field.seat,
      command: { kind: "drag", target, on: true, fromMilli: NO_BEARING, id: best },
      hold: {
        kind: "drag",
        target,
        player: field.seat,
        originX: centre.x,
        originY: centre.y,
        id: best,
        turns: true,
      },
    };
  }
  if (body !== undefined && blisterGestureOf(body) === "hold") {
    return {
      player: field.seat,
      command: { kind: "grip", id: best },
      hold: { kind: "grip", id: best, player: field.seat, originX: x },
    };
  }
  return { player: field.seat, command: { kind: "tap", id: best }, hold: null };
}
