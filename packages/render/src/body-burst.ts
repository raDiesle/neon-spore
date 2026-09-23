import { isWardable, type SimEvent } from "@neon-spore/sim";
import { breachHue } from "./breach-hue.js";
import { strokeGlow } from "./glow.js";
import { sinHash } from "./hash.js";
import { mixHex, rgba } from "./hex.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **A body bursting on the plating it just reached**, like a balloon full of
 * water, in the colour it was wearing.
 *
 * The owner asked for it on 22 September 2026: *in the moment the enemy
 * touches the hull it immediately explodes — a big splash like a balloon with
 * water, with the colour of the enemy.* The first of the three exemptions in
 * `docs/looks.md`, so it goes onto the field.
 *
 * **What the hit had until now was the after and not the moment.** The stain
 * is painted from the `Scar` and stays for the run (`hull-splash.ts`), which
 * is the *colour spread across the hull* he named in the same sentence as
 * already there; the crack is `scars.ts`; the ship's own answer is the strike
 * and the shock. All of them are the ship. None of them is the body, and the
 * body was the thing that went — a slick reaching the hull stopped existing
 * between two frames and left a handful of sparks at the column
 * (`effects-breach.ts`).
 *
 * Two pictures, in the order a balloon does them. **A ring out of the point**,
 * thrown a fifth of a second and gone: the skin letting go. **Then the water**
 * — drops on ballistic arcs out of the same point, up and out and back down
 * onto the plating, all of them landed before the stain under them has
 * settled. After that there is nothing here, because by then what is left of
 * the hit is what stays.
 *
 * **A rock does not burst and a wall does not either.** `isWardable` is the
 * same split `landing.ts` and `hull-splash.ts` already make — stone punches a
 * hole and the hole is the picture (`craters.ts`) — and a wall is a live wire
 * that earths through the dome without breaking the skin at all
 * (`effects-breach.ts`'s first branch). THE GUM is left out for the opposite
 * reason: it is already a drop of water and already bursts, with a smear and
 * ripples the owner asked for on 14 September (`gum-splash.ts`), and a second
 * crown over that one would be the same picture drawn twice.
 *
 * **Held by `RenderState` rather than `Effects`**, for the gum splash's
 * reason: everything `Effects` owns is painted over by the hull, and a burst
 * on the ship is drawn on top of the ship it is about. `RenderState.forget`
 * clears it.
 *
 * **Nothing here is kept per drop.** Every drop is a function of its index,
 * the column it came out of and the age of the hit, so a frame drawn twice on
 * one tick looks the same both times (`restart.test.ts`'s rule) and a drop
 * that landed is the end of its own arc rather than a record to update.
 */

/** Seconds a burst lasts: the last drop is down and the ring long gone. */
const LIFE = 0.5;
/** Seconds the ring takes to run out and go. */
const POP = 0.2;
/** How far the ring gets, in tiles, in that time. */
const POP_R = 2.4;
/**
 * Drops thrown, how far out the furthest one lands and how high the highest
 * one goes, in tiles — and how big one is, before its own variation.
 *
 * **Many, small and low.** The first drawing of this threw eighteen at a
 * fifth of a tile and three tiles up, and the strip of it was a handful of
 * berries lobbed over the ship: a drop the eye can measure is an object, and
 * an arc that clears the hull by three tiles is a fountain. Water is read from
 * the *spray* — more of them, each too small to count, thrown wider than they
 * are thrown high so the burst runs along the plating rather than over it.
 */
const DROPS = 26;
const THROW = 4.2;
const LIFT = 1.4;
const DROP_R = 0.085;
/** How far a drop's lit edge is mixed toward white. */
const LIT = 0.45;
/** Bursts at once. A wave that puts more than this on the hull inside half
 * a second has been lost several times over. */
const MAX = 4;

interface Burst {
  /** The centre, in columns, the body's width, and the colour it wore. */
  col: number;
  span: number;
  hex: string;
  age: number;
}

export class BodyBurst {
  private bursts: Burst[] = [];

  /** One frame's events. */
  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type !== "breach") continue;
      if (isWardable(e.kind) || e.kind === "fence" || e.kind === "gum") continue;
      this.hit(e.col + (e.span - 1) / 2, e.span, breachHue(e.kind, e.color));
    }
  }

  /** A body has burst on the hull, centred on that column. */
  hit(col: number, span: number, hex: string): void {
    this.bursts.push({ col, span, hex, age: 0 });
    if (this.bursts.length > MAX) this.bursts.shift();
  }

  update(dt: number): void {
    for (const b of this.bursts) b.age += dt;
    this.bursts = this.bursts.filter((b) => b.age < LIFE);
  }

  clear(): void {
    this.bursts = [];
  }

  /** Every burst still running, on the ship as it is drawn this frame. */
  draw(ctx: CanvasRenderingContext2D, l: Layout, surfaceY: SurfaceY): void {
    for (const b of this.bursts) {
      const cx = tileCX(l, b.col);
      const rim = mixHex(b.hex, "#FFFFFF", LIT);
      pop(ctx, l, surfaceY, cx, b, rim);
      drops(ctx, l, surfaceY, cx, b, rim);
    }
  }
}

/** The skin letting go: one ring out of the point, fast, and gone. */
function pop(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  surfaceY: SurfaceY,
  cx: number,
  b: Burst,
  rim: string,
): void {
  const t = b.age / POP;
  if (t >= 1) return;
  // A half ring over the plating and not a circle: the lower half would be
  // inside the ship, where a burst above the skin has nothing to say.
  const ring = new Path2D();
  ring.arc(cx, surfaceY(cx), l.tile * POP_R * b.span * Math.sqrt(t), Math.PI, Math.PI * 2);
  strokeGlow(ctx, ring, rim, Math.max(1, l.tile * 0.06 * (1 - t)), 1.4, 1 - t);
}

/**
 * The water: eighteen arcs out of one point.
 *
 * **One path for all of them, not one path each.** `eye-iris.ts`'s rule and
 * `wave-budget.test.ts`'s — eighteen ellipses on one `Path2D` are one fill
 * and one stroke, and the same eighteen drawn a drop at a time are thirty-six
 * ops on a frame that is already the dearest in the wave.
 */
function drops(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  surfaceY: SurfaceY,
  cx: number,
  b: Burst,
  rim: string,
): void {
  const t = b.age / LIFE;
  const tile = l.tile;
  const path = new Path2D();
  for (let i = 0; i < DROPS; i++) {
    // Fanned either way along the hull rather than scattered round a circle:
    // a splash runs across the surface it is stuck to (`hull-splash.ts`), and
    // an even ring of drops reads as a burst hanging in front of the ship.
    const side = i % 2 === 0 ? 1 : -1;
    const out = ((i + 0.5) / DROPS) * 0.9 + 0.1;
    const reach = side * THROW * tile * b.span * out * (0.4 + sinHash(i, b.col, 1) * 0.8);
    const high = LIFT * tile * b.span * (0.35 + sinHash(i, b.col, 2) * 0.9);
    const x = cx + reach * t;
    // A throw and a fall in one expression: up hard, and back down onto the
    // plating exactly as `t` reaches one.
    const y = surfaceY(x) - high * 4 * t * (1 - t);
    const r = tile * DROP_R * b.span * (0.5 + sinHash(i, b.col, 3)) * (1 - 0.35 * t);
    // Stretched along the fall, which is what a drop in the air looks like.
    path.moveTo(x + r * 0.8, y);
    path.ellipse(x, y, r * 0.8, r * 1.3, 0, 0, Math.PI * 2);
  }
  // Bright all the way out and gone as it lands: a drop that faded on its way
  // up would be a burst that ran out of water before it reached anything, and
  // what ends this picture is the plating rather than the clock.
  const fade = Math.min(1, (1 - t) * 4);
  ctx.save();
  ctx.fillStyle = rgba(b.hex, 0.9 * fade);
  ctx.fill(path);
  ctx.strokeStyle = rgba(rim, 0.85 * fade);
  ctx.lineWidth = Math.max(1, tile * 0.02);
  ctx.stroke(path);
  ctx.restore();
}
