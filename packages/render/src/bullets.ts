import type { Bullet } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * Shots sit on tile centres — the simulation only ever knows which tile a
 * bullet occupies and how far it has come towards the next one (`subMilli`).
 * The glide between the two is drawn here and nowhere else.
 *
 * **Sideways too, since THE LOCK.** A bolt steering into the body player 1 has
 * a hand on is genuinely between two columns, and it carries both halves of
 * that: `driftMilli` is how far across its column it stands and `aimMilli` is
 * which way it is going (`sim/lock.ts`). Neither is worked out again here —
 * the second exists precisely so that the tail can be laid down along the path
 * the shot took rather than straight beneath it, which is a lie the moment a
 * shot crosses the field as fast sideways as it climbs.
 */

/**
 * Everything about how one shot reads, as a record rather than as numbers
 * typed into the draw call.
 *
 * It was the second kind until this file was lifted: the alphas, the widths
 * and the three radii were literals inside `drawBullets`, which meant the shot
 * — one of the two things a player watches all game — had exactly one answer
 * and nowhere for a second one to sit. A record can be patched for the length
 * of one `draw()`; a literal cannot. See `docs/versus.md`, and
 * `tools/versus/candidates/cannon-shot/` for the two answers now offered.
 *
 * `tailBack` is a function for one reason worth stating: the shipped tail is
 * not a fixed length. It runs back to the *tile centre the shot left*, so it
 * grows from nothing to one tile and snaps back to nothing at every boundary —
 * a sawtooth, which is `frac => frac`. A candidate that wants a constant
 * streak is `() => 2.6`, and neither can be spelled as a number.
 */
export interface ShotLook {
  /**
   * How far behind the head the tail begins, in tiles. `frac` is how far the
   * shot has come from the tile centre it left, 0 at that centre and
   * approaching 1 at the next one.
   */
  tailBack(frac: number): number;
  tailAlpha: number;
  tailWidth: number;
  /** Halo radius and opacity, as a share of `tile` and of full. */
  haloMul: number;
  haloAlpha: number;
  /** The solid head, as a share of `tile`. */
  coreMul: number;
  /** A ring round the head. `ringWidth <= 0` draws none. */
  ringMul: number;
  ringWidth: number;
  /** `null` means the shot's own ammunition colour. */
  ringColor: string | null;
}

/** An ordinary shot. What the cannon fires all game. */
export const SHOT_LOOK: ShotLook = {
  tailBack: (frac) => frac,
  tailAlpha: 0.35,
  tailWidth: 2,
  haloMul: 0.3,
  haloAlpha: 0.85,
  coreMul: 0.14,
  ringMul: 0,
  ringWidth: 0,
  ringColor: null,
};

/**
 * A lance. Half the speed, so the same tail is twice the object — which is the
 * point: it has to be told apart from an ordinary shot at a glance by both
 * players. The ring is the cannon's own colour, so the shot carries the mark
 * that made it as well as the ammunition it was loaded with.
 *
 * Its own record, beside `SHOT_LOOK` the way `MIRROR_SKIN` sits beside
 * `OWN_SKIN`, and deliberately not part of the `cannon:shot` slot: a vote on
 * how an ordinary shot travels must not quietly move the thing it has to be
 * distinguished from.
 */
export const LANCE_LOOK: ShotLook = {
  tailBack: (frac) => frac,
  tailAlpha: 0.6,
  tailWidth: 5,
  haloMul: 0.5,
  haloAlpha: 0.85,
  coreMul: 0.2,
  ringMul: 0.28,
  ringWidth: 1.6,
  ringColor: PALETTE.hullRim,
};

export function drawBullets(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  bullets: readonly Bullet[],
): void {
  for (const b of bullets) {
    const look = b.lance ? LANCE_LOOK : SHOT_LOOK;
    const hex = b.color === "red" ? PALETTE.red : PALETTE.cyan;
    const frac = b.subMilli / 1000;
    const row = b.row - frac;
    const col = b.col + b.driftMilli / 1000;
    const x = tileCX(l, col);
    const y = tileCY(l, row);
    // How far back down the shot's own path the tail begins. The head has
    // climbed `back` tiles since then, and crossed `aimMilli` thousandths of a
    // column for each of them — so the tail's far end is that much *behind* in
    // both axes, and a shot going straight up is drawn exactly as it was.
    const back = Math.max(0, look.tailBack(frac));
    const fromY = tileCY(l, row + back);
    const fromX = tileCX(l, col - (b.aimMilli / 1000) * back);

    // A tail behind the head, so the direction is legible even at twelve tiles
    // a beat.
    ctx.globalAlpha = look.tailAlpha;
    ctx.strokeStyle = hex;
    ctx.lineWidth = look.tailWidth;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalAlpha = 1;

    halo(ctx, x, y, l.tile * look.haloMul, hex, look.haloAlpha);
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(x, y, l.tile * look.coreMul, 0, Math.PI * 2);
    ctx.fill();
    if (look.ringWidth <= 0) continue;
    ctx.strokeStyle = look.ringColor ?? hex;
    ctx.lineWidth = look.ringWidth;
    ctx.beginPath();
    ctx.arc(x, y, l.tile * look.ringMul, 0, Math.PI * 2);
    ctx.stroke();
  }
}
