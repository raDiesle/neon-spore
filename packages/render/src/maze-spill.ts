import { blobPath } from "@neon-spore/content";
import { MAZE_VERDICT_BEATS, type MazeState } from "@neon-spore/sim";
import { mazeScatter } from "./maze-blood.js";

/**
 * What a shot the heart refuses throws back, and how far it gets.
 *
 * **The heart takes its own colour and only its own.** A shot of the other one
 * still goes in, still walks the whole corridor, and is thrown back out at the
 * end of it (`sim/maze-round.ts`). That used to arrive at the ship as a meteor
 * falling on the hull from nowhere, and the owner asked for the thing that
 * actually happened instead: the heart bursts, blood goes across the whole
 * maze, and a great deal of it lands on the ship and runs down the front of
 * the control panel.
 *
 * **The geometry is here and the drawing is in two places, because the picture
 * is in two layers.** The gout across the drum goes down with the maze
 * (`maze-draw.ts`); the pool on the hull and the drips off it have to be drawn
 * over the finished band, which is the last pass of a frame (`frame-ship.ts`).
 * One file for the clock and the scatter, so the two halves cannot land in
 * different places or dry at different rates.
 *
 * **Nothing is stored.** How far the spill has got is the beat the verdict
 * landed on measured against the beat now, and where each drop went is an
 * integer hash of its own index (`mazeScatter`) — so both phones spill the
 * same blood in the same places, a restart spills it again, and
 * `Effects.reset()` has nothing of this to clear.
 */

/** Beats the gout takes to fly out and land. */
const THROW = 0.8;
/** Beats a drip takes to run its full length down the ship. */
const RUN = 5;
/** Beats before it has dried away to nothing. */
const LIFE = 11;
/** Beats it holds at full strength before it starts drying. */
const HOLD = 6.5;

/**
 * How long ago the heart threw this, in beats, or -1 for no spill at all.
 *
 * The verdict is three beats and the wheel is then handed straight back
 * standing where it was left (`sim/maze-verdict.ts`), so the age carries on
 * across that hand-back rather than stopping at it: the phase changes but the
 * blood does not know that. `read` after a refusal is the only way to be in
 * that phase with `lost` still `"color"` — a dead end and a silence both go by
 * way of `lead`, and a win clears it — so the continuation cannot be claimed
 * by a round the heart never bled in.
 */
export function mazeSpillAge(m: MazeState, beat: number, beatPhase: number): number {
  if (m.lost !== "color" || m.verdict === 1) return -1;
  const since = beat - m.phaseBeat + beatPhase;
  if (since < 0) return -1;
  const age = m.phase === "verdict" ? since : m.phase === "read" ? MAZE_VERDICT_BEATS + since : -1;
  return age >= 0 && age < LIFE ? age : -1;
}

/** How wet it still is, 1 fresh and 0 dried away. */
export function mazeSpillWet(age: number): number {
  return Math.max(0, Math.min(1, (LIFE - age) / (LIFE - HOLD)));
}

/** How far the gout has flown, 0 leaving the heart and 1 landed. */
export function mazeSpillFlown(age: number): number {
  return Math.max(0, Math.min(1, age / THROW));
}

/** How far a drip has run, 0 at the surface and 1 at its full length. It eases
 * out, because blood runs fast off a lip and then crawls. */
export function mazeSpillRun(age: number): number {
  const t = Math.max(0, Math.min(1, age / RUN));
  return 1 - (1 - t) ** 2.4;
}

/** One thrown splash: which way it went, how far, how big, how it lies. */
export interface SpillDrop {
  a: number;
  dist: number;
  size: number;
  turn: number;
  seed: number;
}

/** The gout across the drum: big and thrown far, so it reads as the middle of
 * the maze bursting rather than as more of the blood already on its floor. */
export function spillDrops(round: number, many = 46): SpillDrop[] {
  const out: SpillDrop[] = [];
  for (let i = 0; i < many; i++) {
    out.push({
      a: mazeScatter(round + 7, i, 11) * Math.PI * 2,
      dist: 0.12 + mazeScatter(round + 7, i, 12) ** 0.7 * 0.94,
      size: 0.035 + mazeScatter(round + 7, i, 13) ** 2 * 0.13,
      turn: mazeScatter(round + 7, i, 14) * Math.PI,
      seed: 1 + Math.floor(mazeScatter(round + 7, i, 15) * 90),
    });
  }
  return out;
}

/** A splash, drawn where it landed. A lobed contour and not a dot, which is
 * what every other body on this field is made of. */
export function drawSpillDrop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  drop: SpillDrop,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(drop.turn);
  ctx.fill(new Path2D(blobPath(0, 0, size, size * 0.7, 3, 0.36, 0.14, drop.seed, drop.seed, 14)));
  ctx.restore();
}

/**
 * The gout thrown across the whole drum, from the heart outwards.
 *
 * `r` is the drum's own radius rather than the heart's room, because that is
 * the point: `maze-blood.ts` puts what the heart leaks onto the floor of the
 * room it is in, and this goes **across the maze** — through the corridors,
 * over the walls, out past the rim.
 */
export function drawMazeSpill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  m: MazeState,
  tint: string,
  age: number,
): void {
  const flown = mazeSpillFlown(age);
  const wet = mazeSpillWet(age);
  if (flown <= 0 || wet <= 0) return;
  ctx.save();
  ctx.fillStyle = tint;
  for (const drop of spillDrops(m.round)) {
    // A drop that has further to go is still travelling when a near one has
    // landed, so the gout arrives outwards rather than all at once.
    const reach = Math.max(0, Math.min(1, flown / Math.max(0.35, drop.dist)));
    if (reach <= 0) continue;
    const dist = r * drop.dist * reach;
    ctx.globalAlpha = wet * (0.34 + 0.44 * (1 - drop.dist)) * (0.4 + 0.6 * reach);
    drawSpillDrop(
      ctx,
      cx + Math.cos(drop.a) * dist,
      cy + Math.sin(drop.a) * dist,
      r * drop.size * (0.45 + 0.55 * reach),
      drop,
    );
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
