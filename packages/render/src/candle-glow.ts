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
 *
 * **At the last step the light travels.** The flame is a handle then, and the
 * pilot carries it down the wick and off the end (`candle-grip.ts`); the halo
 * goes with it, because the flame is the light and a light that stayed put
 * while its flame came away would be two things. At `smoking` there is no
 * flame here at all — the ember on the wick's tip is the whole of what is
 * left, and it is drawn next door.
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

/**
 * Where the flame *is* this frame: the wick's root, plus however far the
 * pilot's thumb has carried it down the wick (`candle-grip.ts`). One-to-one
 * with the thumb, because `pinchMilli` is thousandths of a tile and so is
 * this: the light ends up under his finger rather than somewhere that tracks
 * it. Nought on every phase but `last`, so every other frame this is the root
 * and the two answers are one.
 *
 * The **root** is what the cue asks for and keeps asking for: the one word
 * the field says about this boss stands where the wick hangs from, and a word
 * that rode down with the flame would be a label on the thing his own thumb
 * is covering (`boss-cue-read-m.ts`).
 */
export function candleFlameY(l: Layout, c: CandleState): number {
  return candleGlowY(l) + (c.pinchMilli * l.tile) / 1000;
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
  // Nothing at `smoking`: the glow still says one step, but the flame that
  // step was is off the wick and in the pilot's hand. What is left of the
  // light is the ember on the tip, which `candle-grip.ts` draws — and the
  // field going almost black is the phase's own picture.
  if (c.glow <= 0 || c.phase === "out" || c.phase === "smoking") return;
  const share = c.glow / cfg.candleGlowSteps;
  const x = tileCX(l, c.col);
  const y = candleFlameY(l, c);
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
