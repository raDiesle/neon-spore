import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { CLASP_RADIUS_MUL } from "./clasp.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CLASP's shield failing.
 *
 * Its own file beside `clasp.ts`, which draws the shield while it still
 * exists. The seam is the creature's own: up to the ward those two are one
 * object, and after it they are two — a body that is now an ordinary slick or
 * bulb, and a picture of something that is no longer in the world at all.
 * `clasp.ts` went over the 250-line limit the moment both lived in it, which
 * is the limit doing its job rather than a filing problem.
 */

/**
 * One clasp coming apart. Keyed by creature id, aged in seconds, and cleared
 * by `Effects.reset()` — `world.nextId` restarts at 0 with the world, so an
 * entry left behind would be read by the next run as its own body's.
 */
export interface ClaspBreak {
  x: number;
  y: number;
  /** The bubble's drawn radius when it failed. */
  r: number;
  /** Seconds since the ward landed. */
  age: number;
  /** Seconds the whole blink lasts, from `claspBreakBeats` at this tempo. */
  life: number;
}

/**
 * The blink. The owner described it as a broken bulb — "blinking on off, then
 * completely vanishing" — so it is gates rather than a fade: the shield is
 * fully there or fully gone, three times, over shorter and shorter holds, and
 * the last gate does not come back.
 *
 * A fade would say the shield weakened. It did not; it failed.
 *
 * **The list does not start at 0.** It did, and that put a gate on the first
 * instant: the shield was already gone on the frame the ward landed and came
 * back afterwards, which reads as a flicker in the *ward* rather than as a
 * shield failing. `clasp-frame.test.ts` caught it by asking the only question
 * that matters at t=0 — is it still there — so the first hold is now the
 * longest one and the picture starts where the pair were looking.
 */
const GATES = [0.16, 0.3, 0.42, 0.52, 0.62] as const;

export function claspBreakVisible(t: number): boolean {
  if (t >= 1) return false;
  let on = true;
  for (const gate of GATES) if (t >= gate) on = !on;
  return on;
}

/** The shield coming apart, over a body that is now an ordinary slick or bulb. */
export function drawClaspBreak(ctx: CanvasRenderingContext2D, fx: ClaspBreak): void {
  const t = fx.life <= 0 ? 1 : fx.age / fx.life;
  if (!claspBreakVisible(t)) return;
  const r = fx.r * (1 + 0.35 * t);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 1 - t;
  ctx.strokeStyle = PALETTE.claspShieldRim;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(fx.x, fx.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Every clasp coming apart right now.
 *
 * The simulation opens a clasp on the instant of the trigger and keeps no
 * timer — the body is an ordinary slick or bulb from that tick onward. So
 * this is a pure render transient, exactly like `LureVanishFx`, and it is
 * drawing *the shield that is no longer there* rather than a state the world
 * still holds. That is not a lie: it is the same grammar as a burst drawn
 * after a death.
 *
 * The radius and the life are both frozen at ingest, the way `LureVanishFx`
 * freezes its radius and for the same reason: there is no creature left to
 * ask about the first, it having stopped being a clasp, and the second is
 * `claspBreakBeats` at the tempo the wave was actually running. That keeps
 * `draw` free of both the layout and the config.
 */
export class ClaspBreakFx {
  private live: ClaspBreak[] = [];

  /** `beatSeconds` is the run's own beat, so the blink is two beats of *it*. */
  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig, beatSeconds: number): void {
    for (const e of events) {
      if (e.type !== "claspBreak") continue;
      this.live.push({
        x: tileCX(l, e.col),
        y: tileCY(l, e.row),
        r: l.tile * CLASP_RADIUS_MUL,
        age: 0,
        life: cfg.claspBreakBeats * beatSeconds,
      });
    }
  }

  update(dt: number): void {
    for (const fx of this.live) fx.age += dt;
    this.live = this.live.filter((fx) => fx.age < fx.life);
  }

  clear(): void {
    this.live = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const fx of this.live) drawClaspBreak(ctx, fx);
  }
}
