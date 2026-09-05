import {
  catmullRomToBezierPath,
  hullRadiusMul,
  openSmoothPath,
  type Point,
  wardenOpening,
} from "@neon-spore/content";
import {
  type Creature,
  type SimConfig,
  WARDEN_COLS,
  type WardenState,
  wardenColor,
  wardenCycle,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Circle, type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawWardenCilia } from "./warden-cilia.js";
import { drawEye, drawHatch, HATCH } from "./warden-eye.js";
import { drawPlates } from "./warden-plates.js";
import { drawWardenEyelets } from "./warden-skin.js";
import { drawWardenUnderskin } from "./warden-veins.js";

/**
 * THE WARDEN, drawn: a horseshoe standing over a hole you can see the field
 * through, open underneath.
 *
 * Two lobed loops under different seeds, joined into one contour by
 * `wardenOpening` — the material below the pupil is cut away, walls running
 * down from its widest points and out through the rim, so the shot that counts
 * has a way in. A body closed all the way round drew a band of its own rock
 * between the cannon and the one thing on it worth hitting, and of the picture
 * and the rule, the picture is the one a player believes.
 *
 * The two loops deliberately disagree: eight shallow lobes and almost no
 * wobble on the body, five deeper ones with three times the wobble on the
 * pupil, so the edge you look *through* is the one that moves.
 *
 * The numbers are `tools/shape-sheet/src/drafts/bosses.ts`'s, which is where
 * they were tuned and where they can be looked at as a still.
 */

const OUTER = { lobes: 8, depth: 0.035, wobble: 0.012, seed: 5.0 };
const PUPIL = { lobes: 5, depth: 0.1, wobble: 0.075, seed: 9.0 };

/** The pupil at rest, and open, as fractions of the body's radius. */
const PUPIL_REST = 0.44;
const PUPIL_OPEN = 0.62;

/**
 * How far off centre the pupil sits when it has slid all the way to one side,
 * in fractions of the body's radius. Far enough that the material visibly
 * bunches on one side and thins on the other — a smaller offset reads as a
 * hole that happens to be off centre, which is a manufacturing defect rather
 * than a thing looking at you.
 */
const PUPIL_TRAVEL = 0.28;

function loop(
  l: { lobes: number; depth: number; wobble: number; seed: number },
  cx: number,
  cy: number,
  r: number,
  t: number,
): Point[] {
  const pts: Point[] = [];
  const N = 40;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = hullRadiusMul(a, l.lobes, l.depth, l.wobble, t, l.seed);
    pts.push({ x: cx + Math.cos(a) * r * m, y: cy + Math.sin(a) * r * m });
  }
  return pts;
}

/** How far the ring reaches from its own centre, in screen pixels. */
function wardenRadius(l: Layout): number {
  return (l.tile * WARDEN_COLS) / 2;
}

/**
 * Where the hole is standing this instant, in pixels: its centre and how wide
 * it has come open.
 *
 * Exported because the rope hangs off it. It used to hang off the *rim* — one
 * fixed point under the middle of the body — and that was a line tied to the
 * armour beside an eye that had walked two columns away from it. The owner
 * asked for the string to be connected directly to the eye, and this is the
 * one place the eye's position is worked out, so both the picture and the
 * anchor read it from here rather than each keeping a copy.
 */
export function wardenEyeCircle(
  l: Layout,
  body: Creature,
  b: WardenState,
  openness: number,
): Circle {
  const r = wardenRadius(l);
  const centreCol = body.col + (WARDEN_COLS - 1) / 2;
  // Where the hole is, in the body's own units: its column against the body's,
  // clamped to the travel the shape can take without breaching the rim.
  const away = (b.pupilCol - centreCol) / ((WARDEN_COLS - 1) / 2);
  return {
    x: tileCX(l, centreCol) + away * PUPIL_TRAVEL * r,
    y: tileCY(l, body.row),
    r: r * (PUPIL_REST + (PUPIL_OPEN - PUPIL_REST) * openness),
  };
}

/**
 * How far down the eye's own radius the rope is rooted — just past the wet
 * film, which stands at `FLUID_MUL` of the socket (`eye.ts`), so the line
 * leaves the eye where the eye ends rather than crossing it.
 */
const ROPE_ROOT = 0.98;

/**
 * The point a tether leaves from: the underside of the eye, and it travels
 * with the eye.
 *
 * A line off the rim said the rope was tied to the armour; a line off the
 * middle would be a line drawn *through* the boss, and the one thing this body
 * has to say about itself is that its middle is a hole. Off the eye's lower
 * edge it runs straight down the throat that is cut there for it — the same
 * slot the shot comes up — so the picture is one sentence: the thing the rope
 * holds open is the thing the rope is tied to.
 */
export function wardenRopeAnchor(
  l: Layout,
  body: Creature,
  b: WardenState,
  openness: number,
): { x: number; y: number } {
  const eye = wardenEyeCircle(l, body, b, openness);
  return { x: eye.x, y: eye.y + eye.r * ROPE_ROOT };
}

export function drawWarden(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  body: Creature,
  b: WardenState,
  waveBeat: number,
  beat: number,
  beatPhase: number,
  time: number,
  openness: number,
): void {
  const cx = tileCX(l, body.col + (WARDEN_COLS - 1) / 2);
  const cy = tileCY(l, body.row);
  const r = wardenRadius(l);
  const hex = wardenColor(wardenCycle(cfg, waveBeat)) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;

  const eye = wardenEyeCircle(l, body, b, openness);
  const dx = eye.x - cx;
  const pupilR = eye.r;

  const outerPts = loop(OUTER, cx, cy, r, time);
  const pupilPts = loop(PUPIL, cx + dx, cy, pupilR, time);
  const cut = wardenOpening(outerPts, pupilPts, cx, cy);
  // One closed subpath where the opening could be cut, and the old two-loop
  // ring where it could not — a pupil somewhere the walls cannot reach is
  // still a body, and drawing it whole is better than drawing it folded.
  const shape = cut
    ? catmullRomToBezierPath(cut.contour)
    : `${catmullRomToBezierPath(outerPts)} ${catmullRomToBezierPath(pupilPts)}`;

  // Even-odd still, for the fallback's sake: it cuts that hole whichever way
  // either loop happens to wind, and on one contour it decides nothing.
  const body2d = new Path2D(shape);
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(body2d, "evenodd");
  ctx.restore();

  // The surface, under everything on this body that has a job to do: the veins
  // and the wet film inside the material, the eyelets standing in it, and the
  // fringe outside the edge that is drawn over them next. CILIATE off the
  // shapes page (`warden-veins.ts`, `warden-skin.ts`, `warden-cilia.ts`).
  drawWardenUnderskin(ctx, body2d, cx, cy, r, time, openness, cut);
  drawWardenEyelets(ctx, cx, cy, r, cx + dx, pupilR, time, openness, cut);
  drawWardenCilia(ctx, outerPts, cx, cy, r, time, openness, cut);

  strokeGlow(
    ctx,
    new Path2D(cut ? openSmoothPath(cut.edge) : catmullRomToBezierPath(outerPts)),
    PALETTE.rock,
    STROKE.outline,
    0.7,
  );
  // The edge you look through carries the cycle's colour, and it is the only
  // part of the body that does: the rim says what ammunition the one shot
  // needs, a whole cycle before there is anything to shoot at. It stops where
  // the material does — there is no lip across the opening, because there is
  // nothing there for a lip to be the edge of.
  strokeGlow(
    ctx,
    new Path2D(cut ? openSmoothPath(cut.lip) : catmullRomToBezierPath(pupilPts)),
    openness > 0 ? rim : hex,
    STROKE.outline,
    0.6 + openness * 0.8,
  );

  drawPlates(ctx, cx, cy, r, b, cfg, time, cut);
  drawHatch(ctx, cx + dx, cy, pupilR * HATCH, openness);
  // The eye behind the door — the same one THE LID wears, `eye.ts`. The fluid
  // and the fringe are drawn whether or not the hatch is open, because they are
  // what makes the hole read as an eye at all rather than as a porthole that
  // sometimes lights up; only the lens is gated, and it gates itself on
  // `openness` (`warden-eye.ts`).
  drawEye(ctx, cx + dx, cy, pupilR * HATCH, hex, rim, openness, beat + beatPhase, time);
}
