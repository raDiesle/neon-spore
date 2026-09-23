import { circleSubpath } from "@neon-spore/content";
import {
  type DiastoleState,
  diastoleBridgeCol,
  diastoleChamberCol,
  type SimConfig,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE DIASTOLE's bridge: the bundle of vessels between the two chambers, and
 * what it does when both of them are gone.
 *
 * Its own file beside `diastole-draw.ts` because that one reached its 250-line
 * limit, and the seam is the honest one: next door is *a chamber*, which is one
 * of two things drawn twice with a seat's own truth in it, and this is the one
 * thing on this boss that is the same on both screens.
 *
 * **It never says when the coincidence is.** That would be the easiest glow in
 * the game to write and it would end the fight: a bundle that lit on the beat
 * both chambers are closed on would hand the pair the one number they are
 * supposed to arrive at by talking to each other. So it is rock, always, and
 * the only thing that moves it is the burst — which is a thing that has already
 * happened rather than a tell about a thing that has not.
 */

/** Strands in the bundle. Odd, so one of them runs down the bridge column. */
const STRANDS = 5;

/**
 * The bundle of vessels between the two chambers, crossing the bridge column.
 *
 * Open strokes and no inside, each drawn as a tube (`drawVessel`), THE VANE's
 * reason exactly: the moment a shape
 * encloses an area it starts reading as a body, and this is plumbing. It is
 * also why an ordinary bolt is spent on it in the simulation — the field shows
 * through a bundle of tubes, so a bolt going between them is what the picture
 * already says happens.
 *
 * In `burst` the strands distend from both ends and part in the middle column,
 * which is the one thing in this fight nobody may press anything during and is
 * therefore the one thing THE SLOW is opened for (`docs/decisions.md` #33).
 */
export function drawBridge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: DiastoleState,
  y: number,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const lx = tileCX(l, diastoleChamberCol(cfg, -1));
  const rx = tileCX(l, diastoleChamberCol(cfg, 1));
  const mid = tileCX(l, diastoleBridgeCol(cfg));
  // How far through the parting we are, 0 outside it. The burst is the only
  // thing that moves the bundle, so every other frame draws the same tubes.
  const part =
    b.phase === "burst"
      ? Math.min(1, (beat - b.phaseBeat + beatPhase) / Math.max(1, cfg.diastoleBurstBeats))
      : 0;
  const gap = part * l.tile * 0.5;

  for (let k = 0; k < STRANDS; k++) {
    const f = (k + 0.5) / STRANDS - 0.5;
    const sag = f * l.tile * 0.5 + Math.sin(time * 1.3 + k) * l.tile * 0.02;
    // Each tube bows further than it is spread, so the bundle reads as tissue
    // rather than as cable. Straight parallels were the first thing drawn here
    // and they looked like a loom.
    const bow = sag * 1.6 + l.tile * 0.06;
    // Each tube bows through the bridge column and is cut short of it by the
    // parting, so what the eye follows going out is the middle rather than the
    // ends — the ends are still anchored in two chambers that are collapsing.
    const left = `M ${lx.toFixed(2)} ${(y + sag * 0.4).toFixed(2)} Q ${((lx + mid) / 2).toFixed(2)} ${(y + bow).toFixed(2)} ${(mid - gap).toFixed(2)} ${(y + sag).toFixed(2)}`;
    const right = `M ${(mid + gap).toFixed(2)} ${(y + sag).toFixed(2)} Q ${((mid + rx) / 2).toFixed(2)} ${(y + bow).toFixed(2)} ${rx.toFixed(2)} ${(y + sag * 0.4).toFixed(2)}`;
    drawVessel(ctx, new Path2D(left), l.tile, 1 - part * 0.5);
    drawVessel(ctx, new Path2D(right), l.tile, 1 - part * 0.5);
  }

  if (part === 0) return;
  // What comes out of the parting, in both colours at once — the one moment in
  // the fight the two counts are the same count.
  const burst = new Path2D(circleSubpath(mid, y, l.tile * (0.1 + part * 0.9)));
  strokeGlow(ctx, burst, PALETTE.redRim, STROKE.inner, 0.8, 1 - part);
  strokeGlow(ctx, burst, PALETTE.cyanRim, STROKE.inner, 0.8, 1 - part);
}

/**
 * One vessel as a tube rather than a line: a dark wall, a lit core where its
 * top catches the light, and a wet glint along it. Still rock, whatever the
 * beat — a tube that lit would be the tell this file refuses.
 */
function drawVessel(ctx: CanvasRenderingContext2D, path: Path2D, tile: number, fade: number): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.globalAlpha = fade;
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.lineWidth = Math.max(2, tile * 0.07);
  ctx.stroke(path);
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = Math.max(1.5, tile * 0.05);
  ctx.stroke(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.globalAlpha = 0.7 * fade;
  ctx.lineWidth = Math.max(1, tile * 0.018);
  ctx.stroke(path);
  ctx.restore();
}
