import { crystalPath, LIGHT_HALF, METEOR } from "../../../../../packages/content/src/index.js";
import { facet, LAT_LIMIT, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { CrustDraw } from "../../../../../packages/render/src/carom-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * PITS — the rock is a surface with holes in it, and the wake is made of the
 * rock rather than of the body's colour.
 *
 * **The shell.** Nine pits placed by longitude and latitude on a ball the size
 * of the stone and carried round by the roll the stone already has. Each is
 * drawn about its own origin and foreshortened by `facet`'s tangent map, so it
 * is a full cup facing us, a sliver at the limb, and nothing at all on the far
 * side — the reveal `docs/dimensional.md` calls the one cue a pose cannot fake.
 * The lit wall of a pit is the wall *away* from the key, because a hole is lit
 * on the side a ball is dark on, and that inversion is the whole of what says
 * *into* rather than *onto*.
 *
 * **The travel.** Three ghosts of the stone's own outline, at the turns it had
 * a sixth, a third and a half of a beat ago, each fainter than the last. A
 * gradient smear says *something passed*; a run of the body's own silhouette
 * says *this thing passed, and it was turning while it did*.
 */

/** How many pits the stone wears, how far out they sit and how wide each is as
 * a share of the rock. Eight: enough that two or three are always near the limb
 * where the foreshortening is doing its work, and few enough to read at the top
 * of the field. */
const PITS = 8;
const REACH = 0.86;
const WIDE = 0.15;
/**
 * The two latitudes the pits are placed on, as a share of `LAT_LIMIT`.
 *
 * **Near the poles, and that is the rock's shape rather than a preference.**
 * `GLASS_MUL` puts the window at 0.58 of the stone, so the equator of this body
 * is glass from side to side: a pit placed there is drawn straight onto the one
 * thing the pair reads a colour through, and the `evenodd` clip — rightly — cuts
 * it away, which is a surface that costs frames and shows nothing. At 0.95 of
 * the limit a pin projects to 0.6 of the radius up or down, clear of the glass
 * for the whole of its sweep, so the marks live in the two caps of rock the
 * porthole leaves. It is why this candidate has eight and not the twelve a
 * plain ball would carry.
 */
const BAND = 0.95;
/** What a pit keeps of its light when its own wall is turned away. */
const FLOOR = 0.3;
/** The unlit mid-tone `meteor.ts` fills a stone with, so the crust and the rock
 * it becomes are one drawing. */
const STONE_FILL = "#8A8F9C";
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";

/** Where the pits sit: two bands, one on each cap of rock the window leaves. */
const PINS = Array.from({ length: PITS }, (_, i) =>
  // Alternating caps, and a longitude that steps by five eighths of a turn, so
  // no two share a meridian and the top and bottom bands are never in step.
  pin((i * Math.PI * 2 * 5) / PITS, (i % 2 === 0 ? 1 : -1) * BAND * LAT_LIMIT, REACH),
);

/** The stone's outline, hole and all. The *turn* is applied by the caller as a
 * rotation of the frame, not baked in here: a ghost of the rock at an earlier
 * turn is this same path under an earlier rotation, which is exactly what makes
 * the wake read as one thing rolling rather than as several rocks. */
function shellPath(r: number, glass: number, time: number): Path2D {
  const p = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, time * 0.15, METEOR.seed),
  );
  const hole = new Path2D();
  hole.arc(0, 0, glass, 0, Math.PI * 2);
  p.addPath(hole);
  return p;
}

export function pitted(d: CrustDraw): void {
  const { ctx, r, glass, turn, time, metal } = d;
  const shell = shellPath(r, glass, time);

  ctx.save();
  ctx.rotate(turn);
  ctx.fillStyle = STONE_FILL;
  ctx.fill(shell, "evenodd");
  ctx.save();
  ctx.clip(shell, "evenodd");
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  // The pits are clipped to the stone rather than to the window, so one that
  // wanders over the glass is cut off by the same `evenodd` path that leaves
  // the body showing. A pit drawn across the porthole would be a hole in the
  // one thing the pair reads a colour through.
  for (const p of PINS) {
    const f = facet(p, turn);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(f.x * r, f.y * r);
    ctx.scale(f.sx, f.sy);
    // The cup. Dark where a ball is bright and bright where a ball is dark:
    // the near wall of a hole is the one the key cannot reach.
    ctx.beginPath();
    ctx.arc(0, 0, r * WIDE, 0, Math.PI * 2);
    ctx.fillStyle = rgba(SHADOW, 0.8 * surfaceDim(FLOOR, 1 - f.lit));
    ctx.fill();
    // And the far lip, catching what the near wall shades — the one stroke that
    // makes a disc read as a depression rather than as a spot.
    ctx.beginPath();
    ctx.arc(r * WIDE * 0.22, r * WIDE * 0.22, r * WIDE * 0.7, Math.PI * 0.1, Math.PI * 1.05);
    ctx.strokeStyle = rgba("#FFFFFF", 0.55 * surfaceDim(FLOOR, f.lit));
    ctx.lineWidth = Math.max(0.8, r * 0.05);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(shell);
  ctx.restore();
}

/** How many ghosts stand behind it, how far apart in the stone's own turn, and
 * how far back each one stands in rock radii. */
const GHOSTS = 3;
const LAG = 0.19;
const STRIDE = 0.62;

export function wake(d: CrustDraw): void {
  const { ctx, r, glass, dir, turn, time, metal } = d;
  ctx.save();
  for (let k = GHOSTS; k >= 1; k--) {
    // Back along the heading and up the diagonal the simulation walked it down,
    // because a carom is falling as well as crossing.
    ctx.save();
    ctx.translate(-dir * r * STRIDE * k, -r * STRIDE * 0.5 * k);
    // The rotation is what makes this a *ghost of the same stone*: each copy
    // stands at the turn the rock had `LAG` radians of roll ago, so the wake
    // shows the thing turning as it crossed rather than repeating one outline.
    ctx.rotate(turn - LAG * k);
    ctx.globalAlpha = 0.34 / k;
    // The rock's own colour and not the body's: a wake made of the thing that
    // passed says *this stone was here*, where a coloured smear says only that
    // something bright went by. It is the whole of what separates this answer
    // from the wedge it stands beside.
    ctx.fillStyle = metal;
    ctx.fill(shellPath(r, glass, time), "evenodd");
    ctx.restore();
  }
  ctx.restore();
}
