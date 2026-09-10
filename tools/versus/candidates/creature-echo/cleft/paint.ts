import { KEY } from "../../../../../packages/content/src/light.js";
import type { SeamDraw } from "../../../../../packages/render/src/echo-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";

/**
 * CLEFT — the furrow is a *groove*, with a wall the key lights and a wall it
 * does not.
 *
 * The shipped seam is one dark stroke across the body. It says *here* and it
 * says *deeper as the beat comes*, and it says both on a flat plane: a line
 * has no walls, so nothing about it can catch a light, and a mark that cannot
 * catch a light is a mark drawn on a picture rather than cut into a thing.
 *
 * A groove has two walls. The one on the side away from `KEY` faces the
 * light and is lit; the one on the side toward it faces away and is in
 * shadow, and its lip throws that shadow into the trench. So this draws
 * three strokes where there was one: the dark floor exactly where the
 * shipped seam is, a thin line of the rim colour along the far wall, and a
 * wider, softer band of the body's dark along the near lip — and the pair of
 * them make the floor read as *below* the surface. Which wall is which is
 * found by taking the frame's own rotation and the axis back out of `KEY`,
 * so the groove is lit from the same corner as everything else on the field
 * however the body leans.
 *
 * The three deepen together on the strain the shipped seam already reads, so
 * a body on its first frame carries a shallow scored line and a body a beat
 * from parting carries a trench with a bright edge.
 *
 * **How it can lose.** *Three lines are a stripe.* At the size the game
 * draws an echo — six tenths of a slick — the lit edge is a pixel, and if
 * the eye reads lit-dark-dark as one striped band the groove is a decal
 * again with more colours in it. Judge it at 26 px.
 */

/** The floor's darkness, standing and at full strain, and its width — the
 * shipped seam's own, so the floor is exactly the mark the pair already
 * knows. */
const FLOOR_MIN = 0.22;
const FLOOR_MAX = 0.85;
const FLOOR_WIDTH = 0.16;

/** The lit wall: how far it sits off the floor's centre as a share of the
 * floor's width, how wide it is against the floor, and how bright at full
 * strain. */
const WALL_OFFSET = 0.62;
const WALL_WIDTH = 0.38;
const WALL_MAX = 0.75;

/** The shadowed lip: further out and wider than the wall, and softer. */
const LIP_OFFSET = 0.8;
const LIP_WIDTH = 0.9;
const LIP_MAX = 0.4;

export function cleft(d: SeamDraw): void {
  const { ctx, angle, phase, rx, ry, rot, dark, rim } = d;
  const reach = Math.max(rx, ry) * 1.05;
  const floor = Math.min(rx, ry) * FLOOR_WIDTH * (1 + phase);
  // The key, in the frame the seam is drawn in: the pose's lean and the axis
  // both taken back out. The seam runs along y, so only its x component says
  // which wall is lit.
  const a = -(rot + angle);
  const kx = KEY.x * Math.cos(a) - KEY.y * Math.sin(a);
  const toLight = kx >= 0 ? 1 : -1;

  ctx.save();
  ctx.rotate(angle);
  ctx.lineCap = "round";

  const line = (x: number, width: number, colour: string): void => {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, -reach);
    ctx.lineTo(x, reach);
    ctx.stroke();
  };

  // The shadowed lip first, on the side toward the light, under the floor.
  line(toLight * floor * LIP_OFFSET, floor * LIP_WIDTH, rgba(dark, LIP_MAX * (0.3 + 0.7 * phase)));
  // The floor: the shipped seam, unchanged.
  line(0, floor, rgba(dark, FLOOR_MIN + (FLOOR_MAX - FLOOR_MIN) * phase));
  // The lit wall, on the side away from the light.
  ctx.globalCompositeOperation = "lighter";
  line(
    -toLight * floor * WALL_OFFSET,
    floor * WALL_WIDTH,
    rgba(rim, WALL_MAX * (0.25 + 0.75 * phase)),
  );
  ctx.restore();
}
