import { circleSubpath } from "@neon-spore/content";
import { type BatonBead, type SimConfig, ticksPerBeat } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE BATON's bead thrown back up the arm** — the owner, 6 October 2026:
 * *an animation, so that the shot catapults the ball back.* The rule moves the
 * bead in one tick (`sim/baton-press.ts` `batonKnock`, and the settle in
 * `baton-step.ts`); this is the flight the picture puts between where it was
 * and where it sits, read off the two fields the bead keeps for it
 * (`backTick`, `backFromMilli`), so it keeps nothing and survives a restart.
 *
 * The throw is fast out of the hit and slow into the socket, and it rises
 * past the socket and drops back in, which is what makes it read as thrown
 * rather than slid. A knock of two sockets also leaves a ring where the bolt
 * met it; a settle of one does not, because nothing hit it.
 */

/** How long the throw takes, in beats. */
const THROW_BEATS = 0.75;

/** How far above the socket it rises before it drops in, in tiles. */
const LIFT = 0.55;

/** How far it swings sideways at the middle of the throw, in tiles. */
const SWING = 0.4;

/** The trail: how many ghosts behind it, and how far back each is, as a share of the throw. */
const GHOSTS = 3;
const GHOST_STEP = 0.08;

/** How far through its throw the bead is on this tick, 0 to 1, or null when it is not being thrown. */
export function batonThrown(cfg: SimConfig, bead: BatonBead, tick: number): number | null {
  if (bead.flying || bead.backTick < 0) return null;
  const span = Math.max(1, Math.round(THROW_BEATS * ticksPerBeat(cfg)));
  const gone = tick - bead.backTick;
  if (gone < 0 || gone >= span) return null;
  return gone / span;
}

/** Where a bead being thrown is, `f` of the way through, in pixels. `x` is its socket's. */
export function throwPoint(
  l: Layout,
  _cfg: SimConfig,
  bead: BatonBead,
  x: number,
  f: number,
): { x: number; y: number } {
  const to = bead.socket;
  const from = bead.backFromMilli / 1000;
  const out = 1 - (1 - f) ** 3;
  const row = from + (to - from) * out - LIFT * Math.sin(Math.PI * f);
  return {
    x: x - SWING * l.tile * Math.sin(Math.PI * f),
    y: l.gridTop + row * l.tile + l.tile / 2,
  };
}

/**
 * The throw's trail and, on a knock, the ring where the bolt met it. Drawn
 * under the bead, which `drawBead` puts at `throwPoint` itself.
 */
export function drawThrow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  bead: BatonBead,
  x: number,
  f: number,
  r: number,
): void {
  const hex = bead.color === "red" ? PALETTE.red : PALETTE.cyan;
  for (let i = 1; i <= GHOSTS; i++) {
    const back = f - i * GHOST_STEP;
    if (back < 0) break;
    const at = throwPoint(l, cfg, bead, x, back);
    halo(ctx, at.x, at.y, r * (1.6 - 0.25 * i), hex, (0.45 - 0.12 * i) * (1 - f));
  }
  const rows = bead.backFromMilli / 1000 - bead.socket;
  if (rows <= 1.5) return;
  const hitY = l.gridTop + (bead.backFromMilli / 1000) * l.tile + l.tile / 2;
  // In the bolt's colour, which is the one the bead is not: the ring is the
  // wrong answer, said where it was given.
  const bolt = bead.color === "red" ? PALETTE.cyanRim : PALETTE.redRim;
  const ring = new Path2D(circleSubpath(x, hitY, r * (1.2 + 2.2 * f)));
  strokeGlow(ctx, ring, bolt, STROKE.inner, 0.8 * (1 - f));
}
