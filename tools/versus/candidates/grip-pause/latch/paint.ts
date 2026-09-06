import { halo } from "../../../../../packages/render/src/glow.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * The held ring, saying whether the body may be carried yet.
 *
 * Shipped, the four arcs turn at a constant rate whether or not a hand can
 * take the body a column. LATCH stops them: on the beat of pause the arcs come
 * to rest square with the field, close their gaps to a hair and lose their
 * pulse, and the halo shrinks in. When the pause is over they let go and turn
 * again. Nothing is added to the picture and nothing is written in words — the
 * same four arcs, either turning or standing still.
 *
 * The argument for it: the pause is a beat long, which is exactly long enough
 * for a player to pull again and read the nothing that happens as the control
 * being broken. A held thing that has visibly *locked* is a held thing you wait
 * for.
 *
 * The argument against: a ring that stops is a ring that looks let go of, and
 * the grip's whole picture is built to say *somebody is holding this*. The beam
 * still runs, so the two halves of the picture would be saying different things
 * for a beat — and the seat reading it is the one who is not holding anything.
 */
export function latch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
  weight: number,
  ready: boolean,
): void {
  // Square with the field while it is latched, and turning otherwise: the
  // *stopping* is the whole message, so the angle it stops at is the one a
  // player reads as deliberate rather than as a frame dropped.
  const spin = ready ? time * 1.6 : 0;
  const gap = ready ? 0.42 : 0.1;
  ctx.save();
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 1.2 + weight;
  // The pulse is the sign of life in the shipped ring, so a latched one is
  // held at the bottom of it rather than allowed to breathe.
  ctx.globalAlpha = ready ? 0.55 + 0.25 * Math.sin(time * 6) : 0.34;
  for (let k = 0; k < 4; k++) {
    const a = spin + (k * Math.PI) / 2;
    ctx.beginPath();
    ctx.arc(x, y, r, a + gap, a + Math.PI / 2 - gap);
    ctx.stroke();
  }
  ctx.restore();
  halo(ctx, x, y, r * (ready ? 1.25 : 1.05), PALETTE.pod, 0.12 * (1 + weight));
}
