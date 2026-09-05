import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CRAWLER's two endings, as pictures that outlive the body they are about.
 *
 * Both of them happen on the beat the worm leaves the field, so neither can be
 * drawn off the world the way a link is: by the frame after the event there is
 * nothing standing there to hang a picture on. That is the same argument
 * `RockImpactFx` and `FleetFx` make for themselves, and it is why these live
 * in `Effects` rather than in `crawler.ts` next door — that file draws what
 * *is*, and this one draws what has just stopped being.
 *
 * **The beam is the pair's receipt** and it is deliberately the longer of the
 * two. Stripping a worm takes both controls, turn about, for most of a wave;
 * what they get for it is the ship opening a lane over the hull and the two
 * ends they could never have shot going up it. A burst would have said the
 * thing broke, and nothing broke — it was taken.
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

export class CrawlerFx {
  private beams: Beam[] = [];
  private mounds: Mound[] = [];

  /** A worm stripped to its two ends, and the lane the ship opened for it. */
  beam(col: number, row: number): void {
    this.beams.push({ col, row, left: BEAM_LIFE });
  }

  /** A worm that reached the far wall, and the banks it threw up going in. */
  mound(col: number, row: number): void {
    this.mounds.push({ col, row, left: MOUND_LIFE });
  }

  update(dt: number): void {
    for (const b of this.beams) b.left -= dt;
    for (const m of this.mounds) m.left -= dt;
    this.beams = this.beams.filter((b) => b.left > 0);
    this.mounds = this.mounds.filter((m) => m.left > 0);
  }

  clear(): void {
    this.beams.length = 0;
    this.mounds.length = 0;
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const b of this.beams) this.drawBeam(ctx, l, b);
    for (const m of this.mounds) this.drawMound(ctx, l, m);
  }

  /**
   * A column of light from the hull to the top of the field, and the pair of
   * ends riding up the middle of it. It brightens for the first third and
   * fades over the rest, so the eye is pulled to it before it is asked to let
   * it go.
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
    ctx.globalAlpha = 0.5 * strength;
    ctx.fillStyle = grad;
    ctx.fillRect(x - l.tile * 0.34, l.gridTop, l.tile * 0.68, foot - l.gridTop);
    // The two ends going up it, as one pale slug shrinking into the top.
    ctx.globalAlpha = strength;
    ctx.fillStyle = PALETTE.hullRim;
    const r = l.tile * 0.3 * (1 - t * 0.7);
    const cap = new Path2D();
    cap.ellipse(x, lift, r * 0.7, r, 0, 0, Math.PI * 2);
    ctx.fill(cap);
    ctx.restore();
  }

  /** Two banks of plating either side of the hole, rising and settling. */
  private drawMound(ctx: CanvasRenderingContext2D, l: Layout, m: Mound): void {
    const t = 1 - m.left / MOUND_LIFE;
    const x = tileCX(l, m.col);
    const y = tileCY(l, m.row);
    const rise = l.tile * 0.5 * Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.8);
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = PALETTE.rockDark;
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = 1;
    for (const side of [-1, 1]) {
      const bank = new Path2D();
      const base = x + side * l.tile * 0.28;
      bank.moveTo(base - l.tile * 0.4, y + l.tile * 0.2);
      bank.quadraticCurveTo(base, y - rise, base + l.tile * 0.4, y + l.tile * 0.2);
      bank.closePath();
      ctx.fill(bank);
      ctx.stroke(bank);
    }
    ctx.restore();
  }
}
