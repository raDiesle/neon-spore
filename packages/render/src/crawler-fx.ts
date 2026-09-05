import type { Color } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CRAWLER's three transients, as pictures that outlive the body they are
 * about.
 *
 * Each happens on the tick a ring or a whole worm stops existing, so none can
 * be drawn off the world the way a link is: by the frame after the event there
 * is nothing standing there to hang a picture on. That is the same argument
 * `RockImpactFx` and `FleetFx` make for themselves, and it is why these live
 * in `Effects` rather than in `crawler.ts` next door — that file draws what
 * *is*, and this one draws what has just stopped being.
 *
 * **The splash is what a burst ring leaves**, and it is the owner's. A crawler
 * is a wet animal and every ring of it is a sac of the colour the pair have
 * just named out loud, so a matched shot should not put one out like a lamp.
 * It throws a crown of droplets in that colour and spreads a wet patch under
 * them, on top of the biggest particle burst in the game short of a boss going
 * down (`effects-spark.ts`) — two pictures of one moment, because the sparks
 * say *the shot landed* and the goo says *what it landed in*.
 *
 * **The swept lane is the pair's receipt** and it is deliberately the longest
 * of the three. Taking a worm apart costs both controls, turn about, for most
 * of a wave; what they get for it is the ship opening a column of its own
 * light over the hull where the last ring stood.
 *
 * **The mound is what a burrow leaves.** A thing that digs throws material up
 * on both sides of itself, so the hole gets two banks and they settle over
 * about half a second while the `breach` bursts that ride beside it on the
 * same tick throw the hull's own colour. Grey, because what came up is
 * plating, and the colour of the ship is what says whose it was.
 */

/** How long the lane of light stands, in seconds. Longer than any burst in the
 * game: it is the one moment a pair who played this creature well are being
 * shown that they did. */
const BEAM_LIFE = 1.1;
/** And the mound, which is over faster — a failure is stated, not dwelt on. */
const MOUND_LIFE = 0.6;
/** And the splash: long enough to be seen thrown and land, short enough that
 * three rings taken in three beats do not paint over the worm. */
const SPLASH_LIFE = 0.62;

/** Droplets one ring throws. The owner asked for a lot of it, and a lot on a
 * phone is about twenty: past that the crown closes into a disc and stops
 * reading as a thing that was thrown. */
const DROPS = 22;

interface Beam {
  col: number;
  row: number;
  left: number;
}

interface Mound {
  col: number;
  row: number;
  left: number;
}

interface Splash {
  x: number;
  y: number;
  hex: string;
  /** One angle, reach and size per droplet, laid down when the ring burst so
   * the crown does not reshuffle itself every frame. */
  drops: readonly { a: number; r: number; s: number }[];
  left: number;
}

export class CrawlerFx {
  private beams: Beam[] = [];
  private mounds: Mound[] = [];
  private splashes: Splash[] = [];

  /** A worm with its last ring off, and the lane the ship swept clean. */
  beam(col: number, row: number): void {
    this.beams.push({ col, row, left: BEAM_LIFE });
  }

  /** A worm that reached the far wall, and the banks it threw up going in. */
  mound(col: number, row: number): void {
    this.mounds.push({ col, row, left: MOUND_LIFE });
  }

  /**
   * A ring burst by the matching cannon, at the point it was standing on.
   *
   * The crown is laid down here rather than sampled per frame: a droplet that
   * picked a fresh angle every frame is a shimmer, and what this has to be is
   * a thing thrown outwards once and falling. Biased upward — the lower half
   * of the crown is kept short — because the shot came from underneath and
   * that is the direction the contents leave in.
   */
  splash(x: number, y: number, color: Color): void {
    const drops: { a: number; r: number; s: number }[] = [];
    for (let i = 0; i < DROPS; i++) {
      const a = (i / DROPS) * Math.PI * 2 + (i % 3) * 0.21;
      const up = 0.55 + 0.45 * Math.max(0, -Math.sin(a));
      drops.push({ a, r: up * (0.7 + ((i * 7) % 5) * 0.14), s: 0.5 + ((i * 3) % 4) * 0.22 });
    }
    this.splashes.push({
      x,
      y,
      hex: color === "red" ? PALETTE.red : PALETTE.cyan,
      drops,
      left: SPLASH_LIFE,
    });
  }

  update(dt: number): void {
    for (const b of this.beams) b.left -= dt;
    for (const m of this.mounds) m.left -= dt;
    for (const s of this.splashes) s.left -= dt;
    this.beams = this.beams.filter((b) => b.left > 0);
    this.mounds = this.mounds.filter((m) => m.left > 0);
    this.splashes = this.splashes.filter((s) => s.left > 0);
  }

  clear(): void {
    this.beams.length = 0;
    this.mounds.length = 0;
    this.splashes.length = 0;
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const b of this.beams) this.drawBeam(ctx, l, b);
    for (const m of this.mounds) this.drawMound(ctx, l, m);
    for (const s of this.splashes) this.drawSplash(ctx, l, s);
  }

  /**
   * A column of light from the hull to the top of the field, with what the
   * lane carries off riding up the middle of it. It brightens for the first
   * third and fades over the rest, so the eye is pulled to it before it is
   * asked to let it go.
   */
  private drawBeam(ctx: CanvasRenderingContext2D, l: Layout, b: Beam): void {
    const t = 1 - b.left / BEAM_LIFE;
    const x = tileCX(l, b.col);
    const foot = tileCY(l, b.row);
    const lift = foot - (foot - l.gridTop) * Math.min(1, t * 1.4);
    const strength = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
    const grad = ctx.createLinearGradient(x, l.gridTop, x, foot);
    grad.addColorStop(0, `${PALETTE.hull}00`);
    grad.addColorStop(1, PALETTE.hullRim);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.75 * strength;
    ctx.fillStyle = grad;
    ctx.fillRect(x - l.tile * 0.5, l.gridTop, l.tile, foot - l.gridTop);
    // What is left of the animal going up it, as one pale mote shrinking into
    // the top of the field.
    ctx.globalAlpha = strength;
    ctx.fillStyle = PALETTE.hullRim;
    const r = l.tile * 0.3 * (1 - t * 0.7);
    const cap = new Path2D();
    cap.ellipse(x, lift, r * 0.7, r, 0, 0, Math.PI * 2);
    ctx.fill(cap);
    ctx.restore();
  }

  /**
   * The crown and the wet patch under it, both in the ring's own colour.
   *
   * Additive, like every other light on this field, so two rings taken in one
   * column read as brighter rather than as two overlapping stickers. The
   * droplets travel and fade, which is what a thrown liquid does; the patch
   * spreads and thins under them.
   */
  private drawSplash(ctx: CanvasRenderingContext2D, l: Layout, s: Splash): void {
    const t = 1 - s.left / SPLASH_LIFE;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = s.hex;
    ctx.globalAlpha = 0.42 * (1 - t);
    const patch = new Path2D();
    patch.ellipse(
      s.x,
      s.y,
      l.tile * (0.34 + t * 0.7),
      l.tile * (0.18 + t * 0.3),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill(patch);
    ctx.globalAlpha = Math.max(0, 1 - t * t);
    const drops = new Path2D();
    for (const d of s.drops) {
      const reach = l.tile * d.r * (0.28 + t * 1.35);
      const rad = l.tile * 0.085 * d.s * (1 - t * 0.35);
      const dx = s.x + Math.cos(d.a) * reach;
      const dy = s.y + Math.sin(d.a) * reach;
      drops.moveTo(dx + rad, dy);
      drops.arc(dx, dy, rad, 0, Math.PI * 2);
    }
    ctx.fill(drops);
    ctx.restore();
  }

  /**
   * Two banks of plating either side of the hole, rising and settling.
   *
   * Anchored to `l.hullY` and not to the row the worm was standing on. It sat
   * on `tileCY` for a frame, which put the banks a whole tile above the ship —
   * two arcs floating in space over a hull that was visibly breaking somewhere
   * else. What is thrown up here comes *out of the ship*, so it has to start at
   * the surface of it.
   */
  private drawMound(ctx: CanvasRenderingContext2D, l: Layout, m: Mound): void {
    const t = 1 - m.left / MOUND_LIFE;
    const x = tileCX(l, m.col);
    const y = l.hullY;
    const rise = l.tile * 0.55 * Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.8);
    ctx.save();
    ctx.globalAlpha = 1 - t * 0.6;
    ctx.fillStyle = PALETTE.rockDark;
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = 1.4;
    for (const side of [-1, 1]) {
      const bank = new Path2D();
      const base = x + side * l.tile * 0.3;
      bank.moveTo(base - l.tile * 0.42, y);
      bank.quadraticCurveTo(base, y - rise, base + l.tile * 0.42, y);
      bank.closePath();
      ctx.fill(bank);
      ctx.stroke(bank);
    }
    ctx.restore();
  }
}
