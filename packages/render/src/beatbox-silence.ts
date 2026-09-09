import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **A soundbox going quiet**, which is the one thing on this creature that goes
 * right and until now was the quietest picture it had.
 *
 * A run answered on the count the box asked for silenced the body and threw
 * sixteen white specks, which is what every ordinary kill throws. The owner
 * asked for the opposite: *when destroyed make it a much more visual visible
 * beat explosion, in some green colour*. So the body's last act is the loudest
 * one it makes — a ring of air going out of it in every direction at once,
 * three of them, over a flash that lights the whole lane.
 *
 * **It is the discharge's picture run backwards, and that is the argument for
 * it.** A miscount sends a train of arcs *down the field at the ship*
 * (`beatbox-wave.ts`); this sends rings *out of the body and nowhere*. Same
 * shape, same reading — a cabinet moving a lot of air — with the direction
 * carrying the whole of the difference between the two outcomes. A pair who
 * have seen one knows what the other is without being told.
 *
 * **Green, and it is `PALETTE.good`'s own meaning rather than an exception to
 * it.** The palette reserves green for *the one thing that goes right*, and a
 * box silenced on the count it asked for is exactly that. It is the same green
 * the counter's row turns and the same one a counted beat's rings are, so the
 * three readings the pair gets on this creature — a beat landed, the run is
 * right, the box is gone — are one colour saying one thing three times.
 *
 * It runs on the wall clock, which render is free to use and the simulation is
 * not, and it is `Effects`' and cleared in `Effects.reset` — it outlives its
 * frame, so a wave abandoned mid-burst would otherwise hand the next run a
 * screen with somebody else's silence still opening on it (`restart.test.ts`
 * fails without it).
 */

/** Seconds one silencing takes. Longer than the discharge's train, because
 * nothing is travelling anywhere and the whole of it is one place opening: a
 * burst that is over in a third of a beat reads as a body being shot. */
const LIFE = 0.75;

/** How many rings go out, and how far apart in the cycle. Three, staggered
 * wider than the discharge's five — a train aimed at something wants to read as
 * one front, and this wants to read as a thing coming apart. */
const RINGS = 3;
const STAGGER = 0.18;

/** How far the leading ring gets, in tiles. Two lanes either side: this is the
 * loudest thing a box ever does and the pair should see it from the other end
 * of the field. */
const REACH = 2.6;

/** How many specks are thrown with it, and how fast they go, in tiles a
 * second. They are the half of this that is *matter* — the rings are air — and
 * without them a silencing is a ripple rather than a body going. */
const SPECKS = 22;
const SPECK_SPEED = 5.5;

interface Silence {
  x: number;
  y: number;
  age: number;
  /** The body's own drawn radius when it went, so the rings leave the rim the
   * pair was looking at rather than a size decided here. */
  r: number;
}

export class BeatboxSilences {
  private live: Silence[] = [];

  /** A box went quiet at this point on screen, at this drawn radius. */
  cast(x: number, y: number, r: number): void {
    this.live.push({ x, y, r, age: 0 });
  }

  update(dt: number): void {
    for (const s of this.live) s.age += dt;
    this.live = this.live.filter((s) => s.age < LIFE + RINGS * STAGGER * LIFE);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    const prev = ctx.globalCompositeOperation;
    // Additive, so overlapping rings brighten the field rather than muddying
    // it — the same trade the discharge makes, and the whole of what "neon"
    // means on this screen (`beatbox-wave.ts`).
    ctx.globalCompositeOperation = "lighter";
    for (const s of this.live) {
      // The flash first and under everything: a body that has just gone leaves
      // light where it was, and the rings come out of that rather than out of
      // nothing.
      const flash = 1 - Math.min(1, s.age / (LIFE * 0.45));
      if (flash > 0) halo(ctx, s.x, s.y, l.tile * 3.6, PALETTE.good, 0.75 * flash ** 1.4);
      for (let i = 0; i < RINGS; i++) {
        const t = (s.age - i * STAGGER * LIFE) / LIFE;
        if (t <= 0 || t >= 1) continue;
        drawRing(ctx, l, s, t);
      }
      drawSpecks(ctx, l, s);
    }
    ctx.globalCompositeOperation = prev;
  }

  clear(): void {
    this.live = [];
  }
}

/**
 * One ring, `t` of the way through its life.
 *
 * A full circle rather than the discharge's downward bow, and that is the
 * difference between the two: a bow is a front *aimed* at the ship, a circle is
 * a body letting go of everything it was holding. It is drawn slightly wider
 * than it is tall, the same proportion the body's own idle rings take, because
 * a cabinet is wider than it is tall (`beatbox-air.ts`).
 *
 * Two strokes, a wide dim one under a narrow bright one, which is how a neon
 * tube is drawn on a canvas with no blur available.
 */
function drawRing(ctx: CanvasRenderingContext2D, l: Layout, s: Silence, t: number): void {
  const out = s.r + l.tile * REACH * t;
  const fade = Math.sin(Math.PI * t) ** 0.7;
  const path = new Path2D();
  path.ellipse(s.x, s.y, out * 1.12, out * 0.86, 0, 0, Math.PI * 2);
  ctx.save();
  ctx.globalAlpha = 0.3 * fade;
  ctx.strokeStyle = PALETTE.goodRim;
  ctx.lineWidth = Math.max(4, l.tile * 0.4);
  ctx.stroke(path);
  ctx.globalAlpha = 0.95 * fade;
  ctx.strokeStyle = PALETTE.good;
  ctx.lineWidth = Math.max(1.5, l.tile * 0.12 * (1 - t));
  ctx.stroke(path);
  ctx.restore();
}

/**
 * The specks, thrown outward and slowing.
 *
 * Their directions are fixed by the index rather than rolled, for the reason
 * every transient in this package takes: two phones drawing the same silencing
 * must draw the same one, and a random number here would be the only thing on
 * screen the pair could disagree about.
 */
function drawSpecks(ctx: CanvasRenderingContext2D, l: Layout, s: Silence): void {
  const t = Math.min(1, s.age / LIFE);
  if (t >= 1) return;
  // Slowing rather than travelling evenly: everything thrown out of something
  // is fastest on the frame it leaves.
  const out = l.tile * SPECK_SPEED * LIFE * (1 - (1 - t) ** 2);
  ctx.save();
  ctx.globalAlpha = (1 - t) ** 1.3;
  ctx.fillStyle = PALETTE.goodRim;
  for (let i = 0; i < SPECKS; i++) {
    // An irrational turn per speck, so the ring of them never reads as a
    // wheel with spokes: the golden angle is the one that never lines up.
    const a = i * 2.399963;
    // And two lengths, alternating, so the cloud has a depth to it.
    const reach = out * (i % 2 === 0 ? 1 : 0.62);
    const rr = Math.max(1, l.tile * 0.05 * (1 - t));
    ctx.beginPath();
    ctx.arc(s.x + Math.cos(a) * reach, s.y + Math.sin(a) * reach * 0.8, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
