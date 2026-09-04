import { control, type GuideScene } from "@neon-spore/content";
import { gripsCreature, lidIsHeld, type World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import { handleCircle } from "./handles.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { shipCircle } from "./touch-ship.js";

/**
 * The hands that are **not** on the panel: one held on something falling, one
 * pressed against the ship itself, and one carrying a cord.
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

/**
 * And the third: a hand on a **cord, a string or a rope**.
 *
 * Only the pilot's, because all three handles are — the navigator carries both
 * colours and fires (`render/handles.ts`) — and only while the world says a
 * hand is actually on one. That is the whole placement rule: the simulation
 * knows which handle is held, and each of the three already has one function
 * saying where its resting circle is, which is the same one a real thumb is
 * hit-tested against. So the ghost hand cannot be drawn on a handle the finger
 * would have missed.
 *
 * **And it rides what it is holding.** `handleCircle` answers where a handle is
 * *standing* rather than where it rests, so a thumb is never left behind by
 * the cord in it — a hand drawn at the rest while the handle swings away is a
 * hand that has visibly let go. The resting circles are still what a real
 * finger is hit-tested against; that is a different question and `handles.ts`
 * answers both.
 */
export function handleThumb(
  l: Layout,
  world: World,
  seat: 1 | 2,
  beatPhase: number,
): { x: number; y: number; r: number } | null {
  if (seat !== 1) return null;
  const lid = world.creatures.find((c) => c.kind === "lid" && lidIsHeld(c));
  if (lid) return handleCircle(l, world, "lidString", beatPhase, lid.col);
  if (world.boss?.kind === "maze" && world.boss.dragging) {
    return handleCircle(l, world, "mazeString", beatPhase);
  }
  if (world.boss?.kind === "warden" && world.boss.pulling) {
    return handleCircle(l, world, "wardenTether", beatPhase);
  }
  return null;
}
