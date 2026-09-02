import { type Creature, echoAxis, echoSplitPhase, type SimConfig } from "@neon-spore/sim";

/**
 * What tells the pair a body is about to come apart, and which way.
 *
 * THE ECHO wears a slick's or a bulb's contour at six tenths of the size
 * (`livingBodyMul`), which separates it from an ordinary body but says nothing
 * about the thing that actually matters — that in a few beats there will be
 * two of it, and that they will be side by side or one above the other. A
 * creature whose picture gives no warning of what it does is a creature the
 * pair cannot talk about, and talking about it is the whole game.
 *
 * So an echo is drawn **straining**. Two halves of one number
 * (`echoSplitPhase`), and both are read off the axis the simulation will
 * actually use (`echoAxis`), so the picture cannot point one way while the
 * body goes the other:
 *
 * - a **furrow** across that axis, faint from the moment it arrives and cut
 *   deeper as the beat comes — the body is visibly scored where it will part,
 *   which is what says *this one is not a slick* on the first frame;
 * - a **stretch** along it and a squeeze across, so the last beat before a
 *   division is a body pulling itself in two and not quite managing it.
 *
 * A body with no divisions left is drawn with neither, and that absence is
 * information too: it is the one an echo finally settles into, and the pair
 * can stop watching it.
 *
 * The easing is quadratic on purpose. Linear strain reads as a body that has
 * been the wrong shape all along; squared keeps it round while there is time
 * and does nearly all of the pulling in the beat before it goes, which is the
 * moment the warning is worth anything.
 */

/** How far the body pulls out along its axis at the instant it divides. */
const STRAIN = 0.34;

/** How much of that it gives back across the axis, so the body necks rather
 * than simply growing. Under one, because a waist that thinned as fast as the
 * length grew would read as a shape being squashed rather than parting. */
const NECK = 0.55;

/** The furrow's darkness, standing and at full strain. The floor is the part
 * that never goes away: it is what makes the seam a *marking* on this
 * creature rather than an animation that happens to it. */
const SEAM_MIN = 0.22;
const SEAM_MAX = 0.85;

/** The furrow's width across the body, as a share of the radius it cuts. */
const SEAM_WIDTH = 0.16;

/** Squared, so the strain gathers into the beat before the division. */
function strainPhase(cfg: SimConfig, c: Creature, beats: number): number {
  const p = echoSplitPhase(cfg, beats, c);
  return p * p;
}

/**
 * Pull the body out along the axis it is about to divide on, about the point
 * the caller has already translated to. Called before the pose's own rotation
 * and scale, so the stretch is along a *field* direction — the halves step
 * along columns and rows, not along whatever way the body happens to be
 * leaning.
 *
 * Does nothing at all for any other kind, and nothing for an echo that has
 * finished dividing, so the one call site needs no branch of its own.
 */
export function echoStrain(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  c: Creature,
  beats: number,
): void {
  if (c.kind !== "echo") return;
  const axis = echoAxis(cfg, c);
  if (axis === null) return;
  const s = STRAIN * strainPhase(cfg, c, beats);
  if (s <= 0) return;
  const angle = Math.atan2(axis.row, axis.col);
  ctx.rotate(angle);
  ctx.scale(1 + s, 1 - s * NECK);
  ctx.rotate(-angle);
}

/**
 * The furrow, drawn in the body's own scaled space alongside `drawDetails` —
 * so it takes the contour's aspect and the strain above with it, and a bulb's
 * furrow is as round as the bulb is.
 *
 * It is cut *across* the axis: a body dividing sideways is scored down the
 * middle, one dividing up and down is scored across it. That is the whole of
 * how the pair knows which way to expect the halves, and both screens have it.
 */
export function drawEchoSeam(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  c: Creature,
  beats: number,
  rx: number,
  ry: number,
  dark: string,
): void {
  if (c.kind !== "echo") return;
  const axis = echoAxis(cfg, c);
  if (axis === null) return;
  const p = strainPhase(cfg, c, beats);
  const angle = Math.atan2(axis.row, axis.col);
  // Across the axis, and long enough to leave the contour at both ends: a
  // furrow that stopped short would read as a scratch rather than a parting.
  const reach = Math.max(rx, ry) * 1.05;

  ctx.save();
  ctx.rotate(angle);
  ctx.globalAlpha = SEAM_MIN + (SEAM_MAX - SEAM_MIN) * p;
  ctx.strokeStyle = dark;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.min(rx, ry) * SEAM_WIDTH * (1 + p);
  ctx.beginPath();
  ctx.moveTo(0, -reach);
  ctx.lineTo(0, reach);
  ctx.stroke();
  ctx.restore();
}
