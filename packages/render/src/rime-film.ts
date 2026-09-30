import { smoothstep } from "./ease.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rimeCoreR } from "./rime-shape.js";

/**
 * **THE RIME's refreeze**, drawn (§29 row 11): after the third hit a thin
 * film ticks back over the spent core, a step thicker every beat, and
 * hairline cracks run through it. The film asks both seats for nothing, so it
 * carries neither cannon's colour, only the frost and the white of its cracks.
 *
 * **A scatter cracks it wider.** Every wipe or shield sent into it adds
 * hairlines and makes each one longer, for the rest of the refreeze, and the
 * cracks flash white as it lands (`RimeFx.scatter`). **The film shatters a
 * beat before the lens does**: through its last beat it fades, its cracks
 * run out past its edge, and its pieces fly off along them.
 *
 * The pose is `rimeFilm`'s (`rime-pose.ts`), read off the world every frame.
 */

/** How far the grown film reaches, in core radii, and how much of that it covers on its first tick. */
const FILM_R = 1.7;
const FILM_FIRST = 0.55;
/** Hairlines on the first beat, how many each beat adds and each scatter, and the most there are. */
const CRACKS_FIRST = 3;
const CRACKS_BEAT = 2;
const CRACKS_JAR = 3;
const CRACKS_MOST = 12;
/** How much longer each scatter makes every hairline, over the film's radius. */
const JAR_REACH = 0.3;
/** The golden angle: hairlines spread round the core without lining up. */
const SPREAD = 2.399963;
/** How much of a beat the film takes to tick one step thicker. */
const TICK = 0.25;

/** `film` from `rimeFilm`; `scatter`, how bright the last scatter's flash still is, 0..1. */
export function drawRimeFilm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  film: { into: number; beats: number; jars: number },
  scatter: number,
): void {
  const core = rimeCoreR(l);
  const left = film.beats - film.into;
  const breaking = left < 1 ? 1 - left : 0;
  const ticks = Math.floor(film.into);
  const tick = smoothstep(Math.min(1, (film.into - ticks) / TICK));
  const thick = Math.min(1, (ticks + tick) / Math.max(1, film.beats - 1));
  const r = core * FILM_R * (FILM_FIRST + (1 - FILM_FIRST) * thick);
  const fade = 1 - breaking;

  const disc = new Path2D();
  disc.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.rimeFrost, (0.3 + 0.4 * thick) * fade);
  ctx.fill(disc);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rimeFrostDeep, 0.8 * fade);
  ctx.stroke(disc);

  const count = Math.min(CRACKS_MOST, CRACKS_FIRST + CRACKS_BEAT * ticks + CRACKS_JAR * film.jars);
  const reach = r * (0.75 + JAR_REACH * film.jars) * (1 + breaking);
  const cracks = new Path2D();
  const shards = new Path2D();
  for (let k = 0; k < count; k++) {
    const a = k * SPREAD + 0.4;
    const kink = a + (k % 2 === 0 ? 0.18 : -0.18);
    const end = reach * (0.8 + 0.1 * (k % 3));
    cracks.moveTo(Math.cos(a) * core * 0.2, Math.sin(a) * core * 0.2);
    cracks.lineTo(Math.cos(kink) * end * 0.55, Math.sin(kink) * end * 0.55);
    cracks.lineTo(Math.cos(a) * end, Math.sin(a) * end);
    if (breaking > 0) shard(shards, a, r * (0.8 + 1.2 * breaking), core * 0.3 * fade);
  }
  ctx.lineWidth = STROKE.inner * 0.75;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.75 * (0.4 + 0.6 * fade));
  ctx.stroke(cracks);
  if (breaking > 0) {
    ctx.fillStyle = rgba(PALETTE.rimeFrost, 0.85 * fade);
    ctx.fill(shards);
  }
  if (scatter > 0) strokeGlow(ctx, cracks, PALETTE.hullRim, STROKE.inner, 1 + 2 * scatter);
}

/** A splinter of the film `at` out along angle `a`, `size` long, pointing the way it flies. */
function shard(p: Path2D, a: number, at: number, size: number): void {
  const x = Math.cos(a) * at;
  const y = Math.sin(a) * at;
  const side = size * 0.35;
  p.moveTo(x + Math.cos(a) * size, y + Math.sin(a) * size);
  p.lineTo(x - Math.sin(a) * side, y + Math.cos(a) * side);
  p.lineTo(x + Math.sin(a) * side, y - Math.cos(a) * side);
  p.closePath();
}
