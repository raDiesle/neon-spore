import { blobPoints } from "@neon-spore/content";
import {
  type ScoutPoint,
  type ScoutState,
  type SimConfig,
  scoutCurrent,
  scoutHome,
} from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { drawRockBody } from "./meteor.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPodBody } from "./pods.js";
import { splinePath } from "./spline.js";

/**
 * THE SCOUT's arena, drawn: the little ship, what it is there to collect, what
 * would end it, and the mouth it has to bring everything back to.
 *
 * **The arena is the field's own eleven columns**, from the top of the play
 * area down to the hull — the simulation flies in thousandths of a tile over
 * `cfg.cols × cfg.rows` (`sim/scout-fly.ts`), and `scoutHome` is the bottom
 * row's middle, which is exactly where the hull's surface stands
 * (`layout.ts`, `hullY`). So the mother ship's mouth is the real hull's own
 * intake, opened by `mood.intake` in `scout-round.ts`, and home is a ring on
 * the water in front of it.
 *
 * **Nothing here is invented.** A mote is a pod (`drawPodBody`) — amber,
 * breathing, the thing this game has always meant by "go and get this" — and
 * a hazard is a burning rock (`drawRockBody`), the thing it has always meant
 * by "this costs the hull". The little ship itself is next door in
 * `scout-ship.ts`, split off this file on line count.
 *
 * **What each seat is shown is decided next door** (`view-role.ts`) and
 * simply obeyed here: the caller asks for the motes and hazards on the
 * navigator's screen and for the nose and the carried motes on the pilot's.
 * Both are shown the ship's *place* — the navigator has to say which way to
 * point it, and cannot from a picture with no ship on it.
 *
 * Nothing is held between frames: every number comes off the round, the tick
 * and the frame clock, so a restart cannot show this round the last one's
 * ship.
 */

/** A point of the arena, in stage pixels. */
export function scoutAt(l: Layout, p: ScoutPoint): { x: number; y: number } {
  return {
    x: l.gridLeft + (p.colMilli * l.tile) / 1000,
    y: l.gridTop + (p.rowMilli * l.tile) / 1000,
  };
}

/**
 * The walls, as the faintest possible line: the ship genuinely bounces off
 * them and both seats want to know where they are before the first bounce.
 * No floor, because the floor is the mother ship and the ship is drawn.
 */
export function drawScoutWalls(ctx: CanvasRenderingContext2D, l: Layout, cfg: SimConfig): void {
  const w = l.tile * cfg.cols;
  ctx.save();
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = Math.max(1, l.tile * 0.03);
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(l.gridLeft + 0.5, l.hullY);
  ctx.lineTo(l.gridLeft + 0.5, l.gridTop);
  ctx.lineTo(l.gridLeft + w - 0.5, l.gridTop);
  ctx.lineTo(l.gridLeft + w - 0.5, l.hullY);
  ctx.stroke();
  ctx.restore();
}

/**
 * Home: a ring on the water in front of the mother ship's mouth, as wide as
 * what counts as being there (`scoutHomeRadiusMilli`). It brightens for as
 * long as the mouth is open, so the pilot — who cannot see the arena — can at
 * least see the moment the navigator gave them.
 */
export function drawScoutHome(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  open: number,
  time: number,
): void {
  const { x, y } = scoutAt(l, scoutHome(cfg.cols, cfg.rows));
  const r = (cfg.scoutHomeRadiusMilli * l.tile) / 1000;
  const ring = splinePath(blobPoints(x, y, r, r * 0.55, 3, 0.04, 0.03, time * 0.4, 11, 24), true);
  if (open > 0) halo(ctx, x, y, r * 1.6, PALETTE.pod, 0.5 * open);
  strokeGlow(ctx, ring, PALETTE.pod, STROKE.outline, 0.3 + 0.6 * open);
}

/** Every mote still out there: the ones neither carried nor banked. */
export function drawScoutMotes(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  round: ScoutState,
  time: number,
): void {
  const motes = scoutCurrent(round).motes;
  const r = (cfg.scoutMoteRadiusMilli * l.tile) / 1000;
  for (let i = 0; i < motes.length; i++) {
    if (round.carrying.includes(i) || round.banked.includes(i)) continue;
    const mote = motes[i];
    if (mote === undefined) continue;
    const { x, y } = scoutAt(l, mote);
    drawPodBody(ctx, x, y, r * 1.18, time + i * 0.31, "ward");
  }
}

/**
 * The hazards, where they are this tick. Burning rocks, the field's own, and
 * the one that caught the ship — if one did — burns brighter for the verdict.
 */
export function drawScoutHazards(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  round: ScoutState,
  time: number,
): void {
  const r = (cfg.scoutHazardRadiusMilli * l.tile) / 1000;
  for (let i = 0; i < round.hazards.length; i++) {
    const hazard = round.hazards[i];
    if (hazard === undefined) continue;
    const { x, y } = scoutAt(l, hazard);
    if (round.caughtBy === i) halo(ctx, x, y, r * 2.2, PALETTE.ember, 0.6);
    drawRockBody(ctx, x, y, r, time + i * 0.7, i * 7 + 3, 0);
  }
}
