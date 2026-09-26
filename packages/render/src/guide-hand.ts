import { actCol, control, type GuideScene } from "@neon-spore/content";
import { type Creature, gripsCreature, lidIsHeld, occupiesCol, type World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import { bossThumb } from "./guide-boss-hand.js";
import { handleCircle } from "./handles.js";
import { hivePinchCircle } from "./hive-grip.js";
import { fieldX, type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { shipCircle } from "./touch-ship.js";

/**
 * The hands that are **not** on the panel: one held on something falling, one
 * pressed against the ship itself, one carrying a cord, one on a box, and one
 * on a bare square.
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
    const at = creatureCenter(l, world, c, beatPhase);
    return { x: at.x, y: at.y, r: creatureRadius(l, world, c, beatPhase) };
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

/**
 * And the fourth: a **thumb on a body**, which is the one press in this game
 * that lands on the field.
 *
 * It is placed the way the grip's is and for the same reason — the world says
 * which body is standing in the column the film named, and `creatureCenter`
 * says where that body is being drawn, so the thumb lands on the box rather
 * than at a place an author guessed. The difference from the grip is only that
 * nothing is held: a tap is instant and complete on the press, so the hand is
 * on screen for the same short flight the panel's own thumb gets and then goes.
 *
 * The navigator's alone, because the gesture is (`sim/beatbox-round.ts`).
 */
export function tapThumb(
  l: Layout,
  world: World,
  scene: GuideScene,
  tick: number,
  seat: 1 | 2,
  beatPhase: number,
): { x: number; y: number; r: number } | null {
  if (seat !== 2) return null;
  for (const act of scene.acts) {
    if (!act.tap || (act.col === undefined && act.worldCol === undefined)) continue;
    if (tick < act.tick - LEAD_TICKS || tick > act.tick + TRAIL_TICKS) continue;
    // The same body the command lands on: the lowest in the column, which is
    // `sim/scene-aim.ts`' rule, asked here rather than re-derived — a thumb
    // over one box while another was tapped is exactly the drift a second copy
    // of "which body" produces.
    const col = actCol(act, world.cfg.cols);
    let on: Creature | null = null;
    for (const c of world.creatures) {
      if (!occupiesCol(c, col)) continue;
      if (!on || c.row > on.row) on = c;
    }
    if (!on) continue;
    const at = creatureCenter(l, world, on, beatPhase);
    return { x: at.x, y: at.y, r: creatureRadius(l, world, on, beatPhase) };
  }
  return null;
}

/**
 * And the fifth: a **finger on a bare square**, THE MINE's answer
 * (`sim/mine.ts`), and the one hand here that is placed from the act rather
 * than from the world.
 *
 * Every other hand on the field rides something drawn — a body, a swelling, a
 * handle — because the world knows where that thing is and the author does
 * not. This one lands where nothing is drawn, on purpose: the seat pressing is
 * the seat the body is hidden from, so there is no body on this screen to
 * place a thumb by, and the square itself is the only fact there is. So the
 * hand goes to the tile the act names, through the same `actCol` the command
 * went through, and cannot be over a square the command did not press.
 *
 * `fieldX` and not `tileCX`: a square on the field is the field's, and turns
 * with it under a fold (`field-flip.ts`). Only this seat's, and only for the
 * short flight the panel's own thumb gets, because a tap is instant.
 */
export function tileThumb(
  l: Layout,
  scene: GuideScene,
  tick: number,
  seat: 1 | 2,
): { x: number; y: number; r: number } | null {
  for (const act of scene.acts) {
    if (act.tile !== seat) continue;
    if (tick < act.tick - LEAD_TICKS || tick > act.tick + TRAIL_TICKS) continue;
    const col = actCol(act, l.cols);
    return { x: fieldX(l, col), y: tileCY(l, act.row ?? 0), r: l.tile * 0.5 };
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
 * Only the pilot's, because all but one of the handles are — the navigator
 * carries both colours and fires (`render/handles.ts`) — and only while the
 * world says a hand is actually on one. The exception is THE HIVE's lobe read
 * her way, a pinch on a swelling site (`hivePinchCircle`). That is the whole
 * placement rule: the simulation
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
  // A clock boss's handle, on either seat (`guide-boss-hand.ts`).
  const onBoss = bossThumb(l, world, seat, beatPhase);
  if (onBoss) return onBoss;
  // The navigator's one handle is THE HIVE's lobe, pinched. Her other — a
  // stuck gum — went with the sticking on 14 September 2026, and a gum is a
  // grip now (`sim/gum.ts`), which is the hand `gripThumb` draws.
  if (seat === 2) return hivePinchCircle(l, world, beatPhase);
  const lid = world.creatures.find((c) => c.kind === "lid" && lidIsHeld(c));
  if (lid) return handleCircle(l, world, "lidString", beatPhase, lid.col);
  if (world.boss?.kind === "maze" && world.boss.dragging) {
    return handleCircle(l, world, "mazeString", beatPhase);
  }
  if (world.boss?.kind === "warden" && world.boss.pulling) {
    return handleCircle(l, world, "wardenTether", beatPhase);
  }
  // THE HIVE's clenched underside, held for as long as the haul is under way.
  // What the thumb has carried is a number in the simulation and the clench
  // ends on the tick it is enough (`sim/hive-hand.ts`), so the hand appears
  // with the first thousandth and is gone on the one that lands the mass —
  // and a haul let go of half way leaves the hand where the mass stopped,
  // which is where `hive-hold.ts` is drawing the mass.
  if (world.boss?.kind === "hive" && world.boss.haulMilli > 0) {
    return handleCircle(l, world, "hiveLobe", beatPhase);
  }
  return null;
}
