import type { Point } from "@neon-spore/content";
import { PALETTE, type PullKnobDraw } from "@neon-spore/render";
import { noteMark } from "../../../../packages/render/src/mark-spots.js";
import { drawWayArrow } from "../../../../packages/render/src/way-arrow.js";
import { bodyPath, type GooBody, paintBody } from "./body.js";
import { drip, fizz } from "./fx.js";
import {
  DROP_IN,
  droppingIn,
  dropShown,
  FALL_IN,
  fallen,
  type GooMoment,
  IMPACT,
  momentOf,
  redness,
} from "./moment.js";
import { mix, settle } from "./noise.js";
import { failSpray, landSpecks } from "./splash.js";
import type { GooStyle } from "./style.js";

/**
 * **The drop of a GOO look**: OOZE's drop under the hand wherever the hand
 * has it, made a living slime. Waiting, it breathes and calls; taken, it
 * leans into the pull; counted, it braces as the glob lands on it and is gone
 * into the splash; failed, it spits red, shudders and slumps, then crawls
 * home; after a count a fresh one falls into the start and wobbles still.
 */
export function gooKnob(style: GooStyle) {
  return (ctx: CanvasRenderingContext2D, on: Point, r: number, o: PullKnobDraw): void => {
    const m = momentOf(o.held, o.time, o.after);
    const f = m.failed;
    const shudder = f !== null ? Math.sin(f * 60) * r * 0.12 * Math.exp(-f * 6) : 0;
    const at = { x: on.x + m.off.x + shudder, y: on.y + m.off.y };
    noteMark(ctx, at.x, at.y, r);
    if (!dropShown(m)) return;
    const way = o.way ? { x: o.way.dx, y: o.way.dy } : { x: 0, y: 0 };
    const body = shapeOf(m, style, at, r, way);
    const quiet = !m.held && m.failed === null && !m.crawling && m.counted === null;
    const inFall = (droppingIn(m) ?? DROP_IN) < DROP_IN;
    ctx.save();
    if (o.theirs) ctx.globalAlpha = 0.4;
    if (quiet && !inFall && !o.theirs) call(ctx, at, r, style, m);
    if (f !== null) failSpray(ctx, at, r, f);
    const fell = droppingIn(m);
    if (fell !== null) landSpecks(ctx, at, r, fell, DROP_IN, style);
    if (style.drips && !inFall)
      drip(ctx, { x: at.x + r * 0.25, y: at.y + r * 0.88 }, r, m.time, 3, style, 1);
    paintBody(ctx, body, style, m.time, {
      red: redness(m),
      green: m.counted !== null ? (m.counted / IMPACT) * 0.5 : 0,
    });
    if (style.fizz)
      fizz(ctx, at, r, m.time, { seed: 7, n: 5, spread: r * 0.75, style, alpha: 0.8 });
    if (o.way && !inFall && m.counted === null && f === null && !m.crawling)
      arrow(ctx, at, r, o, style, m);
    ctx.restore();
  };
}

/** How the drop is drawn this frame: where, how far drawn out, how squashed. */
function shapeOf(m: GooMoment, style: GooStyle, at: Point, r: number, way: Point): GooBody {
  const seed = 11;
  const fell = droppingIn(m);
  if (fell !== null && fell < DROP_IN)
    return {
      at: fallen(at, r, fell, DROP_IN, FALL_IN),
      r,
      seed,
      lean: { x: 0, y: -1 },
      stretch: 1.1,
      point: 10,
    };
  if (fell !== null)
    return { at, r, seed, squash: 1 + 0.4 * style.jiggle * settle(fell - DROP_IN, 6, 19) };
  if (m.counted !== null) return { at, r, seed, squash: 1 + 0.4 * (m.counted / IMPACT) };
  if (m.failed !== null)
    return {
      at,
      r,
      seed,
      squash: 1.12 + 0.35 * style.jiggle * settle(m.failed, 5, 17),
      shake: 0.25 * style.jiggle * Math.exp(-m.failed * 4),
    };
  if (m.crawling) return { at, r, seed, lean: { x: -way.x, y: -way.y }, stretch: 0.4, squash: 1.1 };
  if (m.held) return { at, r, seed, lean: way, stretch: 0.22 + 0.2 * m.warn };
  if (m.last === "refused" && m.rested < 1)
    return { at, r, seed, squash: 1 + 0.25 * style.jiggle * settle(m.rested, 6, 18) };
  return { at, r, seed, squash: 1 + 0.07 * Math.sin(m.time * 3.4) };
}

/** Put a thumb here: a halo breathing out of the drop, and one lumpy ripple at a time. */
function call(ctx: CanvasRenderingContext2D, at: Point, r: number, style: GooStyle, m: GooMoment) {
  const breathe = 0.5 + 0.5 * Math.sin(m.time * 3.4);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(at.x, at.y, r * 0.6, at.x, at.y, r * 2.6);
  halo.addColorStop(0, style.neon);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.globalAlpha = 0.16 + 0.16 * breathe;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const u = (m.time * 0.7) % 1;
  const ring = bodyPath({ at, r: r * (1.15 + 1.2 * u), seed: 29 }, style, m.time);
  ctx.save();
  ctx.strokeStyle = style.neon;
  ctx.globalAlpha = 0.6 * (1 - u);
  ctx.lineWidth = r * 0.1 * (1 - u) + 0.3;
  ctx.stroke(ring);
  ctx.restore();
}

/** The way to pull, inside the drop: dark under, neon round, near-white on top, and big. */
function arrow(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: PullKnobDraw,
  style: GooStyle,
  m: GooMoment,
) {
  if (!o.way) return;
  const reach = r * (m.held ? 1.05 : 1.15 + 0.07 * Math.sin(m.time * 6));
  const heads = o.either ? 2 : 1;
  const path = (): void =>
    drawWayArrow(ctx, at.x, at.y, reach, o.way?.dx ?? 0, o.way?.dy ?? 1, m.time, heads);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.background;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = r * 0.36;
  path();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = style.neon;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = r * 0.5;
  path();
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = mix(style.neon, "#FFFFFF", 0.7);
  ctx.globalAlpha = 1;
  ctx.lineWidth = r * 0.17;
  path();
  ctx.restore();
}
