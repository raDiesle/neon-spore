import { GHOST } from "@neon-spore/content";
import { slabs } from "./ghost-glitch.js";
import { latitude } from "./ghost-latitude.js";

/**
 * THE ONE RECORD A CANDIDATE **GHOST** PATCHES.
 *
 * `magnet-look.ts`'s kind, and the same reasons: a record rather than a named
 * function, so a candidate look is a field patched onto it for the length of
 * one `draw()` and the call site never learns anything about it
 * (`docs/versus.md`).
 *
 * **One field, and it is the camouflage.** What a ghost *is* — a dome with a
 * hem of tails — is `ghostPoints` and is not in question; what the pair is
 * being asked about is the thing it is wearing instead of being invisible.
 * The outline, the eyes, the halo and the shards thrown clear of the body all
 * stay in `ghost.ts`, because a look that moved the silhouette would be
 * arguing with the one thing player 2 finds this body by.
 *
 * **The shipped `drawTears` came through here with not one pixel moved**, which
 * is the rule for every seam on this page: the left-hand side of a pair is the
 * field exactly as it is.
 */

/** Everything the camouflage is drawn from. A record rather than six
 * positional arguments, because a look placing its bands on a surface reads
 * `rage` and `time` for two different things and a reader should be able to see
 * which is which at the call. */
export interface TearsDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** The body's own contour, already built, to clip to. */
  readonly body: Path2D;
  /** The creature's id — the whole of the randomness (`ghost-glitch.ts`). */
  readonly id: number;
  /** The wall clock in seconds. This body is drawn on one seat only, so it is
   * the one place in the package where that is not a desync. */
  readonly time: number;
  /** How far through its temper a crossing ghost is, 0 for a falling one. */
  readonly rage: number;
  /** The body's rim colour, already hazed for distance by the caller. */
  readonly hex: string;
}

/**
 * The tears inside the body: each band of the contour lit and shifted against
 * its neighbours. Clipped to the outline, so what moves is the *inside* of the
 * silhouette and the silhouette itself stays a shape player 2 can name.
 *
 * Every mark it makes is decided by how far **down the picture** it is: a band
 * is a rectangle across the body at `-GHOST.rx + shift * GHOST.rx`, and that
 * is a surface coming apart on a flat plane. `docs/style-guide.md`'s Depth
 * section names exactly this — a silhouette may be posed, and anything *on* a
 * surface is placed — and a ghost's whole subject is a surface coming apart,
 * which is why the slot below is open.
 */
export function drawTears(d: TearsDraw): void {
  const { ctx, body, id, time, rage, hex } = d;
  ctx.save();
  ctx.clip(body);
  ctx.globalCompositeOperation = "lighter";
  for (const s of slabs(id, time, rage)) {
    ctx.globalAlpha = 0.1 + Math.abs(s.shift) * 0.5;
    ctx.fillStyle = hex;
    ctx.fillRect(
      -GHOST.rx + s.shift * GHOST.rx,
      s.top * GHOST.ry,
      GHOST.rx * 2,
      s.height * GHOST.ry * 0.6,
    );
  }
  ctx.restore();
}

export interface GhostLook {
  /** The camouflage inside the outline. */
  readonly tears: (d: TearsDraw) => void;
}

/**
 * `ghost-latitude.ts` and not `drawTears`, since 9 September 2026.
 *
 * The owner could not tell `ghost:tears`'s two candidates apart, so the slot
 * was settled rather than shown again, and LATITUDE won it on the two things
 * that separate the pair where an eye could not: it keeps the hard edge a torn
 * signal is made of, and it costs exactly what the shipped look cost.
 *
 * `drawTears` stays below, and it is not dead: it is what this record used to
 * hold, it is what a future ghost candidate is offered *against*, and it is the
 * one honest statement in the package of what the flat answer was. A seam whose
 * shipped side has been deleted cannot show a pair anything.
 */
export const GHOST_LOOK: GhostLook = { tears: latitude };
