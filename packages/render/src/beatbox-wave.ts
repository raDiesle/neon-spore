import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The wave of sound a miscounted box sends at the ship**, and the picture
 * this creature is named for.
 *
 * A run committed on the wrong count discharges: the hull pays, and what the
 * pair has to *see* is the thing that did it travelling down the field, out of
 * the body they were tapping, to the ship. Without that the miscount is a
 * number changing on the health bar with nothing between it and the box.
 *
 * **Arcs and not a burst.** Every other failure on this field throws
 * particles, and particles say *something broke here*. Nothing broke here — a
 * cabinet moved a lot of air — so it is drawn the way a subwoofer is heard: a
 * train of open arcs, wide, bowed downward and travelling down the field ahead
 * of each other. The one thing they must not read as is a shot, so they are
 * far too wide to be a bolt.
 *
 * **It goes all the way to the ship, and it is red.** Both are the owner's,
 * reported together: *when sound wave was sent, it should go full vertical to
 * hit ship*, and *make damaging wave look more impactful and give it cool neon
 * red colours*. It used to travel six tiles in the field's own grey and fade
 * out in mid-air, which drew a sound that stopped before it arrived — the one
 * thing that cannot be true of a wave the hull is being charged for. The reach
 * is now the whole distance from the box to the hull row, measured per
 * discharge, and the train ends in a flash across the plating.
 *
 * The red is `PALETTE.red`, the ammunition colour, and that is not the drift
 * it looks like: nothing about a wave of sound is a body a trigger answers, it
 * carries no contour a bolt could meet, and it is drawn as light rather than
 * as matter. What it shares with the trigger is the only thing red means
 * anywhere in this game — *this is going to cost you* — and a second, private
 * red for one creature's alarm would be a colour the pair has to learn twice.
 * The box's own alarm is lit in the same one (`beatbox-air.ts`), so the body
 * and the thing coming out of it read as one event.
 *
 * It is a transient with a life of its own rather than a shape read off the
 * world, because the body it comes out of is still falling and the wave is
 * not: the box goes on down its column and the sound leaves it behind. That is
 * also why it is `Effects`' and cleared in `Effects.reset` — it outlives its
 * frame, so a run abandoned mid-discharge would otherwise hand the next one a
 * screen with somebody else's sound still crossing it (`restart.test.ts`
 * fails without it).
 *
 * It runs on the wall clock, which render is free to use and the simulation is
 * not, so two phones a pixel out of step is not a desync and never reaches
 * `hashWorld` — `choir-quake.ts` makes the same argument about its shake.
 */

/** Seconds one discharge takes to cross the field and die. A little under a
 * beat at the config's tempo, so the sound has plainly arrived before the box
 * is asking for the next one — a wave still crossing when the pair's new run
 * starts would read as the old mistake still costing them. */
const LIFE = 0.55;

/** How many arcs go down per discharge. Five now rather than three: the reach
 * is the whole field instead of half of it, and three arcs spread over twice
 * the distance is a thing that passes rather than a thing that arrives. */
const ARCS = 5;

/** How far apart in the cycle they are, as a fraction of one life. */
const STAGGER = 0.13;

/** How wide an arc is at birth and at the end of its life, in tiles. It opens
 * as it goes, the way anything travelling away from a point does — and it ends
 * wider than a lane, so what meets the ship is a front rather than a line. */
const WIDTH_FROM = 1.2;
const WIDTH_TO = 4.6;

interface Discharge {
  x: number;
  y: number;
  /** How far this one has to go, in pixels: from the box to the hull row.
   * Measured when it is cast rather than assumed, because a box discharges
   * anywhere between the top of the field and the plating — a fixed reach
   * would overshoot the ship from low down and stop short from high up. */
  reach: number;
  age: number;
}

export class BeatboxWaves {
  private live: Discharge[] = [];

  /** A box discharged at this point on screen, aimed at `toY` — the hull row.
   * Both are pixels the caller has already placed (`effects-ingest.ts`). */
  cast(x: number, y: number, toY: number): void {
    this.live.push({ x, y, reach: Math.max(0, toY - y), age: 0 });
  }

  update(dt: number): void {
    for (const d of this.live) d.age += dt;
    this.live = this.live.filter((d) => d.age < LIFE + ARCS * STAGGER * LIFE);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    const prev = ctx.globalCompositeOperation;
    // Additive, so where two arcs of the train overlap the field goes brighter
    // rather than muddier. This is light travelling through a dark room, and
    // the whole of what "neon" means on this screen.
    ctx.globalCompositeOperation = "lighter";
    for (const d of this.live) {
      for (let i = 0; i < ARCS; i++) {
        // Each arc is the same arc started later, so the train is one wave
        // seen five times rather than five different things.
        const t = (d.age - i * STAGGER * LIFE) / LIFE;
        if (t <= 0 || t >= 1) continue;
        drawArc(ctx, l, d.x, d.y + d.reach * t, t);
        // And the leading arc alone lights the plating as it lands: the last
        // tenth of its life, on the row it is arriving at.
        if (i === 0 && t > 0.9) {
          halo(ctx, d.x, d.y + d.reach, l.tile * 3.2, PALETTE.red, (t - 0.9) * 6);
        }
      }
    }
    ctx.globalCompositeOperation = prev;
  }

  clear(): void {
    this.live = [];
  }
}

/**
 * One arc, `t` of the way through its life, already placed on the row it has
 * reached.
 *
 * A quadratic curve bowed downward rather than a circle: what is being drawn
 * is a front moving *at the ship*, and a full ring would put as much of the
 * sound above the box as below it — which is a picture of something exploding
 * rather than of something aimed.
 *
 * Two strokes rather than one: a wide, dim `redRim` behind and a narrow bright
 * `red` on top. That is the only way to draw a neon tube on a canvas with no
 * blur available — a single stroke is a line, and a line with a wash under it
 * is a light (`glow.ts` makes the same trade for a path).
 */
function drawArc(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  top: number,
  t: number,
): void {
  const half = l.tile * (WIDTH_FROM + (WIDTH_TO - WIDTH_FROM) * t) * 0.5;
  const bow = l.tile * 0.55;
  const path = new Path2D();
  path.moveTo(x - half, top);
  path.quadraticCurveTo(x, top + bow, x + half, top);
  ctx.save();
  ctx.lineCap = "round";
  // Deliberately not `(1 - t)`: an arc that is dimmest where it arrives is an
  // arc the pair stops watching before it lands. It holds most of its
  // brightness the whole way down and goes out at the end of its own life.
  const fade = (1 - t) ** 0.45;
  ctx.globalAlpha = 0.28 * fade;
  ctx.strokeStyle = PALETTE.redRim;
  ctx.lineWidth = Math.max(4, l.tile * 0.42);
  ctx.stroke(path);
  ctx.globalAlpha = 0.95 * fade;
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = Math.max(1.5, l.tile * 0.13);
  ctx.stroke(path);
  ctx.restore();
}
