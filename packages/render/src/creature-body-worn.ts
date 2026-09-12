import { beadIsActive, beadIsSpent } from "@neon-spore/sim";
import type { Body } from "./creature-body.js";
import { drawLivingBody } from "./creature-body-living.js";
import { MAGNET_LOOK } from "./magnet-look.js";
import { showsBeadColor } from "./strand.js";
import { drawRaisin, STRAND_LOOK } from "./strand-bead.js";
import { drawStillBead } from "./strand-still.js";

/**
 * **The two body draws that read their own record rather than calling a draw
 * function directly**, cut out of `creature-body.ts` when THE BEATBOX's row
 * took that file over its 250-line limit.
 *
 * Both are here for the same reason and it is stated once rather than twice:
 * a candidate look (`docs/versus.md`) is a field patched onto `MAGNET_LOOK` or
 * `STRAND_LOOK` for the length of one frame, and a draw path that called the
 * function by name would never see the patch. `creature-body.ts` still owns
 * `drawLivingBody`, which `drawStrandBody` reaches back into for the one
 * screen a bead is an ordinary body on.
 */

/**
 * A horseshoe on two coloured poles with an armoured plate under it, and a
 * body with a contour of its own that is no blob: a band with a hole through
 * it and an opening at the bottom, which no radial contour describes
 * (`content/magnet-shape.ts`). Both screens draw the whole of it — nothing
 * about a magnet is hidden — so it has no gate, only a draw path of its own.
 */
export function drawMagnetBody(b: Body): void {
  MAGNET_LOOK.body({
    ctx: b.ctx,
    l: b.l,
    cfg: b.world.cfg,
    c: b.c,
    x: b.x,
    y: b.y,
    beats: b.beats,
    // The same map a wrong colour writes to, read here as the seconds of white
    // left on the plate after it turned a bolt away (`effects-ingest.ts`).
    struck: b.blocked.get(b.c.id) ?? 0,
    near: b.near,
  });
}

/**
 * One bead of THE STRAND, and the only row in this table whose answer depends
 * on **which screen is asking**.
 *
 * A bead already shot is a raisin on both, because how far along the thread
 * the pair has got is the one fact about this creature that is not split. A
 * live one is the slick or the bulb its colour names on the pilot's screen —
 * the ordinary living draw, `wornKind` and all — and on the navigator's a reel
 * rolling between the two of them. Deliberately not the real body drawn grey:
 * a slick is flat and a bulb is round, so the silhouette alone would name the
 * colour, which is `showsVeilCore`'s argument about a halo said about a shape
 * instead (`strand-bead.ts`).
 *
 * And only the bead a shot can actually answer rolls. The rest of the thread
 * is that same reel stopped and drawn as a grey outline — the wrong-colour
 * look, which already means *nothing reaches this* — so the navigator's screen
 * says which one is live in the body itself as well as under the arrow
 * (`strand-still.ts`).
 */
export function drawStrandBody(b: Body): void {
  const { ctx, l, world, c, x, y, time, near } = b;
  const bead = { ctx, l, cfg: world.cfg, c, x, y, time, beatPhase: b.beatPhase, near };
  if (beadIsSpent(c)) {
    drawRaisin(bead);
    return;
  }
  // Through the record rather than by calling the reel directly: a candidate
  // look is a field patched onto `STRAND_LOOK` for the length of one draw, and
  // a draw path that named the function would never see it (`docs/versus.md`).
  if (!showsBeadColor(l)) {
    if (beadIsActive(world, c)) STRAND_LOOK.bead(bead);
    else drawStillBead(bead);
    return;
  }
  drawLivingBody(b);
}
