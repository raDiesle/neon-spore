import { crystalPath, LIGHT_HALF, METEOR } from "../../../../../packages/content/src/index.js";
import { facet, LAT_LIMIT, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import type { CrustDraw } from "../../../../../packages/render/src/carom-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * GRIT — only a solid sheds pieces, so this one sheds.
 *
 * **The shell.** The shipped crystal, with the thing a rock with a hole in it
 * has and a rock drawn flat does not: a **wall** round the window. The bezel
 * next door is a ring drawn on the surface; this is the shadow the surface
 * casts into its own hole, an arc of dark round the upper inside of the
 * opening and a lit lip round the lower outside — which is what says the pane
 * is set into three-quarters of a rock's thickness rather than painted on the
 * front of it. Nothing casts a shadow onto anything *else* in this game
 * (`spec/graphics.md`); a body shading its own recess is the exception that
 * rule was written around.
 *
 * **The travel.** Chips. Twelve flecks placed on the stone by longitude and
 * latitude, each released only while its own facet is turned into the heading —
 * the side that is doing the work — and then thrown backwards along the
 * crossing at its own rate, dimming as it goes. A fleck's brightness is the
 * light on the facet it came off, so the stream is brighter on the lit
 * shoulder, and it is grey rather than the body's colour because what is coming
 * off is rock.
 */

/** How many chips are in the air at once, how far out they root and how far
 * back the oldest of them has travelled, in rock radii. */
const CHIPS = 12;
const REACH = 0.92;
const THROW = 2.4;
/** What a chip keeps of its light when the facet it came off is turned away. */
const FLOOR = 0.35;
/** How wide the mouth of the shed is, in radians either side of the heading.
 * Narrow: a stone shedding in every direction is a stone coming apart. */
const MOUTH = 1.1;
/** The unlit mid-tone `meteor.ts` fills a stone with. */
const STONE_FILL = "#8A8F9C";
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";

/** Where the chips root. A coarse spiral, so no two share a longitude and they
 * do not all come round together; `LAT_LIMIT` keeps them off the poles. */
const PINS = Array.from({ length: CHIPS }, (_, i) =>
  pin((i * Math.PI * 2 * 5) / CHIPS, (((i % 4) - 1.5) / 1.5) * LAT_LIMIT, REACH),
);

export function walled(d: CrustDraw): void {
  const { ctx, r, glass, turn, time, metal } = d;
  const shell = new Path2D(
    crystalPath(0, 0, r, r, METEOR.sides, METEOR.depth, METEOR.wobble, time * 0.15, METEOR.seed),
  );
  const hole = new Path2D();
  hole.arc(0, 0, glass, 0, Math.PI * 2);
  shell.addPath(hole);

  ctx.save();
  ctx.rotate(turn);
  ctx.fillStyle = STONE_FILL;
  ctx.fill(shell, "evenodd");
  ctx.save();
  ctx.clip(shell, "evenodd");
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(shell);
  ctx.restore();

  // The wall of the opening, in the *unturned* frame with the window it belongs
  // to: a recess that rolled would be a recess cut in the wrong side of the
  // rock every half turn.
  const wall = Math.max(1.2, r * 0.1);
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, glass + wall, Math.PI * 0.92, Math.PI * 1.98);
  ctx.strokeStyle = rgba(SHADOW, 0.55);
  ctx.lineWidth = wall * 1.6;
  ctx.stroke();
  // And the lit lip on the far side of it, where the rock's thickness catches
  // what the near wall shades.
  ctx.beginPath();
  ctx.arc(0, 0, glass + wall * 0.9, Math.PI * 0.06, Math.PI * 0.86);
  ctx.strokeStyle = rgba("#FFFFFF", 0.22);
  ctx.lineWidth = wall * 0.9;
  ctx.stroke();
  ctx.restore();
}

export function chips(d: CrustDraw): void {
  const { ctx, r, dir, turn, time, metal } = d;
  ctx.save();
  for (let i = 0; i < CHIPS; i++) {
    const p = PINS[i];
    if (p === undefined) continue;
    const f = facet(p, turn);
    // Only the facets doing the work shed: the ones turned toward us and into
    // the heading. A chip from the trailing side would be a chip travelling
    // through the rock it came off.
    if (!f.near || Math.abs(Math.atan2(f.y, f.x * dir)) > MOUTH) continue;
    // Each chip runs its own loop, spread by its longitude, so the stream is a
    // scatter rather than twelve things leaving together. `time` is the wall
    // clock, which is where every other shimmer on this creature comes from.
    const u = (time * 1.7 + p.lon) % 1;
    const back = -dir * r * THROW * u;
    const drop = -r * THROW * 0.5 * u;
    const size = Math.max(0.7, r * 0.07 * (1 - u * 0.5));
    ctx.beginPath();
    ctx.arc(f.x * r + back, f.y * r + drop, size, 0, Math.PI * 2);
    // `hazed` hands back a hex whatever the distance, so the chip takes the
    // rock's own colour at this row rather than a second copy of the haze.
    ctx.fillStyle = rgba(metal, 0.75 * (1 - u) * surfaceDim(FLOOR, f.lit));
    ctx.fill();
  }
  ctx.restore();
}
