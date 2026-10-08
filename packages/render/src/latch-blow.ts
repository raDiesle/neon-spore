import type { SimConfig } from "@neon-spore/sim";
import type { Point, StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { LATCH_AT_REST } from "./latch-pose.js";
import { LATCH_TENDRIL, latchRoot } from "./latch-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE LATCH's own blow at the hull** (`boss-strike-look.ts`). A level ran
 * out before its knots were in, and the colony takes the rope back the way
 * the pair would not: it **cracks the tendril like a whip**. A wave runs down
 * the rope already hooked into the hull, and where it reaches the plating the
 * hook tears out and the hull splits round it, spattered with the colony's
 * ochre.
 *
 * The blow leaves from under the colony's core, where the tendril grows out
 * of it (`latch-shape.ts`), and the column is the tendril's own — so the whip
 * runs down the rope that is already drawn, never out of empty field.
 */

/** How far the whip throws the tendril aside, in tiles, and how many half waves it carries. */
const THROW = 0.7;
const WAVES = 3;
/** The spatter round the torn hook: how many drops, how far out, and their size, in tiles. */
const DROPS = 7;
const DROP_OUT = 0.6;
const DROP = 0.1;

/** Where the blow leaves the body: under the core, where the tendril grows out, hung at rest. */
export function latchBlowFrom(l: Layout, cfg: SimConfig, _col: number): Point {
  return latchRoot(l, cfg, LATCH_AT_REST);
}

/** The rope from `from` to `to` with a wave `crest` of the way down it, thrown `amp` aside. */
function whip(ctx: CanvasRenderingContext2D, from: Point, to: Point, crest: number, amp: number) {
  const steps = 28;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    // The wave is a hump travelling down the rope, nought away from its crest.
    const hump = Math.max(0, 1 - Math.abs(u - crest) * 2.5);
    const x = from.x + (to.x - from.x) * u + Math.sin(u * WAVES * Math.PI) * hump * amp;
    const y = from.y + (to.y - from.y) * u;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function latchBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha *= fade;
  const crest = Math.min(1, f.reach);
  const amp = THROW * tile * (1 - 0.6 * f.after);
  ctx.strokeStyle = PALETTE.latchSkinDark;
  ctx.lineWidth = LATCH_TENDRIL * tile + STROKE.outline * 2;
  whip(ctx, from, to, crest, amp);
  ctx.strokeStyle = PALETTE.latchTendril;
  ctx.lineWidth = LATCH_TENDRIL * tile;
  whip(ctx, from, to, crest, amp);
  if (f.after > 0) {
    // The hull split round the torn hook, and the colony's ochre spattered on it.
    ctx.strokeStyle = PALETTE.red;
    ctx.lineWidth = tile * 0.1;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.3 + 1.2 * f.after),
      tile * (0.1 + 0.25 * f.after),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    for (let i = 0; i < DROPS; i++) {
      const a = (i / DROPS) * Math.PI * 2 + 0.4;
      const out = DROP_OUT * tile * (0.6 + f.after);
      ctx.fillStyle = rgba(i % 2 === 0 ? PALETTE.latchSkin : PALETTE.red, 0.85);
      ctx.beginPath();
      ctx.arc(
        to.x + Math.cos(a) * out,
        to.y + Math.sin(a) * out * 0.35,
        DROP * tile,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.restore();
}
