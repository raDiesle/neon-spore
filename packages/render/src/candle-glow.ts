import { type CandleState, candleMoving, type SimConfig } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewRole } from "./view-role.js";
import { showsCandleFace } from "./view-role-clocks.js";

/**
 * **THE CANDLE's glow**: its health, and the only steady light in the field.
 *
 * Undrawn as a body, on purpose — the design's silhouette is *undrawn, most of
 * the time* — so what hangs over the column is a point of light: a flame the
 * size of a fingertip and the halo it throws, which is what a candle is at
 * the far end of a dark room. It hangs on THE DIASTOLE's shelf above row 0,
 * the one place above the field a boss that is not a body has stood before
 * (`diastole-draw.ts`), and drifts to the column the sim says it is in.
 *
 * **Five visible steps.** The halo's radius and its brightness are both read
 * off `glow / candleGlowSteps`, so a hit is a step the eye can count, which is
 * the whole of the pair's progress bar. The radius is one of five integers and
 * the throb is in the alpha alone: `haloSprite` bakes a canvas per colour and
 * radius, and a radius that breathed would bake one a frame.
 *
 * Amber and ember, not violet: the design keeps violet for the ship and
 * red and cyan for the pair's own light, and a candle is the one thing in the
 * game allowed to look like fire.
 *
 * **The faced column is the pilot's** (`showsCandleFace`): a dim cone from
 * the flame down onto the top of the column it eats flashes from, on his
 * screen alone, while it is drifting and turning. It is not drawn at the last
 * step — it eats nothing then, and the design's step 13 is *there is nothing
 * left to work out*.
 */

/** Tiles above the middle of row 0 the flame hangs. THE DIASTOLE's shelf. */
const HANG = 0.52;
/**
 * Where the flame hangs this frame, on the line above row 0 THE DIASTOLE's
 * lobe uses. Exported because the cue asks it too: the one word the field
 * says about this boss is drawn beside the light, and a second copy of this
 * arithmetic in `boss-cue-read.ts` would drift off the picture the moment the
 * shelf moved (`boss-cue.ts`).
 */
export function candleGlowY(l: Layout): number {
  return tileCY(l, 0) - l.tile * HANG;
}

/** The halo's reach in tiles at full glow, and at nothing. */
const REACH_FULL = 2.4;
const REACH_OUT = 0.8;
/** The flame itself, in tiles. */
const FLAME = 0.14;
/** Throbs a beat and a half long, slow enough to read as breathing. */
const THROB_HZ = 0.7;
/** How deep the throb goes: nought is a steady light. */
const THROB = 0.12;
/** The cone's spread at the top of the faced column, in tiles either side. */
const CONE = 0.45;
const CONE_ALPHA = 0.14;

export function drawCandleGlow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: CandleState,
  cfg: SimConfig,
  time: number,
  role: ViewRole,
): void {
  if (c.glow <= 0 || c.phase === "out") return;
  const share = c.glow / cfg.candleGlowSteps;
  const x = tileCX(l, c.col);
  const y = candleGlowY(l);
  const throb = 1 - THROB * (0.5 + 0.5 * Math.sin(time * THROB_HZ * 2 * Math.PI));
  const reach = Math.round(l.tile * (REACH_OUT + (REACH_FULL - REACH_OUT) * share));

  if (showsCandleFace(role) && candleMoving(c)) {
    const fx = tileCX(l, c.faceCol);
    const top = l.gridTop + l.tile * 0.5;
    ctx.fillStyle = rgba(PALETTE.pod, CONE_ALPHA * share * throb);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(fx - l.tile * CONE, top);
    ctx.lineTo(fx + l.tile * CONE, top);
    ctx.closePath();
    ctx.fill();
  }

  // Wide and dim in ember, then tight and bright in amber: the two together
  // read as one light with a hot middle, and both dim with the glow.
  halo(ctx, x, y, reach, PALETTE.ember, (0.25 + 0.35 * share) * throb);
  halo(ctx, x, y, Math.max(2, Math.round(reach * 0.45)), PALETTE.pod, (0.5 + 0.5 * share) * throb);
  ctx.fillStyle = PALETTE.podRim;
  ctx.beginPath();
  ctx.arc(x, y, l.tile * FLAME * (0.6 + 0.4 * share), 0, Math.PI * 2);
  ctx.fill();
}
