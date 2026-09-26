import { paintFilm } from "./baton-flesh.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **THE BATON's bead as a drop**, split off `baton-flesh.ts` when the cup's
 * slosh took that file to its limit. The same material, the same wet film;
 * a drop is the thing that sits in a knuckle's cup, and THE GORGE borrows it
 * for the beads that swim in its lobes.
 */

/**
 * The drop's light idling on its own, in radii and radians a second: a
 * sitting bead's blob wobbles on `time * 1.4` (`baton-bead-draw.ts`), and a
 * gradient pinned a fixed share of the radius toward the light is a still
 * life over it (`docs/style-guide.md`'s "Depth on a body that already
 * ships").
 */
const DROP_LIT_WOBBLE = 0.07;
const DROP_LIT_WOBBLE_RATE = 0.53;

/**
 * A bead, as a drop: its colour, shaded from a lit shoulder to a dark foot,
 * the light it throws caught on its lower edge in `rim`, and a wet point.
 * The body is filled in the plain colour first because that colour is the
 * navigator's whole answer and the tests read it off the op log. `time` is
 * for a drop that sits still and wobbles; one that moves on its own, like
 * THE GORGE's orbiting beads, leaves it out and its light stays put.
 */
export function paintDrop(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  r: number,
  hex: string,
  rim: string,
  tile: number,
  lit: number,
  time?: number,
): void {
  ctx.save();
  ctx.fillStyle = hex;
  ctx.fill(body);
  ctx.clip(body);
  const drift = time === undefined ? 0 : DROP_LIT_WOBBLE * Math.sin(time * DROP_LIT_WOBBLE_RATE);
  const shade = ctx.createRadialGradient(
    x - r * (0.3 + drift),
    y - r * (0.35 + drift * 0.8),
    0,
    x,
    y,
    r * 1.1,
  );
  shade.addColorStop(0, rgba(PALETTE.sheenRim, 0.5));
  shade.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.65, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.55));
  ctx.fillStyle = shade;
  ctx.fill(body);
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, tile * 0.035);
  ctx.strokeStyle = rim;
  ctx.globalAlpha = lit;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.78, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  ctx.restore();
  paintFilm(ctx, x, y, r, 0.35);
}
