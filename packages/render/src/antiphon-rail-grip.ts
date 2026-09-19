import { type AntiphonState, antiphonCrossed, type SimConfig } from "@neon-spore/sim";
import { antiphonCentre, antiphonPerch } from "./antiphon-shape.js";
import type { BossCue } from "./boss-cue.js";
import { cueSeen } from "./boss-cue.js";
import { drawCueText } from "./boss-cue-text.js";
import { strokeGlow } from "./glow.js";
import { drawGripRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { hitCircle, type Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsAntiphonRail } from "./view-role-clocks-b.js";

/**
 * **THE ANTIPHON's second handle: the rail, on the one screen it hangs on.**
 *
 * The organ is the pilot's to turn (`antiphon-grip.ts`); this is the
 * navigator's, and the whole of it is one sentence — *pull off the ones you
 * know are wrong.* She carries a candidate down off the rail and it stops
 * counting: a bolt into that column and colour is nothing rather than a
 * hardening, and it cannot fall on them when the cycle ends
 * (`sim/antiphon-hand.ts`). Pull off the one he is describing and the cycle
 * hardens, exactly as firing at a decoy does, so three crossings are three
 * risks where a bolt is one and there is nothing to work out.
 *
 * **Hers and only hers**, decided the way THE SCUTTLE's carry was, by what
 * each seat is drawn: `showsAntiphonRail` puts the rail on her screen alone,
 * and a handle a seat cannot see is not a handle. A press from his seat is
 * dropped without a sound in the simulation, as `queenMark` drops the other
 * seat's.
 *
 * **A ring on every candidate that may still be pulled, never on one.** The
 * rings go up together on the whole rail: a ring on the one she *should*
 * cross off would be her own reading handed back to her, which is the leak
 * `boss-cue-read-p.ts` argues against at length for this boss above all
 * others. The crossed ones lose their ring and take a stroke through them
 * instead, so what she has already said stays said — she is reading a list
 * out loud and needs to see where she is in it.
 *
 * The hit test is the candidate's resting circle at its perch, thumb-sized
 * rather than contour-sized, and the nearest wins when two overlap, which is
 * `creatureAt`'s rule and `scuttle-grip.ts`' for its reason. Whether the
 * pull *takes* — not before the organ stands, not on one already crossed —
 * is the simulation's to refuse; a thumb may rest on a candidate while the
 * organ is still growing and the ring fills under it, which is the picture
 * of a hand held ready.
 */

/** How far below the perch the word sits, in tiles — clear of the candidates and of the window gauge. */
const WORD_DOWN = 0.95;
/** The word's frame, in tiles. */
const HALF_W = 0.62;
const HALF_H = 0.4;
/** How far across a crossed candidate the stroke reaches, in handle radii. */
const CROSS_R = 0.8;

/**
 * A press on a candidate while the rail is up: a `drag` on `antiphonRail`
 * carrying the place on the rail as its `id`, because the rail is never
 * re-ordered and a crossing stays where it was made (`drag-targets-c.ts`).
 */
export function antiphonRailUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "antiphon");
  if (s === null || field.seat !== 2 || !showsAntiphonRail(l.role)) return null;
  if (s.downBeat >= 0 || s.rail.length === 0) return null;
  const r = handleRadius(l, field.cfg);
  let best: number | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < s.rail.length; i++) {
    const c = s.rail[i];
    if (c === undefined || antiphonCrossed(s, i)) continue;
    const at = antiphonPerch(l, c.col);
    if (!hitCircle({ x: at.x, y: at.y, r }, x, y)) continue;
    const d = Math.hypot(x - at.x, y - at.y);
    if (d >= bestDist) continue;
    best = i;
    bestDist = d;
  }
  if (best === null) return null;
  const target = "antiphonRail";
  return {
    player: 2,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id: best },
    hold: { kind: "drag", target, player: 2, originX: x, originY: y, id: best },
  };
}

/** The rings, the strokes through what she has crossed off, and the one word under them. */
export function drawAntiphonRailGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: AntiphonState,
  time: number,
  fade: number,
): void {
  if (fade < 1 || s.downBeat >= 0 || s.rail.length === 0) return;
  const r = handleRadius(l, cfg);
  for (let i = 0; i < s.rail.length; i++) {
    const c = s.rail[i];
    if (c === undefined) continue;
    const at = antiphonPerch(l, c.col);
    if (antiphonCrossed(s, i)) {
      drawCross(ctx, at.x, at.y, r * CROSS_R);
      continue;
    }
    drawGripRing(ctx, at.x, at.y, r, s.heldRail === i, time);
  }
  if (s.heldRail >= 0) return;
  // **The cue** (`decisions.md` #34, `boss-cue-text.ts`). It says the verb and
  // never the answer: one word under the middle of the rail rather than one
  // per candidate, so it names nothing on it. The organ she is being
  // described is still the only question, and it is still on the other
  // screen — this word only says what her thumb may do with a candidate she
  // has already ruled out, which is a thing she worked out herself
  // (`boss-cue-read-p.ts`). The seat is hers twice over: the rail is drawn to
  // her alone, and `cueSeen` says so again rather than trusting the caller.
  const at = antiphonCentre(l, cfg);
  const cue: BossCue = {
    seat: 2,
    kind: "CARRY",
    word: "PULL",
    x: at.x,
    y: antiphonPerch(l, 0).y + l.tile * WORD_DOWN,
    halfW: l.tile * HALF_W,
    halfH: l.tile * HALF_H,
    seed: 96,
    framed: false,
  };
  if (cueSeen(cue, l.role)) drawCueText(ctx, cue, time);
}

/** A crossed candidate: two strokes over it, so a list read out loud shows where she is in it. */
function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  const p = new Path2D();
  p.moveTo(x - r, y - r);
  p.lineTo(x + r, y + r);
  p.moveTo(x + r, y - r);
  p.lineTo(x - r, y + r);
  strokeGlow(ctx, p, PALETTE.dim, STROKE.inner, 0.9);
}
