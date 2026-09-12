import type { Point } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import type { ActionFace, ActionKind } from "./controls.js";
import { halo, strokeGlow } from "./glow.js";
import { ARM_FINGER_TILES, ARM_SHAFT_TILES } from "./reach-arm.js";
import { splinePath } from "./spline.js";

/**
 * Player 1's action buttons, showing the ship doing the thing instead of
 * spelling its name.
 *
 * Each button wears the same membrane the hull is made of, and the three
 * differ only in what that membrane does: it swells into the ward, it opens
 * into the throat, or it swells and puts the hand out. One skin, three
 * directions, which is what the simulation already does with them — the maw is
 * the cannon lobe with the sign of its lift taken away, and the arm rises out
 * of the same swelling — so the buttons are legible *against each other*
 * rather than one at a time.
 *
 * This was `panel:action-face · emblem` in `tools/versus/`, adopted by the
 * owner against the shipped word. The argument that carried it was THE
 * MIRROR: a sequence glyph is a fifth the size of a band button, far too small
 * for a word, so the old face drew nothing at all there and two steps were
 * told apart by colour alone — one channel, and the wrong one to bet a boss
 * about memory on. A shape is drawn at every size.
 *
 * **Nothing here takes a clock.** A button is drawn wherever a control is — on
 * the band under a thumb, and in THE MIRROR's sequence at a fifth the size —
 * and a glyph that animated in the sequence would be a second picture of the
 * same control, which is the one thing `controls.ts` refuses. It is also what
 * lets the shapes be cached rather than rebuilt: nothing in any of them
 * depends on anything but the radius.
 */

/** How many points the membrane is sampled at. Enough that the bump is smooth. */
const STEPS = 22;

/** One emblem's geometry, in units of the button's radius. */
interface Emblem {
  /** Half the skin's width. */
  w: number;
  /** Positive is a swelling, negative a dent — the whole of the difference. */
  lift: number;
  /** Share of that width the lobe itself takes. */
  half: number;
  /** Where the skin sits, below the button's middle. */
  drop: number;
  /** How wide the lit crest is drawn. */
  crestWidth: number;
}

const GUARD: Emblem = { w: 0.78, lift: 0.5, half: 0.5, drop: 0.3, crestWidth: 0.17 };
const INTAKE: Emblem = { w: 0.78, lift: -0.4, half: 0.58, drop: 0.16, crestWidth: 0.15 };
/**
 * The same swelling as the ward, lower and narrower so the arm above it has
 * room. `reach-arm.ts`'s own sentence is why it is a swelling at all: *"on
 * this panel the lobe **is** the hand"* — the fingers are folded at the crown
 * on every frame and a press only travels them upward, so a button that drew
 * an arm standing on flat skin would claim something the field never does.
 */
const REACH: Emblem = { w: 0.74, lift: 0.34, half: 0.46, drop: 0.5, crestWidth: 0.14 };

const SHAPE: Record<ActionKind, Emblem> = { guard: GUARD, intake: INTAKE, reach: REACH };

/**
 * The skin at `t` across the emblem, where `t` runs −1 to 1. A raised cosine,
 * so the lobe leaves the flat skin without a corner — the same thing the hull's
 * own shoulder does, at a size with no room for a plateau in the middle of it.
 */
function skinAt(e: Emblem, t: number, r: number): Point {
  const u = Math.abs(t) / e.half;
  const bump = u >= 1 ? 0 : 0.5 * (1 + Math.cos(Math.PI * u));
  return { x: t * e.w * r, y: -e.lift * bump * r };
}

function sample(e: Emblem, r: number, span: number): Path2D {
  const pts: Point[] = [];
  for (let i = 0; i <= STEPS; i++) pts.push(skinAt(e, (-1 + (2 * i) / STEPS) * span, r));
  return splinePath(pts, false);
}

/**
 * The whole stretch of skin, and the lobe's own share of it, kept by radius.
 *
 * A `bakedCache` and not a plain `Map`, which is what this was in the
 * candidate: module state outlives a test, so whichever budget row first asked
 * for a size paid for the two paths and every row after it was handed them
 * free — the exact order-dependence `baked.ts` exists to end. Nothing in the
 * running game wants it emptied; a contour keyed on a radius is a fact about a
 * pixel size and not about a world.
 */
interface Parts {
  membrane: Path2D;
  crest: Path2D;
}
const parts = bakedCache<string, Parts>();

function partsFor(e: Emblem, name: ActionKind, r: number): Parts {
  const key = `${name}@${r}`;
  const held = parts.get(key);
  if (held) return held;
  if (parts.size > 12) parts.clear();
  const made = { membrane: sample(e, r, 1), crest: sample(e, r, e.half) };
  parts.set(key, made);
  return made;
}

/** Every emblem is the same two strokes; only the geometry differs. */
function drawEmblem(
  ctx: CanvasRenderingContext2D,
  e: Emblem,
  name: ActionKind,
  x: number,
  y: number,
  r: number,
  ink: string,
): void {
  const whole = Math.max(1, Math.round(r));
  const { membrane, crest } = partsFor(e, name, whole);
  const scale = r / whole;
  ctx.save();
  ctx.translate(x, y + e.drop * r);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(1, r * 0.09) / scale;
  ctx.stroke(membrane);
  ctx.globalAlpha = 1;
  strokeGlow(ctx, crest, ink, Math.max(1.4, r * e.crestWidth) / scale, 1.2);
  ctx.restore();
}

/**
 * Motes on their way in — where each one is, and how big, as shares of `r`.
 *
 * One stream straight down the throat, each nearer mote smaller than the one
 * above it: the hull's own inhale shrinks a mote the same way over the same
 * trip, and this is one frame of it held still. A column and not a spread —
 * two abreast over a curve is a pair of eyes over a mouth, and the button stops
 * reading as a ship and starts reading as a face.
 */
const MOTES = [
  [0, -0.62, 0.16],
  [0, -0.4, 0.115],
  [0, -0.22, 0.08],
] as const satisfies readonly (readonly [dx: number, dy: number, size: number])[];

/** How far above the crest the fingers stand, as a share of `r`. */
const ARM_RISE = 0.78;

/**
 * The arm, out of the crest of the swelling — two straight rails, a crossbar
 * and two open fingers.
 *
 * Machined on a membrane, which is `reach-arm.ts`'s own decision said at
 * button size: the ship is grown and this one part of it is a mechanism, and a
 * pair should be able to tell at a glance that the thing climbing the column
 * is not alive. Its proportions are that file's rather than a second set —
 * `ARM_SHAFT_TILES` and `ARM_FINGER_TILES` are shares of a tile there and
 * shares of the rise here, so a change to how wide the real arm is arrives on
 * the button that names it.
 *
 * The fingers are drawn **open**, because an arm that is not carrying anything
 * comes home open (`drawFingers`), and the button is pressed to send it after
 * something it does not have yet.
 */
function drawArm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
): void {
  const foot = y + REACH.drop * r - REACH.lift * r * 0.55;
  const rise = ARM_RISE * r;
  const top = foot - rise;
  const half = Math.max(1, rise * ARM_SHAFT_TILES * 1.6);
  const finger = rise * ARM_FINGER_TILES;

  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1.2, r * 0.1);
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(x + side * half, foot);
    ctx.lineTo(x + side * half, top);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x - half * 1.7, top);
  ctx.lineTo(x + half * 1.7, top);
  ctx.stroke();
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(x + side * half * 1.5, top);
    ctx.lineTo(x + side * half * 2.6, top - finger * 0.55);
    ctx.lineTo(x + side * half * 1.5, top - finger);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The face itself: the ward for `guard`, the throat and its motes for
 * `intake`, and the swelling with its hand out for `reach`.
 *
 * The bright stretch on the ward spans the lobe and no more, which is the rule
 * the real shield rim is drawn by — a rim that ran the whole width would say
 * the whole ship is warded, and the entire coupling is that one column is.
 */
export const emblem: ActionFace = (ctx, x, y, r, ink, kind) => {
  drawEmblem(ctx, SHAPE[kind], kind, x, y, r, ink);
  if (kind === "reach") {
    drawArm(ctx, x, y, r, ink);
    return;
  }
  if (kind !== "intake") return;
  // Out here rather than inside the emblem's transform: `halo` blits a sprite
  // cached on a colour and a whole-pixel radius, and a scaled one would ask for
  // a fresh canvas at every size the button is ever drawn at.
  for (const [dx, dy, size] of MOTES) {
    halo(ctx, x + dx * r, y + dy * r, Math.round(Math.max(2, r * size)), ink, 0.85);
  }
};
