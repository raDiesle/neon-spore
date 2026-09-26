import { FRONT, see, view } from "@neon-spore/content";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { instarFarEnd, instarHeadAt, type Point } from "./instar-place.js";
import type { Figure } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { SHADOW } from "./solid-tube-light.js";

/**
 * **THE INSTAR a third of the way round**: face-on it is never square to the
 * screen, but turned as a painter turns a head — the snout toward the left,
 * the body going away behind it to the right, so its flank is seen, the near
 * wing spreads larger than the far one, and the whole reads as a thing in the
 * round rather than a mask laid flat. The owner, 26 September 2026: *either
 * boss looks directly to us or to the side, but some half angle perspective
 * would make it look 3d*.
 *
 * The turn is toward the profile's own facing (head left, body right), so the
 * crossfade into the side view carries on the way it was already going.
 *
 * **The head turns without moving anything a thumb is on.** It is drawn as
 * two planes meeting down the snout, each foreshortened by its own affine
 * (`drawTurnedHead`), and the two affines are fitted so the two eyes land
 * where they always did: the snout swings toward the far side, the far cheek
 * is squeezed, the near one opens. The lips' marks sit near the midline and
 * move by less than the shove's own tremble.
 *
 * **Between the two views it keeps turning.** At rest the turn is `TURN`,
 * and as the figure's `side` runs toward the profile the face-on body, its
 * wings and its snout go on round the same way (`instarTurn`), still solid,
 * until the profile — which is where they were headed — takes over from
 * them across the middle of the turn (`instarHandover`). A crossfade of two
 * still views was two ghosts of one body; this is one body turning, with the
 * cut hidden where the two views nearly agree.
 *
 * The turn is read off the figure, not a clock: the body's far end is where
 * the slow's light is aimed (`slow-intake-aim.ts`), and at rest it is where it
 * always was.
 */

/** How far round from face-on the body and the wings are seen, in radians. */
export const TURN = 0.55;
/** How far round the face-on view has gone by the time the profile has it whole. */
const TURN_FAR = 1.3;
/** Where in the figure's `side` the profile takes over, and over how much of it. */
const HANDOVER_AT = 0.3;
const HANDOVER_SPAN = 0.4;
/** How deep the body runs behind the neck, and how far off the eye is, in head radii. */
export const BODY_DEPTH = 6;
export const BODY_LENS = 10;
/** How far the snout's midline swings toward the far side, in head radii. */
const SNOUT = 0.14;
const SNOUT_FAR = 0.3;
/** How dark the far cheek goes at its edge. */
const FAR_CHEEK = 0.35;
/** How far out each eye sits, in head radii — the two places the head's affines hold. */
const EYE_X = 0.48;

/** How far round the face-on view is seen, with the figure `side` of the way to its profile. */
export function instarTurn(side: number): number {
  return TURN + (TURN_FAR - TURN) * side;
}

/** How much of the body the profile draws, 0..1: none until the turn is well under way. */
export function instarHandover(side: number): number {
  return smoothstep((side - HANDOVER_AT) / HANDOVER_SPAN);
}

/** Where the body leaves the back of the head. */
export function instarNeck(head: Point, r: number): Point {
  return { x: head.x, y: head.y - r * 0.95 };
}

/** The body's far end, `rear` as it is face-on, seen from `turn` round. */
export function turnedFarEnd(neck: Point, rear: Point, r: number, turn = TURN): Point {
  const s = BODY_LENS / (BODY_LENS + BODY_DEPTH);
  const c = { x: BODY_DEPTH * r, y: (rear.y - neck.y) / s, z: (rear.x - neck.x) / s };
  const p = see(c, view(FRONT - turn, 0, r * BODY_LENS));
  return { x: neck.x + p.x, y: neck.y + p.y };
}

/** Where the engines burn in this frame's figure: in whichever view has the body. */
export function instarEnginesAt(l: Layout, f: Figure): Point {
  const rear = instarFarEnd(l, f);
  const { head, r } = instarHeadAt(l, f);
  const t = turnedFarEnd(instarNeck(head, r), rear, r, instarTurn(f.side));
  const k = instarHandover(f.side);
  return { x: t.x + (rear.x - t.x) * k, y: t.y + (rear.y - t.y) * k };
}

/**
 * The head `draw` draws about `head`, turned: once for each half, clipped at
 * the snout and squeezed or opened about it, so each eye stays where it was.
 * The far half, turned from the eye, goes into the cool dark toward its edge
 * over the plates `draw` answers with. `side` swings the snout further round.
 */
export function drawTurnedHead(
  ctx: CanvasRenderingContext2D,
  head: Point,
  r: number,
  look: { fade: number; side: number },
  draw: (half: -1 | 1) => readonly Path2D[],
): void {
  const { fade, side } = look;
  const m = -(SNOUT + (SNOUT_FAR - SNOUT) * side) * r;
  for (const s of [-1, 1] as const) {
    const k = 1 - (s * m) / (EYE_X * r);
    ctx.save();
    ctx.transform(k, 0, 0, 1, head.x + m - k * head.x, 0);
    ctx.beginPath();
    ctx.rect(s < 0 ? head.x - 4 * r : head.x, head.y - 4 * r, 4 * r, 8 * r);
    ctx.clip();
    const plates = draw(s);
    if (s < 0) {
      const dark = ctx.createLinearGradient(head.x, 0, head.x - r, 0);
      dark.addColorStop(0, rgba(SHADOW, 0));
      dark.addColorStop(1, rgba(SHADOW, FAR_CHEEK * fade));
      ctx.fillStyle = dark;
      for (const p of plates) ctx.fill(p);
    }
    ctx.restore();
  }
}
