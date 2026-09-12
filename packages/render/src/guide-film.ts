import type { ControlSet, GuideScene } from "@neon-spore/content";
import type { SceneRun, SimConfig } from "@neon-spore/sim";
import { drawGripThumb, fieldThumb, gripThumb, handleThumb, tapThumb } from "./guide-hand.js";
import { NAV_H } from "./guide-nav.js";
import { drawGhostThumb, thumbAnchors } from "./guide-thumb.js";
import { computeLayout, computeStage, type Layout, type Stage, type ViewRole } from "./layout.js";

/**
 * Two pieces of the rehearsal's picture that `guide-scene.ts` lays out and
 * does not draw itself: where the film stands, and the hands on it. Split out
 * when that file reached the length ceiling.
 */

/**
 * Where the film stands on the stage it is given, and the layout inside it.
 *
 * The stage minus the nav bar: the film is a whole phone screen, and BACK,
 * the page number and NEXT get their own band under it rather than sitting on
 * the one the film is teaching.
 *
 * And a phone screen is *phone-shaped*: the film is stood in the rectangle the
 * game itself would take on this stage (`computeStage`), for the seat it is
 * showing, and centred. Laid out across the whole box instead, a stage wider
 * than the film's own columns — the director's, whose TEST stage is cut for a
 * taller band, or any viewer squarer than a phone — showed the field short of
 * the box on both sides, with the hull clipped to the field and the band
 * running on under it: the ship's skin cut off square at top-left and
 * top-right (the owner, 12 September 2026). On a phone the box is the phone
 * and the rectangle is the box, less the nav bar's height.
 */
export function filmLayout(box: Layout, cfg: SimConfig, seat: 1 | 2): { film: Stage; l: Layout } {
  const role = seatRole(seat);
  const film = computeStage(
    { width: box.width, height: Math.max(1, box.height - NAV_H), dpr: 1 },
    cfg,
    role,
  );
  return { film, l: computeLayout({ width: film.width, height: film.height, dpr: 1 }, cfg, role) };
}

export function seatRole(seat: 1 | 2): ViewRole {
  return seat === 1 ? "p1" : "p2";
}

/**
 * The hands: the ghost thumb the script places, and the four read off the
 * world — a grip, a press on the ship, a hand on a cord and a thumb on a box.
 */
export function drawHands(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  run: SceneRun,
  scene: GuideScene,
  set: ControlSet,
  seat: 1 | 2,
  phase: number,
): void {
  drawGhostThumb(ctx, thumbAnchors(scene, set, l, run.world), run.tick, l.lobeR, seat);
  // And the other hand, if this seat has one on the field. It is drawn from
  // the world rather than from the script, so it rides the body it is
  // slowing (`guide-thumb.ts`).
  const held = gripThumb(l, run.world, seat, phase);
  if (held) drawGripThumb(ctx, held, l.lobeR);
  // And the hand on the ship, for a film about reaching a control the other
  // way (`SceneAct.onField`).
  const onShip = fieldThumb(l, run.world, scene, run.tick, seat);
  if (onShip) drawGripThumb(ctx, { ...onShip, r: l.lobeR }, l.lobeR * (onShip.press ? 0.86 : 1));
  // And the hand carrying a cord, a string or a rope (`SceneAct.drag`). Read
  // off the world like the other two, so it rides a handle that is falling.
  const onCord = handleThumb(l, run.world, seat, phase);
  if (onCord) drawGripThumb(ctx, onCord, l.lobeR);
  // And the thumb on a box (`SceneAct.tap`), placed off the world like the
  // three above it so it lands on the body the command lands on.
  const onBox = tapThumb(l, run.world, scene, run.tick, seat, phase);
  if (onBox) drawGripThumb(ctx, onBox, l.lobeR);
}
