import { FRONT, SIDE, view } from "@neon-spore/content";
import { gimbalRig } from "../../../packages/render/src/gimbal-rig.js";
import { PALETTE } from "../../../packages/render/src/palette.js";
import { drawRig, type RigLook } from "../../../packages/render/src/solid-rig.js";
import { type GimbalRing, INNER, OUTER } from "../../../packages/sim/src/index.js";

/**
 * The GIMBAL sheet (`bun run solid --gimbal`): THE GIMBAL's rig
 * (`packages/render/src/gimbal-rig.ts`) turned from face-on to the side in
 * five steps — the pilot's ring on the top row, seen from the front, and the
 * navigator's below, the same cradle seen from behind. Two teeth of three
 * left on each, the first a sixth of a turn round.
 */

const CELL = 320;
const TILE = 34;
const YAWS = [FRONT, 1.18, 0.785, 0.39, SIDE];
const LOOK: RigLook = { deep: PALETTE.background, rim: PALETTE.hullRim, haze: 0.35 };

function draw(): string {
  const canvas = document.createElement("canvas");
  canvas.width = CELL * YAWS.length;
  canvas.height = CELL * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const rows: { name: string; ring: GimbalRing; behind: number }[] = [
    { name: "pilot", ring: OUTER, behind: 0 },
    { name: "navigator", ring: INNER, behind: Math.PI },
  ];
  rows.forEach(({ name, ring, behind }, row) => {
    const parts = gimbalRig({ ring, faceMilli: 166, left: 2, of: 3 }, TILE);
    YAWS.forEach((yaw, col) => {
      drawRig(
        ctx,
        parts,
        view(yaw + behind),
        col * CELL + CELL / 2,
        row * CELL + CELL * 0.56,
        LOOK,
      );
      ctx.strokeStyle = PALETTE.grid;
      ctx.strokeRect(col * CELL + 0.5, row * CELL + 0.5, CELL - 1, CELL - 1);
      ctx.fillStyle = PALETTE.dim;
      ctx.font = "14px monospace";
      const turned = Math.round(((FRONT - yaw) * 180) / Math.PI);
      ctx.fillText(`${name}  turned ${turned}°`, col * CELL + 10, row * CELL + 20);
    });
  });
  return canvas.toDataURL("image/png");
}

(window as unknown as { __sheet: string }).__sheet = draw();
