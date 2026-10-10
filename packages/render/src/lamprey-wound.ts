import { hullRow, lampreyBoss, lampreyPlugButton, type World } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { rgba } from "./hex.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **Where THE LAMPREY bit into the ship, the hull bleeds** (the owner, 10
 * October 2026: *the ship of players can leave blooding where it bite*;
 * `sim/lamprey-plug.ts`). Every hull tile a plug bit — the simulation's own
 * `bitten`, on the hull's row — is a torn hole in the membrane, ringed with
 * the punctures of its teeth, and blood runs down the hull from it for the
 * rest of the fight. While the eel is still in it the hole gapes wider and
 * the blood runs faster.
 *
 * Drawn on the ship (`frame-on-ship.ts`), over the hull and under the panel,
 * so the body going down into it (`lamprey-plug-look.ts`) is drawn over it.
 */

/** The hole's half-width and half-height, in tiles; the drips, how long they run, and how many seconds one takes. */
const WIDE = 0.45;
const TALL = 0.16;
const DRIPS = 5;
const RUN = 0.9;
const DRIP_SECONDS = 1.6;

/** The hull columns a plug bit, each once. */
export function lampreyWoundCols(world: World): number[] {
  const s = lampreyBoss(world);
  if (s === null) return [];
  const cfg = world.cfg;
  const row = hullRow(cfg);
  const cols = s.bitten.filter((t) => Math.floor(t / cfg.cols) === row).map((t) => t % cfg.cols);
  return [...new Set(cols)];
}

export function drawLampreyWounds(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  surfaceY: SurfaceY,
  time: number,
): void {
  const s = lampreyBoss(world);
  if (s === null) return;
  const open = s.phase === "bite" && lampreyPlugButton(s) !== null;
  for (const col of lampreyWoundCols(world)) {
    const x = fieldX(l, col);
    const live = open && col === s.col;
    wound(ctx, x, surfaceY(x), l.tile, live ? 1.3 : 1, live ? 2 : 1, time);
  }
}

/** One wound at `(x, y)`, `gape` times its size, the blood running `pace` times as fast. */
function wound(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  gape: number,
  pace: number,
  time: number,
): void {
  const w = WIDE * tile * gape;
  const h = TALL * tile * gape;
  ctx.save();
  // The blood, under the hole: runs down the hull, each drip in its turn.
  ctx.lineCap = "round";
  for (let i = 0; i < DRIPS; i++) {
    const across = (i / (DRIPS - 1)) * 2 - 1;
    const k = (time * pace) / DRIP_SECONDS + i * 0.37;
    const f = k - Math.floor(k);
    const len = RUN * tile * (0.5 + 0.5 * ((i * 7) % 3) * 0.5) * f;
    const dx = x + across * w * 0.7;
    ctx.strokeStyle = rgba(PALETTE.red, 0.85 * (1 - f * 0.5));
    ctx.lineWidth = tile * (0.05 + 0.02 * (i % 2));
    ctx.beginPath();
    ctx.moveTo(dx, y + h * 0.5);
    ctx.lineTo(dx, y + h * 0.5 + len);
    ctx.stroke();
    ctx.fillStyle = rgba(PALETTE.red, 0.9 * (1 - f));
    ctx.beginPath();
    ctx.arc(dx, y + h * 0.5 + len, tile * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  // The hole, ragged: a red-rimmed tear, dark inside.
  const rag = new Path2D();
  const points = 14;
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2;
    const jag = i % 2 === 0 ? 1 : 0.72;
    const px = x + Math.cos(a) * w * jag;
    const py = y + Math.sin(a) * h * jag;
    if (i === 0) rag.moveTo(px, py);
    else rag.lineTo(px, py);
  }
  ctx.fillStyle = rgba(PALETTE.red, 0.75);
  ctx.save();
  ctx.translate(0, h * 0.25);
  ctx.fill(rag);
  ctx.restore();
  ctx.fillStyle = PALETTE.lampreyMouth;
  ctx.fill(rag);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.redRim;
  ctx.stroke(rag);
  // The punctures of the teeth, round the tear.
  for (let t = 0; t < 7; t++) {
    const a = (t / 7) * Math.PI * 2;
    ctx.fillStyle = PALETTE.lampreyGill;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(a) * w * 1.3,
      y + Math.sin(a) * h * 1.6,
      tile * 0.05,
      tile * 0.035,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}
