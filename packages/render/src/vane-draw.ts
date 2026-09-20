import { circleSubpath } from "@neon-spore/content";
import {
  type VaneState,
  vaneColor,
  vaneOpen,
  vaneOpeningNow,
  vanePinned,
  vanePivotCol,
  vaneReachMilli,
  vaneTipCol,
  vaneTipNow,
  type World,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawBearing } from "./vane-bearing.js";
import { drawArm } from "./vane-spar.js";

/**
 * THE VANE, drawn: an arm sweeping the top of the field, and the bearing it
 * turns on.
 *
 * **A mechanism, and never a body.** That was one open stroke of even width
 * until 20 September 2026, on the reading that a shape enclosing an area starts
 * to look like something holding a weapon; what it actually looked like was a
 * line with a circle on the end. It is a made thing now, cut from one metal and
 * lit by one ramp: a mount across three columns, a hub with the pins in a bolt
 * circle round it (`vane-bearing.ts`), and a tapered spar with a lattice
 * through it and a fork on the end (`vane-spar.ts`). None of it is a creature —
 * there is no skin, no socket and no slime on the whole boss — and a vane is
 * still the thing that turns when something pushes it.
 *
 * The pivot is not decoration — it is the only part of the boss that can be
 * reached, and it hangs above row 0 where nothing else in the game is, so a
 * shot answers it by leaving the field entirely (`vane.ts`). The casing around
 * it wears the pins, and a pin gone is a gap that never fills: the arm reaches
 * a phase further out for it, so the silhouette says how far in the pair are by
 * getting *longer*, which is the same bargain the Bulb Queen makes by sinking.
 *
 * Nothing here is held between frames. Everything it draws comes off the world
 * and the beat, so there is no `Effects` field to clear and no way for a
 * restart to show this fight the last one's arm.
 */

/** Beats a throw's streak takes to go out. Short — it is a flick, not a trail. */
const THROW_FADE = 1.4;

/** How far the tip dips below the bearing at mid-swing, in tiles. */
const DROOP = 0.85;

/**
 * The row the bearing hangs on, above the field's first row — where the casing,
 * its pins and the mouth of the split all stand.
 *
 * Exported because the cue's mark stands on the mouth and may not work this out
 * a second time (`boss-cue-read-g.ts`): a word standing where the split is not
 * would be worse than no word at all.
 */
export function vaneBearingY(l: Layout): number {
  return tileCY(l, 0) - l.tile * 0.2;
}

export function drawVane(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: VaneState,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const pivotCol = vanePivotCol(cfg);
  const px = tileCX(l, pivotCol);
  const py = vaneBearingY(l);
  const hub = l.tile * 0.34;

  // Where the arm stands between two beats. Pinned, it has stopped — the fold
  // line holds the column the thumb landed it in (`vaneTipNow`) and there is
  // nothing to interpolate towards. Sweeping, it is still read a beat ahead off
  // the cycle so it travels along the grid the pair is naming, the same number
  // on both screens because both read it out of the sim.
  const pinned = vanePinned(world, b);
  const from = vaneTipNow(world, b);
  const to = pinned ? from : vaneTipCol(cfg, b.pins, world.waveBeat + 1);
  const tipCol = from + (to - from) * beatPhase;
  const mFrom = vaneReachMilli(world.waveBeat);
  const mTo = vaneReachMilli(world.waveBeat + 1);
  const m = mFrom + (mTo - mFrom) * beatPhase;

  const tx = tileCX(l, tipCol);
  const ty = py + l.tile * DROOP * (1 - Math.abs(m) / 1000);
  // Lag against the direction of travel, so a held arm hangs straight and a
  // sweeping one trails. `to - from` is columns per beat, which is exactly how
  // hard it is being swung.
  const whip = (to - from) * l.tile * 0.18 + Math.sin(time * 1.7) * l.tile * 0.03;

  // The colour is the cycle's in every phase (`docs/spec/bosses.md` §11.5): the
  // housing has worn it since the arm stopped, so `vaneOpeningNow` names it even
  // while the cycle's own openings have stopped, from VEER on.
  const opening = vaneOpeningNow(world.waveBeat);
  const open = vaneOpen(world);
  const hex = vaneColor(opening) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;

  drawBearing(ctx, l, world, b, px, py, hub, open, hex, rim);
  drawArm(ctx, l, px, py, hub, tx, ty, whip);

  // The tip, which is the fold line and the only column anybody has to watch.
  // The last thing filled in the whole picture, and `vane-pin-frame.test.ts`
  // reads the drawn column back off it.
  const tip = new Path2D(circleSubpath(tx, ty, l.tile * 0.11));
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(tip);
  ctx.restore();
  strokeGlow(ctx, tip, PALETTE.rock, STROKE.inner, 0.9);

  drawThrow(ctx, l, b, world.beat, beatPhase, tx, ty);
}

/**
 * The flick the arm leaves when it throws an arrival: a line from the tip to
 * the column the body came down in, going out over about a beat. It is the one
 * moment the fold is a picture rather than an arithmetic, so it is drawn even
 * though the body it threw is already standing in its new column.
 */
function drawThrow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  b: VaneState,
  beat: number,
  beatPhase: number,
  tx: number,
  ty: number,
): void {
  if (b.throwBeat === -1 || b.throwCol === -1) return;
  const since = beat - b.throwBeat + beatPhase;
  if (since < 0 || since > THROW_FADE) return;
  const fade = 1 - since / THROW_FADE;
  const cx = tileCX(l, b.throwCol);
  const cy = tileCY(l, 0);
  const streak = new Path2D(
    `M ${tx.toFixed(2)} ${ty.toFixed(2)} L ${cx.toFixed(2)} ${cy.toFixed(2)}`,
  );
  strokeGlow(ctx, streak, PALETTE.rock, STROKE.inner, fade * 0.9);
}
