import { KEY } from "@neon-spore/content";
import { mixHex, rgba } from "./hex.js";
import type { Point } from "./lamprey-shape.js";
import { PALETTE } from "./palette.js";

/**
 * **One of THE LAMPREY's fangs**, wherever it stands — on the ring round the
 * sucker (`lamprey-teeth.ts`) or along a jaw seen from the side
 * (`lamprey-jaws.ts`): a curved bone hook, its back convex and its front
 * hollowed, lit on the half the key light reaches and shaded on the other,
 * with a glint down the lit edge and a dark line round it.
 *
 * A fang is laid by its root's middle, the way it points, how long and how
 * wide it is, and how far its tip bends toward its `side`.
 */
export interface Fang {
  root: Point;
  /** Root to tip, a unit long. */
  dir: Point;
  /** Across the root, a unit long: the way the tip hooks. */
  side: Point;
  len: number;
  /** Half the root's width. */
  half: number;
  /** How far the tip bends toward `side`, as a share of `len`. */
  hook: number;
}

/** The fang's corners and the controls of its two edges and its ridge. */
function corners(f: Fang) {
  const at = (along: number, across: number): Point => ({
    x: f.root.x + f.dir.x * along + f.side.x * across,
    y: f.root.y + f.dir.y * along + f.side.y * across,
  });
  const { len, half } = f;
  return {
    back: at(0, -half),
    front: at(0, half),
    tip: at(len, f.hook * len),
    // The back of the hook bows out, the front is hollowed in under the tip.
    backBow: at(len * 0.7, -half * 0.55 + f.hook * len * 0.35),
    frontBow: at(len * 0.45, half * 0.15 + f.hook * len * 0.15),
    ridge: at(len * 0.6, f.hook * len * 0.3),
  };
}

/** The fang's outline. */
export function fangPath(f: Fang): Path2D {
  const c = corners(f);
  const path = new Path2D();
  path.moveTo(c.back.x, c.back.y);
  path.quadraticCurveTo(c.backBow.x, c.backBow.y, c.tip.x, c.tip.y);
  path.quadraticCurveTo(c.frontBow.x, c.frontBow.y, c.front.x, c.front.y);
  path.closePath();
  return path;
}

/** Bone in shadow: the tooth's colour taken toward the hide's dark. */
const SHADE = rgba(mixHex(PALETTE.lampreyTooth, PALETTE.lampreyHideDark, 0.45), 0.85);

/** The line round a fang. */
const OUTLINE = rgba(PALETTE.lampreyHideDark, 0.8);
/** The glint down a fang's lit edge. */
const GLINT = "rgba(255,255,245,0.75)";

/**
 * The fang drawn: filled in `fill`, the half turned from the key in shadow,
 * the glint down the lit edge unless `glint` is false — for a fang dimmed
 * into the background — and the outline.
 */
export function drawFang(
  ctx: CanvasRenderingContext2D,
  f: Fang,
  fill: string,
  glint = true,
): Path2D {
  const c = corners(f);
  const path = fangPath(f);
  ctx.fillStyle = fill;
  ctx.fill(path);
  // The back edge faces `-side`: lit when that points toward the key.
  const backLit = -(f.side.x * KEY.x + f.side.y * KEY.y) > 0;
  const shade = new Path2D();
  shade.moveTo(f.root.x, f.root.y);
  shade.quadraticCurveTo(c.ridge.x, c.ridge.y, c.tip.x, c.tip.y);
  if (backLit) shade.quadraticCurveTo(c.frontBow.x, c.frontBow.y, c.front.x, c.front.y);
  else shade.quadraticCurveTo(c.backBow.x, c.backBow.y, c.back.x, c.back.y);
  shade.closePath();
  ctx.fillStyle = SHADE;
  ctx.fill(shade);
  ctx.lineWidth = Math.max(0.6, f.half * 0.35);
  ctx.strokeStyle = OUTLINE;
  ctx.stroke(path);
  if (glint) {
    const from = backLit ? c.back : c.front;
    const bow = backLit ? c.backBow : c.frontBow;
    const lead = 0.25;
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(0.6, f.half * 0.3);
    ctx.strokeStyle = GLINT;
    ctx.beginPath();
    ctx.moveTo(from.x + (bow.x - from.x) * lead, from.y + (bow.y - from.y) * lead);
    ctx.quadraticCurveTo(
      bow.x,
      bow.y,
      c.tip.x + (bow.x - c.tip.x) * 0.2,
      c.tip.y + (bow.y - c.tip.y) * 0.2,
    );
    ctx.stroke();
  }
  return path;
}
