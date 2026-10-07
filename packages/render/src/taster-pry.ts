import { NO_SLOW, type TasterState, tasterPhase, tasterPried, type World } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * **THE TASTER's SLOW, on the fan** (`docs/spec/bosses.md` §11.25, *what the
 * look does not have*). The pry opens THE SLOW for exactly as long as the
 * interlock stands open (`sim/taster-hand.ts`), and until now the fan stood in
 * its interlock through the whole of it — the window was the field's streams
 * and fuse (`slow-intake.ts`, `slow-fuse.ts`) and nothing on the boss itself.
 *
 * **The blades are the clock.** As the pilot hauls, the interlock parts a
 * little under his carry; when it gives, the crossed blades spring past
 * upright and stand pried open, then creep back over the window until they
 * cross again on the beat it locks. How far open the fan stands *is* how much
 * window is left, read off THE SLOW's own two beats, so a pair watching the
 * blades close is watching the same count the fuse burns.
 *
 * **A sliver of light in the lock's column** while it stands open: the gap
 * the beams go up. White, never a colour — which colour the beam has to be is
 * the navigator's arithmetic, and the fan must not say it.
 *
 * Nothing aimed at moves with it: a beam is judged by column, and the pry's
 * ring stands at the lock's root (`taster-grip.ts`), not on a blade.
 */

/** How far past upright a pried blade's tip stands at the widest, in tiles. */
export const PRY_PAST = 0.55;
/** How far a full haul parts the interlock before it gives, 0..1 of the way open. */
const HAUL = 0.3;
/** Beats the interlock takes to spring open once it gives. */
const SPRING_BEATS = 0.4;

/**
 * How far the interlock stands open, 0 crossed to 1 wide: parted by the
 * pilot's carry while he hauls, sprung open when it gives, and closing over
 * THE SLOW's window until it crosses again as the window shuts.
 */
export function tasterPryOpen(world: World, t: TasterState, beatPhase: number): number {
  const { cfg } = world;
  if (tasterPhase(t, cfg) !== "closed") return 0;
  const haul = HAUL * Math.max(0, Math.min(1, t.pryMilli / Math.max(1, cfg.tasterPryMilli)));
  if (!tasterPried(t, world.beat, cfg)) return haul;
  const b = world.beat + beatPhase;
  const { from, to } = pryWindow(world, t);
  const through = Math.max(0, Math.min(1, (b - from) / Math.max(1, to - from)));
  const sprung = HAUL + (1 - HAUL) * smoothstep((b - from) / SPRING_BEATS);
  return sprung * (1 - through);
}

/**
 * The window the pry stands open over: THE SLOW's, which the pry opened and
 * which spans it exactly, or the pry's own count where no window is held.
 */
function pryWindow(world: World, t: TasterState): { from: number; to: number } {
  const own = { from: t.pryBeat, to: t.pryBeat + world.cfg.tasterPryBeats };
  if (world.slowToBeat === NO_SLOW || world.slowAskBeat === NO_SLOW) return own;
  if (world.slowAskBeat < t.pryBeat || world.slowToBeat <= world.slowAskBeat) return own;
  return { from: world.slowAskBeat, to: world.slowToBeat };
}

/** A crossed blade's lean, `side` its side of the lock, `lock` the interlock's lean, in tiles. */
export function pryLean(side: number, lock: number, open: number): number {
  return side * (lock - (lock + PRY_PAST) * open);
}

/** The gap the beams go up, lit between the pried blades from the crest to a blade's reach. */
export function drawTasterPryLight(
  ctx: CanvasRenderingContext2D,
  x: number,
  /** The crest's top, where every blade stands. */
  y: number,
  /** How tall a full blade stands, in pixels. */
  reach: number,
  tile: number,
  open: number,
  time: number,
): void {
  if (open <= 0.02) return;
  const shimmer = 0.85 + 0.15 * Math.sin(time * 7);
  const a = Math.min(1, open * 1.4) * shimmer;
  const top = y - reach * 1.15;
  halo(ctx, x, y - reach * 0.5, reach * 0.9, PALETTE.text, 0.25 * a);
  const sliver = new Path2D();
  sliver.moveTo(x, y);
  sliver.lineTo(x, top);
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.text;
  ctx.globalAlpha = 0.35 * a;
  ctx.lineWidth = tile * 0.22 * open;
  ctx.stroke(sliver);
  ctx.globalAlpha = 0.9 * a;
  ctx.lineWidth = Math.max(1, tile * 0.06);
  ctx.stroke(sliver);
  ctx.restore();
}
