import { emblem } from "./action-face.js";
import type { BossCue } from "./boss-cue-shape.js";
import { drawInstarCrosshair } from "./instar-crosshair.js";
import { PALETTE } from "./palette.js";

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
 *   `BossCue.aim`. The word may stand on the cannon's column at the hull —
 *   where the thumb goes — and the crosshair stands on the part the bolt
 *   must reach, so the pair can see what is being aimed at. A word standing
 *   off the hull already stands on its target (THE WARDEN's eye, THE
 *   BATON's bead), and is its own aim (`cueAim`); one at the hull with no
 *   `aim` draws no crosshair, and `test/cue-aim.test.ts` lists the bosses
 *   still owed one. Never in an ammunition colour (#34): the colour is the
 *   pair's to work out.
 * - **`SHIELD`, `SUCK`**: the panel's own button face inside the scanner
 *   box (`action-face.ts`), the ward for one and the throat for the other —
 *   the button under the thumb, shown where the field wants it pressed.
 *
 * Pulls are not here: a pull is a handle, and its arrow is the knob's
 * (`pull-knob.ts`, `way-arrow.ts`).
 */

export type CueHelper = "aim" | "guard" | "intake";

/** Which helper a word asks for, by its first word: `FIRE ON ZERO` still fires. */
export function cueHelper(word: string): CueHelper | null {
  const verb = word.split(" ")[0];
  if (verb === "FIRE" || verb === "SHOOT") return "aim";
  if (verb === "SHIELD") return "guard";
  if (verb === "SUCK") return "intake";
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

/**
 * Whether the crosshair stands on the cue's own place, so it *is* the scan
 * frame there and the frame is not drawn round it a second time.
 */
export function aimIsHere(cue: BossCue, hullY: number): boolean {
  const aim = cueAim(cue, hullY);
  if (aim === null) return false;
  return Math.abs(aim.x - cue.x) <= cue.halfW && Math.abs(aim.y - cue.y) <= cue.halfH;
}

export function drawCueHelper(
  ctx: CanvasRenderingContext2D,
  cue: BossCue,
  hullY: number,
  time: number,
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
    drawInstarCrosshair(ctx, aim.x, aim.y, aim.r ?? short * AIM_R, true, breath);
    return;
  }
  ctx.save();
  ctx.globalAlpha = breath;
  emblem(ctx, cue.x, cue.y, short * FACE_R, PALETTE.text, helper);
  ctx.restore();
}
