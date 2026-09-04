import type { ControlSet } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import type { MiniView } from "./guide-mini.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Viewport } from "./renderer.js";

/**
 * One of the two screens a rehearsal is drawn on: the transform that puts it in
 * its box, the frame round it and the word above it.
 *
 * Split off `guide-scene.ts` on that file's line count, along the seam it
 * already had: next door owns the *loop* — the runner, the clock, which of the
 * two seats is which — and this owns what one screen looks like once it has
 * been given a box to sit in.
 */

export interface ScreenDraw {
  world: World;
  layout: Layout;
  seat: 1 | 2;
  /** Top-left of the box, in the guide panel's own pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  /** Which screen the person holding the phone is on; `test` is both at once. */
  role: ViewRole;
  time: number;
  events: readonly import("@neon-spore/sim").SimEvent[];
  set: ControlSet;
}

export function drawSceneScreen(
  ctx: CanvasRenderingContext2D,
  mini: MiniView,
  p: ScreenDraw,
): void {
  const seatRole: ViewRole = p.seat === 1 ? "p1" : "p2";
  const both = p.role === "test";
  const mine = both || p.role === seatRole;
  const { cfg } = p.world;
  const tpb = (cfg.tickHz * 60) / cfg.bpm;

  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x, p.y, p.w, p.h);
  ctx.clip();
  ctx.translate(p.x, p.y);
  ctx.scale(p.scale, p.scale);
  mini.draw(ctx, p.layout, {
    world: p.world,
    beatPhase: (p.world.tick % tpb) / tpb,
    role: seatRole,
    time: p.time,
    // A frame's own seconds, so a lobe eases at the speed it eases at on a
    // phone rather than at the speed the rehearsal's ticks happen to arrive.
    dt: 1 / 60,
    events: p.events,
    running: true,
    controls: p.set,
  });
  ctx.restore();

  // The other player's screen is dimmed by a scrim rather than by an alpha on
  // the whole draw: several of the passes inside set `globalAlpha` themselves,
  // so an alpha set out here would be overwritten by the first one that did.
  if (!mine) {
    ctx.fillStyle = "rgba(5,4,11,.46)";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }
  ctx.strokeStyle = mine ? PALETTE.hullRim : PALETTE.grid;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1);

  ctx.font = '600 9px "Courier New",monospace';
  ctx.fillStyle = mine ? PALETTE.shieldRim : PALETTE.dim;
  ctx.textAlign = "left";
  ctx.fillText(label(both, mine, p.seat), p.x, p.y - 5);
}

function label(both: boolean, mine: boolean, seat: 1 | 2): string {
  if (both) return seat === 1 ? "PLAYER ONE" : "PLAYER TWO";
  return mine ? "YOUR SCREEN" : "THEIR SCREEN";
}

/**
 * The virtual screen a rehearsal is laid out at before it is scaled into its
 * box: a phone's height, and exactly as many pixels wide as that many columns
 * of the tile it leaves.
 *
 * A phone's height and not a thumbnail's, because one part of `Layout` is not
 * viewport-relative — `radarHeightPx` is pixels — and laying out at 150 would
 * give the strip a third of the picture. The width follows from the tile, so
 * the grid fills its box rather than sitting in a letterbox of its own, and a
 * scene with a shorter field simply comes out squatter.
 */
export function miniViewport(world: World, height: number): Viewport {
  const { cfg } = world;
  const band = (height * cfg.bandSoloPct) / 100;
  const usable = height - band - cfg.radarHeightPx;
  const tile = Math.max(1, usable / cfg.rows);
  return { width: cfg.cols * tile, height, dpr: 1 };
}
