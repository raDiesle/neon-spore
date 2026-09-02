import { type ControlDef, type ControlSet, setControls } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import type { Viewport } from "./renderer.js";

export {
  showsCannon,
  showsFleetHulls,
  showsQueenHint,
  showsQueenShape,
  showsShield,
  type ViewRole,
} from "./view-role.js";

import { showsCannon, showsShield, type ViewRole } from "./view-role.js";

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
  /**
   * The row every lobe stands on, and how big one is. Both seats share them,
   * and they are fields rather than something `bandLobes` works out again from
   * `bandTop` because a second copy of "where the buttons are" is exactly how a
   * button comes to be drawn off its own hit region.
   */
  lobeY: number;
  lobeR: number;
}

/**
 * A round button on the band, and the control it is. There is no `guardButton`
 * on the layout any more, and that is the point: a control the wave's set does
 * not name has no circle at all, so nothing can hit-test one that was never
 * drawn. See `bandLobes`.
 */
export interface Lobe {
  control: ControlDef;
  circle: Circle;
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
  // Both seats' lobes share the test view — and `hitCircle` answers a ring 30%
  // wider than the circle drawn, so they have to be smaller there than on a
  // screen carrying one role's half.
  const r = Math.min(bandHeight * (solo ? 0.19 : 0.14), width * (solo ? 0.068 : 0.056));

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
    lobeY: rowButton,
    lobeR: r,
  };
}

/**
 * Where one seat's lobes sit, and there is a row here for every seat on every
 * screen rather than a fixed list of named circles.
 *
 * A seat owns a share of the band and its lobes are **centred in that share**,
 * however many the wave's control set gives it — the same rule `slabPanel`
 * uses for a panel that is slabs rather than a band. That
 * is what the fixed list could not do: with the lance off the panel, player 1
 * had two buttons standing in the first two of three slots and a hole where
 * the third had been, which reads as a control that failed to draw rather than
 * as a panel with two controls on it.
 *
 * `maxPitch` is what keeps the ordinary panels where they have always been.
 * Spreading two buttons evenly across a whole share would fling them to its
 * edges, so the spacing is capped: at the sizes the game actually ships —
 * three lobes for player 1 in the test view, two for player 2 — the cap wins
 * and every circle lands on the pixel it landed on before. It only gives way
 * for a set with more lobes than a row can hold at that spacing.
 *
 * It is a function of the *set* rather than a field of `Layout` because the
 * panel changes with the wave and the layout does not: the wave is known where
 * the band is drawn and where a finger is answered, and both ask here.
 */
export function bandLobes(l: Layout, set: ControlSet, player: 1 | 2): Lobe[] {
  // A seat this screen does not carry has no buttons on it at all — not
  // buttons somewhere off to one side. A solo view gives its one seat the
  // whole width, so the absent seat's circles would otherwise land on top of
  // the present one's and both would claim the same thumb.
  if (player === 1 ? !showsCannon(l.role) : !showsShield(l.role)) return [];
  const controls = setControls(set, player).filter((c) => c.form === "lobe");
  if (controls.length === 0) return [];
  const solo = l.role !== "test";
  // Each seat's share of the width, and the middle of it. In the test view the
  // two seats stand side by side and neither may reach into the other's half.
  const centre = solo ? 0.5 : player === 1 ? 0.23 : 0.72;
  const maxPitch = solo ? (player === 1 ? 0.28 : 0.32) : player === 1 ? 0.15 : 0.24;
  const share = solo ? 1 : 0.46;
  const pitch = Math.min(maxPitch, share / controls.length);
  const first = centre - ((controls.length - 1) / 2) * pitch;
  return controls.map((control, i) => ({
    control,
    circle: { x: l.width * (first + i * pitch), y: l.lobeY, r: l.lobeR },
  }));
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
