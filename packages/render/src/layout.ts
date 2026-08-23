import type { SimConfig } from "@neon-spore/sim";
import type { Viewport } from "./renderer.js";

/**
 * Where everything sits on the screen. Computed once per resize and shared by
 * the renderer and by input hit-testing, so a control is never drawn in one
 * place and answered in another.
 *
 * Ported from `layout()` in the raster prototype, with one difference: the
 * prototype derived the row count from the tile size, while `rows` is a fixed
 * field of `SimConfig` here. It has to be — two devices that disagree about the
 * height of the field disagree about when a creature reaches the hull. The tile
 * shrinks to fit instead.
 */
export interface Layout {
  width: number;
  height: number;
  cols: number;
  rows: number;
  tile: number;
  gridLeft: number;
  gridTop: number;
  gridWidth: number;
  gridHeight: number;
  /** Top of the control band; also the bottom of the play area. */
  bandTop: number;
  bandHeight: number;
  playHeight: number;
  radarHeight: number;
  /** Screen y of the hull surface — the row a creature dies on. */
  hullY: number;
  cannonStrip: Strip;
  shieldStrip: Strip;
  guardButton: Circle;
  fireButtons: { color: "red" | "cyan"; circle: Circle }[];
}

export interface Strip {
  y: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  r: number;
}

export function computeLayout(viewport: Viewport, cfg: SimConfig): Layout {
  const { width, height } = viewport;
  const bandHeight = (height * cfg.bandPct) / 100;
  const playHeight = height - bandHeight;
  const bandTop = playHeight;
  const radarHeight = cfg.radarHeightPx;

  // The field must fit both ways round: never wider than the screen, never
  // taller than the play area above the band.
  const usable = playHeight - radarHeight;
  const tile = Math.min(width / cfg.cols, usable / cfg.rows);
  const gridWidth = cfg.cols * tile;
  const gridHeight = cfg.rows * tile;
  const gridLeft = (width - gridWidth) / 2;
  const gridTop = playHeight - gridHeight;

  const rowCannon = bandTop + bandHeight * 0.2;
  const rowShield = bandTop + bandHeight * 0.48;
  const rowButton = bandTop + bandHeight * 0.8;
  const r = Math.min(bandHeight * 0.15, width * 0.068);

  return {
    width,
    height,
    cols: cfg.cols,
    rows: cfg.rows,
    tile,
    gridLeft,
    gridTop,
    gridWidth,
    gridHeight,
    bandTop,
    bandHeight,
    playHeight,
    radarHeight,
    hullY: gridTop + (cfg.rows - 1) * tile,
    cannonStrip: { y: rowCannon, height: Math.min(bandHeight * 0.24, 32) },
    shieldStrip: { y: rowShield, height: Math.min(bandHeight * 0.24, 32) },
    guardButton: { x: width * 0.14, y: rowButton, r },
    fireButtons: [
      { color: "red", circle: { x: width * 0.66, y: rowButton, r } },
      { color: "cyan", circle: { x: width * 0.86, y: rowButton, r } },
    ],
  };
}

export function tileCX(l: Layout, col: number): number {
  return l.gridLeft + col * l.tile + l.tile / 2;
}

export function tileCY(l: Layout, row: number): number {
  return l.gridTop + row * l.tile + l.tile / 2;
}

/** Which column a screen x falls in. Snaps to a column centre, never between. */
export function colFromX(l: Layout, x: number): number {
  const col = Math.round((x - l.gridLeft - l.tile / 2) / l.tile);
  return Math.max(0, Math.min(l.cols - 1, col));
}

export function hitCircle(c: Circle, x: number, y: number): boolean {
  const dx = x - c.x;
  const dy = y - c.y;
  return dx * dx + dy * dy <= (c.r * 1.3) ** 2;
}
