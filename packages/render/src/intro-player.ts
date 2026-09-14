import { blobPoints } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * ONE OF THE TWO PEOPLE IN THE SCENE.
 *
 * Not a person: a lobed blob with an eye and a mouth, in the seat's own colour.
 * That is deliberate and it is the cheaper of two truths — the game is made of
 * blobs and slimes, and a stick figure or a photograph of a hand would be the
 * one thing on the first screen that came from somewhere else. It also spares
 * the intro a decision it has no business making, which is what the two people
 * holding these phones look like.
 *
 * The seat's colour does the naming. Violet is player one and amber is player
 * two everywhere else in the game (`seat-skin.ts`), so the pair meet the two
 * colours they are about to be told apart by before they have chosen anything.
 */

/** The head, its eye, and — while they are shouting — its mouth. */
export function introPlayer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  tint: string,
  age: number,
  opts: { look: number; talking: number; listening: number },
): void {
  // Leaning in while the other one is talking: the whole of what makes the
  // right-hand one read as *listening* rather than as a second decoration.
  const lean = opts.listening * r * 0.12;
  const breath = 1 + 0.03 * Math.sin(age * 1.7 + cx);
  halo(ctx, cx + opts.look * lean, cy, r * 2.3, tint, 0.4 + 0.25 * opts.talking);
  const head = splinePath(
    blobPoints(
      cx + opts.look * lean,
      cy,
      r * breath,
      r * 0.92 * breath,
      3,
      0.07,
      0.04,
      age,
      6101 + Math.round(cx),
      28,
    ),
    true,
  );
  ctx.fillStyle = mixHex(tint, "#0B0718", 0.7);
  ctx.fill(head);
  strokeGlow(ctx, head, tint, Math.max(1.2, r * 0.16), 1);

  const x = cx + opts.look * (lean + r * 0.22);
  // The eye is on the side facing the other one, so both of them are plainly
  // looking at each other rather than out at whoever is holding the phone.
  const blink = Math.abs(Math.sin(age * 0.6 + cx * 0.01)) > 0.05 ? 1 : 0.12;
  halo(ctx, x, cy - r * 0.14, r * 0.7, PALETTE.text, 0.4);
  ctx.beginPath();
  ctx.ellipse(x, cy - r * 0.14, r * 0.24, r * 0.24 * blink, 0, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.text;
  ctx.fill();
  if (blink > 0.5) {
    ctx.beginPath();
    ctx.ellipse(x - r * 0.08, cy - r * 0.2, r * 0.07, r * 0.055, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.fill();
  }

  // The mouth opens only while a word is coming out of it, and it is the one
  // part of the figure that moves fast: a shout is loud and short.
  const open = opts.talking * (0.55 + 0.45 * Math.abs(Math.sin(age * 9)));
  if (open <= 0.02) return;
  ctx.beginPath();
  ctx.ellipse(x, cy + r * 0.34, r * 0.2, r * 0.26 * open, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#0B0718";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, cy + r * 0.34, r * 0.2, r * 0.26 * open, 0, 0, Math.PI * 2);
  ctx.strokeStyle = tint;
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.stroke();
}
