import { control, type GuideScene } from "@neon-spore/content";
import { gripsCreature, type World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { shipCircle } from "./touch-ship.js";

/**
 * The hands that are **not** on the panel: one held on something falling, and
 * one pressed against the ship itself.
 *
 * Its own file beside `guide-thumb.ts`, split when that one reached the length
 * ceiling, along the seam it always had. Next door places a thumb from the
 * *layout* — a lobe's circle, a strip's column, a slab's box — and everything
 * it needs is known before a world exists. Both of these are placed from the
 * **world**: a grip rides the body it is slowing, and a press on the ship goes
 * to wherever the cannon or the plate has been left. That is the same rule read
 * from the other end, and it is why neither of them can be an authored
 * coordinate.
 */

/** How long a press against the ship reads as down, and how far either side of
 * its own tick a hand is on screen at all. The panel hand's own numbers, so a
 * thumb arrives and presses at one pace whichever surface it lands on. */
const PRESS_TICKS = 18;
const LEAD_TICKS = 24;
const TRAIL_TICKS = 60;

/**
 * The other hand: one held on the field, on whatever it has hold of.
 *
 * It is derived the same way everything else here is, and from further away —
 * the world says which body this seat is gripping and `creatureCenter` says
 * where that body is being drawn, so the hand rides the thing it is slowing
 * instead of sitting at a place an author guessed. Nothing about it is
 * authored except the column the hand went down in (`SceneAct.grip`).
 */
export function gripThumb(
  l: Layout,
  world: World,
  seat: 1 | 2,
  beatPhase: number,
): { x: number; y: number; r: number } | null {
  for (const c of world.creatures) {
    if (!gripsCreature(world, seat, c.id)) continue;
    const at = creatureCenter(l, c, beatPhase);
    return { x: at.x, y: at.y, r: creatureRadius(l, c, beatPhase, world.cfg) };
  }
  return null;
}

/**
 * And the hand that is on the **ship**: a press or a drag against the cannon or
 * the plate where they stand on the hull, rather than against the button for
 * the same control on the panel below (`touch-ship.ts`).
 *
 * Where it goes comes from the world and never from the act, exactly as the
 * grip's does — the swelling is wherever the cannon and the plate have been
 * left, and an authored column beside the act would be a hand pressing a place
 * the ship is not.
 *
 * Only the act in flight, and only this seat's. `LEAD_TICKS` and `PRESS_TICKS`
 * are the panel hand's own numbers, so a thumb arrives and presses at the same
 * pace whichever surface it lands on.
 */
export function fieldThumb(
  l: Layout,
  world: { cannonCol: number; shieldCol: number },
  scene: GuideScene,
  tick: number,
  seat: 1 | 2,
): { x: number; y: number; press: boolean } | null {
  for (const act of scene.acts) {
    if (!act.onField || !act.control) continue;
    if (control(act.control).player !== seat) continue;
    if (tick < act.tick - LEAD_TICKS || tick > act.tick + TRAIL_TICKS) continue;
    const at = shipCircle(l, world, act.control);
    if (!at) continue;
    return { x: at.x, y: at.y, press: tick >= act.tick && tick - act.tick < PRESS_TICKS };
  }
  return null;
}

/** That hand, drawn — the same thumb the panel gets, pressed down, because it
 * is the same gesture and a second look for it would read as a second verb. */
export function drawGripThumb(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  radius: number,
): void {
  const r = Math.max(6, Math.min(radius * 1.1, at.r * 0.9));
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = PALETTE.text;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
