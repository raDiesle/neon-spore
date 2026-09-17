import { blobPoints, circleSubpath } from "@neon-spore/content";
import {
  DIASTOLE_SIDES,
  type DiastoleSide,
  type DiastoleState,
  diastoleBeating,
  diastoleChamberCol,
  diastoleColor,
  diastoleHits,
  diastoleSeat,
  diastoleSince,
  diastoleStanding,
  type SimConfig,
} from "@neon-spore/sim";
import { drawBridge } from "./diastole-bridge.js";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { showsDiastoleBeat } from "./view-role-clocks.js";

/**
 * THE DIASTOLE, drawn: two chambers above the top of the field, and the bridge
 * of vessels between them.
 *
 * **The whole boss is above row 0**, where THE VANE's bearing is and nothing
 * else in the game — which is why there is no creature to find among
 * `world.creatures` and why a shot answers it by leaving the field entirely
 * (`sim/diastole-step.ts`). The field under it is the ordinary field.
 *
 * **Each seat sees one chamber beating and the other still.** That is the
 * encounter, not a trick of the drawing: the pilot's chamber pulses on its
 * count and the navigator's hangs there as a grey mass, and on the other phone
 * it is the other way round (`showsDiastoleBeat`). Neither is lying — a still
 * mass is exactly what a count you cannot hear looks like — and the only way
 * to learn the other one's stride is for its owner to say it out loud.
 *
 * **The bridge between them is the one part both screens read the same**, and
 * it never says when the coincidence is (`diastole-bridge.ts`).
 *
 * Nothing here is held between frames. Every number comes off the boss and the
 * beat, so there is no `Effects` field to clear and a restart cannot show this
 * fight the last one's chambers.
 */

/** Beats a strike's flare takes to go out. */
const STRUCK_FADE = 1.4;

/** How far above row 0 the chambers hang, in tiles. */
const HANG = 0.52;

/**
 * How hard a chamber is squeezing right now, 1 on its contraction and 0 by the
 * time the next beat has gone by.
 *
 * Cubed on the way out so the squeeze is a *snap* rather than a swell: a heart
 * is a thing that jerks and then relaxes, and a sine would read as breathing.
 * It is a beat wide whatever the chamber's stride is, which is the point —
 * three and five have to be told apart by *when* the snap comes and never by
 * how long it lasts.
 */
function squeeze(b: DiastoleState, beat: number, beatPhase: number, side: DiastoleSide): number {
  const since = diastoleSince(b, beat, side) + beatPhase;
  if (since >= 1) return 0;
  const f = 1 - since;
  return f * f * f;
}

export function drawDiastole(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: DiastoleState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const y = tileCY(l, 0) - l.tile * HANG;
  drawBridge(ctx, l, cfg, b, y, beat, beatPhase, time);
  for (const side of DIASTOLE_SIDES) {
    drawChamber(ctx, l, cfg, b, side, y, beat, beatPhase, time);
  }
}

/**
 * One chamber, and how much of it is left.
 *
 * **The hits are the lobes.** A chamber with three left is a full, round thing
 * and one with a single hit in it is a two-lobed sac that has plainly been
 * worked on — the Bulb Queen's bargain, where the silhouette is the health bar
 * and there is no bar (`docs/spec/bosses.md` §11.0). A chamber with nothing
 * left is not drawn as an empty one: it is a slack husk, smaller than it ever
 * was, dark, and it does not move again.
 */
function drawChamber(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: DiastoleState,
  side: DiastoleSide,
  y: number,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const x = tileCX(l, diastoleChamberCol(cfg, side));
  const hits = diastoleHits(b, side);

  if (!diastoleStanding(b, side)) {
    // A husk. It hangs where the chamber was, so the pair can see which of the
    // two they finished, and it takes no colour at all.
    const husk = splinePath(
      blobPoints(x, y, l.tile * 0.28, l.tile * 0.18, 3, 0.26, 0.04, time, side, 24),
      true,
    );
    ctx.save();
    ctx.fillStyle = PALETTE.rockDark;
    ctx.fill(husk);
    ctx.restore();
    strokeGlow(ctx, husk, PALETTE.rock, STROKE.inner, 0.35);
    return;
  }

  // Whose chamber this is, and whether it is saying anything yet. Two
  // questions, and keeping them apart is the whole of what the picture found
  // out by being looked at. `diastoleBeating` is the boss's half — the right
  // chamber keeps no cadence at all through phase `one`, on either screen —
  // and `showsDiastoleBeat` is this file's.
  const mine = showsDiastoleBeat(l.role, diastoleSeat(side));
  const beats = diastoleBeating(b, side) && mine;
  const s = beats ? squeeze(b, beat, beatPhase, side) : 0;

  const hex = diastoleColor(side) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = diastoleColor(side) === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  // A chamber squeezing is smaller and brighter; a chamber at rest is wide and
  // dull. Both screens draw the same *size* at rest, so the two masses match
  // and a seat cannot tell from the outline which one it is being shown.
  const r = l.tile * (0.62 - 0.08 * s);
  const body = splinePath(
    blobPoints(
      x,
      y,
      r,
      r * 0.86,
      Math.max(2, hits + 1),
      // The lobes do not deepen on the squeeze, and that took a picture to
      // find out: a depth that moved with `s` turned the contracting chamber
      // into a four-pointed star and the resting one into a sac, so the two
      // read as different bodies rather than as one body doing something. The
      // squeeze is size and brightness only — the silhouette is the health,
      // and health does not change three times a beat.
      0.15,
      0.05,
      time * 0.6,
      side + 7,
      32,
    ),
    true,
  );
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(body);
  ctx.restore();
  // Three states and not two, which the first frame of this boss made the case
  // for on its own: the navigator's screen through phase `one` was two
  // identical grey masses, so a seat did not even know *which* of them was
  // theirs until it woke up. Ownership is not timing — a chamber wearing its
  // owner's hue while standing perfectly still gives away no count at all —
  // and the seat that has to hold the other's number deserves to know which
  // number will be its own. So: the one a seat owns is drawn in its hue, dim
  // and unmoving until it beats; the one a seat does not own is grey, which is
  // the honest colour for a mass that is there and is not saying anything.
  const hue = beats ? hex : mine ? hex : PALETTE.rock;
  strokeGlow(ctx, body, hue, STROKE.outline, beats ? 0.5 + 0.5 * s : mine ? 0.22 : 0.4);
  if (beats && s > 0) strokeGlow(ctx, body, rim, STROKE.inner, s);

  drawStruck(ctx, b, side, x, y, r, beat, beatPhase, rim);
}

/**
 * The flare a chamber wears for a beat after it is taken.
 *
 * Both screens draw it, whichever seat owns the chamber, and that is the point:
 * a hit is the one fact about this boss neither player has to be told by the
 * other, so it is the pair's shared receipt for a count they agreed on out
 * loud. `struckSide` is `0` when the beam took both at once, which is the frame
 * the whole fight is for.
 */
function drawStruck(
  ctx: CanvasRenderingContext2D,
  b: DiastoleState,
  side: DiastoleSide,
  x: number,
  y: number,
  r: number,
  beat: number,
  beatPhase: number,
  rim: string,
): void {
  if (b.struckBeat === -1) return;
  if (b.struckSide !== 0 && b.struckSide !== side) return;
  const since = beat - b.struckBeat + beatPhase;
  if (since < 0 || since >= STRUCK_FADE) return;
  const fade = 1 - since / STRUCK_FADE;
  const ring = new Path2D(circleSubpath(x, y, r * (1 + since * 0.8)));
  strokeGlow(ctx, ring, rim, STROKE.inner, fade * 0.9);
}
