import { LEECH, LIMPET, livingPath } from "@neon-spore/content";
import {
  type ClingKind,
  clingFuse,
  clingIsStuck,
  clingMovesSoFar,
  clingShake,
  clingStillBeats,
  isClingKind,
  type World,
} from "@neon-spore/sim";
import { drawClingFuse, showsClingFuse } from "./cling-fuse.js";
import type { Body } from "./creature-body-in.js";
import { drawLivingBody } from "./creature-body-living.js";
import { contourClock, livingScale } from "./creature-place.js";
import type { Wash } from "./creature-tint.js";
import { hazed } from "./depth.js";
import { smoothstep } from "./ease.js";
import { halo, strokeGlow } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE LIMPET and THE LEECH, drawn in their two states: a body coming down a
 * lane, and the same body clamped onto its control once it has it.
 *
 * **Nothing here is a new shape.** THE LIMPET is HOOK COLONY's round base
 * off the shape sheet with its nine hooklets drawn round the rim, all curled
 * the same way; THE LEECH is CALTROP, four needles on a round body
 * (`content/silhouettes-cling.ts`). On the ship each is drawn *on* the thing
 * it has — the gum's rule — the limpet squatting on the plate with its hooks
 * turned down into the plating, the leech on the cannon's swelling with its
 * needles driven in. In the air both fall by `drawLivingBody`, in the
 * malfunction's arc-blue laid over the body as a wash, since they are what
 * that colour means in this game: a thing that has a control of the ship's.
 *
 * **What the picture has to say**, in the order it is needed:
 * 1. it has the control: the body rides the swelling or the plate, and is
 *    drawn arriving along the plating from the lane it fell in;
 * 2. how loose it is: the body lifts and the hooks open as the moves against
 *    it mount, on both screens, so the seat that is moving sees the moving
 *    work;
 * 3. how long is left — **on the seat without the control only**
 *    (`cling-fuse.ts`): the beats of the fuse as a row of lights over the
 *    body, going out one a beat, and the last of them the loud one.
 */

/** The malfunction's material, over the body's own dim grey. */
const ARC_WASH: Wash = { rim: PALETTE.arcRim, hex: PALETTE.arc, dark: "#111A44", amount: 1 };
/** The stuck body's radius in tiles: a little under the falling one, squat. */
const STUCK_R = 0.36;
/** How far the body lifts off its control when every move but one is in. */
const LIFT = 0.28;
/** The limpet's rim of hooklets, as HOOK COLONY has them. */
const HOOKS = 9;

export function drawLimpetBody(b: Body): void {
  if (clingIsStuck(b.c)) return;
  drawLivingBody(b, 1, undefined, ARC_WASH);
  const { ctx, l, c, x, y, time, near, world } = b;
  const r = l.tile * 0.42;
  hooklets(ctx, x, y, r, contourClock(c.id, time), 0, hazed(world.cfg, PALETTE.arcRim, near));
}

export function drawLeechBody(b: Body): void {
  if (clingIsStuck(b.c)) return;
  drawLivingBody(b, 1, undefined, ARC_WASH);
}

/**
 * Nine barbs round a rim, all turned the same way — the part the sheet draws
 * as HOOKLET, in the game's stroke. `open` is 0 for hooks curled tight to the
 * body and 1 for hooks standing out from it; on the ship only the lower
 * half of the ring is drawn, the half that is in the plating.
 */
function hooklets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  open: number,
  color: string,
  lowerOnly = false,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = STROKE.outline;
  ctx.lineCap = "round";
  for (let k = 0; k < HOOKS; k++) {
    const a = (k / HOOKS) * Math.PI * 2 + 0.2 * Math.sin(t * 1.4 + k);
    if (lowerOnly && Math.sin(a) < 0.15) continue;
    const rx = x + Math.cos(a) * r * 0.92;
    const ry = y + Math.sin(a) * r * 0.92;
    const len = r * 0.42;
    // Out along the radius, then curled clockwise; open hooks curl less.
    const curl = a + Math.PI / 2 - (1 - open) * 0.9;
    const mx = rx + Math.cos(a) * len * 0.6;
    const my = ry + Math.sin(a) * len * 0.6;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(mx, my, mx + Math.cos(curl) * len * 0.7, my + Math.sin(curl) * len * 0.7);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Every clinger on its control, over the finished hull. `cannonX` and
 * `shieldX` are the eased lobes the ship pass drew, not the world's columns,
 * so a body rides its swelling through the glide rather than jumping a beat
 * ahead of it; `surfaceY` is the membrane they are lobes of, sampled at the
 * body's foot. On the beat one takes hold it is drawn sliding along the
 * plating from the lane it fell in, by `beatPhase`.
 */
export function drawStuckClingers(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  cannonX: number,
  shieldX: number,
  surfaceY: SurfaceY,
  beatPhase: number,
  time: number,
): void {
  const tile = l.tile;
  for (const c of world.creatures) {
    if (!isClingKind(c.kind) || !clingIsStuck(c)) continue;
    const kind: ClingKind = c.kind;
    const homeX = kind === "limpet" ? shieldX : cannonX;
    // The grip beat: nought of both counts and a lane it has not left yet.
    const arriving = clingStillBeats(c) === 0 && clingMovesSoFar(c) === 0 && c.fromCol !== c.col;
    const u = arriving ? smoothstep(beatPhase) : 1;
    const laneX = tileCX(l, c.fromCol ?? c.col);
    const x = laneX + (homeX - laneX) * u;
    const loose = clingMovesSoFar(c) / Math.max(1, clingShake(world, kind));
    const r = tile * STUCK_R;
    const y = surfaceY(x) - r * 0.55 - tile * LIFT * loose;
    const shape = kind === "limpet" ? LIMPET : LEECH;
    const t = contourClock(c.id, time);
    const s = livingScale(shape, r);
    // Squatting: wider than tall, harder the tighter it holds.
    const squat = 1 - 0.25 * (1 - loose);
    const path = new Path2D(livingPath(shape, t));
    halo(ctx, x, y, Math.round(tile * 1.1), PALETTE.arc, 0.3);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s * squat);
    ctx.fillStyle = ARC_WASH.dark;
    ctx.fill(path);
    ctx.fillStyle = PALETTE.arc;
    ctx.globalAlpha = 0.55;
    ctx.fill(path);
    ctx.globalAlpha = 1;
    ctx.lineWidth = STROKE.outline / s;
    strokeGlow(ctx, path, PALETTE.arc, STROKE.outline / s, 0.8);
    ctx.restore();
    if (kind === "limpet") hooklets(ctx, x, y, r * squat, t, loose, PALETTE.arcRim, true);
    // The grab: a light that swells and goes as it arrives.
    if (arriving) halo(ctx, x, y, Math.round(tile * (1.2 + u)), PALETTE.arcRim, 0.5 * (1 - u));
    if (showsClingFuse(l.role, kind)) {
      drawClingFuse(
        ctx,
        x,
        y - r * squat,
        tile,
        clingFuse(world, kind),
        clingStillBeats(c),
        beatPhase,
        time,
      );
    }
  }
}
