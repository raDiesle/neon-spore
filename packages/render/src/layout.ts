import type { SimConfig } from "@neon-spore/sim";
import type { Viewport, ViewState } from "./renderer.js";

// The lobes moved out when this file crossed its 250-line limit, and are
// re-exported here so that nothing which asked the layout where a button is
// had to learn a second file's name (`band-lobes.ts`).
export { bandLobes, type Lobe } from "./band-lobes.js";

export {
  seatOf,
  showsCannon,
  showsCodex,
  showsFleetHulls,
  showsQueenHint,
  showsQueenShape,
  showsShield,
  type ViewRole,
} from "./view-role.js";

import { flippedLayout } from "./field-flip.js";
import type { Stage } from "./layout-stage.js";
import { bandHeightFor } from "./layout-stage.js";
import { PANEL_PLAN } from "./panel-plan.js";
// The rows a strip answers a press on, worked out where its reasons are
// written down. Re-exported so nothing holding a `Strip` had to move.
import { type Strip, stripBands } from "./strip-band.js";
import { showsCannon, showsShield, type ViewRole } from "./view-role.js";
import { rolledLayout } from "./well-roll.js";

export type { Strip };

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
  /**
   * Device pixels per CSS pixel, carried through so a pass that bakes a
   * picture into an offscreen canvas can bake it at the resolution it will be
   * blitted at. Everything else here is in CSS pixels and stays that way —
   * this is the one number that says how many real pixels one of those is.
   */
  dpr: number;
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
  /**
   * **Whether this screen's field is drawn mirrored** — THE FLIP, and the one
   * field here that is not arithmetic over a viewport. It is on the layout
   * because a layout is what both the renderer and hit-testing are handed, and
   * a fold in the field has to reach them together or a body is drawn in one
   * place and answered in another. `computeLayout` never sets it;
   * `flippedLayout` does, from a world (`field-flip.ts`).
   */
  flip: boolean;
  /**
   * **How far THE WELL's face has turned**, in thousandths of a sector, and
   * here for `flip`'s reason exactly: a face that turned in the frame but not
   * under the finger would answer a thumb at four o'clock with the column that
   * used to be there. Two functions read it and the rest of the projection
   * follows from them (`well-roll.ts`). Nought on every other wave.
   */
  wellRoll: number;
}

export interface Circle {
  x: number;
  y: number;
  r: number;
}

export function computeLayout(viewport: Viewport, cfg: SimConfig, role: ViewRole): Layout {
  const { width, height } = viewport;
  const solo = role !== "test";
  const bandHeight = bandHeightFor(height, cfg);
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
  // The shares are the panel's plan (`panel-plan.ts`), which is also what
  // `bandLobes` reads — so a candidate arrangement moves both at once.
  const at = solo ? 0 : 1;
  const plan = PANEL_PLAN;
  const rowCannon = bandTop + bandHeight * plan.cannonRow[at];
  const rowShield = bandTop + bandHeight * plan.shieldRow[at];
  const rowButton = bandTop + bandHeight * plan.lobeRow[at];
  // Both seats' lobes share the test view — and `hitCircle` answers a ring 30%
  // wider than the circle drawn, so they have to be smaller there than on a
  // screen carrying one role's half.
  const r = Math.min(bandHeight * plan.lobeR[at], width * plan.lobeRCap[at]);
  const stripHeight = Math.min(bandHeight * plan.stripH, plan.stripHCap);
  const strips = stripBands({
    bandTop,
    cannon: rowCannon,
    shield: rowShield,
    button: rowButton,
    lobeReach: r * 1.3,
    height: stripHeight,
    shows: { cannon: showsCannon(role), shield: showsShield(role) },
  });

  return {
    role,
    // Never here: the fold is a fact about the wave, and this is handed a
    // viewport and a config (`field-flip.ts`).
    flip: false,
    // Nor this, and out of the same drawer: a boss's face is a fact about the
    // world, not about a viewport (`well-roll.ts`).
    wellRoll: 0,
    width,
    height,
    dpr: viewport.dpr,
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
    cannonStrip: strips.cannon,
    shieldStrip: strips.shield,
    lobeY: rowButton,
    lobeR: r,
  };
}

/** THE FLIP: this screen's own column, and the layout that carries the fold.
 * Re-exported so a caller holding a layout is holding the answer; the subject
 * itself is `field-flip.ts`, out of the way of the arithmetic. */
export { fieldCol, fieldX, flippedLayout } from "./field-flip.js";
/** The rectangle the picture is drawn into, and the band's share of the
 * height it is cut around. Re-exported because a caller holding a layout was
 * already asking this file where the game is (`layout-stage.ts`). */
export { computeStage, type Stage } from "./layout-stage.js";

/** THE WELL's face, and how far it has turned — re-exported beside the fold
 * for the fold's reason: both are a fact about the world put on a layout so a
 * frame and a finger cannot disagree (`well-roll.ts`). */
export { rolledLayout } from "./well-roll.js";

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

/**
 * The row a point is in: `colFromX`'s inverse down the field, and the one
 * other axis a finger can name.
 *
 * It arrived with THE MINE, which is the first control in the game that is a
 * press on a bare square rather than on a body or a strip (`mine-tap.ts`).
 * Written beside its partner and clamped the same way, because the two halves
 * of a tile address must never be worked out by two different expressions.
 */
export function rowFromY(l: Layout, y: number): number {
  const row = Math.round((y - l.gridTop - l.tile / 2) / l.tile);
  return Math.max(0, Math.min(l.rows - 1, row));
}

/**
 * The layout for one frame of `Canvas2DRenderer.draw`, moved here from a
 * private method of that class when adding one call to it (`drawFieldBossCue`,
 * `canvas2d.ts`) would have carried the file over its 250-line limit.
 *
 * Derived from the **stage**, not the window: on a desktop screen the window
 * is far wider than any phone, and the hull is as wide as the field. Cheap
 * arithmetic, so it is redone every frame rather than cached — a test slider
 * moves `cols` between two frames.
 *
 * `flippedLayout` is THE FLIP: the turned seat's field comes back mirrored,
 * and input is handed a layout too, so a finger and a frame fold together.
 * `rolledLayout` is THE WELL's face turned, on the same two callers and for
 * the same reason (`well-roll.ts`).
 */
export function frameLayout(view: ViewState, stage: Stage, dpr: number): Layout {
  const vp = { width: stage.width, height: stage.height, dpr };
  const l = flippedLayout(computeLayout(vp, view.world.cfg, view.role), view.world);
  return rolledLayout(l, view.world);
}

export function hitCircle(c: Circle, x: number, y: number): boolean {
  const dx = x - c.x;
  const dy = y - c.y;
  return dx * dx + dy * dy <= (c.r * 1.3) ** 2;
}
