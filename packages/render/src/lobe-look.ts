import { drawLobeGloss, drawLobeSocket } from "./lobe-shell.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * WHAT A BUTTON STANDS IN AND SHINES WITH, AS A RECORD.
 *
 * `drawLobe` called `drawLobeSocket` under a button's face and `drawLobeGloss`
 * over it, by name. The face — the creature inside a fire button, the arrows,
 * a guard's ring — is the control's own and says *which control*; the socket
 * and the gloss are the *panel's*, and say what the button is set into. That
 * second half had nowhere for a second answer to sit, so a candidate panel
 * that grew its buttons as pores in the flesh rather than lobes in wet
 * sockets could not be drawn. Lifted out on 10 September 2026 with
 * `panel-plan.ts` and `strip-look.ts`.
 *
 * The menu's and the guide's buttons (`nav-button.ts`, `guide-switch.ts`)
 * keep calling the shipped sprites directly: they are not on the panel and
 * must not change with it.
 */

export interface LobeDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly dpr: number;
  readonly skin: SeatSkin;
}

export interface LobeLook {
  /** Under the face: what the button is set into. */
  socket(d: LobeDraw): void;
  /** Over the face: the wet highlight. */
  gloss(d: LobeDraw): void;
}

/** The shipped look: a wet depression with a rim of its own, and a gloss. */
export const LOBE_LOOK: LobeLook = {
  socket: (d) => drawLobeSocket(d.ctx, d.x, d.y, d.r, d.dpr, d.skin.lip),
  gloss: (d) => drawLobeGloss(d.ctx, d.x, d.y, d.r, d.dpr),
};
