import type { SimConfig } from "@neon-spore/sim";
import { CANOPY_HALF, CANOPY_LIFT, canopyPath } from "./chute-canopy.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE ONE RECORD A CANDIDATE **CHUTE** PATCHES.
 *
 * `carom-look.ts`'s kind and the same reasons, and the two are cut in one
 * sitting because they are two halves of one creature: a carom is opened and
 * what comes out of it is a chute (`sim/chute.ts`). A record rather than two
 * named functions, so a candidate look is a field patched onto a live export
 * for the length of one `draw()` and the call site never learns anything about
 * it (`docs/versus.md`).
 *
 * **Two fields, and together they are one question.** This body is the only
 * thing in the game that goes **up**, and then the only one that comes down
 * slower than a slick. Both halves are motion the pair has never seen anything
 * else do, so both are drawn as an attachment rather than as the body: `plume`
 * while it is being thrown, `canopy` once it is out. What the pair is being
 * asked is whether the thing hanging there reads as a **solid object being
 * carried** — a shell with an inside and a far wall — or as a flat shape parked
 * above another flat shape.
 *
 * **The body itself is not in the record.** `wornKind` answers slick or bulb
 * for a chute, so `creatures.ts` draws an ordinary living body in its ordinary
 * colour underneath — the same drawing it was making a moment earlier through
 * the carom's window, which is the point of the creature. A slot that repainted
 * it would be `creature:skin` again under a second name.
 *
 * **The shipped pair came through here with not one pixel moved.** Both
 * functions are the code `chute.ts` carried, with the arguments gathered into a
 * record and nothing else touched.
 */

/**
 * Everything the attachment is drawn from, in the body's own translated frame —
 * the caller has already put the origin on the body, so nothing here is a place
 * on the field.
 */
export interface ChuteDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly cfg: SimConfig;
  /** The body's drawn radius. Everything a canopy or a plume measures is in
   * these, so the assembly scales with the body down the field. */
  readonly r: number;
  /** The body's colour and its rim, hazed for distance already. */
  readonly glow: string;
  readonly rim: string;
  /** The ember a thrust burns in, hazed. */
  readonly ember: string;
  /** `nearness`, for a look that hazes a colour of its own. */
  readonly near: number;
  /** Seconds on the wall clock — the sway, the breath and the guttering. */
  readonly time: number;
  /** This body's own offset into all three, from its id, so two chutes are
   * never one drawing done twice (`restart.test.ts` is the gate). */
  readonly phase: number;
}

/** How far the whole assembly leans, in radians, at the ends of its sway. */
const SWAY = 0.16;
/** How long the plume under a climbing body reaches, in body radii. */
const PLUME = 2.4;

/**
 * The dome and its lines as they ship, leaning together about the body they
 * hang from. Rotated about the *body* and not about the canopy's own crown,
 * because that is where the weight is: a canopy pivoting on itself swings the
 * body around underneath it, which is a picture of something being shaken
 * rather than something hanging.
 */
export function membrane(d: ChuteDraw): void {
  const { ctx, cfg, r, glow, rim, near, time, phase } = d;
  ctx.save();
  ctx.rotate(Math.sin(time * 0.7 + phase) * SWAY);
  const lift = -r * CANOPY_LIFT;
  const half = r * CANOPY_HALF;

  // The dome, with its own breath — the shape `chute-cut.ts` cuts loose.
  const belly = 1 + Math.sin(time * 1.6 + phase) * 0.06;
  const dome = canopyPath(r, belly);
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.22;
  ctx.fill(dome);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(dome);

  // Four lines, evenly across the hem and gathered at the body. Four rather
  // than two, because two is a handle; and evenly rather than at the edges,
  // because the inner pair is what says the hem is being *held down* across
  // its whole width.
  ctx.beginPath();
  for (let k = 0; k < 4; k++) {
    const t = -1 + (k * 2) / 3;
    ctx.moveTo(half * t, lift + r * 0.42 * (1 - t * t));
    ctx.lineTo(0, -r * 0.45);
  }
  ctx.strokeStyle = hazed(cfg, PALETTE.dim, near);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
  ctx.restore();

  // A soft light off the underside of the canopy onto the body, so the two
  // read as one object rather than as a shape parked above another.
  halo(ctx, 0, -r * CANOPY_LIFT * 0.5, r * 1.4, glow, 0.1);
}

/**
 * The column of fire under a body still climbing, as it ships: a tapering
 * plume with a bright core, guttering on the wall clock.
 *
 * Drawn downward from the body's underside, which is the only direction it can
 * be — the thrust is what is putting the thing up the screen, and a flame that
 * pointed anywhere else would be describing a body that is falling.
 */
export function column(d: ChuteDraw): void {
  const { ctx, r, ember, time, phase } = d;
  const gutter = 1 + Math.sin(time * 22 + phase) * 0.12;
  const len = r * PLUME * gutter;
  const grad = ctx.createLinearGradient(0, r * 0.4, 0, r * 0.4 + len);
  grad.addColorStop(0, ember);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, r * 0.4);
  ctx.lineTo(r * 0.55, r * 0.4);
  ctx.lineTo(0, r * 0.4 + len);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  // The core, half the width and reaching two thirds as far — the part that is
  // white-hot rather than burning.
  ctx.beginPath();
  ctx.moveTo(-r * 0.22, r * 0.4);
  ctx.lineTo(r * 0.22, r * 0.4);
  ctx.lineTo(0, r * 0.4 + len * 0.66);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,240,214,0.75)";
  ctx.fill();
  ctx.restore();
  halo(ctx, 0, r * 0.6, r * 1.2, ember, 0.18);
}

export interface ChuteLook {
  /** What is over the body once the canopy is out and it is coming down. */
  canopy(d: ChuteDraw): void;
  /** What is under the body while it is still being thrown. */
  plume(d: ChuteDraw): void;
}

/** The shipped chute: a membrane dome on four lines, and a tapering flame. */
export const CHUTE_LOOK: ChuteLook = { canopy: membrane, plume: column };
