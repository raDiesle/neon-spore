import {
  type ScoutState,
  type SimConfig,
  scoutCurrent,
  scoutHome,
  scoutRevealThrough,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { scoutAt } from "./scout-draw.js";
import { drawFuseLine, fuseColours } from "./slow-fuse.js";

/**
 * **THE SCOUT's moments**, each asked for by the owner on 29 September 2026
 * and each drawn off the round and the tick, never held:
 *
 * - **the launch** — *the ship should go out immediately … with a visual
 *   effect to raise attention*: two rings thrown off the little ship the tick
 *   it is let go (`launchTick`), and a flash under it;
 * - **the suck** — *suck range is around 2 tiles around the suck cannon
 *   position, also helping player that player needs to suck*: the mouth's
 *   reach drawn round home while a mote is aboard, and a stream of amber
 *   running from the ship into the mouth while it is being drawn in;
 * - **the pilot's glimpse** — *like on "fault" of "flip"*: the arena torn in
 *   and out with THE FLIP's own projection tear (`flip-reveal.ts`);
 * - **the clock** — *show the common boss time remaining*: the slow's fuse
 *   (`slow-fuse.ts`), across the top of the arena, burning in from both ends.
 */

/** How long the launch rings run, in ticks: three quarters of a second. */
const LAUNCH_TICKS = 90;

export function drawScoutLaunch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  round: ScoutState,
  tick: number,
): void {
  const age = tick - round.launchTick;
  if (round.launchTick < 0 || age < 0 || age >= LAUNCH_TICKS) return;
  const { x, y } = scoutAt(l, round);
  const r = (cfg.scoutRadiusMilli * l.tile) / 1000;
  const t = age / LAUNCH_TICKS;
  halo(ctx, x, y, r * 4, PALETTE.hullRim, 0.7 * (1 - t));
  ctx.save();
  for (const lag of [0, 0.3]) {
    const u = (t - lag) / (1 - lag);
    if (u <= 0) continue;
    ctx.strokeStyle = rgba(lag === 0 ? PALETTE.hullRim : PALETTE.hull, 1 - u);
    ctx.lineWidth = Math.max(1.5, l.tile * 0.12 * (1 - u));
    ctx.beginPath();
    ctx.arc(x, y, r * (1.2 + 3.3 * u), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** The dashes of the mouth's reach while something is aboard, and the stream while it sucks. */
export function drawScoutSuck(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  round: ScoutState,
  time: number,
): void {
  if (round.phase !== "play" || round.carrying.length === 0) return;
  const home = scoutAt(l, scoutHome(cfg.cols, cfg.rows));
  ctx.save();
  if (!round.sucking) {
    ctx.strokeStyle = rgba(PALETTE.pod, 0.45);
    ctx.lineWidth = Math.max(1, l.tile * 0.05);
    ctx.setLineDash([l.tile * 0.22, l.tile * 0.18]);
    ctx.lineDashOffset = -time * l.tile * 0.6;
    ctx.beginPath();
    // Only the half over the water: the other half is inside the mother ship.
    ctx.arc(home.x, home.y, (cfg.scoutSuckRadiusMilli * l.tile) / 1000, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const ship = scoutAt(l, round);
  const dx = home.x - ship.x;
  const dy = home.y - ship.y;
  const width = l.tile * 0.35;
  const beam = ctx.createLinearGradient(ship.x, ship.y, home.x, home.y);
  beam.addColorStop(0, rgba(PALETTE.pod, 0.1));
  beam.addColorStop(1, rgba(PALETTE.pod, 0.45));
  ctx.strokeStyle = beam;
  ctx.lineCap = "round";
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(ship.x, ship.y);
  ctx.lineTo(home.x, home.y);
  ctx.stroke();
  // Beads running down it into the mouth, faster as they near it.
  ctx.fillStyle = PALETTE.podRim;
  for (let i = 0; i < 6; i++) {
    const u = (time * 1.8 + i / 6) % 1;
    const k = u * u;
    ctx.globalAlpha = 0.35 + 0.6 * u;
    ctx.beginPath();
    ctx.ellipse(ship.x + dx * k, ship.y + dy * k, width * 0.22, width * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * How torn the pilot's glimpse of the arena is this frame — `null` between
 * glimpses. It tears in over the first quarter and out over the last, and
 * stands whole between.
 */
export function scoutGlimpse(
  cfg: SimConfig,
  round: ScoutState,
  tick: number,
): { s: number; alpha: number } | null {
  if (round.phase !== "play") return null;
  const through = scoutRevealThrough(cfg, tick - round.arenaTick);
  if (through === null) return null;
  const s = through < 0.25 ? 1 - through / 0.25 : through > 0.75 ? (through - 0.75) / 0.25 : 0;
  return { s, alpha: 1 - 0.55 * s };
}

/** The arena's clock: the fuse across the top, the whole width at the start. */
export function drawScoutClock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  round: ScoutState,
  beat: number,
  beatPhase: number,
): void {
  if (round.phase !== "play") return;
  const beats = scoutCurrent(round).beats;
  const left = Math.max(0, beats - (beat + beatPhase - round.arenaBeat));
  if (left <= 0) return;
  const { body, core } = fuseColours({ beats, through: 1 - left / beats, left });
  const at = {
    x: l.gridLeft + l.gridWidth / 2,
    y: l.gridTop + l.tile * 0.5,
    half: l.gridWidth / 2 - l.tile * 0.5,
  };
  drawFuseLine(ctx, l, at, left / beats, body, core);
}
