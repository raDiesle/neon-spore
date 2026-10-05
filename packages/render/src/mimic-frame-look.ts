import type { MimicState, SimConfig } from "@neon-spore/sim";
import { drawChartLattice } from "./chart-lattice.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { mimicPictureBox } from "./mimic-board.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE MIMIC's frame, as the mimic's own flesh**: a band of its skin round
 * each picture's square of the board, held up by the crane's two arms
 * (`mimic-crane.ts`) and the same on both screens. The owner, 5 October
 * 2026: *not this rectangle scanner box, but something new which is part of
 * boss graphics — some border frame of current level area — both players
 * see this frame*, and *the boss graphics should like hold the current area
 * of tiles to be placed*.
 *
 * It stands round the frame the simulation stands the picture in
 * (`sim/mimic-frame.ts`), so it is as big as every picture of its step and in
 * the same place every time; the lattice is drawn inside it and nowhere else,
 * since a tap anywhere else paints nothing. Its suckers pulse on the beat, the
 * crane's own light, so a dark band on the dark field reads as alive.
 */

/** One frame on this screen, in pixels: the squares inside the band, and whose picture it holds. */
export interface FrameBox {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly seat: 1 | 2;
}

/** How thick the band is, and how far it stands out from the squares, in tiles. */
export const BAND = 0.3;
/** How many suckers along each side of the band. */
const SUCKERS = 3;

/** Every frame up this frame: one, or two on a split — from the pictures, so a peeled half keeps its frame. */
export function mimicFrames(l: Layout, cfg: SimConfig, s: MimicState): FrameBox[] {
  const out: FrameBox[] = [];
  for (const seat of [1, 2] as const) {
    const box = mimicPictureBox(l, cfg, s.signs[seat - 1] ?? -1, s.origins[seat - 1] ?? 0);
    if (box === null) continue;
    out.push({
      left: box.x - box.w / 2,
      top: box.y - box.h / 2,
      right: box.x + box.w / 2,
      bottom: box.y + box.h / 2,
      seat,
    });
  }
  return out;
}

/** Everything the frames take, band and all: what the crane holds by its top corners. */
export function mimicHold(l: Layout, frames: readonly FrameBox[]): FrameBox | null {
  if (frames.length === 0) return null;
  const out = BAND * l.tile;
  return {
    left: Math.min(...frames.map((f) => f.left)) - out,
    top: Math.min(...frames.map((f) => f.top)) - out,
    right: Math.max(...frames.map((f) => f.right)) + out,
    bottom: Math.max(...frames.map((f) => f.bottom)) + out,
    seat: frames[0]?.seat ?? 1,
  };
}

/** Inside each frame: the dark ground and THE FLEET's lattice, nowhere else on the field. */
export function drawMimicGround(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  frames: readonly FrameBox[],
  beatPhase: number,
): void {
  for (const f of frames) {
    ctx.fillStyle = "rgba(4,8,20,.72)";
    ctx.fillRect(f.left, f.top, f.right - f.left, f.bottom - f.top);
    const chart = {
      left: f.left,
      top: f.top,
      tile: l.tile,
      cols: Math.round((f.right - f.left) / l.tile),
      rows: Math.round((f.bottom - f.top) / l.tile),
    };
    drawChartLattice(ctx, chart, Math.max(0, 1 - beatPhase * 4), PALETTE.mimicSign);
  }
}

/** The band of skin round each frame, its pale rim, and its suckers pulsing on the beat. */
export function drawMimicFrames(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  frames: readonly FrameBox[],
  beatPhase: number,
): void {
  const w = BAND * l.tile;
  for (const f of frames) {
    const mid = w / 2;
    const band = new Path2D();
    band.roundRect(
      f.left - mid,
      f.top - mid,
      f.right - f.left + w,
      f.bottom - f.top + w,
      l.tile * 0.22,
    );
    ctx.lineJoin = "round";
    ctx.lineWidth = w + STROKE.outline * 2;
    ctx.strokeStyle = PALETTE.mimicSkinDark;
    ctx.stroke(band);
    ctx.lineWidth = w;
    ctx.strokeStyle = PALETTE.mimicSkin;
    ctx.stroke(band);
    ctx.lineWidth = w * 0.35;
    ctx.strokeStyle = PALETTE.mimicMottle;
    ctx.stroke(band);
    strokeGlowFaded(ctx, band, PALETTE.mimicSign, STROKE.outline, 0.55, 1);
    ctx.lineJoin = "miter";
    drawFrameSuckers(ctx, f, mid, w, beatPhase);
  }
}

/** Suckers along every side of the band, a pulse running round it on the beat. */
function drawFrameSuckers(
  ctx: CanvasRenderingContext2D,
  f: FrameBox,
  mid: number,
  w: number,
  beatPhase: number,
): void {
  const [x0, y0, x1, y1] = [f.left - mid, f.top - mid, f.right + mid, f.bottom + mid];
  const sides: [number, number, number, number][] = [
    [x0, y0, x1, y0],
    [x1, y0, x1, y1],
    [x1, y1, x0, y1],
    [x0, y1, x0, y0],
  ];
  const dots = new Path2D();
  for (const [ax, ay, bx, by] of sides) {
    for (let i = 1; i <= SUCKERS; i++) {
      const u = i / (SUCKERS + 1);
      const x = ax + (bx - ax) * u;
      const y = ay + (by - ay) * u;
      dots.moveTo(x + w * 0.2, y);
      dots.arc(x, y, w * 0.2, 0, Math.PI * 2);
    }
  }
  const pulse = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.mimicSign, 0.35 + 0.45 * pulse);
  ctx.fill(dots);
}
