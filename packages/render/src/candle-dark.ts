import { beatSeconds, type CandleState, candleBoss, guardArmed } from "@neon-spore/sim";
import type { AfterImage } from "./after-image.js";
import { drawCandleGlow } from "./candle-glow.js";
import { smoothstep } from "./ease.js";
import type { Effects } from "./effects.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { showsCandleGuard } from "./view-role-clocks.js";

/**
 * **THE CANDLE's dark**: the field going black, and the pair's own weapons as
 * the only light in it (`docs/spec/bosses-choreographed.md` §14).
 *
 * Drawn over every body and under the ship — the ship keeps its own violet
 * glow, the one steady light the design allows besides the boss's — so the
 * pass is a black laid on the field *after* the bodies were painted into it.
 * That order is the whole trick: the field is drawn as it always is, and the
 * dark is a mask over it with holes where a light stands. A column lit this
 * frame is the field as it is; one lit two beats ago is the same field, dim,
 * through the colour of the shot that lit it (`after-image.ts`).
 *
 * Three lights, each on the screen of the seat whose control made it
 * (`view-role.ts`): the muzzle flash three columns wide for a beat, the guard
 * window on the plate's column for as long as it is armed, the beam on its
 * column for as long as it stands. A breach lights its own neighbourhood for
 * two beats on both — the design's *a scar is a light source*. The first
 * arrives as an event and is ingested; the other two are read off the world
 * here every frame, so they hold exactly as long as the sim says they do.
 *
 * The black comes down over `candleDarkBeats` from the beat the boss arrives
 * and lifts over one beat after the sim takes it away, which is the design's
 * wave-end light coming up on a field the pair never saw. Between the last
 * step going and that, the frame is black and nothing else: no after-image,
 * no glow (`out`).
 */

const BLACK = "#000000";
const WHITE = "#FFFFFF";
/** How much of a lit column's colour is washed over it, at full light. */
const TINT = 0.18;
/** Beats an after-image takes to fade once its hold is over, at full glow. */
const AFTER_BEATS = 3;
/** Beats the wave-end light takes to come up. */
const RELIGHT_BEATS = 1;

/** How black the field is, 0..1: coming down while the boss is `dark`, full from then on. */
function darkness(c: CandleState, beat: number, beatPhase: number, darkBeats: number): number {
  if (c.phase !== "dark") return 1;
  return smoothstep(Math.min(1, (beat - c.phaseBeat + beatPhase) / darkBeats));
}

/**
 * Seconds an after-image lasts once its hold is over. The design's step 8:
 * the after-images get shorter as the glow dims, so the fight closes in
 * — three beats at full glow, half that at the last step.
 */
function afterSeconds(c: CandleState, steps: number, spb: number): number {
  return AFTER_BEATS * spb * (0.5 + (0.5 * c.glow) / steps);
}

/** A run of columns, `from` to `to` inclusive, at one alpha of black. */
function fillCols(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: number,
  to: number,
  a: number,
): void {
  if (a <= 0.002) return;
  ctx.globalAlpha = a;
  ctx.fillStyle = BLACK;
  ctx.fillRect(l.gridLeft + from * l.tile, 0, (to - from + 1) * l.tile, l.hullY);
  ctx.globalAlpha = 1;
}

/** The whole field at one alpha: the margins beside the grid too. */
function fillField(ctx: CanvasRenderingContext2D, l: Layout, a: number): void {
  if (a <= 0.002) return;
  ctx.globalAlpha = a;
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, l.width, l.hullY);
  ctx.globalAlpha = 1;
}

/** The lit columns, each through the tint of the light that lit it. */
function drawLit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  img: AfterImage,
  time: number,
  decay: number,
  dark: number,
): void {
  let run = -1;
  for (let col = 0; col < l.cols; col++) {
    const light = img.light(col, time, decay);
    if (light <= 0) {
      if (run < 0) run = col;
      continue;
    }
    if (run >= 0) fillCols(ctx, l, run, col - 1, dark);
    run = -1;
    fillCols(ctx, l, col, col, dark * (1 - light));
    ctx.fillStyle = rgba(img.tint(col), TINT * light * dark);
    ctx.fillRect(l.gridLeft + col * l.tile, 0, l.tile, l.hullY);
  }
  if (run >= 0) fillCols(ctx, l, run, l.cols - 1, dark);
}

/**
 * The dark over the field and the glow in it, or the light coming back up.
 * Called by the renderer between the bodies and the ship; on every wave but
 * THE CANDLE's, and once its black has lifted, it returns on its first line.
 */
export function drawCandleField(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  effects: Effects,
): void {
  const { world } = view;
  const c = candleBoss(world);
  const img = effects.boss.afterImage;
  const spb = beatSeconds(world.cfg);
  if (c === null) {
    // The wave-end light: the black lifts over a beat from the last dark frame.
    if (img.darkAt < 0) return;
    const t = (view.time - img.darkAt) / (RELIGHT_BEATS * spb);
    if (t >= 1) {
      img.darkAt = -1;
      return;
    }
    fillField(ctx, l, 1 - smoothstep(t));
    return;
  }
  img.darkAt = view.time;
  if (c.phase === "out") {
    fillField(ctx, l, 1);
    return;
  }
  const dark = darkness(c, world.beat, view.beatPhase, world.cfg.candleDarkBeats);
  // The two lights that stand, refreshed for as long as the world says they
  // do: a hold of nought, so the decay starts the frame after the last one.
  if (guardArmed(world) && showsCandleGuard(view.role)) {
    img.lit(world.shieldCol, view.time, 0, PALETTE.hull);
  }
  if (world.beam !== null) img.lit(world.beam.col, view.time, 0, WHITE);
  // The margins beside the grid have no light in them and never will.
  const gridRight = l.gridLeft + l.cols * l.tile;
  ctx.globalAlpha = dark;
  ctx.fillStyle = BLACK;
  if (l.gridLeft > 0) ctx.fillRect(0, 0, l.gridLeft, l.hullY);
  if (gridRight < l.width) ctx.fillRect(gridRight, 0, l.width - gridRight, l.hullY);
  ctx.globalAlpha = 1;
  drawLit(ctx, l, img, view.time, afterSeconds(c, world.cfg.candleGlowSteps, spb), dark);
  drawCandleGlow(ctx, l, c, world.cfg, view.time, view.role);
}
