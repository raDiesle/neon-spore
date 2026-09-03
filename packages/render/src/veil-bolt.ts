import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { PALETTE } from "./palette.js";
import { cloudEdge } from "./veil-shape.js";

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
    if (v === 1 && sinHash(id * 3 + 17, beat) > 0.5) continue;
    const count = v === 0 ? PER_BEAT : 2;
    for (let k = 0; k < count; k++) {
      const seed = id * 31 + v * 7 + k;
      // Each bolt burns out at its own rate — between about a fifth and a
      // third of a beat — so the volley arrives as one flash and frays out.
      const life = Math.max(0, 1 - since * (3.4 + sinHash(seed, beat) * 2.6));
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
  const angle = Math.PI * (0.82 + sinHash(seed * 9 + 3, beat) * 1.36);
  const e = cloudEdge(r, t, angle);

  // A wrong colour has shut the cloud: the whole thing goes red, and the
  // weather stops being pretty. It is the one state the pair has to read
  // across a room, so it does not get a palette.
  const pick = NEONS[Math.floor(sinHash(seed * 13 + 7, beat) * NEONS.length) % NEONS.length]!;
  const hot = shut > 0 ? PALETTE.redRim : pick[0];
  const glow = shut > 0 ? PALETTE.red : pick[1];

  // Small: a sixth to a third of the cloud's radius, which at the size a cloud
  // draws on a phone is seven to twelve pixels. They start *on* the outline
  // now rather than inside it, so they no longer need the length it took to
  // climb out of the shape — and short is the word the owner used.
  const len = r * (0.17 + sinHash(seed * 3 + 5, beat) * 0.16);
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
    const jitter = (sinHash(seed * 7 + i, beat) * 2 - 1) * len * 0.42;
    x += (e.nx * len) / 3 + tx * jitter;
    y += (e.ny * len) / 3 + ty * jitter;
    p.lineTo(x, y);
    if (i === 2) {
      const fx = (sinHash(seed * 11, beat) * 2 - 1) * len * 0.55;
      p.moveTo(x, y);
      p.lineTo(x + e.nx * len * 0.3 + tx * fx, y + e.ny * len * 0.3 + ty * fx);
      p.moveTo(x, y);
    }
  }
  return p;
}
