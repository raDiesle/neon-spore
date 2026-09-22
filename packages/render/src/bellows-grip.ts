import { type BellowsState, bellowsDepthMilli, type SimConfig } from "@neon-spore/sim";
import { bellowsFillMilli } from "./bellows-pose.js";
import { bellowsHandleAt } from "./bellows-shape.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsBellowsPull, showsBellowsPush } from "./view-role-clocks-b.js";

/**
 * **The thumb on one of THE BELLOWS's two handles** — half two of the look
 * lane, and the half that makes the lung answer a hand at all.
 *
 * Its own page beside `bellows-handle.ts` rather than inside it, for
 * `sinew-handles.ts`' reason turned up one notch: the bar a finger is answered
 * at and the bar the drawing paints are the same `bellowsHandleAt`, and the
 * only thing this file adds is *whether* the press counts. Keeping the two in
 * one file would have put a hit test in a page the frame test already drives
 * for its painting, and keeping the geometry in a third (`bellows-shape.ts`)
 * is what stops either of them writing down where the rail is a second time.
 *
 * **A seat is answered on its own handle and on no other** — the same split
 * the drawing keeps (`showsBellowsPull`, `showsBellowsPush`), so a thumb that
 * lands where the other seat's rail would be finds whatever is behind it.
 *
 * **The wrong seat's grab is not refused, and that is the whole boss.** A
 * stroke in someone else's beat jams both handles and spends the exchange
 * (`sim/bellows-hand.ts`), which is the fight's one fault and the thing the
 * pair has to hear, name and start again from. A hit test that only opened
 * while `bellowsTurn` named this seat would have made the fault unreachable
 * and left the lung a machine that cannot be played wrong.
 *
 * **What it does refuse is what the simulation refuses**: a jam, the opening
 * still and the vent take no hand at all, so a press in one of those three
 * falls through exactly as if no rail were drawn — `boss-cue.ts`'s first rule,
 * asked of a hit test rather than of a word.
 *
 * **The rest, and not where the bar has been carried.** `handles.ts`' standing
 * rule: by the time a hand has carried the bar down the rail the pointer is
 * captured and nothing is hit-tested again, so the circle here is the bar with
 * no hand on it. Where it is *standing* under a hand is `handle-place.ts`'s
 * question and `bellowsHandleAt`'s answer, with the depth passed in.
 */

/** Which target is whose, fixed by geometry and never negotiated (§11.35). */
export function bellowsTarget(player: 1 | 2): "bellowsPull" | "bellowsPush" {
  return player === 1 ? "bellowsPull" : "bellowsPush";
}

/** Whether this seat is shown — and so may take hold of — its own handle. */
export function showsBellowsHandle(l: Layout, player: 1 | 2): boolean {
  return player === 1 ? showsBellowsPull(l.role) : showsBellowsPush(l.role);
}

/** Whether there is a handle to take hold of at all: `bellowsHeard`'s own three refusals. */
export function bellowsTakesHand(s: BellowsState): boolean {
  return s.phase !== "jam" && s.phase !== "vent" && s.phase !== "still";
}

/**
 * One seat's bar, where it rests with no hand on it. The rail hangs off the
 * cap, so the circle travels with the chamber's own fill — a housing drawn
 * out carries its handle with it, and a press is answered where the bar is
 * drawn on this frame rather than where it was drawn on the fight's first.
 */
export function bellowsHandleCircle(
  l: Layout,
  cfg: SimConfig,
  s: BellowsState,
  player: 1 | 2,
  beat: number,
  beatPhase: number,
): Circle {
  const open = bellowsFillMilli(s, cfg, player, beat, beatPhase);
  const { at } = bellowsHandleAt(l, cfg, player, open, 0);
  return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
}

/** Where the bar is **standing**, with this seat's thumb wherever it has carried it. */
export function bellowsHandleStanding(
  l: Layout,
  cfg: SimConfig,
  s: BellowsState,
  player: 1 | 2,
  beat: number,
  beatPhase: number,
): Circle {
  const open = bellowsFillMilli(s, cfg, player, beat, beatPhase);
  const { at } = bellowsHandleAt(l, cfg, player, open, bellowsDepthMilli(s, player));
  return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
}

/**
 * The press. `bossOf(field, "bellows")` is `null` on every wave without the
 * lung, and a press then falls through to whatever is behind it exactly as if
 * no rail were there.
 */
export function bellowsHandleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "bellows");
  if (s === null || !bellowsTakesHand(s)) return null;
  const player = field.seat;
  if (!showsBellowsHandle(l, player)) return null;
  const rest = bellowsHandleCircle(l, field.cfg, s, player, field.beat, field.beatPhase);
  if (!hitCircle(rest, x, y)) return null;
  const target = bellowsTarget(player);
  return {
    player,
    // The grab is the origin and carries nothing: the stroke is the *edge*
    // across `bellowsWorkMilli` on the way down, so a hand that reported a
    // depth the moment it landed would work the handle by touching it.
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player, originX: x, originY: y },
  };
}
