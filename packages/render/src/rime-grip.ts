import { type RimeState, rimeDone, type SimConfig } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";
import { rimeArrived } from "./rime-pose.js";
import { rimeAt, rimeHalfMiddle, rimeRadius } from "./rime-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The two halves of THE RIME's lens as controls** — the hands lane that
 * makes the frost answer a thumb at all (§11.64, `bosses-choreographed.md` §29).
 *
 * Its own page for `trivet-grip.ts`' reason: the lens a thumb is answered on
 * is the one `drawRime` puts on the screen this frame — dropped in as it
 * arrives — and all this file adds is *whose half* a press is on.
 *
 * **Geometry says whose is whose, on both phones.** The left half is Player
 * 1's and the right Player 2's (`sim/rime-hand.ts`); both screens draw the
 * whole lens, and a thumb on the other seat's side of the spine falls through
 * to whatever is behind it, as the simulation would refuse it anyway.
 *
 * **A press anywhere on a seat's half takes a rub**, out to `REACH` past the
 * rim: held and saying nothing until it turns back on itself, and then its
 * host counts the reversals (`rub.ts`) the way THE CAPSTAN's drum does.
 *
 * **The lens takes a hand until it shatters**: the simulation hears a wipe
 * whenever the lens is present, so a thumb already rubbing when a step lights
 * is counted from its first turn.
 */

/** How far past the rim a thumb is still on the lens, in tiles. */
const REACH = 0.5;

type HalfTarget = "rimeHalfLeft" | "rimeHalfRight";

/** Whether the lens is there to be touched: every phase but the shatter. */
export function rimeTakesHand(s: RimeState): boolean {
  return !rimeDone(s);
}

function target(side: 0 | 1): HalfTarget {
  return side === 0 ? "rimeHalfLeft" : "rimeHalfRight";
}

/**
 * A press on this seat's half of the lens: a rubbing thumb, held and **saying
 * nothing** — what it says is counted once it moves. `bossOf(field, "rime")`
 * is `null` on every wave without it.
 */
export function rimeHalfUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "rime");
  if (s === null || !rimeTakesHand(s)) return null;
  const seat = field.seat;
  const side: 0 | 1 = seat === 1 ? 0 : 1;
  const at = rimeAt(l, field.cfg, rimeArrived(s, field.cfg, field.beat, field.beatPhase));
  const { rx, ry } = rimeRadius(l);
  const reach = REACH * l.tile;
  const dx = x - at.x;
  const dy = y - at.y;
  if ((dx / (rx + reach)) ** 2 + (dy / (ry + reach)) ** 2 > 1) return null;
  if ((side === 0) !== dx <= 0) return null;
  const t = target(side);
  return {
    player: seat,
    command: null,
    hold: { kind: "drag", target: t, player: seat, originX: x, originY: y, rub: true },
  };
}

/**
 * A seat's half as a circle, where it stands this frame — which is where the
 * ghost thumb stands and what `handleCircle` answers. The press is taken over
 * the whole half (`rimeHalfUnder`); this is the middle its clear patch opens from.
 */
export function rimeHalfStanding(
  l: Layout,
  cfg: SimConfig,
  s: RimeState,
  t: HalfTarget,
  beat: number,
  beatPhase: number,
): Circle {
  const side: 0 | 1 = t === "rimeHalfLeft" ? 0 : 1;
  const at = rimeAt(l, cfg, rimeArrived(s, cfg, beat, beatPhase));
  const mid = rimeHalfMiddle(l, side);
  return { x: at.x + mid.x, y: at.y + mid.y, r: rimeRadius(l).rx * 0.5 };
}
