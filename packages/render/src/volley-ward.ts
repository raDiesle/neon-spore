import { strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";
import { WARD_LOOK } from "./shield.js";

/**
 * **THE VOLLEY wears the shield's own band on the face the shield will meet.**
 *
 * The owner asked for it on 15 September 2026, in those terms: *a similar
 * graphic around the volley, like the shield of the hull ship, so it is clear
 * the shield can bounce it.* The problem it answers is one the shell itself
 * cannot — a volley is drawn as a ball of stone, which is the same material
 * every rock on this field is made of, and *a rock is answered by the shield
 * and then gone*. Nothing on the ball says the one thing that makes this
 * creature what it is: the ward does not finish it, it hits it back
 * (`sim/volley.ts`). A pair meeting it for the first time has to learn that by
 * being surprised, and the surprise costs them the wave.
 *
 * So the band is the **same band**, in the same colour, drawn with the same
 * two-sine shimmer the hull's rim is drawn with (`shield.ts` `WARD_LOOK`) —
 * borrowed rather than invented, because the whole of what it says is *this
 * and that are the same thing*. `PALETTE.shieldRim` is the ward's colour
 * everywhere else in the game, and a second cyan would have read as a second
 * idea.
 *
 * **It faces the way the ball is going**, exactly as the shell's own break
 * does: down while it falls and up while a ward is carrying it, off the one
 * `lead` angle `volley.ts` already computes, so the band and the worn face can
 * never point opposite ways. And it is the *leading* face and not a ring: a
 * ring round the ball would read as an aura the ball is wearing, and this is
 * an announcement about where the two of them are going to meet.
 */

/** How far round the leading face the band reaches, either side, in radians.
 * A third of the ball's circumference: wide enough to read as the dome's arc
 * at a glance, narrow enough that it is plainly a face and not a halo. */
const ARC = Math.PI / 3;
/** How far outside the shell the band stands, as a share of its radius. The
 * same gap the hull's rim keeps off the membrane: a band drawn on the stone
 * reads as paint, and a band standing off it reads as a field. */
const STANDOFF = 1.12;

/**
 * The band, on a canvas already translated to the ball's centre.
 *
 * `lead` is the leading face's angle and `r` the shell's radius — both of them
 * `volley.ts`'s own, handed in rather than recomputed, for the reason the shell
 * hands `VolleyShell` around: a second spelling of where the front of the ball
 * is would be a band that drifts off the face it belongs to.
 */
export function drawVolleyWard(
  ctx: CanvasRenderingContext2D,
  r: number,
  lead: number,
  time: number,
  id: number,
): void {
  const w = WARD_LOOK;
  // The hull's rim shimmer, with the body's own id in the phase so two volleys
  // in two columns never pulse as one drawing done twice (`volley.ts`'s rule
  // about remembering nothing between frames).
  const shimmer =
    w.shimmerBase +
    w.shimmerA * Math.sin(time * w.shimmerHzA + id) +
    w.shimmerB * Math.sin(time * w.shimmerHzB + 1.7 + id);
  const band = new Path2D();
  band.arc(0, 0, r * STANDOFF, lead - ARC, lead + ARC);
  ctx.save();
  strokeGlow(ctx, band, PALETTE.shieldRim, w.widthBase, w.intensityBase + shimmer);
  ctx.restore();
}
