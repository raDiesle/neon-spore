import { rgba } from "./hex.js";
import { drawFireball, fireRadius } from "./instar-fire.js";
import { drawDrip, drawScales, type Form } from "./instar-hide.js";
import { drawHorn } from "./instar-horn.js";
import type { Point } from "./instar-place.js";
import { drawPlate, drawSeam, faded, type Look } from "./instar-plate.js";
import {
  BRIDGE,
  EYES,
  FOLDS,
  hornSeen,
  jawSeen,
  MIDLINE,
  NOSTRILS,
  SKULL_OUTLINE,
  UPPER_LIP,
} from "./instar-quarter-model.js";
import {
  drawFrill,
  drawNostril,
  drawQuarterEye,
  drawQuarterTeeth,
} from "./instar-quarter-parts.js";
import { sideJawOpen } from "./instar-side-head.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE INSTAR's head side-on, turned three quarters to the ship and
 * snarling** (`instar-quarter-model.ts` is the model). Back to front: the far
 * horn, the gape and the fire in it, the lower jaw, the skull with its bridge
 * lit from above, the teeth, the nose, the eyes under brows driven down at the
 * snout, the near horn and the frill.
 *
 * Painted with the hide every other head of this boss wears — `drawPlate`'s
 * dark plate, `lightHide`'s rounding, the baked scales, the shipped gold eye —
 * so it is the same animal turned, not a new one.
 */

/** The plates a bolt meets, skull and jaw, about `look.head` — as `drawQuarterHead` lays them. */
export function quarterHeadPoints(look: Look): { jaw: Point[]; skull: Point[] } {
  const at = placed(look);
  const { outline } = jawSeen(sideJawOpen(look.f, look.time));
  return { jaw: outline.map(at), skull: SKULL_OUTLINE.map(at) };
}

function placed(look: Look): (p: Point) => Point {
  const { head, r } = look;
  return (p) => ({ x: head.x + p.x * r, y: head.y + p.y * r });
}

/** A plate's form for its light: the middle and half-extents of what it spans. */
function formOf(pts: readonly Point[]): Form {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of pts) {
    x0 = Math.min(x0, p.x);
    y0 = Math.min(y0, p.y);
    x1 = Math.max(x1, p.x);
    y1 = Math.max(y1, p.y);
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, r: (x1 - x0) / 2, ry: (y1 - y0) / 2 };
}

export function drawQuarterHead(ctx: CanvasRenderingContext2D, look: Look): void {
  const { f, r, fade, hurt, time } = look;
  const at = placed(look);
  const open = sideJawOpen(f, time);
  const jaw = jawSeen(open);
  drawQuarterHorn(ctx, look, -1);
  // The lower jaw, and over it the gape, lip to lip, dark and lit from the throat.
  const jawPts = jaw.outline.map(at);
  const lower = splinePath(jawPts, true);
  const jawForm = formOf(jawPts);
  drawPlate(ctx, lower, fade, 0.6, hurt, jawForm);
  drawScales(ctx, lower, jawForm, r * 0.1, fade);
  const lipUp = UPPER_LIP.map(at);
  const lipDown = jaw.lip.map(at);
  const mouth = splinePath([...lipUp, ...[...lipDown].reverse()], true);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(mouth);
  ctx.fillStyle = faded(PALETTE.ember, fade, 0.18 + 0.25 * look.fire);
  ctx.fill(mouth);
  ctx.restore();
  const throat = at({ x: -0.4, y: 0.2 + open * 0.3 });
  const gape = Math.abs((lipDown[3] as Point).y - (lipUp[3] as Point).y) / 2;
  if (look.fire > 0)
    drawFireball(ctx, throat.x, throat.y, fireRadius(look.fire, r * 0.6, gape), time, fade);
  drawQuarterTeeth(ctx, jaw.lip, at, r, -1, fade);
  // The skull, its bridge lit from above.
  const skullPts = SKULL_OUTLINE.map(at);
  const skull = splinePath(skullPts, true);
  const crown = formOf(skullPts);
  drawPlate(ctx, skull, fade, 0.7, hurt, crown);
  drawScales(ctx, skull, crown, r * 0.11, fade);
  drawBridge(ctx, BRIDGE.map(at), fade);
  drawQuarterTeeth(ctx, UPPER_LIP, at, r, 1, fade);
  const [m0, m1, m2] = MIDLINE.map(at) as [Point, Point, Point];
  drawSeam(ctx, m0, m1, m2, fade, 0.7);
  // The snarl: the hide of the bridge rucked up in folds behind the nose.
  for (const [a, b, c] of FOLDS) drawSeam(ctx, at(a), at(b), at(c), fade, 0.6);
  for (const n of NOSTRILS) drawNostril(ctx, at(n.at), n.face, r, look.fire, fade);
  EYES.forEach((e, i) => {
    const s = i === 0 ? -1 : 1;
    const shut = s === 1 ? f.wince : f.winceLeft;
    drawQuarterEye(ctx, look, at(e.at), Math.max(0.42, e.face), s, f.eye * (1 - 0.8 * shut));
  });
  drawQuarterHorn(ctx, look, 1);
  drawFrill(ctx, at, r, fade);
  const chin = lipDown[4] as Point;
  drawDrip(ctx, { x: chin.x, y: chin.y + r * 0.12 }, r * 0.3, r * 0.03, time, 1, fade);
  drawDrip(ctx, at({ x: 0.05, y: 0.32 + open * 0.2 }), r * 0.2, r * 0.025, time, 4, fade);
}

/** The bridge's top face, square to the key: a soft sheen laid over the skull. */
function drawBridge(ctx: CanvasRenderingContext2D, pts: readonly Point[], fade: number) {
  const p = splinePath(pts, true);
  const f = formOf(pts);
  const g = ctx.createLinearGradient(f.x, f.y - (f.ry ?? f.r), f.x, f.y + (f.ry ?? f.r));
  g.addColorStop(0, rgba(PALETTE.sheenRim, 0.28 * fade));
  g.addColorStop(1, rgba(PALETTE.sheenRim, 0));
  ctx.save();
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.restore();
}

function drawQuarterHorn(ctx: CanvasRenderingContext2D, look: Look, s: -1 | 1): void {
  const { r, fade } = look;
  const h = hornSeen(s);
  const at = placed(look);
  drawHorn(
    ctx,
    {
      base: at(h.base),
      bend: at(h.bend),
      tip: at(h.tip),
      width: r * (s > 0 ? 0.12 : 0.1),
      lean: (h.tip.z - h.base.z) * r + (s > 0 ? 0 : -r * 0.8),
    },
    r,
    fade,
  );
}
