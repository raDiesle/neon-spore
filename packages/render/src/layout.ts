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
  /** Which half of the band this screen carries. */
  role: ViewRole;
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
  /** Player 1's second action: the maw. Sits next to the trigger, never alone. */
  intakeButton: Circle;
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

/**
 * Whose screen this is. `p1` shows the cannon and the trigger, `p2` the shield
 * and the two colours — one role per device, which is the finished game. `test`
 * is both halves at once on one screen, which is how it is played alone.
 */
export type ViewRole = "p1" | "p2" | "test";

export const showsCannon = (role: ViewRole): boolean => role !== "p2";
export const showsShield = (role: ViewRole): boolean => role !== "p1";

/**
 * The phone-shaped rectangle the game is drawn into, centred in the window.
 *
 * The game is portrait mobile web; a desktop window is far wider than that, and
 * a hull drawn across the whole window is not the hull anybody will ever see.
 * So the window is not the stage — this rectangle is, and everything the
 * players are meant to see lives inside it. Only the test chrome, which no
 * player gets, is allowed outside.
 */
export interface Stage {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Widest the stage is allowed to get, width / height. Roughly a 9:16 phone. */
const STAGE_ASPECT = 0.56;

/**
 * The band is a share of the screen height and one role needs less of it, so
 * both the stage and the layout ask for it before anything else is placed.
 */
function bandHeightFor(height: number, cfg: SimConfig, role: ViewRole): number {
  return (height * (role === "test" ? cfg.bandPct : cfg.bandSoloPct)) / 100;
}

/**
 * The columns are the frame, not the phone. The hull is exactly as wide as the
 * field and is clipped to it, so any stage wider than the columns shows empty
 * background beside the ship — and it changes width with the band, which is why
 * the gap used to move when the view switched. The tile is whatever the height
 * leaves; the stage is that many columns wide, and never wider than a phone or
 * than the window.
 */
export function computeStage(viewport: Viewport, cfg: SimConfig, role: ViewRole): Stage {
  const height = viewport.height;
  const usable = height - bandHeightFor(height, cfg, role) - cfg.radarHeightPx;
  const tile = Math.max(0, usable / cfg.rows);
  const width = Math.min(viewport.width, height * STAGE_ASPECT, cfg.cols * tile);
  return { left: Math.round((viewport.width - width) / 2), top: 0, width, height };
}

export function computeLayout(viewport: Viewport, cfg: SimConfig, role: ViewRole): Layout {
  const { width, height } = viewport;
  const solo = role !== "test";
  const bandHeight = bandHeightFor(height, cfg, role);
  const playHeight = height - bandHeight;
  const bandTop = playHeight;
  const radarHeight = cfg.radarHeightPx;

  // The field must fit both ways round: never wider than the screen, never
  // taller than the play area above the band.
  const usable = playHeight - radarHeight;
  // Never negative: a hidden tab reports a zero-sized window, and a negative
  // tile reaches the canvas as a negative radius, which throws.
  const tile = Math.max(0, Math.min(width / cfg.cols, usable / cfg.rows));
  const gridWidth = cfg.cols * tile;
  const gridHeight = cfg.rows * tile;
  const gridLeft = (width - gridWidth) / 2;
  const gridTop = playHeight - gridHeight;

  // One role has a single strip and its buttons, so both move up and the band
  // itself is shorter. Two roles share the band in the order they are read out.
  const rowCannon = bandTop + bandHeight * (solo ? 0.28 : 0.2);
  const rowShield = bandTop + bandHeight * (solo ? 0.28 : 0.48);
  const rowButton = bandTop + bandHeight * (solo ? 0.72 : 0.8);
  const r = Math.min(bandHeight * (solo ? 0.19 : 0.15), width * 0.068);

  // Player 1 now has two buttons, so neither of them can sit in the middle any
  // more. They stay side by side and in a fixed order — trigger left, maw
  // right — because a control that moves between screens is a control that gets
  // pressed by mistake under time pressure.
  const p1Buttons = role === "p1" ? [width * 0.35, width * 0.65] : [width * 0.1, width * 0.3];

  return {
    role,
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
    guardButton: { x: p1Buttons[0]!, y: rowButton, r },
    intakeButton: { x: p1Buttons[1]!, y: rowButton, r },
    fireButtons:
      role === "p2"
        ? [
            { color: "red" as const, circle: { x: width * 0.34, y: rowButton, r } },
            { color: "cyan" as const, circle: { x: width * 0.66, y: rowButton, r } },
          ]
        : [
            { color: "red" as const, circle: { x: width * 0.58, y: rowButton, r } },
            { color: "cyan" as const, circle: { x: width * 0.82, y: rowButton, r } },
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
