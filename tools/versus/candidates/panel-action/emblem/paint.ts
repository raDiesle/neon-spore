import { openSmoothPath, type Point } from "../../../../../packages/content/src/shapes.js";
import type { ActionFace, ActionKind } from "../../../../../packages/render/src/controls.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";

/**
 * EMBLEM — player 1's two buttons showing the ship doing the thing instead of
 * spelling its name.
 *
 * Each button wears the same membrane the hull is made of, once swelling into
 * the ward and once opening into the throat. One skin, two directions, which is
 * exactly what the simulation does with them: the maw is the cannon lobe with
 * the sign of its lift taken away.
 *
 * **Nothing here takes a clock.** A button is drawn wherever a control is — on
 * the band under a thumb, and in THE MIRROR's sequence at a fifth the size — and
 * a glyph that animated in the sequence would be a second picture of the same
 * control, which is the one thing `controls.ts` refuses. It is also what lets
 * both shapes be cached rather than rebuilt: nothing in either depends on
 * anything but the radius.
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
  return new Path2D(openSmoothPath(pts));
}

/** The whole stretch of skin, and the lobe's own share of it, kept by radius. */
interface Parts {
  membrane: Path2D;
  crest: Path2D;
}
const parts = new Map<string, Parts>();

function partsFor(e: Emblem, name: ActionKind, r: number): Parts {
  const key = `${name}@${r}`;
  const held = parts.get(key);
  if (held) return held;
  if (parts.size > 12) parts.clear();
  const made = { membrane: sample(e, r, 1), crest: sample(e, r, e.half) };
  parts.set(key, made);
  return made;
}

/** Both emblems are the same two strokes; only the geometry differs. */
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

/**
 * The face itself: the ward for `guard`, the throat and its motes for
 * `intake`, and the word dropped in both cases.
 *
 * The bright stretch on the ward spans the lobe and no more, which is the rule
 * the real shield rim is drawn by — a rim that ran the whole width would say
 * the whole ship is warded, and the entire coupling is that one column is.
 */
export const emblem: ActionFace = (ctx, x, y, r, ink, kind) => {
  if (kind === "guard") {
    drawEmblem(ctx, GUARD, "guard", x, y, r, ink);
    return;
  }
  drawEmblem(ctx, INTAKE, "intake", x, y, r, ink);
  // Out here rather than inside the emblem's transform: `halo` blits a sprite
  // cached on a colour and a whole-pixel radius, and a scaled one would ask for
  // a fresh canvas at every size the button is ever drawn at.
  for (const [dx, dy, size] of MOTES) {
    halo(ctx, x + dx * r, y + dy * r, Math.round(Math.max(2, r * size)), ink, 0.85);
  }
};
