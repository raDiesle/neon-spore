import { blobRadiusMul } from "@neon-spore/content";
import { type MazeState, mazeCurrent, mazeReadBeats } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * THE MAZE's clock, drawn on the outside of the heart.
 *
 * **The pair had a clock and no way to see it.** A round's reading phase runs
 * out after `mazeReadBeats` and a silence costs the hull exactly as a dead end
 * does (`sim/maze-clock.ts`, `sim/maze-verdict.ts`) — and until this, the only
 * warning either player got was the failure itself. The owner asked for the
 * time to be shown as the heart's own outer line filling round, glowing red,
 * and that is what this is: not a bar bolted to the side of the field but the
 * body in the middle of the drum going red round its edge.
 *
 * **It is the heart's own contour and not a circle round it.** The same lobes,
 * the same wobble, the same breathing radius, read out of `blobRadiusMul` —
 * the one function the muscle itself is built from — a little way outside the
 * skin. A ring drawn round the body would have been one more piece of
 * scaffolding on a field that has none; a line the *body* wears is the same
 * vocabulary as everything else here (`maze-heart.ts`).
 *
 * **Red whichever colour the heart is running.** The round alternates between
 * a slick's red and a bulb's cyan, and player 2 has to fire the one she can
 * see — so the clock is deliberately *not* that colour. It is the alarm, drawn
 * in the one hue this game has always used for damage, and on a red round it
 * is the brightness and the sweep that separate the two rather than the hue.
 *
 * **Nothing is stored.** How far round it has got is the beat the reading
 * phase began on measured against the beat now, so both phones fill the same
 * amount at the same moment and `Effects.reset()` has nothing of this to
 * clear.
 */

/** The heart's contour, as the numbers it is built from. Handed over rather
 * than re-derived, so the clock can never trace a body the heart is not. */
export interface MazeSkin {
  rx: number;
  ry: number;
  lobes: number;
  depth: number;
  wobble: number;
  t: number;
  seed: number;
}

/** How far outside the skin the clock is drawn. Far enough to be a second
 * line rather than a thickening of the first, close enough to be the body's —
 * and the muscle swells by nearly a third on a thump, so a smaller gap than
 * this is one the heart closes on its own twice a beat. */
const CLEARANCE = 1.24;

/** Points on the whole turn. The clock is stroked as a polyline, so this is
 * also how finely the leading end can be placed. */
const STEPS = 96;

/** Where the fill starts and which way it runs: straight up on the screen,
 * turning the way a clock does. The heart's own contour is drawn a quarter
 * turn over (`maze-heart.ts` rotates the whole body), so the local angle that
 * points at the top of the screen is half a turn back. */
const START = -Math.PI;

/**
 * How much of the reading phase has been spent, 0 fresh and 1 out of time.
 *
 * Zero in every other phase, which is the honest answer: the clock is only
 * running while the pair may still turn the wheel and fire. The instant the
 * shot goes in it stops, because nothing the pair does after that can be late.
 */
export function mazeClockRun(m: MazeState, beat: number, beatPhase: number): number {
  if (m.phase !== "read") return 0;
  const wheel = mazeCurrent(m);
  if (wheel === null) return 0;
  const total = mazeReadBeats(wheel.entrances.length);
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, (beat - m.phaseBeat + beatPhase) / total));
}

/** One point of the contour at `turn` of a whole turn round it. */
function at(skin: MazeSkin, turn: number, out: number): { x: number; y: number } {
  const a = START + turn * Math.PI * 2;
  const m = blobRadiusMul(a, skin.lobes, skin.depth, skin.wobble, skin.t, skin.seed) * out;
  return { x: Math.cos(a) * skin.rx * m, y: Math.sin(a) * skin.ry * m };
}

/** A stretch of the contour, from `from` to `to` of a whole turn. */
function arc(skin: MazeSkin, from: number, to: number, out: number): Path2D {
  const path = new Path2D();
  const steps = Math.max(1, Math.ceil((to - from) * STEPS));
  for (let i = 0; i <= steps; i++) {
    const p = at(skin, from + ((to - from) * i) / steps, out);
    if (i === 0) path.moveTo(p.x, p.y);
    else path.lineTo(p.x, p.y);
  }
  return path;
}

/**
 * The clock, drawn in the heart's own frame — the caller has already put the
 * origin at the middle of the drum and turned it the way the body is turned,
 * so everything here is measured from (0, 0).
 *
 * `run` is what `mazeClockRun` answered and `time` is the heart's own clock,
 * which the travelling highlight rides: the growth says how long is left and
 * the sweep says the thing is *running*, which a gauge that only grew would
 * not — at this tempo a fresh round moves the leading end by about a degree a
 * beat, and a degree a beat is indistinguishable from stopped.
 */
export function drawMazeClock(ctx: CanvasRenderingContext2D, skin: MazeSkin, run: number): void {
  if (run <= 0) return;
  const heat = run * run;
  // **Not additively.** The caller draws the heart under `lighter`, and red
  // laid over a lit cyan muscle that way comes out white — which is what the
  // first cut of this did: a clock the owner asked to be red read as a pale
  // ring. Everything below is laid *on* the body instead, so red stays red on
  // both of the colours the heart runs.
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "source-over";

  // The track: the whole turn, barely there, so what is filled is read against
  // what is not rather than against nothing.
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = 1.4;
  ctx.stroke(arc(skin, 0, 1, CLEARANCE));

  // The fill, in two passes: a wide soft red under a bright core, both
  // thickening the whole way round so the last quarter is loud on a screen
  // held at arm's length — which is the only place this is ever read from.
  const filled = arc(skin, 0, run, CLEARANCE);
  ctx.globalAlpha = 0.3 + 0.35 * heat;
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = 5 + 7 * heat;
  ctx.stroke(filled);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = PALETTE.redRim;
  ctx.lineWidth = 2 + 2.6 * heat;
  ctx.stroke(filled);

  // The sweep: a short bright stretch running along what is already filled,
  // twice every three beats. It is the difference between a clock that is
  // running and a mark that is merely there — a fresh round moves the leading
  // end by about a degree a beat, and a degree a beat is indistinguishable
  // from stopped.
  const lap = (skin.t * 0.65) % 1;
  const tail = Math.max(0, lap * run - 0.08);
  const nose = Math.min(run, lap * run + 0.08);
  if (nose > tail) {
    ctx.lineWidth = 3 + 3 * heat;
    ctx.strokeStyle = PALETTE.redRim;
    ctx.stroke(arc(skin, tail, nose, CLEARANCE));
  }
  ctx.globalCompositeOperation = prev;

  // The leading end, lit. A body's worth of light at the point the fill has
  // reached, which is the part of this an eye actually tracks — and the one
  // piece of it that *is* additive, because a light is light.
  const head = at(skin, run, CLEARANCE);
  halo(ctx, head.x, head.y, skin.rx * (0.4 + 0.35 * heat), PALETTE.red, 0.5 + 0.4 * heat);
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
}
