import { emblem } from "./action-face.js";
import type { BossCue } from "./boss-cue-shape.js";
import { drawHoldMark, HOLD_MARK_R } from "./hold-mark.js";
import { drawInstarCrosshair } from "./instar-crosshair.js";
import { PALETTE } from "./palette.js";
import { drawRubMark } from "./rub-mark.js";
import { P1_SKIN, type SeatSkin } from "./seat-skin.js";

/**
 * **The helper a cue's word wears on the field**, the same on every boss —
 * the owner, 29 September 2026, for all of them: *shooting with cannon should
 * have clear aim target (check "the instar") … and also good to have a
 * specific helper symbol scanner box for shield and suck.* THE INSTAR drew
 * these first on its own rings (`instar-glyphs.ts`, `instar-crosshair.ts`);
 * this is them for a `BossCue`, called from the one place every boss's cue is
 * drawn (`boss-cue-draw.ts`), so no boss draws its own.
 *
 * - **`FIRE`, `SHOOT`**: THE INSTAR's crosshair **on what the shot is for**,
 *   `BossCue.aim`, **in red, with the word and its scan box moved there**.
 *   A reading may stand the word on the cannon's column at the hull, where
 *   the thumb goes; it is drawn on the target instead (`cueDrawnAt`) — the
 *   owner, 3 October 2026: *the aim in the middle to shoot with cannon
 *   helper must be also in a cool red, not white. and the helper of text
 *   with the box should be moved from cannon to the enemy only where to
 *   shoot - that is enough.* A word standing off the hull already stands on
 *   its target (THE WARDEN's eye, THE BATON's bead), and is its own aim
 *   (`cueAim`); one at the hull with no `aim` stays there and draws no
 *   crosshair, and `test/cue-aim.test.ts` lists the bosses still owed one.
 *   The red is the red of every mark asking a thumb (`hold-mark.ts`), the
 *   owner's call over #34's *never an ammunition colour*: the colour the
 *   bolt wants is still never named.
 * - **`SHIELD`, `SUCK`**: the panel's own button face inside the scanner
 *   box (`action-face.ts`), the ward for one and the throat for the other —
 *   the button under the thumb, shown where the field wants it pressed.
 * - **`HOLD`**: a red circle with a thumbprint in it (`hold-mark.ts`), and
 *   **no scanner box** — the owner, 2 October 2026: *i expect some red circle
 *   like, no scan rectangle box*. The circle is the frame there, as the
 *   crosshair is a shot's (`holdIsHere`).
 * - **`RUB`**: a red line with an arrow sliding in at it from each side
 *   (`rub-mark.ts`), and no scanner box either — the owner, 3 October 2026,
 *   on THE GRINDSTONE. The line is as long as the cue's `rubHalf` says.
 *
 * Pulls are not here: a pull is a handle, and its arrow is the knob's
 * (`pull-knob.ts`, `way-arrow.ts`).
 */

export type CueHelper = "aim" | "guard" | "intake" | "hold" | "rub";

/** Which helper a word asks for, by its first word: `FIRE ON ZERO` still fires. */
export function cueHelper(word: string): CueHelper | null {
  const verb = word.split(" ")[0];
  if (verb === "FIRE" || verb === "SHOOT") return "aim";
  if (verb === "SHIELD") return "guard";
  if (verb === "SUCK") return "intake";
  if (verb === "HOLD") return "hold";
  if (verb === "RUB") return "rub";
  return null;
}

/** The crosshair's ring, in the cue frame's shorter half-extent. */
const AIM_R = 0.55;
/** The button face, in the same. */
const FACE_R = 0.62;

/**
 * Where a shot cue's crosshair stands: its `aim`, or its own place when the
 * word stands off the hull — `null` for a word that asks no shot, or waits at
 * the hull for its boss to say what it is aimed at.
 */
export function cueAim(cue: BossCue, hullY: number): { x: number; y: number; r?: number } | null {
  if (cueHelper(cue.word) !== "aim") return null;
  if (cue.aim !== undefined) return cue.aim;
  return Math.abs(cue.y - hullY) > cue.halfH ? { x: cue.x, y: cue.y } : null;
}

/** How far the crosshair's ticks reach, in its ring's radius (`instar-crosshair.ts`). */
const AIM_TICKS = 1.75;
/** Room between the ticks' ends and the scan box, in the ring's radius. */
const AIM_ROOM = 0.15;
/** How far the shipped crosshair reaches, ticks and room, in its ring's radius. */
const CROSSHAIR_REACH = AIM_TICKS + AIM_ROOM;

/**
 * **Where a cue is drawn**: its own place, or — for a shot with an `aim` —
 * the target, the box grown to hold the crosshair. The reading's lines about
 * clearing the hull (`roomBelow`, `wordFloor`) were written for the place it
 * left, so they are left behind with it.
 *
 * A shot that is its own aim keeps the reading's frame, pushed out only by how
 * much further `AIM_LOOK` reaches than the crosshair shipped with — nothing,
 * until a look that reaches further is taken.
 */
export function cueDrawnAt(cue: BossCue, hullY: number): BossCue {
  if (cueHelper(cue.word) !== "aim") return cue;
  if (cue.aim === undefined) {
    const own = cueAim(cue, hullY);
    if (own === null) return cue;
    // The ring is pinned to the reading's frame, or it would grow with it.
    const r = aimR(cue, own);
    const more = r * (AIM_LOOK.reach - CROSSHAIR_REACH);
    if (more <= 0) return cue;
    return { ...cue, halfW: cue.halfW + more, halfH: cue.halfH + more, aim: { ...own, r } };
  }
  const { x, y } = cue.aim;
  const reach = aimR(cue, cue.aim) * AIM_LOOK.reach;
  const halfW = Math.max(cue.halfW, reach);
  const halfH = Math.max(cue.halfH, reach);
  const { roomBelow: _below, wordFloor: _floor, ...rest } = cue;
  return { ...rest, x, y, halfW, halfH };
}

/** The crosshair's ring for this cue: the aim's own, or one sized by the frame. */
function aimR(cue: BossCue, aim: { r?: number }): number {
  return aim.r ?? Math.min(cue.halfW, cue.halfH) * AIM_R;
}

/**
 * **How a shot's aim is laid on its target**, and whether the cue's scan box
 * stands round it. Swapped by VERSUS (`aim:cannon`), which asks whether the
 * crosshair should wear the cannon's colour: `skin` is this screen's seat, so
 * `skin.tint` is the exact colour the cannon and its column are drawn in here
 * (`cannon-column.ts`). `from` is the cannon's muzzle, for a look that joins
 * the two. `reach` is how far the look stands out from its target, in the
 * ring's radius: the box and the word are hung off it (`cueDrawnAt`).
 */
export const AIM_LOOK: {
  paint: (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    k: number,
    time: number,
    skin: SeatSkin,
    from: { x: number; y: number },
  ) => void;
  boxed: boolean;
  reach: number;
} = {
  paint: (ctx, x, y, r, k) => drawInstarCrosshair(ctx, x, y, r, true, k, "red"),
  boxed: true,
  reach: CROSSHAIR_REACH,
};

/** Whether the scan box stands round this cue: not where `AIM_LOOK` draws its own frame. */
export function cueBoxed(cue: BossCue, hullY: number): boolean {
  return AIM_LOOK.boxed || cueAim(cue, hullY) === null;
}

/** Whether the cue wears a mark of its own that stands in the scan frame's place: a hold's circle or a rub's line. */
export function markIsHere(cue: BossCue): boolean {
  const helper = cueHelper(cue.word);
  return helper === "hold" || helper === "rub";
}

export function drawCueHelper(
  ctx: CanvasRenderingContext2D,
  cue: BossCue,
  hullY: number,
  time: number,
  skin: SeatSkin = P1_SKIN,
  from: { x: number; y: number } = { x: cue.x, y: hullY },
): void {
  const helper = cueHelper(cue.word);
  if (helper === null) return;
  const short = Math.min(cue.halfW, cue.halfH);
  // The same breath as the word (`boss-cue-text.ts`), a little brighter: the
  // helper is the picture of the instruction, and the word its caption.
  const breath = 0.7 + 0.25 * ((Math.sin(time * 4.4) + 1) / 2);
  if (helper === "aim") {
    const aim = cueAim(cue, hullY);
    if (aim === null) return;
    AIM_LOOK.paint(ctx, aim.x, aim.y, aimR(cue, aim), breath, time, skin, from);
    return;
  }
  if (helper === "hold") {
    drawHoldMark(ctx, cue.x, cue.y, short * HOLD_MARK_R, time);
    return;
  }
  if (helper === "rub") {
    drawRubMark(ctx, cue.x, cue.y, cue.rubHalf ?? cue.halfH, time);
    return;
  }
  ctx.save();
  ctx.globalAlpha = breath;
  emblem(ctx, cue.x, cue.y, short * FACE_R, PALETTE.text, helper);
  ctx.restore();
}
