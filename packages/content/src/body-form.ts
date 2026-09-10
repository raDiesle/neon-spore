import type { Point } from "./shapes.js";
import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * **A form worn whole by a body that ships** — the one way to make a
 * `CreatureSilhouette` that carries its own contour.
 *
 * Its own file beside `body-path.ts`, which walks what this makes and was at
 * its length the day this arrived. The seam is the one `CreatureSilhouette`'s
 * own docstring draws: next door is how a body is *walked* — a blob sampled by
 * angle, a rim of clubs, or a contour handed over whole — and this is how the
 * third of those is *made*, which is a question about the two numbers every
 * reader of the record trusts rather than about the walk.
 */

/**
 * A silhouette that carries its own contour, with `rx` and `ry` taken off it.
 *
 * The one way to make one, because the two numbers cannot be left to the
 * author: `livingScale` fits a body into its footprint by `max(rx, ry)`, so a
 * contour reaching past the ellipse it claims is drawn too big for the grip
 * ring hit-tested round it, and one short of it too small. Both are read
 * **once**, here, off the contour sampled through its own breathing — never
 * per frame, which is what the queue entry that asked for this field warned
 * against. A sample every quarter second across a long window, because a form
 * that comes apart or leans reaches furthest at a moment no single `t` finds;
 * what falls between two samples overshoots the ellipse by well under a
 * percent, which no scale can see.
 *
 * `lobes`, `depth`, `wobble` and `seed` are still the author's: `rimCount`
 * reads `lobes` as what an eye counts round the form, and the other three
 * describe nothing the walk uses but keep every reader of the record honest.
 */
export function walkedSilhouette(
  base: Omit<CreatureSilhouette, "rx" | "ry" | "contour" | "clubs">,
  contour: (t: number) => Point[],
): CreatureSilhouette {
  let rx = 0;
  let ry = 0;
  for (let i = 0; i < REACH_SAMPLES; i++) {
    for (const p of contour((i / REACH_SAMPLES) * REACH_WINDOW)) {
      rx = Math.max(rx, Math.abs(p.x));
      ry = Math.max(ry, Math.abs(p.y));
    }
  }
  // A contour with no reach is a form that produced nothing; a radius of
  // nought would divide every scale by it, so it is refused where it is made.
  if (rx <= 0 || ry <= 0) throw new Error("walkedSilhouette: the contour has no reach");
  return { ...base, rx, ry, contour };
}

/** Moments the reach is read at, and how many seconds they span — longer than
 * any breathing period a form uses (`blobRadiusMul`'s slowest layer is under
 * ten seconds). Forty-eight over twelve is one every quarter second. */
const REACH_SAMPLES = 48;
const REACH_WINDOW = 12;
