import {
  beatSeconds,
  type MimicState,
  mimicDraws,
  mimicRows,
  mimicShapeSize,
  mimicStep,
  mimicWants,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { drawChartLattice } from "./chart-lattice.js";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import type { Chart } from "./fleet-chart.js";
import { clockText, drawDrainBar, FLEET_LATE } from "./fleet-clock.js";
import { type Layout, tileCY } from "./layout.js";
import { drawMimicTile, type TileLook } from "./mimic-tile.js";
import { PALETTE } from "./palette.js";
import { phaseInto } from "./phase-into.js";
import { showsMimicPaint, showsMimicSign } from "./view-role-clocks-c.js";

/**
 * **THE MIMIC's board** (§42; the owner, 3 October 2026): the field above the
 * ship as squares, THE FLEET's lattice without its letters, and the pictures
 * painted on it a tile at a time.
 *
 * **The two screens are not drawn the same.** The reader is shown the
 * picture — every tile it wants, faint, in its colour — and every tile
 * painted so far, marked **right** with a tick or **wrong** with a cross, as
 * it is painted. The painter is shown only what has been painted: no
 * picture and no marks, so what to fix is said out loud. `test` is both.
 *
 * The lattice's border is the mantle's pale sign light, the tiles' own. The **clock** is the row just over the
 * hull, which no picture stands on (`sim/mimic.ts` `mimicRows`): THE FLEET's
 * drain bar and its seconds, the window's.
 */

/** How long the mantle and the board take to cross-fade, in beats. */
const VEIL_BEATS = 0.5;

/**
 * **How far the board has taken the mantle's place**, 0 the mantle and 1 the
 * board: up over half a beat as a picture goes up, and down over half a beat
 * as it peels or its window runs out. Read off the phase and the beat, as the
 * pose is, so a still frame and a frame mid-fight agree.
 */
export function mimicVeil(s: MimicState, beat: number, beatPhase: number): number {
  const k = smoothstep(Math.min(1, phaseInto(s, beat, beatPhase) / VEIL_BEATS));
  if (s.phase === "sign") return k;
  if (s.phase === "mimicking" || s.phase === "peeled") return 1 - k;
  return 0;
}

/** Where the board is on this screen. */
export function mimicChart(l: Layout, cfg: SimConfig): Chart {
  return { left: l.gridLeft, top: l.gridTop, tile: l.tile, cols: cfg.cols, rows: mimicRows(cfg) };
}

/** The centre of a board tile on this screen, through the fold. */
export function mimicTileAt(l: Layout, col: number, row: number): { x: number; y: number } {
  return { x: fieldX(l, col), y: tileCY(l, row) };
}

/**
 * Seat `seat`'s picture as a box on this screen: its centre and its size in
 * pixels, or null with none up.
 */
export function mimicPictureBox(
  l: Layout,
  cfg: SimConfig,
  sign: number,
  origin: number,
): { x: number; y: number; w: number; h: number } | null {
  if (sign < 0) return null;
  const { w, h } = mimicShapeSize(sign);
  const [c0, r0] = [origin % cfg.cols, Math.floor(origin / cfg.cols)];
  const a = mimicTileAt(l, c0, r0);
  const b = mimicTileAt(l, c0 + w - 1, r0 + h - 1);
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    w: Math.abs(b.x - a.x) + l.tile,
    h: Math.abs(b.y - a.y) + l.tile,
  };
}

/** Which seat's picture a tile lies in, or null for none. */
function pictureOf(world: World, s: MimicState, col: number, row: number): 1 | 2 | null {
  const cols = world.cfg.cols;
  for (const seat of [1, 2] as const) {
    const sign = s.signs[seat - 1] ?? -1;
    if (sign < 0) continue;
    const origin = s.origins[seat - 1] ?? 0;
    const { w, h } = mimicShapeSize(sign);
    const [c0, r0] = [origin % cols, Math.floor(origin / cols)];
    if (col >= c0 && col < c0 + w && row >= r0 && row < r0 + h) return seat;
  }
  return null;
}

/** The board, `alpha` of the way in: lattice, pictures for the reader, paint, marks and the clock. */
export function drawMimicBoard(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MimicState,
  beatPhase: number,
  alpha: number,
): void {
  if (alpha <= 0) return;
  const cfg = world.cfg;
  const c = mimicChart(l, cfg);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = "rgba(4,8,20,.6)";
  ctx.fillRect(c.left, c.top, c.cols * c.tile, c.rows * c.tile);
  drawChartLattice(ctx, c, Math.max(0, 1 - beatPhase * 4), PALETTE.mimicSign);

  // What this screen reads, and whether it paints anything itself.
  const reads = ([1, 2] as const).filter((k) => mimicDraws(s, k) && showsMimicSign(l.role, k));
  const paints = ([1, 2] as const).some((k) => mimicDraws(s, k) && showsMimicPaint(l.role, k));
  for (const k of reads) drawPicture(ctx, l, world, s, k);
  for (let row = 0; row < c.rows; row++) {
    for (let col = 0; col < c.cols; col++) {
      const paint = s.paint[col + row * c.cols] ?? 0;
      if (paint === 0) continue;
      const owner = pictureOf(world, s, col, row);
      let look: TileLook = "paint";
      if (owner !== null && reads.includes(owner)) {
        look = mimicWants(world, s, owner, col, row) === paint ? "right" : "wrong";
      } else if (owner === null && reads.length > 0 && (!paints || l.role === "test")) {
        look = "wrong";
      }
      const at = mimicTileAt(l, col, row);
      drawMimicTile(ctx, at.x, at.y, l.tile, paint, look);
    }
  }
  drawMimicClock(ctx, l, world, s, beatPhase);
  ctx.restore();
}

/** Every tile seat `seat`'s picture wants, faint in its colour, for the reader to say. */
function drawPicture(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MimicState,
  seat: 1 | 2,
): void {
  const cols = world.cfg.cols;
  const sign = s.signs[seat - 1] ?? -1;
  const origin = s.origins[seat - 1] ?? 0;
  const { w, h } = mimicShapeSize(sign);
  const [c0, r0] = [origin % cols, Math.floor(origin / cols)];
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      const wants = mimicWants(world, s, seat, c0 + dc, r0 + dr);
      if (wants === 0) continue;
      const at = mimicTileAt(l, c0 + dc, r0 + dr);
      drawMimicTile(ctx, at.x, at.y, l.tile, wants, "wanted");
    }
  }
}

/** The window's clock in the row over the hull: a drain bar, red at the end, and its seconds. */
function drawMimicClock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MimicState,
  beatPhase: number,
): void {
  const step = mimicStep(s);
  if (s.phase !== "sign" || step === null) return;
  const total = Math.max(1, step.beats);
  const beats = Math.max(0, total - phaseInto(s, world.beat, beatPhase));
  const left = beats / total;
  const late = left < FLEET_LATE * 2;
  const c = mimicChart(l, world.cfg);
  const y = c.top + c.rows * c.tile + c.tile * 0.62;
  const h = Math.max(3, c.tile * 0.14);
  const inset = c.tile * 0.3;
  drawDrainBar(ctx, c.left + inset, y, c.cols * c.tile - inset * 2, h, left, late);
  const size = Math.max(11, c.tile * 0.42);
  ctx.font = `700 ${Math.round(size)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = late ? PALETTE.redRim : PALETTE.text;
  ctx.fillText(clockText(beats * beatSeconds(world.cfg)), c.left + (c.cols * c.tile) / 2, y - 3);
}
