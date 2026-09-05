import { sinHash } from "./hash.js";

/**
 * **The damage on THE VOLLEY's shell**: the fractures a ward leaves across the
 * stone that is still there.
 *
 * Its own file beside `volley-seams.ts` and for its reason, one step along:
 * `volley.ts` is what the shell *is* and how much of it a ward has taken off,
 * the seams are the pattern painted on it, and this is what the hits have done
 * to what is left. Three things that change for three different reasons, and
 * `volley.ts` reached its 250-line limit holding all of them.
 */
/** Fractures a single ward leaves behind. Two: one reads as a chip and three
 * is a web, and what the pair has to be able to count is the *wards*, which
 * the missing sector already says — the cracks are the damage under it. */
const CRACKS_PER_WARD = 2;
/** Legs in one crack. Three kinks is a fault; two is a bent line and five is
 * a scribble at the size a phone draws a body. */
const CRACK_KINKS = 3;
/** How far one leg may turn off the last, in radians. */
const CRACK_BEND = 0.9;
/** How wide a crack is drawn, as a share of the radius. */
const CRACK_MUL = 0.055;

/**
 * Fractures across the stone that is still there, one fan per ward already
 * spent. A ball that has been hit hard enough to lose a third of itself does
 * not lose it cleanly, and the count is easier to read off a body that is
 * visibly *coming apart* than off one that is merely smaller.
 *
 * **Deterministic, from the body's own id and nothing else.** `sinHash` is the
 * same stream every other body in render/ shakes on, so two devices draw one
 * volley's damage identically and two volleys in two lanes never carry the same
 * fractures. Nothing is remembered between frames — the count comes off the
 * world, and a restart cannot leave a cracked ball behind.
 *
 * Drawn in the rock's own dark, not in the body's colour: a crack is a place
 * the stone has failed and light is not coming out of it yet. The bright hair
 * beside each is the lit edge of the fault, which is what stops the whole thing
 * reading as a scribble at the size a phone draws a body.
 */
export function drawCracks(
  ctx: CanvasRenderingContext2D,
  ball: Path2D,
  r: number,
  turn: number,
  spent: number,
  id: number,
  metal: string,
): void {
  ctx.save();
  ctx.rotate(turn);
  ctx.clip(ball);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let k = 0; k < spent * CRACKS_PER_WARD; k++) {
    // Spread round the whole ball rather than fanned from the break: the
    // sector that went is gone, and what a second ward has to say is that the
    // rest of the shell is failing too.
    const from = sinHash(id, k) * Math.PI * 2;
    const path = new Path2D();
    let a = from;
    let d = r * (0.25 + 0.35 * sinHash(id, k, 1));
    path.moveTo(Math.cos(a) * d, Math.sin(a) * d);
    for (let step = 0; step < CRACK_KINKS; step++) {
      // Each leg turns a little and runs a little further out, so a crack
      // travels toward the rim the way a fault does instead of wandering.
      a += (sinHash(id, k, step + 2) - 0.5) * CRACK_BEND;
      d += (r - d) * (0.35 + 0.3 * sinHash(id, k, step + 9));
      path.lineTo(Math.cos(a) * d, Math.sin(a) * d);
    }
    ctx.strokeStyle = "#0B0C11";
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = Math.max(1, r * CRACK_MUL);
    ctx.stroke(path);
    ctx.strokeStyle = metal;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = Math.max(0.6, r * CRACK_MUL * 0.45);
    ctx.stroke(path);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
