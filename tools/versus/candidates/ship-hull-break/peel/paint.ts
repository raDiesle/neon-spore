import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { stream } from "../../../../../packages/render/src/hash.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import type { HullBreakPaint } from "../../../../../packages/render/src/hull-break-look.js";

/**
 * Two flaps of plating bent back out of the hole, one off each lip, standing
 * clear of the membrane with their inner faces turned to the player.
 *
 * The faces are the point. Nothing in this game has ever shown the *inside* of
 * the ship's skin — every surface here is lit from within and seen from
 * outside — so a dark face with a hot torn edge on it is a material the player
 * has no other reading for, which is what makes a hole read as a wound rather
 * than as a shape cut out of a picture.
 */

/** How far the break reaches past the hole, in tiles. */
export const OPEN = 1.15;

/** How far a flap leans away from the hole as it rises, as a share of its height. */
const LEAN = 0.55;

/** How much the torn edge breathes, and how fast. */
const HEAT = 0.22;
const HEAT_HZ = 2.4;

export function peel(ctx: CanvasRenderingContext2D, b: HullBreakPaint): void {
  const rnd = stream(b.seed + 7);
  const up = b.tile * OPEN;
  const heat = 1 - HEAT + HEAT * Math.sin(b.time * HEAT_HZ + b.seed);

  for (const side of [-1, 1] as const) {
    // The flap is hinged on the lip of the hole and its foot runs back along
    // the skin away from it, so the plating it is made of is plating that was
    // there — `craters.ts` measured both lips once and kept them.
    const hinge = side < 0 ? b.left : b.right;
    const foot = hinge + side * b.r * (0.9 + 0.5 * rnd());
    const tipX = hinge + side * up * LEAN * (0.7 + 0.6 * rnd());
    const tipY = b.skinY(hinge) - up * (0.7 + 0.5 * rnd());

    const flap = new Path2D();
    flap.moveTo(hinge, b.skinY(hinge));
    flap.quadraticCurveTo(hinge + side * up * 0.2, tipY + up * 0.35, tipX, tipY);
    // The far edge comes back down to the skin at the foot, curling the other
    // way: a torn sheet is not a triangle.
    flap.quadraticCurveTo(foot + side * up * 0.1, tipY + up * 0.8, foot, b.skinY(foot));
    flap.closePath();

    // The inside face, and it is nearly black rather than a darker hull: a
    // surface with no light on it is the whole argument.
    ctx.fillStyle = rgba(mixHex(b.rim, "#060309", 0.88), 0.92);
    ctx.fill(flap);
    strokeGlow(ctx, flap, b.rim, Math.max(1, b.tile * 0.035), 0.5 * heat);

    // The tear itself, along the top edge only, hot.
    const edge = new Path2D();
    edge.moveTo(hinge, b.skinY(hinge));
    edge.quadraticCurveTo(hinge + side * up * 0.2, tipY + up * 0.35, tipX, tipY);
    strokeGlow(ctx, edge, "#FF7A2F", Math.max(1, b.tile * 0.05), 1.1 * heat);
  }
}
