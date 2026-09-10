import { crystalPath, LIGHT_HALF, METEOR } from "@neon-spore/content";
import { litRound } from "./key-light.js";
import { STROKE } from "./palette.js";

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
 * **The shipped pair came through here with not one pixel moved.** Both
 * functions are the code `carom.ts` carried inline, with the arguments
 * gathered into a record and nothing else touched.
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
  /** How far round the stone has rolled on this frame, in radians. */
  readonly turn: number;
  /** Seconds on the wall clock, for a facet that has its own gutter. */
  readonly time: number;
  /** The rock's mid-tone, hazed for distance already. */
  readonly metal: string;
  /** The body's colour and its rim, hazed — what is burning through the
   * glass, and the only colour on this drawing that is the creature's own. */
  readonly glow: string;
  readonly rim: string;
}

/** The unlit mid-tone a meteor is filled with before the key touches it.
 * `meteor.ts`'s own fill, so the rock a cracked carom becomes is the identical
 * drawing with the window closed up. */
const STONE_FILL = "#8A8F9C";

/** How far the streak reaches behind it, in rock radii. Two: about half a lane
 * at the top of the field and most of one at the bottom, which is the distance
 * that reads as speed without reaching into the column next door. */
const TRAIL_MUL = 2.0;
/** How much of the trail's own colour survives where it leaves the rock. */
const TRAIL_ALPHA = 0.5;

/**
 * The rock as it ships: `crystalPath` at the full `METEOR` parameters with the
 * window's disc added to it, filled `evenodd` so the hole is never painted at
 * all, lit by the key and outlined in the metal.
 *
 * The whole path is drawn inside the *turned* frame and the circle is added
 * there too, which is right rather than convenient: a circle about the origin
 * is the same circle whichever way the frame is turned, so the stone rolls
 * while the window stays where the eye left it.
 */
export function stone(d: CrustDraw): void {
  const { ctx, r, glass, turn, time, metal } = d;
  const shell = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, time * 0.15, METEOR.seed),
  );
  const hole = new Path2D();
  hole.arc(0, 0, glass, 0, Math.PI * 2);
  shell.addPath(hole);

  ctx.save();
  ctx.rotate(turn);
  ctx.fillStyle = STONE_FILL;
  ctx.fill(shell, "evenodd");
  ctx.save();
  ctx.clip(shell, "evenodd");
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(shell);
  ctx.restore();
}

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

/** The shipped crust: a lit crystal with a hole in it, dragging a wedge of the
 * body's own colour behind it along the heading. */
export const CAROM_LOOK: CaromLook = { shell: stone, travel: wedge };
