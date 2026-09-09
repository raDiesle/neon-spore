import { plumes } from "./torch-ball.js";

/**
 * THE ONE RECORD A CANDIDATE **VEIL** PATCHES.
 *
 * `magnet-look.ts`'s kind, and a record of its own rather than a second field
 * on `torch-look.ts` for one reason that is not taste: `TORCH_LOOK` holds the
 * *whole* flame, which `torch-fire.ts` provides, so a field on it that
 * `torch-fire.ts` also had to read would be an import cycle. The question this
 * slot asks is one pass out of four, and a record named for the question is
 * what every other seam on the VERSUS page already is.
 *
 * **What the pass is.** The last thing a burning rock draws: the nearest
 * plumes again, over the stone's own face, after the stone has been laid down
 * opaque over everything behind it. Without it the rock reads as standing in
 * front of the fire rather than inside it. With it too loud, the craters stop
 * being countable — and the craters are the only readout this body carries.
 *
 * **What the shipped pass actually does, which is not what the code said.**
 * `torch-fire.ts` set `globalAlpha` to a fifth and called `plumes`, and
 * `plumes` *overwrites* that alpha per plume rather than multiplying it. So
 * the veil has been the near plumes at their own full strength since the day
 * it was written, drawn twice over the face, and the constant that said
 * otherwise never reached a pixel. The constant is gone rather than honoured:
 * what has been on the field for this creature's whole life is the loud
 * version, the owner has looked at THE TORCH and at BULB QUEEN's six sockets
 * with it, and quietly turning it down would be a look changed by a session
 * rather than chosen by him (CLAUDE.md, *a look is offered, never replaced*).
 * The quiet one is offered instead, as `torch:veil` / `fifth`.
 */

/** Everything the veil pass gets. `ctx` is already in the stone's own frame,
 * so `r` is the only size there is and `theta` is the fire's own rotation
 * about the rock's vertical axis. */
export interface TorchVeilDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** The stone's radius in pixels. */
  readonly r: number;
  /** How far the fire has rolled, in radians — the same number the tongues
   * and the plumes underneath were placed with. */
  readonly theta: number;
  /** The wall clock in seconds, which the flicker rides. */
  readonly time: number;
}

/**
 * The shipped veil: the near plumes again, at their own strength, over the
 * face of the rock.
 *
 * Additive, like every other mark this fire makes, and inside a `save` of its
 * own because the composite mode it needs is not the one the caller was left
 * holding.
 */
export function drawVeil(d: TorchVeilDraw): void {
  const { ctx, r, theta, time } = d;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  plumes(ctx, r, theta, time, true);
  ctx.restore();
}

export interface TorchVeil {
  /** The pass over the stone's face, after the stone is down. */
  readonly draw: (d: TorchVeilDraw) => void;
}

export const TORCH_VEIL: TorchVeil = { draw: drawVeil };
