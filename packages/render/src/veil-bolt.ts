import { PALETTE } from "./palette.js";

/** The bolt itself, and the light it throws into the vapour around it. */
const BOLT = "#DCE6FF";
const BOLT_GLOW = "#9FB6FF";

/**
 * THE VEIL's lightning, and the light it throws into the vapour around it.
 *
 * Its own file beside `veil.ts` for the reason `clasp-lattice.ts` sits beside
 * `clasp.ts`: the cloud is a contour with a gradient in it and does not change
 * again, while this is the half that is a *picture* and will be argued about.
 * The seam is also where the clip is — everything here is drawn inside the
 * cloud's own path, so a bolt cannot light anything that is not weather.
 *
 * **It is on the beat, and that is a mechanic rather than a flourish.** The
 * pair counts beats to the morph (`veilBeatsToMorph`), and a flash that lands
 * on the count puts the metronome inside the thing they are counting about —
 * so player 1 can say "two more" and player 2 can watch the two go by without
 * either of them looking at the HUD.
 *
 * **And the cloud lights up where the bolt is**, which is what the owner asked
 * for by name. The glow is a radial gradient at the bolt's own origin, painted
 * before the bolt and under it, so the vapour brightens around a strike
 * instead of the whole shape flickering as one lamp.
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
 * The bolts, clipped to the cloud so the light they throw stays inside the
 * weather. One on the beat, forking, plus a second smaller one on the offbeat
 * for the clouds whose scatter asks for it — so the rhythm is a beat and not a
 * metronome tick.
 */
export function drawVeilBolts(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  r: number,
  beats: number,
  id: number,
  shut: number,
  seeThrough: boolean,
): void {
  ctx.save();
  ctx.clip(path);
  const beat = Math.floor(beats);
  const phase = beats - beat;
  // Two strikes per beat at most, the second at half strength and only when
  // this cloud's own scatter says so. `k` is which of the two.
  for (let k = 0; k < 2; k++) {
    const at = k === 0 ? 0 : 0.5;
    const since = phase - at;
    if (since < 0) continue;
    // Over roughly the first half of the beat for the main strike and a
    // quarter for the second. Fast enough to read as lightning, slow enough
    // that a glance at any moment usually catches one — which is the point:
    // the pair is counting these.
    const life = Math.max(0, 1 - since * (k === 0 ? 2.4 : 4.2));
    if (life <= 0.02) continue;
    const s = veilScatter(id + k * 31, beat);
    if (k === 1 && s > 0.55) continue;
    const strength = (k === 0 ? 1 : 0.5) * life * life;
    strike(ctx, r, s, id + k, beat, strength, shut, seeThrough);
  }
  ctx.restore();
}

/** One bolt: a jagged line down through the cloud, and the glow it throws into
 * the vapour around the point it started at — which is the thing the owner
 * asked for by name, the cloud lighting up *where* the lightning is. */
function strike(
  ctx: CanvasRenderingContext2D,
  r: number,
  s: number,
  seed: number,
  beat: number,
  strength: number,
  shut: number,
  seeThrough: boolean,
): void {
  const hot = shut > 0 ? PALETTE.red : BOLT;
  const glow = shut > 0 ? PALETTE.redRim : BOLT_GLOW;
  const x0 = (s * 2 - 1) * r * 0.5;
  const y0 = -r * 0.62;

  // The light in the vapour first, so the bolt is drawn on top of its own
  // glow rather than under it. This is the half the owner asked for by name:
  // the cloud brightens *where the lightning is*, so a strike on the left of
  // one and a strike on the right are two different pictures.
  const lit = ctx.createRadialGradient(x0, y0 + r * 0.2, 0, x0, y0 + r * 0.2, r * 1.1);
  lit.addColorStop(0, glow);
  lit.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = strength * (seeThrough ? 0.62 : 0.85);
  ctx.fillStyle = lit;
  ctx.fillRect(-r * 1.6, -r, r * 3.2, r * 2);

  // **Two passes, wide and soft under narrow and hot.** The first version drew
  // one 1.5 px line at 39% alpha and it was invisible in a frame: a cloud is
  // about 55 px across on a phone, so a hairline inside one is a hairline
  // nobody finds. Glow comes from a soft aura around the line rather than from
  // a thicker line (docs/spec/graphics.md), and lightning is the one thing on
  // this field that has every right to be the brightest thing in its own tile.
  const path = boltPath(r, x0, y0, seed, beat);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.globalAlpha = Math.min(1, strength * 0.5);
  ctx.strokeStyle = glow;
  ctx.lineWidth = Math.max(3, r * 0.2);
  ctx.stroke(path);

  ctx.globalAlpha = Math.min(1, strength * (seeThrough ? 0.9 : 1));
  ctx.strokeStyle = hot;
  ctx.lineWidth = Math.max(1.4, r * 0.075);
  ctx.stroke(path);
  ctx.globalAlpha = 1;
}

/** The line itself: four steps down through the cloud with one fork halfway,
 * always at the same step so it reads as a shape rather than as noise. */
function boltPath(r: number, x0: number, y0: number, seed: number, beat: number): Path2D {
  const p = new Path2D();
  p.moveTo(x0, y0);
  let x = x0;
  let y = y0;
  for (let i = 1; i <= 4; i++) {
    x += (veilScatter(seed * 7 + i, beat) * 2 - 1) * r * 0.26;
    y += (r * 1.15) / 4;
    p.lineTo(x, y);
    if (i === 2) {
      p.moveTo(x, y);
      p.lineTo(x + (veilScatter(seed * 11, beat) * 2 - 1) * r * 0.45, y + r * 0.32);
      p.moveTo(x, y);
    }
  }
  return p;
}
