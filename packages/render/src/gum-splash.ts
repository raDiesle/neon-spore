import type { SimEvent } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **A gum landing on the ship, remembered.**
 *
 * One event — a `breach` carrying the gum's own kind — and one picture that
 * outlives the frame it arrived in: the drop bursting across the plating
 * where it hit, and the whole hull rippling from it the way water does when
 * something heavy goes in. The owner asked for exactly that on 14 September
 * 2026: *when it hits the ship hull it damages the ship immediately and
 * splashes across the surface of the ship like water.*
 *
 * **Two pictures in one, on THE FENCE's terms** (`fence-strike.ts`, and the
 * rule that damage to the ship is drawn on the part that took it *and* as a
 * reaction across the whole hull): the smear at the column is where it
 * landed, and the ripples running out to both walls are the ship taking it.
 * Both in the gum's own `venom`, because an impact is drawn in the colour of
 * the thing that made it — never a damage red, and never a crack: there is
 * no `Scar` behind this event (`breachUnscarred`), and what a gum does to
 * plating is not a crack but a wetting.
 *
 * **Drawn along the surface rather than over the body**, `hull-shock.ts`'s
 * one decision again. A ripple is a line that follows every rise the
 * membrane takes, lifted by a wave that travels out from the column and
 * dies away with distance; `surfaceY` is the sampler the hull was drawn
 * from, so the crests ride the cannon and the dome and cannot drift off
 * them.
 *
 * Held by `RenderState` rather than `Effects`, for the strike's reason:
 * everything `Effects` owns is painted over by the hull, and this is drawn
 * on top of the ship it is about. `RenderState.forget` clears it.
 */

/** Seconds a splash lasts: the ripples have reached both walls and gone
 * quiet, and the smear has thinned to nothing. */
const LIFE = 1.5;
/** Tiles a second the ripple front travels out from the column. */
const SPEED = 6;
/** The ripple's wavelength along the hull, and its crest height, in tiles. */
const WAVELENGTH = 1.1;
const AMP = 0.24;
/** Rings of crest: each is a bright front a little behind the last. */
const RINGS = 3;
const RING_GAP = 0.13;
/** The smear: how many tiles wider than the drop it spreads to, and how tall
 * it stands when it first lands. */
const SMEAR_SPREAD = 2.2;
const SMEAR_H = 0.36;
/** Splashes remembered at once. A wave may drop several gums; more than this
 * on the hull in a second and a half is the wave failing anyway. */
const MAX_HITS = 4;

interface Hit {
  /** The splash's centre on the hull, in columns, and the drop's width. */
  col: number;
  span: number;
  life: number;
}

export class GumSplash {
  private hits: Hit[] = [];

  /** One frame's events. */
  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "breach" && e.kind === "gum") this.hit(e.col + (e.span - 1) / 2, e.span);
    }
  }

  /** A gum has hit the hull, centred on that column. */
  hit(col: number, span: number): void {
    this.hits.push({ col, span, life: LIFE });
    if (this.hits.length > MAX_HITS) this.hits.shift();
  }

  update(dt: number): void {
    for (const h of this.hits) h.life -= dt;
    this.hits = this.hits.filter((h) => h.life > 0);
  }

  clear(): void {
    this.hits = [];
  }

  /** Every splash still running, on the ship as it is drawn this frame. */
  draw(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY, time: number): void {
    for (const h of this.hits) {
      const age = LIFE - h.life;
      // Sudden and then slow: it lands all at once and dries off gradually.
      const fade = (h.life / LIFE) ** 1.5;
      const cx = tileCX(l, h.col);
      drawRipples(ctx, l, surfaceY, cx, age, fade);
      drawSmear(ctx, l, surfaceY, cx, h.span, age / LIFE, fade, time);
    }
  }
}

/**
 * The whole hull rippling out from the column. Two lines along the membrane,
 * each lifted by a wave that has come `SPEED` tiles a second from the hit
 * and dies away with distance, and a bright crest on each front.
 */
function drawRipples(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  surfaceY: SurfaceY,
  cx: number,
  age: number,
  fade: number,
): void {
  const tile = l.tile;
  const left = l.gridLeft;
  const right = l.gridLeft + l.gridWidth;
  const front = age * SPEED * tile;
  const step = tile / 4;
  ctx.save();
  for (let line = 0; line < 2; line++) {
    const path = new Path2D();
    const lift = line * tile * 0.07;
    for (let x = left; x <= right; x += step) {
      const d = Math.abs(x - cx);
      // Only behind the front, and eased in over half a tile so the wave has
      // a leading edge rather than a step; smaller the further it has come.
      const reach = Math.max(0, Math.min(1, (front - d) / (tile * 0.5)));
      const far = Math.exp(-d / (l.gridWidth * 0.55));
      const phase = ((front - d) / (WAVELENGTH * tile)) * Math.PI * 2;
      const crest = Math.max(0, Math.sin(phase + line * 0.9));
      const y = surfaceY(x) - lift - AMP * tile * crest * reach * far * fade;
      if (x === left) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    strokeGlow(ctx, path, PALETTE.venom, Math.max(1.2, tile * 0.035), 0.4 + 1.1 * fade);
  }
  // The crests: a bright hop over the membrane at each front, both ways.
  for (let k = 0; k < RINGS; k++) {
    const r = (age - k * RING_GAP) * SPEED * tile;
    if (r <= 0) continue;
    for (const side of [-1, 1] as const) {
      const x = cx + side * r;
      if (x < left || x > right) continue;
      const w = tile * 0.45;
      const path = new Path2D();
      path.moveTo(x - w, surfaceY(x - w));
      path.quadraticCurveTo(x, surfaceY(x) - AMP * tile * 1.3 * fade, x + w, surfaceY(x + w));
      strokeGlow(
        ctx,
        path,
        PALETTE.venomRim,
        Math.max(1, tile * 0.025),
        (1 + 1.2 * fade) / (k + 1),
      );
    }
  }
  ctx.restore();
}

/**
 * The drop itself, burst across the plating where it landed: a mound of
 * venom on the surface that spreads wider and lower as it runs, drawn on
 * `surfaceY` so it lies on the ship wherever the ship is.
 */
function drawSmear(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  surfaceY: SurfaceY,
  cx: number,
  span: number,
  t: number,
  fade: number,
  time: number,
): void {
  const tile = l.tile;
  const halfW = (span / 2 + SMEAR_SPREAD * t) * tile;
  const h = tile * SMEAR_H * (1 - 0.75 * t);
  const steps = 14;
  const path = new Path2D();
  for (let k = 0; k <= steps; k++) {
    const u = k / steps;
    const x = cx - halfW + halfW * 2 * u;
    // A wet edge: the mound's outline wobbles as it runs, faster at first.
    const wobble = 1 + 0.18 * Math.sin(time * 9 + u * 11) * (1 - t);
    const y = surfaceY(x) - h * Math.sin(u * Math.PI) ** 0.8 * wobble;
    if (k === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  for (let k = steps; k >= 0; k--) {
    const x = cx - halfW + (halfW * 2 * k) / steps;
    path.lineTo(x, surfaceY(x) + tile * 0.05);
  }
  path.closePath();
  ctx.save();
  const g = ctx.createLinearGradient(0, surfaceY(cx) - h, 0, surfaceY(cx));
  g.addColorStop(0, PALETTE.venomRim);
  g.addColorStop(0.45, PALETTE.venom);
  g.addColorStop(1, PALETTE.venomDeep);
  ctx.globalAlpha = 0.9 * fade;
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.venomRim;
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.globalAlpha = fade;
  ctx.stroke(path);
  ctx.restore();
}
