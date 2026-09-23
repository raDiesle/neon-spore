import { halo, strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import { collar, tongues } from "./lost-bleed.js";
import type { LostPaint } from "./lost-look.js";
import { PALETTE } from "./palette.js";

/**
 * Where the ship was broken, drawn as a wound: a ragged hole in the plates
 * with a focus ring round it, bleeding red.
 *
 * **The owner asked for it by name on 22 September 2026** — *change the
 * vertical visual of where the damage happens so it is instead some radial
 * circle visual around where the damage happened, with some cool animations
 * where slowly blood slime in red colour is coming outside of the borders of
 * the focus circle (like a wound) and very slowly flows down and continuously
 * more blood comes up* — which is the first of the three look exemptions
 * (`docs/looks.md`).
 *
 * It replaces two things at once. The hole was a **column**: a lit slot two
 * and a half tiles wide running the whole height of the phone, which read as
 * a rail rather than as a place. And the fluid was thirteen violet rivulets
 * falling the full width of the glass every three and a half seconds
 * (deleted with this), which is the movement he asked to have
 * taken away — a screen the pair are meant to read had a curtain crossing it.
 * What is left moving is one thing in one place, and it is `lost-bleed.ts`:
 * six slow tongues of red out of one rim, the shortest of them thirteen
 * seconds long.
 *
 * **The blood is red and not the hull's violet.** The rivulets argued the
 * other way — the ship is what was broken, so the screen should bleed the
 * thing that lost — and the owner overruled it in the same sentence he asked
 * for the circle. It is the honest reading anyway: the hole is what came
 * through, so what wells out of it is what came through.
 *
 * **Everything here is a function of the layout and the breach.** Nothing
 * outlives a frame (`restart.test.ts`'s rule) and nothing is random — the rim
 * is torn with `signedHash`, because the screen is drawn on two phones on one
 * tick and both have to tear the same way.
 */

/** The hole's radius, in tiles. */
const R_TILES = 1.8;
/** How far the rim wanders off the true circle, as a share of the radius. */
const RAG = 0.15;
/** Points round the rim. Enough that a bite reads as a bite and not a facet. */
const TEETH = 30;
/** The focus ring's radius, as a multiple of the hole's. */
const RING = 1.35;
/**
 * The bloom under the whole thing, as a multiple of the hole's radius.
 *
 * One sprite at one radius for the whole wound rather than one per tongue
 * head: `halo` bakes per colour and radius and keeps it for the session
 * (`glow.ts`), and `baked-growth.test.ts` is the test that said so the last
 * time this screen bled — thirteen rivulet heads at their own thicknesses
 * were thirteen sprites.
 */
const BLOOM = 1.9;

export interface Wound {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly rim: readonly { readonly x: number; readonly y: number }[];
  /** The colour the hit arrived in, for the ring and the lit rim. */
  readonly hex: string;
  /**
   * **How far the wound has come up, 0 to 1 — the plates' own progress.**
   *
   * Every alpha on the wound and on its blood is multiplied by this, and
   * nothing about its shape moves. The owner, 22 September 2026: *the dark
   * circle animation must be done together with the circle animation, so not
   * sequential waiting and then show the new animation of circle focus, but
   * together.* So the number is the plates' `shut`, handed down rather than
   * kept here (`lost-shut.ts`): one clock, and the two cannot drift apart
   * because there is not a second one to drift from.
   *
   * **It is a light and not a growth.** The hole's radius is fixed — `halo`
   * bakes a sprite per colour and radius and keeps it for the session, so a
   * bloom that grew over the arrival would leave one canvas per frame behind
   * it (`baked-growth.test.ts`) — and the ring is still, which is what the
   * owner asked for in the sentence that put it there.
   */
  readonly arrive: number;
}

/**
 * The hole, where the hull was broken, or null on a wave that scarred nothing
 * — a wall earths through the dome and leaves no mark (`lost-look.ts`).
 *
 * **It is centred on the membrane and not moved off it.** The hull line sits
 * about a tile above the play area's foot on a phone, so the lower quarter of
 * the circle hangs below it — over the ship's own body, which is what is there
 * and is continuous with the skin above it. Lifting the circle to keep it
 * inside the play area was the first drawing of this and it opened the hole on
 * empty sky: the one fact this screen exists to show is *where it got through*,
 * and a hole a hand's width above the hull shows nothing at all. The only
 * clamp left is against the bottom of the screen.
 */
export function woundOf(p: LostPaint, arrive: number): Wound | null {
  if (p.breachX === null) return null;
  const r = p.l.tile * R_TILES;
  const cx = p.breachX;
  const cy = Math.min(p.surfaceY(cx), p.l.height - r * RING);
  const rim = [];
  for (let i = 0; i < TEETH; i++) {
    const a = (i / TEETH) * Math.PI * 2;
    // `signedHash` and not a random: both phones draw this screen and both
    // have to tear the same way.
    const k = r * (1 + signedHash(i, 3, 0) * RAG);
    rim.push({ x: cx + Math.cos(a) * k, y: cy + Math.sin(a) * k });
  }
  return { cx, cy, r, rim, hex: p.breach?.hex ?? PALETTE.ember, arrive };
}

/**
 * The rim, into whatever path the caller has open.
 *
 * Its one reader is the plates' clip (`lost-shut.ts`): the hole is a hole the
 * held field is seen through, so it comes off the plates as a cut rather than
 * going on top of them as a shape.
 */
export function traceWound(ctx: CanvasRenderingContext2D, w: Wound): void {
  for (const [i, q] of w.rim.entries()) {
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  }
  ctx.closePath();
}

/**
 * The wound: the bloom behind it, the collar of blood standing inside the rim,
 * the tongues that come out of it, the lit rim itself and the focus ring.
 *
 * **The ring is still.** Every picture this screen has worn moved, and the
 * owner's complaint on 22 September 2026 was that it moved; what points at the
 * place is a reticle that is simply there, and the only thing left with a
 * clock on it is the blood — six tongues, the fastest of them thirteen seconds
 * end to end.
 *
 * **What arrives is its light.** The whole wound is drawn at `w.arrive`, which
 * is how far the plates have shut, so the focus comes up with the dark rather
 * than after it — the owner's second report the same day, that the circle had
 * to come much quicker and *together* with the plates, not behind them. It was
 * behind them because this used to be clipped to the plates and the hole sits
 * near the foot of the screen, so the bottom plate had to sweep past it before
 * a single pixel of it showed. Nothing here moves on that clock; it only
 * lights.
 *
 * The collar is what *keeps* it bleeding. A tongue runs, thins and goes, and a
 * hole with only tongues on it empties between them; a band of red standing
 * inside the rim the whole time, swelling on a slow breath, is the screen
 * saying that more is coming up behind — which is what the owner asked for in
 * the same sentence as the tongues.
 */
export function drawWound(ctx: CanvasRenderingContext2D, w: Wound, age: number): void {
  halo(ctx, w.cx, w.cy, w.r * BLOOM, PALETTE.red, 0.15 * w.arrive);
  collar(ctx, w, age);

  // The rim and the reticle, lit in the colour the hit arrived in
  // (`breach-hue.ts`) — and **the arrival is their alpha, not only their
  // intensity**: a ring that is not there yet is not drawn at all, which is the
  // case that gave `strokeGlow` its `alpha`. Arrival is in both, as it was when
  // it was spelled on the colour, so the glow comes up as its square.
  const bright = Math.max(1, w.r * 0.07);
  const edge = new Path2D();
  for (const [i, q] of w.rim.entries()) {
    if (i === 0) edge.moveTo(q.x, q.y);
    else edge.lineTo(q.x, q.y);
  }
  edge.closePath();
  strokeGlow(ctx, edge, w.hex, bright, w.arrive, w.arrive);

  strokeGlow(ctx, reticle(w), w.hex, Math.max(1, w.r * 0.03), 0.5 * w.arrive, w.arrive);
  tongues(ctx, w, age);
}

/** The reticle: the ring, and the four ticks that make it read as an aim. */
function reticle(w: Wound): Path2D {
  const path = new Path2D();
  const rr = w.r * RING;
  path.moveTo(w.cx + rr, w.cy);
  path.arc(w.cx, w.cy, rr, 0, Math.PI * 2);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * (0.25 + i * 0.5);
    const c = Math.cos(a);
    const s = Math.sin(a);
    path.moveTo(w.cx + c * rr * 0.86, w.cy + s * rr * 0.86);
    path.lineTo(w.cx + c * rr * 1.18, w.cy + s * rr * 1.18);
  }
  return path;
}
