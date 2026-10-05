import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { paintBreach, paintLobe } from "./hive-cell.js";
import { hiveWrungRingPath } from "./hive-hold.js";
import {
  BREACH,
  BREACH_DOWN,
  hiveBreachPath,
  hiveScarPath,
  hiveSitePath,
  hiveSwellDrop,
  type Point,
  SITE_HANG,
  SITE_R,
} from "./hive-shape.js";
import type { HiveHang } from "./hive-stop.js";
import { faded } from "./hive-wax.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE HIVE's sites**: one lobe of its underside each, in whichever of its
 * four states it is in — shut, swelling, open, or scarred over.
 *
 * Out of `hive-draw.ts` when aiming the bolt stops took that file to its
 * length limit, along the seam it already had: these read nothing of the
 * frame but their arguments, and `drawHive` is what decides which one each
 * site gets and on which screen.
 */

/** A lobe of the mass's own wax hung at `c`, `drop` lower, its lower wall lit in `rim` — shut, it is only this. */
export function drawLobe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  drop: number,
  open: number,
  fade: number,
  hex: string = PALETTE.bileDeep,
  fillA = 0.9,
  rim: string = PALETTE.bile,
  rimA = 0.35,
): void {
  const r = l.tile * SITE_R * open;
  const p = hiveSitePath(l, c, drop, open);
  paintLobe(
    ctx,
    p,
    c.x,
    c.y + (r * SITE_HANG + drop) * 0.4,
    r,
    l.tile,
    hex,
    fillA,
    rim,
    rimA,
    fade,
  );
}

/**
 * The next site, swelling: the lobe hangs lower by the beat and fills with
 * light from inside, on the screen shown it.
 *
 * **`held` is how far through her hold it is**, or `-1` for a lobe nobody has
 * a thumb on. A held lobe stops throbbing and squeezes — narrower and longer
 * the further through the hold it is — so that the gesture looks like a
 * gesture before it has finished being one. It is the picture of a hand and
 * not a countdown: the dial is the ring's, over it (`hive-grip.ts`).
 */
export function drawSwell(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  phase: number,
  open: number,
  time: number,
  fade: number,
  held = -1,
): HiveHang {
  const squeeze = held < 0 ? 0 : held;
  const throb = held < 0 ? 1 + 0.08 * phase * Math.sin(time * 9) : 1 + 0.35 * squeeze;
  const drop = hiveSwellDrop(l, phase) * throb;
  const bright = Math.min(1, 0.6 + 0.4 * phase + squeeze);
  const fill = 0.55 + 0.4 * phase;
  drawHalo(ctx, l, c, drop, phase, time, fade);
  drawLobe(
    ctx,
    l,
    c,
    drop,
    open * (1 - 0.3 * squeeze),
    fade,
    PALETTE.bile,
    fill,
    PALETTE.bileRim,
    bright,
  );
  return { drop, open: open * (1 - 0.3 * squeeze) };
}

/**
 * The light the next site throws round itself before it opens — no line
 * round the lobe (`hive-cell.ts`), a glow behind it that grows through the
 * swell and beats with it, so the site to watch is found from across the
 * screen rather than by comparing lobes (the owner, 5 October 2026).
 */
function drawHalo(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  drop: number,
  phase: number,
  time: number,
  fade: number,
): void {
  const r = l.tile * (0.75 + 0.35 * phase);
  const y = c.y + drop * 0.6;
  const a = (0.35 + 0.4 * phase) * (0.8 + 0.2 * Math.sin(time * 9)) * fade;
  const g = ctx.createRadialGradient(c.x, y, 0, c.x, y, r);
  g.addColorStop(0, rgba(PALETTE.bileRim, a));
  g.addColorStop(0.45, rgba(PALETTE.bile, a * 0.5));
  g.addColorStop(1, rgba(PALETTE.bile, 0));
  ctx.save();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(c.x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * An open breach: the lobe with a wet socket opened in it — its colour
 * welling in it where the colour is shown, grey elsewhere.
 *
 * **A `wrung` one has no colour anywhere** and says so with a shape rather
 * than a shade: the pale collar of `hiveWrungRingPath` round the aperture, on
 * both screens, because grey alone is what the navigator's screen already
 * says about every breach she has (`hive-hold.ts`). The collar is a marker
 * and keeps its glow.
 */
export function drawBreach(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  color: Color | null,
  open: number,
  time: number,
  fade: number,
  wrung = false,
): void {
  drawLobe(ctx, l, c, 0, open, fade);
  const hex = color === null ? PALETTE.dim : PALETTE[color];
  const rim = color === null ? PALETTE.rock : color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const breath = 1 + 0.05 * Math.sin(time * 5);
  const r = l.tile * SITE_R * BREACH * open * breath;
  const hole = hiveBreachPath(l, c, open * breath);
  paintBreach(
    ctx,
    hole,
    c.x,
    c.y + r * BREACH_DOWN,
    r,
    l.tile,
    hex,
    rim,
    fade,
    0.5 + 0.5 * Math.sin(time * 5),
  );
  if (!wrung) return;
  strokeGlow(
    ctx,
    hiveWrungRingPath(l, c, open),
    faded(PALETTE.hullRim, fade),
    STROKE.inner,
    (0.5 + 0.3 * Math.sin(time * 3)) * fade,
  );
}

/** A sealed site: the lobe shut again with the stitch of the seal across it, in the hull's pale. */
export function drawScar(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  open: number,
  fade: number,
): void {
  drawLobe(ctx, l, c, 0, open, fade);
  strokeGlow(ctx, hiveScarPath(l, c), faded(PALETTE.hullRim, fade), STROKE.inner, 0.5 * fade);
}
