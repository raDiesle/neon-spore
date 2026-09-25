import {
  bodyCenterCol,
  darkBeats,
  type LitTile,
  litNow,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { drawnCol, drawnRow } from "./depth.js";
import { fieldCol } from "./field-flip.js";
import type { Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";

/**
 * **THE DARK, as a screen sees it**: the field above the ship put out, and a
 * finger's light the only way back into it (`sim/dark.ts`).
 *
 * Two halves, and the same arithmetic under both, so that what is lit and
 * what is shown can never disagree:
 *
 * - **`darkView`** takes out of the frame every body no light reaches, called
 *   from inside `seenView` (`unseen.ts`), whose reasons it shares: a body is drawn
 *   by two dozen passes and only a filtered list keeps all of them quiet. The
 *   effects are not filtered, so a kill in the dark still bursts; the ship and
 *   what stands on it are below the dark and stay.
 * - **`drawDarkField`** lays the black over the field, tile by tile, thinner
 *   where a light stands. Over the bodies and under the ship, THE CANDLE's
 *   station and its reason (`candle-dark.ts`): the ship is not in the dark.
 *
 * Built 25 September 2026 because the owner asked for the fault by name. The
 * light is square and soft-edged — a first look, and VERSUS is where a better
 * one goes.
 */

/** How black the dark is. Not quite 1, so the field's own grid is a ghost in it. */
const COVER = 0.93;
/** Beats the dark takes to come down, and a light to go out at the end of its hold. */
const FALL_BEATS = 1;
const OUT_BEATS = 0.5;
/** How lit a body's square has to be for the body to show. */
const SHOWS = 0.3;

/**
 * How lit one point of the field is, 0..1, in the world's own columns and rows:
 * the brightest light on it, each one full at its own square, gone at
 * `darkLitRadiusMilli`, and fading over the last half beat of its hold.
 * Exported for `dark-field.test.ts`.
 */
export function lightAt(world: World, lit: readonly LitTile[], col: number, row: number): number {
  const r = world.cfg.darkLitRadiusMilli / 1000;
  const out = OUT_BEATS * ticksPerBeat(world.cfg);
  let best = 0;
  for (const t of lit) {
    const d2 = ((t.col - col) ** 2 + (t.row - row) ** 2) / (r * r);
    if (d2 >= 1) continue;
    const left = Math.min(1, (t.untilTick - world.tick) / out);
    best = Math.max(best, (1 - d2) * left);
  }
  return best;
}

/** The frame with every body no light reaches taken out, or the frame itself
 * while the dark is up — which is every wave but one, and allocates nothing. */
export function darkView(view: ViewState): ViewState {
  const { world } = view;
  if (darkBeats(world) < 0) return view;
  const lit = litNow(world);
  const hullRow = world.cfg.rows - 1.5;
  const shown = world.creatures.filter((c) => {
    const row = drawnRow(c, view.beatPhase);
    if (row >= hullRow) return true;
    return lightAt(world, lit, bodyCenterCol(c, drawnCol(c, view.beatPhase)), row) >= SHOWS;
  });
  if (shown.length === world.creatures.length) return view;
  return { ...view, world: { ...view.world, creatures: shown } };
}

/**
 * The black, over every square above the hull. A row with no light in it is
 * one fill across the whole width; a row with one is a fill per square, so
 * the cost of a light is the rows it reaches and nothing on the rest.
 */
export function drawDarkField(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const { world } = view;
  const beats = darkBeats(world);
  if (beats < 0) return;
  const cover = COVER * Math.min(1, (beats + view.beatPhase) / FALL_BEATS);
  const lit = litNow(world);
  const reach = world.cfg.darkLitRadiusMilli / 1000;
  ctx.fillStyle = "#000000";
  ctx.globalAlpha = cover;
  if (l.gridTop > 0) ctx.fillRect(0, 0, l.width, l.gridTop);
  const right = l.gridLeft + l.cols * l.tile;
  for (let row = 0; row < l.rows - 1; row++) {
    const y = l.gridTop + row * l.tile;
    const inRow = lit.some((t) => Math.abs(t.row - row) < reach);
    if (!inRow) {
      ctx.globalAlpha = cover;
      ctx.fillRect(0, y, l.width, l.tile);
      continue;
    }
    ctx.globalAlpha = cover;
    ctx.fillRect(0, y, l.gridLeft, l.tile);
    ctx.fillRect(right, y, l.width - right, l.tile);
    for (let col = 0; col < l.cols; col++) {
      const a = cover * (1 - lightAt(world, lit, col, row));
      if (a <= 0.002) continue;
      ctx.globalAlpha = a;
      ctx.fillRect(l.gridLeft + fieldCol(l, col) * l.tile, y, l.tile, l.tile);
    }
  }
  ctx.globalAlpha = 1;
}
