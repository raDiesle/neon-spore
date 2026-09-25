import type { PodKind } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { bodyX, type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPodBody, POD_TILES } from "./pods.js";

/**
 * **A husk refused: a balloon let go.**
 *
 * The owner asked for this by name on 15 September 2026 — *it goes the way of a
 * balloon let go: it does not break on the skin, it shrinks and shrinks, flying
 * about the hull as the air leaves it* — and it is the one moment in the game
 * that is meant to be funny. Everything else that reaches the ship either pays
 * the pair or costs them; this costs nothing, and the picture has to say so
 * before the banner does.
 *
 * **It is deliberately not a break.** `shatter.ts` cuts a contour into pieces
 * that tile it, and every destruction in the game is spent through it
 * (`.claude/skills/destruction`). A husk does not come apart: it stays one
 * whole object the entire way, and what happens to it is that it gets
 * *smaller*. A shatter here would say the pair destroyed something, which is
 * the one reading this moment must not have — they did nothing at all, and that
 * was the answer.
 *
 * **It is the pod's own body, shrinking, and not a new shape.** The thing the
 * pair refused has to be recognisable as the thing they refused for the whole
 * second it takes to go, or the joke is about some other object
 * (`drawPodBody`). What is added here is the flight and the air.
 *
 * Closed form off one age, like every transient in this package: two phones
 * watching one husk go must watch it go the same way, and a per-frame step
 * would drift between two devices running at two frame rates.
 */

/** Seconds one flight takes. Long — this is a thing getting away rather than a
 * thing going off, and the pair should have time to laugh at it. */
const LIFE = 1.15;

/** How far it darts from where it was let go, in tiles, and how many turns it
 * makes doing it. Not a whole number of turns, so it never lands back where it
 * started and the path never reads as a circle somebody drew. */
const REACH = 2.3;
const LOOPS = 1.7;

/** How fast it spins about its own middle, in turns over its whole life. A
 * balloon let go is not tumbling end over end, it is being shoved about by its
 * own neck — fast, and never twice at the same rate, which the two frequencies
 * below give it for nothing. */
const SPIN = 3.4;

interface Flight {
  x: number;
  y: number;
  r: number;
  kind: PodKind;
  /** The same on both phones — a column (`castHuskFlight`). */
  seed: number;
  age: number;
}

export class HuskDeflates {
  private live: Flight[] = [];

  /** A husk was refused at this point on screen, at this drawn radius. */
  cast(x: number, y: number, r: number, kind: PodKind, seed: number): void {
    this.live.push({ x, y, r, kind, seed, age: 0 });
  }

  update(dt: number): void {
    for (const f of this.live) f.age += dt;
    this.live = this.live.filter((f) => f.age < LIFE);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const f of this.live) {
      const t = Math.min(1, f.age / LIFE);
      const now = flightAt(f, l, t);
      // The air first and under it: a thin jet strung back along the way it
      // has just come, which is the only thing in the picture that says *why*
      // it is moving.
      drawJet(ctx, f, l, t);
      // Smaller all the way, and gone rather than faded — a balloon that ran
      // out of air is a scrap of skin, not a ghost.
      const r = f.r * (1 - t) ** 0.62;
      if (r <= 0.4) continue;
      ctx.save();
      ctx.translate(now.x, now.y);
      ctx.rotate(t * SPIN * Math.PI * 2 + f.seed);
      // The body's own clock is run fast, so the core flutters instead of
      // beating: the lamp that said *this is not coming for you* is the thing
      // losing its nerve.
      drawPodBody(ctx, 0, 0, r, f.age * 5 + f.seed, f.kind);
      ctx.restore();
    }
  }

  clear(): void {
    this.live = [];
  }
}

/**
 * Where it is, `t` of the way through.
 *
 * Two frequencies a seventh apart, which is what makes the path read as a
 * balloon rather than as an orbit: a single turn is a circle, and two that
 * never come back into step is a thing being pushed about by something it
 * cannot control. The reach opens fast and closes, so it is furthest out in
 * the middle of its life and coming back down by the end — the air is
 * strongest at the start and there is none of it left at the finish.
 */
function flightAt(f: Flight, l: Layout, t: number): { x: number; y: number } {
  const turn = t * LOOPS * Math.PI * 2 + f.seed;
  const out = l.tile * REACH * Math.sin(Math.PI * t) ** 0.7;
  return {
    x: f.x + Math.cos(turn) * out,
    // **Up, always, and never below where it was let go.** The second
    // frequency is taken through `abs` rather than left signed, which is the
    // one place this path is not free to be a loop: a husk is refused *at the
    // hull*, so everything under the point it was let go at is inside the
    // ship, and the first capture of this had half the arc behind the
    // plating. Rising is also the truer picture — what is leaving it is the
    // only thing that was holding it down.
    y: f.y - out * 0.55 - Math.abs(Math.sin(turn * 1.7)) * out * 0.4,
  };
}

/** The air going out of it: three puffs strung back along the path it has just
 * flown, the freshest brightest. Halos rather than specks — this is a gas
 * leaving, and a speck would read as debris, which is the one thing a husk
 * does not leave. */
function drawJet(ctx: CanvasRenderingContext2D, f: Flight, l: Layout, t: number): void {
  for (let k = 1; k <= 3; k++) {
    const back = t - k * 0.055;
    if (back <= 0) continue;
    const at = flightAt(f, l, back);
    const fade = (1 - k / 4) * (1 - t) ** 0.8;
    halo(ctx, at.x, at.y, f.r * (1.1 - k * 0.2), PALETTE.podDark, 0.28 * fade);
  }
}

/**
 * A `huskRefused` turned into a flight. The seed is the column and not the
 * pod's id: the event carries no id, and a column is a number both phones
 * already agree on — which is all the seed has to be for the two of them to
 * watch the same thing fly off.
 */
export function castHuskFlight(
  fx: HuskDeflates,
  e: { col: number; row: number; kind: PodKind },
  l: Layout,
  put: (x: number, y: number) => { x: number; y: number },
): void {
  const at = put(bodyX(l, e.col, e.row), tileCY(l, e.row));
  fx.cast(at.x, at.y, l.tile * POD_TILES, e.kind, e.col);
}
