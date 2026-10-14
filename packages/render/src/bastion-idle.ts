import type { BastionLayer, BastionState } from "@neon-spore/sim";
import { BASTION_GLANCE, bastionHush } from "./bastion-glance.js";
import { type At, RING_DROP } from "./bastion-shape.js";
import type { Layout } from "./layout.js";
import { bodyLife } from "./motion-life.js";

/**
 * **THE BASTION's outer shells idle**, so the moon is not a sphere turning
 * inside a frame nailed to the sky — the owner, 14 October 2026: *let the
 * other front parts move as well somehow so it does not look very static*.
 *
 * - **The gun ring rides the sphere like a loose collar**: it tips after the
 *   sphere's cock (`bastion-glance.ts`), a beat late and a little further,
 *   and nods on its own slower clock, its ellipse opening and closing as if
 *   the moon dipped toward the ship. It steadies while it is the shell lit,
 *   as the sphere does for its own, because a bolt stops on its front gun
 *   (`bastion-stop.ts`) and that point is not moved.
 * - **The armour breathes**: each slab stands a hair out from its seat and
 *   back, one after another round the moon, so the seams open and close in a
 *   wave; the tower rises and the keel sinks with the slabs beside them. A
 *   slab under a thumb does not — the knob sits on it.
 *
 * Each is a function of the clock alone, kept nowhere, and halved on a
 * device asking for less motion (`bodyLife`).
 */

/** How much further the ring tips than the sphere, and how many seconds behind it. */
const RING_FOLLOW = 1.6;
const RING_LAG = 0.3;
/** The ring's nod: how far its ellipse opens and closes, as a share of its height, and a nod's seconds. */
const RING_NOD = 0.14;
const RING_NOD_SECONDS = 4;
/** How far a slab stands out at its widest breath, in tiles, and a breath's seconds round the moon. */
const PLATE_BREATH = 0.1;
const BREATH_SECONDS = 3;

/** The ring's sway this frame: a roll about the moon's centre and a nod, a share of its height. */
export interface RingSway {
  roll: number;
  nod: number;
}

const isRing = (layer: BastionLayer | undefined): boolean => layer === "ring";

/** How the ring sways at `time`, hushed while it is the shell lit (`at` in beats with their fraction). */
export function bastionRingSway(s: BastionState, at: number, time: number): RingSway {
  const k = bastionHush(s, at, isRing) * bodyLife();
  return {
    roll: k * RING_FOLLOW * BASTION_GLANCE.roll(Math.max(0, time - RING_LAG)),
    nod: k * RING_NOD * Math.sin((2 * Math.PI * time) / RING_NOD_SECONDS),
  };
}

/** Draws `draw` swayed as `sway` says: rolled about the moon's centre and nodded about the ring's. */
export function drawSwayed(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: At,
  sway: RingSway,
  draw: () => void,
): void {
  if (sway.roll === 0 && sway.nod === 0) {
    draw();
    return;
  }
  const y = c.y + RING_DROP * l.tile;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(sway.roll);
  ctx.translate(0, y - c.y);
  ctx.scale(1, 1 + sway.nod);
  ctx.translate(-c.x, -y);
  draw();
  ctx.restore();
}

/** How far out a piece of armour at `angle` (from straight up, clockwise) breathes at `time`, in tiles. */
export function bastionBreath(angle: number, time: number): number {
  const wave = 0.5 + 0.5 * Math.sin((2 * Math.PI * time) / BREATH_SECONDS - angle);
  return PLATE_BREATH * wave * bodyLife();
}
