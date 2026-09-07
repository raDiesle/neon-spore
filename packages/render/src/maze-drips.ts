import { mazeRound, midCol, type World } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { mazeScatter } from "./maze-blood.js";
import { mazeHeartBlood } from "./maze-heart.js";
import {
  drawSpillDrop,
  mazeSpillAge,
  mazeSpillFlown,
  mazeSpillRun,
  mazeSpillWet,
  spillDrops,
} from "./maze-spill.js";

/**
 * The half of a refused shot that lands on the ship: a pool across the top of
 * the hull, and what runs off it down the front of the control panel.
 *
 * **It is drawn last, over the finished band, and that is the whole reason it
 * is not in `maze-draw.ts`.** The owner asked for the blood to go *far* — over
 * the hull, off the lip of it and down across the top of the panel the pair
 * has its hands on — and everything the maze draws goes down before the ship
 * and the band are painted. So `frame-ship.ts` calls this at the end of the
 * overlay pass, which is the one place on a frame that is above both.
 *
 * **It lies on the membrane rather than on a line.** The hull breathes, so
 * every drop takes its y from the same surface sampler the hull was drawn from
 * — a pool laid on a flat `hullY` floats above the skin on half the frames.
 *
 * The clock, the scatter and the shape of one splash are `maze-spill.ts`
 * next door: one file for how far the spill has got, so the gout on the drum
 * and the pool on the ship can never dry at different rates.
 */

/** Drips that run off the hull. Enough to read as a mess, few enough that each
 * one is a drip rather than a wash. */
const DRIPS = 18;
/** Splashes lying on the hull itself. */
const POOL = 30;

/** How far a drip reaches at full length, as a share of the way from the hull
 * down into the band. Past 1 it is over the panel, which is the point. */
const NEAR = 0.35;
const FAR = 1.25;

export function drawMazeDrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beat: number,
  beatPhase: number,
  surfaceY: (x: number) => number = () => l.hullY,
): void {
  const m = mazeRound(world);
  if (m === null) return;
  const age = mazeSpillAge(m, beat, beatPhase);
  if (age < 0) return;
  const wet = mazeSpillWet(age);
  const flown = mazeSpillFlown(age);
  if (wet <= 0 || flown <= 0) return;

  const { tint, rim } = mazeHeartBlood(m.round);
  // Where it came down. The column the shot went up is where most of it is,
  // and the rest is thrown across the width of the ship — a gout out of the
  // middle of the drum does not land in one lane.
  const from = tileCX(l, m.verdictCol < 0 ? midCol(world.cfg) : m.verdictCol);
  // How far below the hull a drip may reach, at its longest.
  const drop = l.bandTop - l.hullY + l.bandHeight * 0.3;

  ctx.save();
  ctx.fillStyle = tint;

  // The pool: splashes lying along the skin, thickest under the column it came
  // down in and thinning out to either side.
  for (const [i, splash] of spillDrops(m.round, POOL).entries()) {
    const spread = (mazeScatter(m.round + 3, i, 21) - 0.5) * 2;
    const x = from + spread * Math.abs(spread) * l.gridWidth * 0.62;
    if (x < l.gridLeft || x > l.gridLeft + l.gridWidth) continue;
    const reach = Math.max(0, Math.min(1, flown / Math.max(0.3, Math.abs(spread))));
    if (reach <= 0) continue;
    ctx.globalAlpha = wet * (0.5 - 0.24 * Math.abs(spread)) * reach;
    drawSpillDrop(
      ctx,
      x,
      surfaceY(x) + l.tile * 0.06,
      l.tile * (0.14 + splash.size * 1.5) * (0.5 + 0.5 * reach),
      splash,
    );
  }

  // And what runs off it. Each drip is a tapered tongue with a bead at the
  // end, growing downward as the run eases out — fast off the lip, then a
  // crawl, which is what blood on a vertical surface actually does.
  const run = mazeSpillRun(age);
  for (let i = 0; i < DRIPS; i++) {
    const spread = (mazeScatter(m.round + 5, i, 31) - 0.5) * 2;
    const x = from + spread * Math.abs(spread) * l.gridWidth * 0.55;
    if (x < l.gridLeft || x > l.gridLeft + l.gridWidth) continue;
    const top = surfaceY(x);
    const lag = mazeScatter(m.round + 5, i, 32);
    const len = drop * (NEAR + (FAR - NEAR) * mazeScatter(m.round + 5, i, 33) ** 1.6);
    const grown = len * Math.max(0, Math.min(1, (run - lag * 0.35) / (1 - lag * 0.35)));
    if (grown <= 1) continue;
    const w = l.tile * (0.05 + mazeScatter(m.round + 5, i, 34) * 0.09);

    ctx.globalAlpha = wet * 0.62;
    ctx.beginPath();
    ctx.moveTo(x - w, top);
    ctx.quadraticCurveTo(x - w * 0.55, top + grown * 0.7, x - w * 0.34, top + grown);
    ctx.quadraticCurveTo(x, top + grown + w * 1.5, x + w * 0.34, top + grown);
    ctx.quadraticCurveTo(x + w * 0.55, top + grown * 0.7, x + w, top);
    ctx.closePath();
    ctx.fill();

    // The bead at the tip, brighter — a running drop carries the light.
    ctx.globalAlpha = wet * 0.75;
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.ellipse(x, top + grown + w * 0.5, w * 0.82, w * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tint;
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
