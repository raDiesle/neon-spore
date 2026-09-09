import { pin, surfaceDim } from "@neon-spore/content";
import { PALETTE } from "./palette.js";
import type { WispFringe } from "./wisp-look.js";

/**
 * THE WISP's streamers — the half of the jellyfish that hangs.
 *
 * Its own file rather than another block in `wisp-body.ts` for the reason the
 * limit exists at all, and the split lands where the picture already divides:
 * the bell is a contour with a fill and a rim, and these are six strokes that
 * read the jump and nothing else. Everything here is in *silhouette units*,
 * inside the one `ctx.scale` `drawWispBody` has already applied — a streamer
 * measured in pixels would be a body whose tentacles grew a different amount
 * than its bell as it came down the field.
 */

/**
 * How many strands hang off the hem, and where each is rooted.
 *
 * Eight rather than the shipped five, and the count is a consequence rather
 * than a preference: a ring only reads as a ring if some of it is behind, and
 * with five at most three are ever in front — a fringe of three is thinner
 * than the one it replaces. Eight puts four or five on the near side at any
 * turn, which is the shipped density with a far side underneath it.
 *
 * The latitude is a hair below the equator so the roots sit on the hem rather
 * than on the crown, and nowhere near a pole: a strand rooted at one would be a
 * horizontal hairline whatever the rotation did, which is what `LAT_LIMIT`
 * exists to say.
 */
const STRANDS = 8;
const HEM_LAT = -0.22;
const PINS = Array.from({ length: STRANDS }, (_, i) =>
  pin((i / STRANDS) * Math.PI * 2, HEM_LAT, 1),
);

/**
 * Seconds for one turn of the bell about its own vertical axis.
 *
 * Seven, and slow on purpose. This is the one creature on the field that does
 * not fall, so it is on screen for as long as the wave lasts and has all the
 * time there is; and the pair reads a *column* off it, so a fringe that spun
 * fast enough to strobe would be a body arguing with the number somebody is
 * saying out loud.
 */
const SPIN_SECONDS = 7;

/** What a strand keeps of its brightness where the surface has turned fully
 * away from the light. High: these are filaments over a dark field, and one
 * that reached nothing would take the fringe's *count* with it — five, or here
 * eight, is part of what makes the body one word. */
const DIM = 0.45;

/** How much narrower a strand is drawn at the limb than facing us. Not nought:
 * a line has no width to foreshorten, so this is the stand-in for the
 * `scale(sx, sy)` a patch would get, and it is what makes a strand going round
 * the back thin away instead of simply stopping. */
const EDGE_WEIGHT = 0.35;

/**
 * The streamers, hung round the hem of a bell rather than in a row across it.
 *
 * The fringe used to root each strand at `k * rx * 0.32` — a row of positions
 * in *picture* coordinates — so five sat on one line and the whole thing read
 * as a comb, with no far side at all. The owner took RING out of VERSUS on
 * 9 September 2026 and this is it: each strand is pinned at a longitude on the hem circle and
 * placed by the same projection every other surface in this repository uses:
 * `x = sin α`, and its width and its light taken from `cos α`. A strand on the
 * far side is drawn **behind the bell**, which the caller gets for free — this
 * whole pass is painted before the dome is — so the fringe is something the
 * body is standing in the middle of rather than something hung off its front.
 *
 * The three things the jump does to a strand — gathered while it crouches,
 * trailing while it flies, splashed on the landing — are the shipped numbers
 * and are unchanged, and so is each strand's own share of the signal.
 *
 * It takes a record rather than ten positional arguments because it is the
 * field on `WISP_LOOK` a candidate fringe is patched onto (`wisp-look.ts`).
 */
export function drawTentacles(f: WispFringe): void {
  const { ctx, rx, ry, t, j, dive, air, heading, noise, haze } = f;
  // The three things the jump does to a strand, unchanged from the shipped
  // fringe: short when gathered, short when splashed, longest at the two ends
  // of the arc; thrown outward on the landing; swept back while flying.
  const len = ry * (1.5 - j.crouch * 0.85 - j.land * 0.88 + dive * 0.6);
  const splay = 1 + j.land * 2.2 + air * 0.25;
  const drag = -heading * rx * 0.55 * (dive * 0.7 + air * 0.35);
  const theta = (t / SPIN_SECONDS) * Math.PI * 2;

  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < STRANDS; i++) {
    const p = PINS[i];
    if (!p) continue;
    const a = p.lon + theta;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    // Where the root lands, and how much of the hem's own width is left there.
    // `k` is the circle of latitude's radius, so this is the projection and not
    // an approximation of it.
    const bx = p.k * rx * 1.02 * sinA;
    const by = ry * (0.34 + p.cy * 0.1);
    // How much of the strand is facing us: 1 square on, 0 at the limb, and the
    // sign of `cosA` is which side of the bell it is on.
    const face = Math.abs(cosA);
    const sway = Math.sin(t * 1.7 + i * 1.15) * rx * 0.2 * (1 - j.land);
    const tipX = bx * splay + drag + sway;
    const tipY = by + len * (1 - j.land * 0.55);
    // The two nearest the front are the thick ones, and *which two that is
    // changes as the bell turns* — that is the whole of the difference from a
    // comb, where the middle pair are the same two strands forever.
    const near = cosA > 0.72;
    // A strand's own share of the signal — `strandWave` called rather than
    // re-typed, so the two sides of the pair flicker identically and the only
    // thing that can differ is where the strand is — multiplied by how much of
    // it the surface is showing.
    const hold =
      0.25 + 0.75 * Math.max(0, Math.min(1, 0.62 + strandWave(t, i) * 0.5 - noise * 0.5));
    const lit = surfaceDim(DIM, face);
    ctx.strokeStyle = haze(near ? PALETTE.wispRim : PALETTE.wisp);
    ctx.lineWidth = ry * (near ? 0.09 : 0.06) * (EDGE_WEIGHT + (1 - EDGE_WEIGHT) * face);
    ctx.globalAlpha = (near ? 0.9 : 0.7) * hold * lit;
    ctx.beginPath();
    ctx.moveTo(bx, by * 0.4);
    ctx.bezierCurveTo(
      bx + sway * 0.8,
      by + len * 0.34,
      tipX - sway * 0.6,
      by + len * 0.7,
      tipX,
      tipY,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/** One strand's own two-frequency wobble, in −1 to 1. The same shape of answer
 * `wispBands` uses and deliberately not the same numbers: a fringe that faded
 * in step with the band above it would read as one shutter over the whole
 * body, which is a screen effect rather than a body.
 *
 * Exported because the fringe above and any candidate offered against it want
 * the identical reading — a second
 * copy of these four frequencies would be two fringes flickering differently
 * on two phones being compared, which is the one thing a pair must not have
 * (`purity.test.ts`'s COPIES sweep, and `docs/versus.md`). */
export function strandWave(t: number, i: number): number {
  const k = i * 1.73 + 0.6;
  return Math.sin(t * 2.3 + k) * 0.55 + Math.sin(t * 4.1 + k * 1.9) * 0.45;
}
