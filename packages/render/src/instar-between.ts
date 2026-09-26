import { smoothstep } from "./ease.js";
import type { Figure } from "./instar-shape.js";

/**
 * **THE INSTAR between two poses**: the in-between motion of a morph, keyed
 * on the pose it comes from, the pose it goes to and how far the change has
 * come, 0..1 — never a straight blend of every number at once. The owner, 26
 * September 2026: *more graphic poses and some transition of movements to
 * come into different poses and states*.
 *
 * Four things an animator draws between two keys, each a channel here:
 *
 * - **The parts do not move together.** The head leads, the body — its turn,
 *   its far end, the nests, the fork — follows, and the wings trail: each
 *   part runs over its own stretch of the change (`LEADS`, `FOLLOWS`, `TRAILS`).
 * - **The wings gather.** Mid-change they fold toward the back and only open
 *   into the new pose late, so a body turning or rearing is compact while it
 *   moves; the jaws shut part-way and the fire in them dies down with them.
 * - **A dip before a rise.** The head first goes a little the other way —
 *   down before it rears, back before it looms — and settles into the new
 *   place with a small overshoot, so the move has a start and a stop.
 * - **A blink on a turn.** When the head swings round or across, the eyes
 *   close through the middle of it.
 *
 * At 0 it is exactly the pose it came from and at 1 exactly the new one, so
 * the marks glow up on their parts where they always did (`instar-marks.ts`).
 * Nothing here keeps state.
 */

/** Where in the change each part moves: the head first, the body after, the wings last. */
const LEADS = [0, 0.75] as const;
const FOLLOWS = [0.15, 0.9] as const;
/** Where the wings may begin to open out of the gather: after the body has mostly turned. */
const WINGS_OPEN = 0.6;
/** Where the wings are most folded and the jaws most shut, and by how much. */
const GATHER_AT = 0.45;
const GATHER = 0.35;
const SHUT = 0.5;
/** How far the head goes the wrong way first, as a share of its move, and when. */
const DIP = 0.14;
const DIP_AT = 0.14;
/** How far the head overshoots its new place, the back ease's own constant. */
const SETTLE = 0.9;
/** The blink: when, how wide, how far shut, and how much turn it takes to earn a whole one. */
const BLINK_AT = 0.45;
const BLINK_SPAN = 0.16;
const BLINK = 0.9;
const TURN_FOR_BLINK = 0.5;

type Key = keyof Figure;
const HEAD: readonly Key[] = ["headX", "headY", "headR"];
const FACE: readonly Key[] = ["reach", "wince", "winceLeft"];
const BODY: readonly Key[] = [
  "side",
  "rearX",
  "rearY",
  "eggsX",
  "eggsY",
  "nestX",
  "nestY",
  "tail",
  "tailX",
  "tailY",
];

/** The figure `t` of the way from `a` to `b`, in-betweens and all. */
export function instarBetween(a: Figure, b: Figure, t: number): Figure {
  const out = { ...a };
  // Anything not named below — the moult, the eggs, the heart — goes evenly.
  const even = smoothstep(t);
  for (const k of Object.keys(a) as Key[]) out[k] = a[k] + (b[k] - a[k]) * even;
  const lead = settle(stretch(t, LEADS));
  const dip = DIP * bump(t, DIP_AT, DIP_AT);
  for (const k of HEAD) out[k] = a[k] + (b[k] - a[k]) * (lead - dip);
  const face = smoothstep(stretch(t, LEADS));
  for (const k of FACE) out[k] = a[k] + (b[k] - a[k]) * face;
  const follow = smoothstep(stretch(t, FOLLOWS));
  for (const k of BODY) out[k] = a[k] + (b[k] - a[k]) * follow;
  out.wing = through(a.wing, Math.min(a.wing, b.wing) * GATHER, b.wing, t, WINGS_OPEN);
  out.jawUp = through(a.jawUp, Math.min(a.jawUp, b.jawUp) * SHUT, b.jawUp, t, 0);
  out.jawDown = through(a.jawDown, Math.min(a.jawDown, b.jawDown) * SHUT, b.jawDown, t, 0);
  out.flame = through(a.flame, Math.min(a.flame, b.flame) * SHUT, b.flame, t, 0);
  const turned = Math.abs(b.side - a.side) + Math.abs(b.headX - a.headX) / 500;
  const blink = BLINK * Math.min(1, turned / TURN_FOR_BLINK) * bump(t, BLINK_AT, BLINK_SPAN);
  out.eye = (a.eye + (b.eye - a.eye) * face) * (1 - blink);
  return out;
}

/** `t` rescaled to run 0..1 across `[from, to]` of the change, and held outside it. */
function stretch(t: number, [from, to]: readonly [number, number]): number {
  return Math.max(0, Math.min(1, (t - from) / (to - from)));
}

/** Eased in, and out past 1 by a little before it comes back to rest there. */
function settle(u: number): number {
  const e = smoothstep(u) - 1;
  return 1 + (SETTLE + 1) * e * e * e + SETTLE * e * e;
}

/** A smooth hump, 1 at `at` and nothing further than `span` either side of it. */
function bump(t: number, at: number, span: number): number {
  const d = (t - at) / span;
  if (d <= -1 || d >= 1) return 0;
  const k = 1 - d * d;
  return k * k;
}

/**
 * A value through one key between its ends: from `a` to `mid` by the gather
 * and on to `b` after it, eased at each key. `open` is where the second leg
 * may start at the earliest — the wings stay folded until they trail.
 */
function through(a: number, mid: number, b: number, t: number, open: number): number {
  if (t <= GATHER_AT) return a + (mid - a) * smoothstep(t / GATHER_AT);
  const from = Math.max(GATHER_AT, open);
  return mid + (b - mid) * smoothstep((t - from) / (1 - from));
}
