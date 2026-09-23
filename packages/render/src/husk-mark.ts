import type { Pod, World } from "@neon-spore/sim";
import { HUSK_LOOK } from "./husk-look.js";
import type { Layout } from "./layout.js";
import { podCenter } from "./pods.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * **The frame player 2 sees around a husk, and player 1 never does.**
 *
 * The pod underneath is drawn by `pods.ts` identically on both screens — the
 * same amber, the same contour, the same beating core, the same glyph saying
 * which cargo it claims. That is the creature: up to the mouth a husk *is* a
 * pod, and the only thing in the game that says otherwise is this file, drawn
 * on one device.
 *
 * **It is `lure-alarm.ts`'s frame on purpose, and that is the one decision
 * here worth arguing.** That file says at length that two alarms which look
 * alike are worse than one alarm that is ugly, and it is right — about two
 * markings that mean *different* things. This means the same thing: a white
 * frame round something on the field is *leave that one alone*, and the pair
 * has already learnt it on THE LURE. A second picture for one idea is the
 * mistake the lure's own ring was taken out for.
 *
 * What differs is the words, because what the pair must not do differs: a lure
 * must not be shot, and a husk may be shot all day — it is the *maw* that has
 * to stay shut. `DO NOT TAKE` and not the lure's `IGNORE`, and the two are never on
 * screen together, since a lure is a creature and a husk is a pod.
 *
 * Its own file rather than a branch inside `pods.ts` for the reason
 * `lure-alarm.ts` is beside `creatures.ts`: nothing that draws a body should
 * have to know which seat it is running on.
 *
 * **And it is one of two answers.** `husk-look.ts` is the record a candidate
 * offers the other through: a body that carries the tell itself, with this
 * frame turned off (`HUSK_LOOK.marked`). The shipped look is this file.
 */

/** The colour of *leave that one alone*, shared with `lure-alarm.ts` by being
 * written out twice — it is the absence of a palette entry rather than one. */
const ALARM = "#FFFFFF";

/** How far outside the pod's own radius the frame stands. Wider than the
 * lure's, because a pod is a small round thing with a wide halo and a frame at
 * the lure's 1.55 would sit inside the glow the pod is already throwing. */
const BOX_MUL = 2.1;

/** What to do about it, in the fewest words that are still an instruction. */
const LABEL = "DO NOT TAKE";

/** Every husk on the field. Exported so anything else that has to ask asks it
 * once, the way `lures` is. */
export function husks(world: World): Pod[] {
  return world.pods.filter((p) => p.husk);
}

/**
 * Whether this screen carries the mark. `p1` never does — that is the whole
 * creature — and `test` does, because it is both halves at once on one screen
 * and a rig that hid half the picture would be no rig.
 */
export function showsHuskMark(l: Layout): boolean {
  return l.role !== "p1";
}

export function drawHuskMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  /** The wall clock, for the lock's flicker (`target-lock.ts`). */
  time: number,
  /** A picture of the body rather than of the screen it is on
   * (`ViewState.bare`): the frame is on the pod and stays, the words are laid
   * out against the screen's own edge and arrive torn in half in a crop. */
  bare = false,
): void {
  if (!showsHuskMark(l) || !HUSK_LOOK.marked) return;
  for (const p of husks(world)) {
    const { x, y, r } = podCenter(l, p);
    const half = r * BOX_MUL;
    drawTargetLock(ctx, x, y, half, half, ALARM, time, 0.95, p.id);
    if (bare) continue;
    ctx.save();
    ctx.fillStyle = ALARM;
    drawLabel(ctx, l, x, y, half);
    ctx.restore();
  }
}

/** The words, on whichever side keeps them on the screen — a husk in the first
 * or last column would otherwise have half its label off the edge, and half a
 * label is one the pair has to lean in for at the moment there is no time. */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  half: number,
): void {
  ctx.font = '600 9px "Courier New",monospace';
  ctx.textBaseline = "middle";
  const width = ctx.measureText(LABEL).width;
  const gap = half + 6;
  const right = x + gap + width <= l.width - 4;
  ctx.textAlign = right ? "left" : "right";
  ctx.globalAlpha = 0.92;
  ctx.fillText(LABEL, right ? x + gap : x - gap, y);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}
