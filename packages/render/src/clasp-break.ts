import type { SimConfig, SimEvent, World } from "@neon-spore/sim";
import { CLASP_RADIUS_MUL } from "./clasp.js";
import { creatureCenter } from "./creature-place.js";
import { depthScale, drawnRow } from "./depth.js";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
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
 *
 * **It is keyed by the body, not by a place.** The first version froze the
 * screen position at ingest, the way `LureVanishFx` does — which is right for
 * a lure, because a lure is gone, and wrong here, because the thing the shield
 * was around is still falling. The owner caught it in one sentence: *"when the
 * shield vanishes, it must stay in same position around the enemy, right now
 * it stays where it is."* So an entry stores a creature id and the position is
 * looked up every frame — off `claspBreak`'s own `id`, which the event carries
 * for exactly this. That is also what keeps the blizzard inside the ball
 * instead of leaving it hanging a row above the body a beat later.
 */

/**
 * One clasp coming apart. Keyed by creature id, aged in seconds, and cleared
 * by `Effects.reset()` — `world.nextId` restarts at 0 with the world, so an
 * entry left behind would be read by the next run as its own body's.
 */
export interface ClaspBreak {
  /** The body the shield was around. It is an ordinary slick or bulb now. */
  id: number;
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

/** How many fragments tumble inside the ball while it is coming apart. */
const SHARDS = 9;

/**
 * The blizzard inside the circle — the owner's word for it: *"some blizzards
 * in the shield circle indicating its being destroyed"*.
 *
 * Short bright fragments tumbling **inside** the rim rather than sparks thrown
 * out of it, and that distinction is the whole of the effect. A burst outward
 * is what the field already does when a body dies (`sparks.ts`); this is a
 * structure failing inwards while the body it was holding stands there
 * unharmed, so every fragment stays within the ball's own radius — the
 * distance and the length below are both bounded to keep it there.
 *
 * Each one is aged off `t` alone, so the storm thickens and thins on its own
 * without a particle list for `Effects.reset()` to clear.
 */
function drawBlizzard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
): void {
  // Loudest as the ball starts to go, spent by the time the last gate closes.
  const strength = Math.max(0, 1 - t) * Math.min(1, t * 6 + 0.2);
  if (strength <= 0) return;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = PALETTE.claspShieldRim;
  ctx.lineWidth = Math.max(0.6, r * 0.08);
  for (let i = 0; i < SHARDS; i++) {
    // Each fragment has its own tumble rate, so they never sweep as one ring.
    const spin = 1.4 + sinHash(i * 17.3) * 2.6;
    const a = sinHash(i * 5.1) * Math.PI * 2 + t * spin;
    // Outward over the fragment's life: the shell is throwing itself apart.
    const d = r * (0.12 + 0.55 * ((sinHash(i * 9.7) + t * 1.6) % 1));
    const len = r * (0.12 + 0.14 * sinHash(i * 3.3));
    const flicker = sinHash(i * 2.9 + Math.floor(t * 24)) * 0.7 + 0.3;
    ctx.globalAlpha = Math.min(1, strength * flicker);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    ctx.lineTo(x + Math.cos(a + 0.5) * (d + len), y + Math.sin(a + 0.5) * (d + len));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

/** The shield coming apart, around a body that is now an ordinary slick or bulb. */
function drawClaspBreak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
): void {
  // The blizzard runs whether or not the rim is in an "on" gate: the shell is
  // failing across the whole blink, and it is the one thing that keeps the
  // picture alive through a dark gate.
  drawBlizzard(ctx, x, y, r, t);
  if (!claspBreakVisible(t)) return;
  const rr = r * (1 + 0.35 * t);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 1 - t;
  ctx.strokeStyle = PALETTE.claspShieldRim;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Every clasp coming apart right now.
 *
 * The simulation opens a clasp on the instant of the trigger and keeps no
 * timer — the body is an ordinary slick or bulb from that tick onward. So
 * this is a pure render transient, and it is drawing *the shield that is no
 * longer there* rather than a state the world still holds. That is not a lie:
 * it is the same grammar as a burst drawn after a death.
 *
 * The life is frozen at ingest — `claspBreakBeats` at the tempo the wave was
 * actually running — and the position deliberately is not.
 */
export class ClaspBreakFx {
  private live: ClaspBreak[] = [];

  /** `beatSeconds` is the run's own beat, so the blink is two beats of *it*. */
  ingest(events: readonly SimEvent[], cfg: SimConfig, beatSeconds: number): void {
    for (const e of events) {
      if (e.type !== "claspBreak") continue;
      this.live.push({ id: e.id, age: 0, life: cfg.claspBreakBeats * beatSeconds });
    }
  }

  update(dt: number): void {
    for (const fx of this.live) fx.age += dt;
    this.live = this.live.filter((fx) => fx.age < fx.life);
  }

  clear(): void {
    this.live = [];
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    for (const fx of this.live) {
      const c = world.creatures.find((x) => x.id === fx.id);
      // The body was destroyed inside the blink. There is nothing to be around
      // any more, and a ring left hanging in the column would say the shield
      // outlived the thing it was holding.
      if (!c) continue;
      const { x, y } = creatureCenter(l, c, beatPhase);
      const r = l.tile * CLASP_RADIUS_MUL * depthScale(world.cfg, l, drawnRow(c, beatPhase));
      drawClaspBreak(ctx, x, y, r, fx.life <= 0 ? 1 : fx.age / fx.life);
    }
  }
}
