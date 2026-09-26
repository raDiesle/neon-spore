import {
  farFirst,
  type Ring,
  type SeenRing,
  see,
  seeTube,
  tubeFrames,
  type Vec3,
  type View,
} from "@neon-spore/content";
import { drawBall } from "./solid-ball.js";
import { backness, drawContact, hazeSkin } from "./solid-haze.js";
import { drawTube, rimTube, type Skin } from "./solid-tube-draw.js";

/**
 * A RIG, DRAWN FROM ANY SIDE: a boss as a list of parts, each a tube or a
 * ball, authored side-on in pixels about the rig's own origin
 * (`packages/content/src/solid.ts`).
 *
 * The order is the whole trick. Every part is seen, then sorted far-first on
 * its own depth, so a near wing crosses a far one and a head swung toward the
 * player covers the body behind it. A part that can pass behind *itself* — a
 * tail that curls round — is authored as two or three tubes, not one, because
 * the painter sorts parts and not pixels.
 *
 * Per part, from back to front: haze by how far back it sits (six steps), the
 * fill and the light across it, the rim, and — for a part that `rests` on an
 * earlier one — the contact shadow on that one first, so the one sits *on*
 * the other. The light does not turn; every part is lit from the one key.
 */

export interface TubePart {
  readonly kind: "tube";
  readonly rings: readonly Ring[];
  readonly skin: Skin;
}

export interface BallPart {
  readonly kind: "ball";
  readonly c: Vec3;
  readonly r: number;
  readonly skin: Skin;
  /** The index of the part this one bears on, for its contact shadow. */
  readonly rests?: number;
}

export type Part = TubePart | BallPart;

export interface RigLook {
  /** The field colour far parts are hazed toward. */
  readonly deep: string;
  /** The rim colour, drawn additively round every tube. */
  readonly rim: string;
  /** How far toward `deep` the furthest part goes, 0..1. */
  readonly haze?: number;
}

interface Placed {
  readonly part: Part;
  readonly i: number;
  readonly z: number;
  readonly rings?: SeenRing[];
}

function place(part: Part, i: number, w: View): Placed {
  if (part.kind === "ball") return { part, i, z: see(part.c, w).z };
  const rings = seeTube(part.rings, tubeFrames(part.rings), w);
  const z = rings.reduce((s, r) => s + r.c.z, 0) / Math.max(1, rings.length);
  return { part, i, z, rings };
}

/** Draw a rig at `(x, y)` in view `w`. */
export function drawRig(
  ctx: CanvasRenderingContext2D,
  parts: readonly Part[],
  w: View,
  x: number,
  y: number,
  look: RigLook,
  alpha = 1,
): void {
  const placed = parts.map((p, i) => place(p, i, w));
  const zs = placed.map((p) => p.z);
  const near = Math.max(...zs);
  const far = Math.min(...zs);
  const outlines = new Map<number, Path2D>();
  ctx.save();
  ctx.translate(x, y);
  for (const p of farFirst(placed, (q) => q.z)) {
    const skin = hazeSkin(p.part.skin, backness(p.z, near, far), look.deep, look.haze);
    if (p.part.kind === "tube" && p.rings) {
      const outline = drawTube(ctx, p.rings, skin, alpha);
      rimTube(ctx, outline, look.rim, 2, alpha * (1 - backness(p.z, near, far) * 0.6));
      outlines.set(p.i, outline);
      continue;
    }
    if (p.part.kind !== "ball") continue;
    const s = see(p.part.c, w);
    const under = p.part.rests === undefined ? undefined : outlines.get(p.part.rests);
    if (under) drawContact(ctx, under, s.x, s.y + p.part.r * 0.35, p.part.r * s.s * 1.5, alpha);
    drawBall(ctx, s.x, s.y, p.part.r * s.s, skin, alpha);
  }
  ctx.restore();
}
