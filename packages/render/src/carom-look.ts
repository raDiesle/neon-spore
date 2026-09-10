import { capsule } from "./carom-capsule.js";

/**
 * THE ONE RECORD A CANDIDATE **CAROM** CRUST PATCHES.
 *
 * `crawler-look.ts`'s kind and the same reasons: a record rather than two
 * named functions, so a candidate look is a field patched onto a live export
 * for the length of one `draw()` and the call site never learns anything about
 * it (`docs/versus.md`). A file of its own rather than the bottom of
 * `carom.ts`, because the record needs the paint and a candidate needs the
 * record — a record sitting beside the paint would make every reader import
 * the paint to reach it.
 *
 * **Two fields, and together they are one question.** THE CAROM is the only
 * body in this game that is somewhere else before anybody has finished saying
 * where it was: three lanes a beat, turning at the walls, all the way down. So
 * the question the pair is being asked is *does this read as a solid thing
 * travelling, or as a sprite being moved* — and that is two halves. `shell` is
 * the solid: the rock's own face, and whether a light on it says stone. And
 * `travel` is the travelling: whatever the crossing leaves in the frame, which
 * ships as a flat wedge of the body's colour and is the one part of this
 * picture that has never been anything but a gradient.
 *
 * **The window is not in the record and is not in the question.** `drawWindow`
 * is drawn by `carom.ts` between the two, unpatched, on both sides of any
 * pair: the porthole is what the pair reads a *colour* through, and a slot
 * that moved it would be asking two questions at once. A candidate that wants
 * a differently-lit bezel is a second slot, later.
 *
 * **The shipped crust is a rescue capsule since 10 September 2026.** The
 * rolling stone that shipped before it — `crystalPath` filled flat and lit by
 * one gradient — went when the owner took FACET and asked for it as a capsule;
 * `carom-capsule.ts` is the answer he picked of the three offered, on
 * `carom-facet.ts`. The streak is still the code `carom.ts` carried inline.
 */

/**
 * Everything the crust is drawn from, in the body's own translated frame — the
 * caller has already put the origin on the rock, so every field here is a
 * length or a colour and none of them is a place on the field.
 */
export interface CrustDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** The rock's drawn radius, depth-scaled. */
  readonly r: number;
  /** The window's radius: the disc `carom.ts` leaves unpainted so the living
   * body underneath shows through. A shell that fills over it hides the one
   * thing the pair has to name a colour for. */
  readonly glass: number;
  /** Which way it is crossing — +1 right, −1 left. `caromHeading`'s answer,
   * read off the world, so a picture and the next beat can never point
   * opposite ways. */
  readonly dir: number;
  /** How far round the stone has rolled on this frame, in radians. The
   * capsule ignores it — its nose is on its heading — and a rolling look
   * reads it. */
  readonly turn: number;
  /** Seconds on the wall clock, for a facet that has its own gutter. */
  readonly time: number;
  /** The rock's mid-tone, hazed for distance already. */
  readonly metal: string;
  /** The body's colour and its rim, hazed — what is burning through the
   * glass, and the only colour on this drawing that is the creature's own. */
  readonly glow: string;
  readonly rim: string;
  /** Where the body is on the field, in the same pixels the context has
   * been translated to — for a look whose turn follows the distance it has
   * travelled rather than the clock, so it turns back at the wall because
   * the heading does. Not read by the capsule. */
  readonly x: number;
  readonly y: number;
  /** This body's own phase, from its id, so two caroms are never one drawing
   * done twice; `turn` already carries it plus the clock's drift. */
  readonly phase: number;
  /** The rock's own dark and the ember a heated one glows, hazed the same —
   * the capsule scorches its shield with the ember. */
  readonly dark: string;
  readonly ember: string;
  /** Where in the beat this frame falls, 0 at the beat and 1 just before the
   * next — the capsule's beacon flashes on it. */
  readonly beat: number;
}

/** How far the streak reaches behind it, in rock radii. Two: about half a lane
 * at the top of the field and most of one at the bottom, which is the distance
 * that reads as speed without reaching into the column next door. */
export const TRAIL_MUL = 2.0;
/** How much of the trail's own colour survives where it leaves the rock. */
const TRAIL_ALPHA = 0.5;

/**
 * The wedge dragged behind it as it ships: widest at the rock, gone by the far
 * end, and pointing the way `caromHeading` says the body is going. Drawn in the
 * body's own colour rather than in rock, because what the streak is saying is
 * *this one is alive and it is already past you*.
 */
export function wedge(d: CrustDraw): void {
  const { ctx, r, dir, glow } = d;
  const back = -dir * r * TRAIL_MUL;
  const tip = -r * TRAIL_MUL * 0.5;
  // Along the wedge rather than across it: a gradient running the other way
  // samples the transparent end everywhere and draws nothing at all.
  const grad = ctx.createLinearGradient(0, 0, back, tip);
  grad.addColorStop(0, glow);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = TRAIL_ALPHA;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.lineTo(0, r * 0.7);
  // Behind and *above*: the body is falling as well as crossing, so a streak
  // laid flat along the row would describe a different creature. The wedge
  // leans back up the diagonal the simulation actually walked it down.
  ctx.lineTo(back, tip);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

export interface CaromLook {
  /** The rock's face, drawn in the upright frame and turning itself. It must
   * leave the window's disc unpainted — the body under it is what the pair
   * calls a colour for. */
  shell(d: CrustDraw): void;
  /** What the crossing leaves in the frame, drawn under the shell. */
  travel(d: CrustDraw): void;
}

/** The shipped crust: a rescue capsule cut from FACET's faces, nose along its
 * heading, dragging a wedge of the body's own colour behind it (`carom-capsule.ts`). */
export const CAROM_LOOK: CaromLook = { shell: capsule, travel: wedge };
