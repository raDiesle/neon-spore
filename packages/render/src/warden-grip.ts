import {
  type Creature,
  type SimConfig,
  type WardenState,
  type World,
  wardenPhase,
  wardenThrown,
} from "@neon-spore/sim";
import { drawGripDial, drawGripRing } from "./grip-rings.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import type { ViewRole } from "./view-role.js";
import { wardenEyeCircle } from "./warden.js";

/**
 * **THE WARDEN's eye as a control**, for the two gestures that ask a thumb for
 * it after the rope (`sim/warden-hand.ts`): player 2's thumb resting on the
 * eye under NARROW, which parts the lids and pins the pupil, and player 1's
 * swipe across the hatch under GLARE, which throws it open for
 * `wardenThrowBeats` and then lets it slam. One circle, and the phase and the
 * seat say which of the two a press is: the rope's handle hangs a row below
 * (`tether.ts`), so nothing here is under it.
 *
 * The circle is the eye **at rest**, shut, where it stands this beat — not
 * the hatch as it has come open, which swells with the pull and would be a
 * control you could only grab once your partner had done their half. The
 * pupil walks a column a beat under WATCH and NARROW; the thumb is asked to
 * land where it is *now*, the way the rope's handle is (`handles.ts`), and
 * once it is down the pupil stops under it.
 *
 * What is drawn is read off the world every frame and nothing is kept: under
 * NARROW a ring on the eye on the navigator's screen, breathing until her
 * thumb lands and filled while the sim has it (`eyeHeld`); under GLARE a ring
 * on the hatch on the pilot's screen until his swipe throws it, and then the
 * window's dial round the eye on **both** screens, because three beats is
 * *our* count — the shot has to go inside it. The other seat's thumb is never
 * drawn as a thumb: the pilot sees the lids part, the navigator sees the
 * hatch fly open, and each is what the partner's hand *does*. That is the
 * split. The word for each is the cue's (`boss-cue-read-f.ts`), never a
 * second voice here.
 */

/** The ring, inside the hatch: on the eye, not round the hole. */
const RING_MUL = 0.5;

/** The eye, shut, where the pupil stands: what a thumb is asked to land on. */
export function wardenGripCircle(l: Layout, body: Creature, b: WardenState): Circle {
  return wardenEyeCircle(l, body, b, 0);
}

/** Which of the two hands this seat's press on the eye is, under this phase. */
function wardenGripTarget(b: WardenState, seat: 1 | 2): "wardenEye" | "wardenHatch" | null {
  const asks = wardenPhase(b.plates).asks;
  if (asks === "hold" && seat === 2) return "wardenEye";
  if (asks === "throw" && seat === 1) return "wardenHatch";
  return null;
}

/**
 * A press on the eye: `wardenEye` is a hold whose lift lets go; `wardenHatch`
 * is a swipe whose **lift** is the gesture, carrying how far the thumb went
 * (`touch.ts` reads the travel off the hold's origin, as THE MIRROR's does).
 */
export function wardenGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "warden");
  if (b === null) return null;
  const target = wardenGripTarget(b, field.seat);
  if (target === null) return null;
  const body = field.creatures.find((c) => c.id === b.creatureId);
  if (body === undefined || !hitCircle(wardenGripCircle(l, body, b), x, y)) return null;
  return {
    player: field.seat,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: field.seat, originX: x, originY: y },
  };
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * The ring and the dial, drawn after the rope so they stand over it. Read
 * off the world and this screen's role, nothing else — a frame test sets the
 * world and gets the picture.
 */
export function drawWardenGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  world: World,
  body: Creature,
  b: WardenState,
  role: ViewRole,
  beatPhase: number,
  time: number,
): void {
  const asks = wardenPhase(b.plates).asks;
  if (asks === "pull") return;
  const c = wardenGripCircle(l, body, b);
  const r = c.r * RING_MUL;
  if (asks === "hold") {
    if (role !== "p1") drawGripRing(ctx, c.x, c.y, r, b.eyeHeld, time);
    return;
  }
  if (!wardenThrown(world, b)) {
    if (role !== "p2") drawGripRing(ctx, c.x, c.y, r, false, time);
    return;
  }
  // The window, off the same beat `wardenThrown` read: the dial and the door agree.
  const gone = (world.beat - b.throwBeat + beatPhase) / cfg.wardenThrowBeats;
  drawGripDial(ctx, c.x, c.y, r, 1 - clamp01(gone));
}
