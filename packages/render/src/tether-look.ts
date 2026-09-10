import { circleSubpath, openSmoothPath } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { handleSag } from "./handle-draw.js";
import { STROKE } from "./palette.js";

/**
 * THE ONE RECORD A CANDIDATE **TETHER** LOOK PATCHES.
 *
 * `coil-look.ts`'s kind and the same reasons: a record rather than two named
 * functions, so a candidate look is a field patched onto a live export for the
 * length of one `draw()` and `tether.ts` never learns anything about it
 * (`docs/versus.md`).
 *
 * **Two fields, and what is left out of them.** THE WARDEN's rope is the
 * game's first open contour — a line with two ends — and it is drawn as one
 * stroke of one width, which is the picture a rope has when nothing is telling
 * the eye it is round. `rope` is that line, from where it leaves the eye to
 * where the hand has it; `root` is where it comes out of the boss. The handle
 * on the end is **not** here: `drawHandleRing` is shared with THE LID's cord
 * and the balloon strings, so a look for it would be a look for three controls
 * at once and a vote nobody could cast on one (`handle-draw.ts`).
 *
 * **The rule that binds every candidate.** The rope is its own gauge — there
 * is no widget anywhere saying how far the pull has got — so whatever a look
 * draws has to change *continuously* with `pull`, from slack to taut, because
 * the player who is not holding it reads the tension off the line alone
 * (`sim/handle-pull.ts` on why nothing may ease it).
 *
 * **The shipped pair came through here with not one pixel moved.** `rope` is
 * the sag and the stroke `drawTether` carried inline, and `root` is its
 * `drawAnchor`, each with the arguments gathered into a record.
 */

/**
 * Everything the line is drawn from, in field pixels — a rope runs between two
 * places, so unlike a crust nothing here is about an origin.
 */
export interface TetherDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** Where it leaves the boss: the underside of the eye (`wardenRopeAnchor`). */
  readonly anchor: { readonly x: number; readonly y: number };
  /** Where the hand has it: the handle's centre. */
  readonly head: { readonly x: number; readonly y: number };
  /** Whether a hand is on it at all. */
  readonly held: boolean;
  /** How taut, 0 slack and 1 fully pulled — the number the hatch opens by. */
  readonly pull: number;
  /** Seconds on the wall clock, for the slack wave and the tremble. */
  readonly time: number;
  readonly tile: number;
  /** The colour the warden's cycle is on, and its rim. */
  readonly hex: string;
  readonly rim: string;
}

/**
 * The line as it ships. Under tension the rope goes thin and bright from the
 * rim down; slack, it hangs with a slow wave travelling down it.
 */
export function line(d: TetherDraw): void {
  const { ctx, anchor, head, held, pull, time, hex, rim } = d;
  const sag = handleSag({
    anchor,
    head,
    held,
    pull,
    time,
    segments: 14,
    waveHeld: 1.2,
    waveSlack: 3.5,
  });
  const path = new Path2D(openSmoothPath(sag));
  strokeGlow(ctx, path, held ? rim : hex, STROKE.outline * (1 - pull * 0.35), 0.5 + pull * 1.5);
}

/** Where it comes out of the rim as it ships: a dot, brightening and growing
 * as the tension takes. */
export function knot(d: TetherDraw): void {
  const { ctx, anchor, hex, rim, pull } = d;
  const p = new Path2D(circleSubpath(anchor.x, anchor.y, 3 + pull * 4));
  ctx.save();
  ctx.fillStyle = pull > 0 ? rim : hex;
  ctx.globalAlpha = 0.5 + pull * 0.5;
  ctx.fill(p);
  ctx.restore();
}

export interface TetherLook {
  /** The line between the eye and the hand, drawn first. */
  rope(d: TetherDraw): void;
  /** Where the line leaves the boss, drawn over it. */
  root(d: TetherDraw): void;
}

/** The shipped rope: one glowing stroke that thins and brightens as it is
 * pulled, from a dot on the eye's underside. */
export const TETHER_LOOK: TetherLook = { rope: line, root: knot };
