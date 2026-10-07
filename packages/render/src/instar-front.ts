import { FRONT, type SeenRing, view } from "@neon-spore/content";
import { halo } from "./glow.js";
import { INSTAR_BODY } from "./instar-body-look.js";
import { BODY_SKIN, drawFrontBody, frontBody } from "./instar-front-body.js";
import { INSTAR_HEAD } from "./instar-head-look.js";
import { drawLegs, profileLegs } from "./instar-legs.js";
import { instarFarEnd, type Point } from "./instar-place.js";
import { faded, type Look } from "./instar-plate.js";
import type { WingSeat } from "./instar-profile.js";
import { drawTail } from "./instar-tail.js";
import { instarNeck, instarTurn } from "./instar-turn.js";
import { drawWing } from "./instar-wings.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE INSTAR face-on**: a living ship coming at the screen. The body runs
 * back and up behind the head into the dark — a lit tube of the rig going
 * into depth, seamed and lit with gold lamps (`instar-front-body.ts`), two
 * engines burning at the far end and the tail going on out of it, the legs
 * hanging under it — and the wings spread wide off the shoulders behind the
 * head. Then the head (`instar-head.ts`).
 *
 * All of it a third of the way round at rest and further round as it turns
 * toward the profile (`instar-turn.ts`), and drawn back to
 * front: the engines, the far wing hazed toward the field, the body, the near
 * wing over it, the head over all.
 */

/** How far off the eye is for the wings, in head radii: near enough that the tips swept back go small. */
const WING_LENS = 10;
/** How far the far wing is hazed toward the field, behind the body. */
const FAR_WING = 0.3;

export function drawFront(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f, head, r, fade, time } = look;
  const neck = instarNeck(head, r);
  const turn = instarTurn(f.side);
  const body = frontBody(look, neck, instarFarEnd(l, f), turn);
  const limbs = frontLimbs(look, neck, body.seen);
  drawTail(ctx, l, limbs.tailLook, limbs.rear, limbs.heading);
  drawEngines(ctx, limbs.rear, r, time, fade);
  const [far, near] = frontWings(look);
  drawWing(ctx, look, far.at, far.w, far.hinge, far.side, FAR_WING);
  drawLegs(ctx, limbs.legs, true, BODY_SKIN, r, fade);
  drawFrontBody(ctx, look, neck, body);
  drawLegs(ctx, limbs.legs, false, BODY_SKIN, r, fade);
  drawWing(ctx, look, near.at, near.w, near.hinge, near.side);
  INSTAR_HEAD.front(ctx, look);
}

/**
 * **The same tail and the same legs as side-on** (`instar-tail.ts`,
 * `instar-legs.ts`) — the owner, 7 October 2026: *from any angle view, it's
 * identified to be the same drake*. Face-on they hang off the body going away:
 * the tail out of its far end, the way it is heading, and the legs under the
 * chest and the haunches — each as large, against the girth it hangs from, as
 * it is side-on, so the far ones are smaller by the body's own perspective.
 */
export function frontLimbs(look: Look, neck: Point, seen: readonly SeenRing[]) {
  const { r, time } = look;
  const n = seen.length - 1;
  const on = (g: SeenRing, down = 0): Point => ({ x: neck.x + g.c.x, y: neck.y + g.c.y + down });
  const spine = seen.map((g) => on(g));
  const bottom = seen.map((g) => on(g, g.r));
  const rear = spine[n] as Point;
  const back = spine[Math.max(0, n - 2)] as Point;
  const len = Math.hypot(rear.x - back.x, rear.y - back.y) || 1;
  const heading = { x: (rear.x - back.x) / len, y: (rear.y - back.y) / len };
  const near = (u: number) => (seen[Math.round(u * n)] as SeenRing).r / (r * INSTAR_BODY.girth(u));
  const legs = profileLegs(spine, bottom, r, time, near);
  return { rear, heading, legs, tailLook: { ...look, r: r * near(1) } };
}

/** The two wings face-on, the far one first, off the shoulders behind the
 * head — as `drawFront` draws them and a bolt meets them (`instar-limb-stop.ts`). */
export function frontWings(look: Look): [WingSeat, WingSeat] {
  const { f, head, r } = look;
  const neck = instarNeck(head, r);
  const at = { x: neck.x, y: neck.y + r * 0.05 };
  const w = view(FRONT - instarTurn(f.side), 0, r * WING_LENS);
  const seat = (side: 1 | -1): WingSeat => ({
    at,
    w,
    hinge: { x: 0, y: 0, z: side * r * 0.55 },
    side,
  });
  return [seat(-1), seat(1)];
}

/** The two engines at the far end: a steady burn, flickering. */
export function drawEngines(
  ctx: CanvasRenderingContext2D,
  rear: { x: number; y: number },
  r: number,
  time: number,
  fade: number,
): void {
  const flick = 0.75 + 0.25 * Math.sin(time * 21);
  const size = Math.max(4, Math.round((r * 0.32) / 4) * 4);
  for (const s of [-1, 1]) {
    const x = rear.x + s * r * 0.18;
    const y = rear.y - r * 0.05;
    halo(ctx, x, y, size, PALETTE.ember, 0.7 * flick * fade);
    // The nozzle: a ring of hide round the burn, and its white-hot core.
    ctx.save();
    ctx.strokeStyle = faded(PALETTE.rockDark, fade);
    ctx.lineWidth = Math.max(1, r * 0.035);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.09, r * 0.06, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = faded(PALETTE.emberRim, fade, 0.8 * flick);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.045, r * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
