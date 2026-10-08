import {
  drawGovernorAlloy,
  drawGovernorVeins,
  GOVERNOR_ALLOY_SPRITE,
  GOVERNOR_VEINS_SPRITE,
  governorVeinPulse,
  PALETTE,
} from "@neon-spore/render";
import type { SpriteDemo } from "./sprite-demos.js";

/**
 * **THE GOVERNOR's face on the sprite bench**: the alloy and the veins
 * (`packages/render/src/governor-face-baked.ts`), each beside the face it is
 * laid over. Its own file because `sprite-demos.ts` is THE INSTAR's and near
 * the length ceiling.
 *
 * The dial is drawn flat, from straight above — the way it is painted — at a
 * radius of the demo's `r`, so it plays at its own diameter. One state: the
 * face has no threat, and the veins are drawn at the top of their pulse.
 */

/** The flat face the alloy is laid on: the brass rim and the dark face inside it. */
function flatFace(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = PALETTE.governorBrass;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.governorFace;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.96, 0, Math.PI * 2);
  ctx.fill();
}

const dial = (x: number, y: number, r: number) => ({ cx: x, cy: y, r, tilt: 1 });

export const GOVERNOR_DEMOS: readonly SpriteDemo[] = [
  {
    name: "governor-alloy",
    spec: GOVERNOR_ALLOY_SPRITE,
    base: PALETTE.governorBrass,
    glow: PALETTE.governorSheen,
    playH: (r) => r * 2,
    threats: [0],
    box: [-1, -1, 1, 1],
    shipped(ctx, x, y, r) {
      flatFace(ctx, x, y, r);
    },
    baked(ctx, x, y, r, _threat, _time, dpr) {
      flatFace(ctx, x, y, r);
      drawGovernorAlloy(ctx, dial(x, y, r), dpr);
    },
  },
  {
    name: "governor-veins",
    spec: GOVERNOR_VEINS_SPRITE,
    base: PALETTE.governorGlow,
    glow: PALETTE.governorGlow,
    playH: (r) => r * 2,
    threats: [0],
    box: [-1, -1, 1, 1],
    shipped(ctx, x, y, r) {
      flatFace(ctx, x, y, r);
    },
    baked(ctx, x, y, r, _threat, _time, dpr) {
      flatFace(ctx, x, y, r);
      drawGovernorVeins(ctx, dial(x, y, r), governorVeinPulse(0.5), dpr);
    },
  },
];
