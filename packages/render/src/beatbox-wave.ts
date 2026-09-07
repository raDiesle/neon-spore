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
 * few open arcs, wide, bowed downward and travelling down the field ahead of
 * each other, thinning as they go. The one thing they must not read as is a
 * shot, so they are the field's own grey rather than either ammunition colour
 * and they are far too wide to be a bolt.
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

/** How many arcs go down per discharge. Three reads as a *train* — the eye
 * gets an interval out of it, which is what says "sound" rather than "one
 * ring" — and a fourth adds nothing but ink. */
const ARCS = 3;

/** How far apart in the cycle the three are, as a fraction of one life. */
const STAGGER = 0.17;

/** How far the leading arc travels, in tiles. Six is most of the lower field
 * from where a box usually is when a run comes apart, and an arc that faded
 * before it got anywhere would say the sound stopped in mid-air. */
const REACH = 6;

/** How wide an arc is at birth and at the end of its life, in tiles. It opens
 * as it goes, the way anything travelling away from a point does. */
const WIDTH_FROM = 1.1;
const WIDTH_TO = 3.4;

interface Discharge {
  x: number;
  y: number;
  age: number;
}

export class BeatboxWaves {
  private live: Discharge[] = [];

  /** A box discharged at this point on screen. */
  cast(x: number, y: number): void {
    this.live.push({ x, y, age: 0 });
  }

  update(dt: number): void {
    for (const d of this.live) d.age += dt;
    this.live = this.live.filter((d) => d.age < LIFE + ARCS * STAGGER * LIFE);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const d of this.live) {
      for (let i = 0; i < ARCS; i++) {
        // Each arc is the same arc started later, so the three are one wave
        // seen three times rather than three different things.
        const t = (d.age - i * STAGGER * LIFE) / LIFE;
        if (t <= 0 || t >= 1) continue;
        drawArc(ctx, l, d.x, d.y, t);
      }
    }
  }

  clear(): void {
    this.live = [];
  }
}

/**
 * One arc, `t` of the way through its life.
 *
 * A quadratic curve bowed downward rather than a circle: what is being drawn
 * is a front moving *at the ship*, and a full ring would put as much of the
 * sound above the box as below it — which is a picture of something exploding
 * rather than of something aimed.
 */
function drawArc(ctx: CanvasRenderingContext2D, l: Layout, x: number, y: number, t: number): void {
  const half = l.tile * (WIDTH_FROM + (WIDTH_TO - WIDTH_FROM) * t) * 0.5;
  const top = y + l.tile * REACH * t;
  const bow = l.tile * 0.55;
  ctx.save();
  ctx.globalAlpha = (1 - t) * 0.55;
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = Math.max(1.5, l.tile * 0.1 * (1 - t));
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - half, top);
  ctx.quadraticCurveTo(x, top + bow, x + half, top);
  ctx.stroke();
  ctx.restore();
}
