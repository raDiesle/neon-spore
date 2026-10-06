import type { SimEvent } from "@neon-spore/sim";
import { flueEmberR, type Point } from "./flue-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The spore beamed away and back** (the owner, 6 October 2026: *when a miss
 * or a hit is done, the ball beams away and is teleported back to the start,
 * left*). As a shot meets the flue's row, hit or spent, the spore is drawn
 * pulled thin into a shaft of light where the shot met it and gone; then a
 * shaft opens at the left end and the spore is drawn back out of it, where
 * the simulation already has it (`flue-step.ts`, `rewind` and `rest`).
 *
 * Only on the screen shown the spore: where it was beamed out from is where
 * it was, which the navigator is not shown. The place comes on the event,
 * `emberMilli`, because by the frame that draws it the simulation has the
 * spore at the left end already. Cleared in `Effects.reset()` with the rest
 * of `FlueFx`.
 */

/** How long the spore takes to beam out, and to beam back in after, in seconds. */
const OUT = 0.32;
const IN = 0.42;
/** The shaft: how far above and below the spore it reaches, in tiles, and its widest, against the spore's radius. */
const SHAFT_REACH = 2.6;
const SHAFT_WIDE = 1.15;
/** How much taller than round the spore is pulled as it goes. */
const PULL = 1.8;
/** The motes that climb the shaft. */
const MOTES = 7;

export class FlueBeam {
  private fromMilli: number | null = null;
  private age = 0;

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type !== "flueHit" && e.type !== "flueMiss") continue;
      this.fromMilli = e.emberMilli;
      this.age = 0;
    }
  }

  /** The spore beaming out: where it was, thousandths of a column off the middle, and how far gone, 0..1. */
  get out(): { milli: number; gone: number } | null {
    if (this.fromMilli === null || this.age >= OUT) return null;
    return { milli: this.fromMilli, gone: this.age / OUT };
  }

  /** How much of the spore is back where the simulation has it: 0 while it beams out, up to 1 as it beams in. */
  get present(): number {
    if (this.fromMilli === null) return 1;
    return Math.max(0, Math.min(1, (this.age - OUT) / IN));
  }

  update(dt: number): void {
    if (this.fromMilli === null) return;
    this.age += Math.min(dt, 1 / 30);
    if (this.age >= OUT + IN) this.fromMilli = null;
  }

  clear(): void {
    this.fromMilli = null;
    this.age = 0;
  }
}

/**
 * The spore drawn by `draw` pulled into the shaft at `at`, `gone` 0 whole to
 * 1 a line of light, and the shaft round it: brightest halfway, where the
 * spore is thinnest.
 */
export function drawFlueBeamed(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  gone: number,
  draw: () => void,
): void {
  if (gone < 1) {
    ctx.save();
    ctx.globalAlpha *= 1 - gone * gone;
    ctx.translate(at.x, at.y);
    ctx.scale(Math.max(0.02, 1 - gone), 1 + PULL * gone);
    ctx.translate(-at.x, -at.y);
    draw();
    ctx.restore();
  }
  drawShaft(ctx, l, at, Math.sin(Math.PI * Math.min(1, gone * 1.15)), gone);
}

/** The shaft of light at `at`, `glow` 0..1, its motes climbing with `along`. */
function drawShaft(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  glow: number,
  along: number,
): void {
  if (glow <= 0.01) return;
  const r = flueEmberR(l);
  const half = r * SHAFT_WIDE * (0.35 + 0.65 * glow);
  const reach = SHAFT_REACH * l.tile;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // Two lenses, widest at the spore and tapering to nothing at either end,
  // so it reads as light and not a bar: a cyan sheath and a white core.
  lens(ctx, at, half, reach, PALETTE.cyanRim, 0.45 * glow);
  lens(ctx, at, half * 0.35, reach * 0.85, PALETTE.hullRim, 0.95 * glow);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.9 * glow);
  for (let i = 0; i < MOTES; i++) {
    const k = (i / MOTES + along * 0.9) % 1;
    const x = at.x + Math.sin(i * 2.4) * half * 0.6;
    const y = at.y + reach * 0.8 * (1 - 2 * k);
    ctx.beginPath();
    ctx.arc(x, y, r * (0.06 + 0.03 * (i % 3)), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A tall lens of light round `at`, fading toward its ends. */
function lens(
  ctx: CanvasRenderingContext2D,
  at: Point,
  half: number,
  reach: number,
  color: string,
  alpha: number,
): void {
  const g = ctx.createLinearGradient(0, at.y - reach, 0, at.y + reach);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(0.5, rgba(color, alpha));
  g.addColorStop(1, rgba(color, 0));
  const p = new Path2D();
  p.moveTo(at.x, at.y - reach);
  p.quadraticCurveTo(at.x + half * 2, at.y, at.x, at.y + reach);
  p.quadraticCurveTo(at.x - half * 2, at.y, at.x, at.y - reach);
  ctx.fillStyle = g;
  ctx.fill(p);
}
