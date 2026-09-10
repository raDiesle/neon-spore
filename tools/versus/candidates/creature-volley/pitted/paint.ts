import { facet, LAT_LIMIT, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { keyAxis, METEOR_LOOK } from "../../../../../packages/render/src/meteor-look.js";
import { drawCracks } from "../../../../../packages/render/src/volley-cracks.js";
import type { VolleyShell } from "../../../../../packages/render/src/volley-look.js";
import { fillRock } from "../../../../../packages/render/src/volley-stone.js";

/**
 * PITTED — the stone carries the meteor's own pits, and they come round.
 *
 * A meteor in this game is a lit polygon with craters cut into it where shots
 * landed, and a volley is a meteor with none: it has never been shot, so its
 * face is bare, and a bare lit disc rolling in its own plane is a coin. This
 * puts the pits it was *born* with on it — the ordinary weathering of a stone
 * that has been in space — and places them by longitude and latitude
 * (`.claude/skills/depth`: the silhouette is posed, the surface is placed).
 * They are turned by the ball's own roll, so as the pattern rolls the pits
 * sweep across the face, foreshorten at the limb, go behind, and come back
 * round the other side. That reveal is the whole claim: it is the one cue
 * that separates a ball from a disc, and no amount of shading a disc produces
 * it.
 *
 * Each pit is `METEOR_LOOK.pit`, the crater a shot leaves, drawn about its own
 * origin and squashed by its tangent plane — so the volley's pits are visibly
 * the same holes every rock on the field wears. The cracks a ward leaves and
 * the seams over it all are the shipped ones.
 */

/** Pits the stone is born with. Twelve, of which about half are on the near
 * side at any moment and one or two of those edge-on at the limb: fewer and
 * the turn has nothing to count, more and the ball is a golf ball. */
const PITS = 12;
/** How far in from the contour the pits sit, as a share of the radius —
 * inside the faceted rim, which is under `r` almost everywhere. */
const REACH = 0.78;
/** A pit's radius, as a share of the ball's — `drawRockBody`'s own 0.16, so
 * the volley's pits are the same holes as a shot's crater on a rock. */
const PIT_MUL = 0.16;
/** How much of a pit survives on the far side of the terminator — over
 * half, because a pit that fades to nothing before it reaches the limb never
 * shows the foreshortening that is the point of it. */
const DIM = 0.55;

export function pittedStone(s: VolleyShell): void {
  const { ctx, ball, r, turn, id } = s;
  fillRock(ctx, ball, r, turn);

  // The pits are drawn in the *unturned* frame and turned by longitude, so
  // they travel round the ball rather than with the picture. Clipped to the
  // rolled contour, because that is where the stone is.
  ctx.save();
  ctx.rotate(turn);
  ctx.clip(ball);
  ctx.rotate(-turn);
  const { dx, dy } = keyAxis(0);
  for (let k = 0; k < PITS; k++) {
    // Spread by the golden angle and the body's id, so two volleys in two
    // lanes wear two different faces and the same one is the same every frame.
    const lon = k * 2.399 + sinHash(id, k) * 0.6;
    const lat = (sinHash(id, k, 1) - 0.5) * 2 * LAT_LIMIT * 0.85;
    const f = facet(pin(lon, lat, r * REACH), turn);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(Math.max(0.12, f.sx), f.sy);
    ctx.globalAlpha = surfaceDim(DIM, f.lit);
    METEOR_LOOK.pit(ctx, 0, 0, r * PIT_MUL, dx, dy);
    ctx.restore();
  }
  ctx.restore();

  if (s.plates < s.total) drawCracks(ctx, ball, r, turn, s.total - s.plates, id, s.metal);
}
