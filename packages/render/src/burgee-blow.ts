import type { SimConfig } from "@neon-spore/sim";
import type { StrikeFrame } from "./boss-strike-look.js";
import { burgeeFlagLong, burgeeFlagPath, burgeeTip, type Point } from "./burgee-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE BURGEE's own blow at the hull** (`boss-strike-look.ts`). The spindle
 * was lit and nobody shot it (`burgee-step.ts`'s `burgeeMiss`), the flag
 * held still over the middle column. A scrap of its fly tears away — SLICK
 * · COMMA at under half the flag's size, the caught cream of a canvas with
 * both catches in — and falls the way cloth falls, rocking side to side and
 * turning over, down the middle column, to land at `reach = 1` plastered
 * flat on the skin, its fly still rippling as it fades.
 */

/** The scrap's size, as a share of the flag's. */
const SCRAP = 0.45;
/** Where on the flag it tears off, as a share of the flag's length below the boom's tip. */
const TORN_AT = 0.75;
/** How far it rocks either way as it falls, in tiles, and how many times. */
const ROCK = 0.55;
const ROCKS = 2.5;
/** How far it turns over as it rocks, in radians. */
const TURN = 0.9;

/** Where the blow leaves the body: the fly of the flag held over the middle column. */
export function burgeeBlowFrom(l: Layout, cfg: SimConfig): Point {
  const tip = burgeeTip(l, cfg, 0);
  return { x: tip.x, y: tip.y + TORN_AT * burgeeFlagLong(l) };
}

export function burgeeBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  // Cloth falls slow off the flag and faster as it goes, on the skin at 1.
  const t = f.reach ** 1.6;
  // Rocking side to side, nought at the tear and nought on the skin.
  const rock = ROCK * tile * 4 * f.reach * (1 - f.reach);
  const x = from.x + (to.x - from.x) * t + rock * Math.sin(f.reach * Math.PI * ROCKS);
  const y = from.y + (to.y - from.y) * t;
  // Landed: turned to lie along the skin and pressed flat to it.
  const flat = Math.min(1, f.after * 6);
  const turn = TURN * Math.sin(f.reach * Math.PI * ROCKS);
  const long = burgeeFlagLong(f.l);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 1 - 0.45 * flat);
  ctx.rotate(turn + (Math.PI / 2 - turn) * flat);
  ctx.scale(SCRAP, SCRAP);
  const scrap = burgeeFlagPath(
    f.l,
    { x: 0, y: -long / 2 },
    {
      angle: 0,
      open: 1,
      ripple: 0.3 * (1 - 0.6 * flat),
      wave: f.time * 6,
      time: f.time,
    },
  );
  ctx.fillStyle = rgba(PALETTE.burgeeCanvasCaught, fade);
  ctx.fill(scrap);
  ctx.lineWidth = (tile * 0.05) / SCRAP;
  ctx.strokeStyle = rgba(PALETTE.burgeeCanvasDark, 0.95 * fade);
  ctx.stroke(scrap);
  ctx.restore();
}
