import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import { cloudEdge } from "./veil-shape.js";

/**
 * THE VEIL's lightning: small bolts that break out of the cloud's own border,
 * scattered round it, each in its own neon colour.
 *
 * Its own file beside `veil.ts` for the reason `clasp-lattice.ts` sits beside
 * `clasp.ts`: the cloud is a contour with a gradient in it and does not change
 * again, while this is the half that is a *picture* and will be argued about.
 *
 * **It is on the beat, and that is a mechanic rather than a flourish.** The
 * pair counts beats to the morph (`veilBeatsToMorph`), and a flash that lands
 * on the count puts the metronome inside the thing they are counting about —
 * so player 1 can say "two more" and player 2 can watch the two go by without
 * either of them looking at the HUD. Every bolt in a volley therefore *starts*
 * on the beat exactly; only how long each one lasts is spread.
 *
 * **Why the border rather than through the middle.** The first version drew
 * one long fork from the top of the cloud down through it, clipped to the
 * contour. Clipped lightning is lightning in a cutout: it cannot light
 * anything outside the shape, so the cloud flickered as one flat lamp and the
 * strike had no location. These start *on* the outline (`cloudEdge`) and walk
 * outward, unclipped, over the fog `veil-shape.ts` lays down — so a strike on
 * the left of a cloud and a strike on its right are two different pictures,
 * which is what the owner asked for by name.
 *
 * **And they are not all one colour.** A bolt is the one thing on this field
 * with every right to be the brightest object in its tile, and a white one
 * beside a red body and a cyan body reads as neither. Cycling the palette's
 * neons per bolt makes the weather its own thing rather than a tint of
 * whatever is inside it — and it cannot leak the answer, because the colours
 * are picked from the body's *id*, which both screens have, and never from its
 * colour, which only one of them does.
 */

/**
 * A small deterministic spread from two integers. Not `Math.random`: render/ is
 * allowed one, but two phones drawing different lightning would be two phones
 * with a different picture of the same beat, and the beat is what the pair is
 * counting.
 */
export function veilScatter(a: number, b: number): number {
  const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * The neons a bolt can be, hot core first and the light it throws second.
 *
 * Five, and every one of them already in the game's vocabulary — nothing here
 * is a colour invented for weather. The two ammunition colours are in the list
 * on purpose and are safe to be: a bolt lands for a fifth of a beat somewhere
 * on the rim, while the body's colour is a whole silhouette in the middle, and
 * nobody has ever read one as the other.
 */
const NEONS: readonly [hot: string, glow: string][] = [
  [PALETTE.cyanRim, PALETTE.cyan],
  [PALETTE.redRim, PALETTE.red],
  [PALETTE.hullRim, PALETTE.hull],
  [PALETTE.goodRim, PALETTE.good],
  [PALETTE.podRim, PALETTE.pod],
];

/** How many break out on a beat. Enough to be scattered, few enough that the
 * eye can still say "that one, on the left". */
const PER_BEAT = 5;

/**
 * A volley. Drawn in the cloud's own space — the caller has already translated
 * to its centre — and deliberately **not** clipped to the contour.
 *
 * `beats` is `world.beat + beatPhase`, `t` the contour clock the fill used (so
 * a bolt starts on the outline as it is drawn this frame, not as it was drawn
 * at rest), `shut` is 1 while a wrong colour holds the cloud closed.
 */
export function drawVeilBolts(
  ctx: CanvasRenderingContext2D,
  r: number,
  t: number,
  beats: number,
  id: number,
  shut: number,
  seeThrough: boolean,
): void {
  const beat = Math.floor(beats);
  const phase = beats - beat;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  // Two volleys per beat at most: the full one on the count, and a lighter one
  // on the half for the clouds whose own scatter asks for it, so the rhythm is
  // a beat rather than a metronome tick.
  for (let v = 0; v < 2; v++) {
    const at = v === 0 ? 0 : 0.5;
    const since = phase - at;
    if (since < 0) continue;
    if (v === 1 && veilScatter(id * 3 + 17, beat) > 0.5) continue;
    const count = v === 0 ? PER_BEAT : 2;
    for (let k = 0; k < count; k++) {
      const seed = id * 31 + v * 7 + k;
      // Each bolt burns out at its own rate — between about a fifth and a
      // third of a beat — so the volley arrives as one flash and frays out.
      const life = Math.max(0, 1 - since * (3.4 + veilScatter(seed, beat) * 2.6));
      if (life <= 0.03) continue;
      strike(ctx, r, t, seed, beat, life * life * (v === 0 ? 1 : 0.6), shut, seeThrough);
    }
  }
  ctx.restore();
}

/**
 * One bolt: a point on the border, three short steps out from it with a jitter
 * across the normal, and a small light in the vapour where it started.
 */
function strike(
  ctx: CanvasRenderingContext2D,
  r: number,
  t: number,
  seed: number,
  beat: number,
  strength: number,
  shut: number,
  seeThrough: boolean,
): void {
  // Where on the rim. The range covers the top and both flanks and stops
  // short of straight down: a cloud's underside is the flat one, and lightning
  // crawling along it reads as a fringe on a body rather than as weather.
  const angle = Math.PI * (0.82 + veilScatter(seed * 9 + 3, beat) * 1.36);
  const e = cloudEdge(r, t, angle);

  // A wrong colour has shut the cloud: the whole thing goes red, and the
  // weather stops being pretty. It is the one state the pair has to read
  // across a room, so it does not get a palette.
  const pick = NEONS[Math.floor(veilScatter(seed * 13 + 7, beat) * NEONS.length) % NEONS.length]!;
  const hot = shut > 0 ? PALETTE.redRim : pick[0];
  const glow = shut > 0 ? PALETTE.red : pick[1];

  // Small: a sixth to a third of the cloud's radius, which at the size a cloud
  // draws on a phone is seven to twelve pixels. They start *on* the outline
  // now rather than inside it, so they no longer need the length it took to
  // climb out of the shape — and short is the word the owner used.
  const len = r * (0.17 + veilScatter(seed * 3 + 5, beat) * 0.16);
  const path = boltPath(e, len, seed, beat);

  // The light in the vapour first, under the bolt rather than over it, at the
  // point it broke out of. `halo` rather than `shadowBlur`, for `glow.ts`'s
  // reason — and it is what the fog next door exists to catch.
  halo(ctx, e.x, e.y, len * 2.6, glow, strength * (seeThrough ? 0.45 : 0.6));

  // **Two passes, wide and soft under narrow and hot.** A single hairline was
  // invisible in a frame: a cloud is about 55 px across on a phone, so a 1.5 px
  // line inside one is a line nobody finds. Glow comes from a soft aura around
  // the line rather than from a thicker line (docs/spec/graphics.md).
  ctx.globalAlpha = Math.min(1, strength * 0.7);
  ctx.strokeStyle = glow;
  ctx.lineWidth = Math.max(1.8, r * 0.09);
  ctx.stroke(path);

  ctx.globalAlpha = Math.min(1, strength * (seeThrough ? 0.9 : 1));
  ctx.strokeStyle = hot;
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.stroke(path);
  ctx.globalAlpha = 1;
}

/**
 * The line itself: three steps out along the border's own normal, each one
 * shoved sideways across it, and a single short fork off the middle joint so
 * the shape is lightning rather than a scratch.
 */
function boltPath(
  e: { x: number; y: number; nx: number; ny: number },
  len: number,
  seed: number,
  beat: number,
): Path2D {
  // Across the normal, for the sideways shove and the fork.
  const tx = -e.ny;
  const ty = e.nx;
  const p = new Path2D();
  p.moveTo(e.x, e.y);
  let x = e.x;
  let y = e.y;
  for (let i = 1; i <= 3; i++) {
    const jitter = (veilScatter(seed * 7 + i, beat) * 2 - 1) * len * 0.42;
    x += (e.nx * len) / 3 + tx * jitter;
    y += (e.ny * len) / 3 + ty * jitter;
    p.lineTo(x, y);
    if (i === 2) {
      const fx = (veilScatter(seed * 11, beat) * 2 - 1) * len * 0.55;
      p.moveTo(x, y);
      p.lineTo(x + e.nx * len * 0.3 + tx * fx, y + e.ny * len * 0.3 + ty * fx);
      p.moveTo(x, y);
    }
  }
  return p;
}
