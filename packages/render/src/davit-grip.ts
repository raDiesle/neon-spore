import { type DavitState, davitDraws, davitSteers, type SimConfig } from "@neon-spore/sim";
import { davitAngle, davitStood } from "./davit-pose.js";
import { davitHook, davitHookRadius, davitMast, davitTip } from "./davit-shape.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE DAVIT's two steers and two looses as controls**.
 *
 * **A steer is the boom itself, carried**: `davitSteerLeft` is the pilot's,
 * `davitSteerRight` the navigator's, and `davitSteers` says whose. The thumb
 * goes down on the boom — a circle round its middle, wide enough to take the
 * mast too — and says nothing until it moves; then the generic drag hold
 * sends its sideways carry, and the simulation turns that into the boom's
 * angle (`sim/davit-hand.ts`). It was the phone's lean until 30 September
 * 2026, when the owner asked for a drag. It is asked before the loose in
 * `handles.ts`, so on a reland — where one seat both steers and draws — the
 * boom steers and anywhere else on the panel draws.
 *
 * **The looses**: `davitLooseLeft` is the pilot's
 * (seat 1), `davitLooseRight` the navigator's (seat 2) — `davitDraws` says
 * whose turn it is, the same way `sling-hand.ts`'s command side does, and the
 * wrong seat's thumb finds nothing there to press.
 *
 * **A loose is `DrawRelease`, §32's primitive, reused whole**: `on: true` is
 * the thumb landing anywhere on the seat's own panel, not a handle circle —
 * so the hit test here is the whole field, the same as `sling-grip.ts`'s. It
 * is asked only while `davitDraws` wants this seat's loose, so a fire step's
 * cannon and trigger still answer underneath it. The lift carries the
 * swipe's side on `fromMilli` the way THE SLING's does, so `touch.ts`'s
 * `swiped` set has to know these two targets too or the sign never reaches
 * the sim.
 *
 * **The circle `davitLooseCircle` draws is the hook at rest** — unlike THE
 * SLING's two tines, both seats' looses answer the one shared hook, so the
 * circle does not move by `side`; it is used only for the ghost hand and the
 * resting picture, never for the hit test.
 */

/** The loose's reach round the hook, in hook radii. The marks are this wide too (`davit-verdicts.ts`). */
export const GRIP_R_MUL = 1.6;
/** The steer's reach round the boom's middle, in tiles: the boom and the mast. */
export const STEER_R = 1.1;

function seatSide(field: Field): 0 | 1 | null {
  return field.seat === 1 ? 0 : field.seat === 2 ? 1 : null;
}

function steerTarget(side: 0 | 1): "davitSteerLeft" | "davitSteerRight" {
  return side === 0 ? "davitSteerLeft" : "davitSteerRight";
}

function target(side: 0 | 1): "davitLooseLeft" | "davitLooseRight" {
  return side === 0 ? "davitLooseLeft" : "davitLooseRight";
}

/** The hook's rest handle, once the boom has stood up out of its socket. */
export function davitLooseCircle(
  l: Layout,
  cfg: SimConfig,
  s: DavitState,
  _side: 0 | 1,
  beat: number,
  beatPhase: number,
): Circle {
  const mast = davitMast(l, cfg);
  const stood = davitStood(s, beat, beatPhase, cfg.davitStillBeats);
  const angle = davitAngle(s, cfg, beatPhase) * stood;
  const hook = davitHook(l, angle, 1);
  return {
    x: mast.x + hook.x,
    y: mast.y + hook.y,
    r: davitHookRadius(l) * GRIP_R_MUL,
  };
}

export function davitLooseUnder(_l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "davit");
  if (s === null) return null;
  const side = seatSide(field);
  if (side === null || !davitDraws(s, side)) return null;
  const t = target(side);
  return {
    player: field.seat,
    command: { kind: "drag", target: t, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: t, player: field.seat, originX: x, originY: y },
  };
}

/** The boom's middle where it stands this frame: where a steering thumb goes down. */
export function davitSteerCircle(
  l: Layout,
  cfg: SimConfig,
  s: DavitState,
  beat: number,
  beatPhase: number,
): Circle {
  const mast = davitMast(l, cfg);
  const stood = davitStood(s, beat, beatPhase, cfg.davitStillBeats);
  const tip = davitTip(l, davitAngle(s, cfg, beatPhase) * stood);
  return { x: mast.x + tip.x / 2, y: mast.y + tip.y / 2, r: STEER_R * l.tile };
}

/** A press on the boom by the seat the lit step has steer: held, and silent until it moves. */
export function davitSteerUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "davit");
  if (s === null) return null;
  const side = seatSide(field);
  if (side === null || !davitSteers(s, side)) return null;
  const c = davitSteerCircle(l, field.cfg, s, field.beat, field.beatPhase);
  if (Math.hypot(x - c.x, y - c.y) > c.r) return null;
  const t = steerTarget(side);
  return {
    player: field.seat,
    command: null,
    hold: { kind: "drag", target: t, player: field.seat, originX: x, originY: y },
  };
}
