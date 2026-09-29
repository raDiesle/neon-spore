import { GOVERNOR_RUN } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Dial, dialAt, TRACK_IN, TRACK_OUT, trackBand } from "./governor-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE GOVERNOR's marks**: what says what a step asks and what is spent.
 * **The lit mark** is a piece of the track itself, `governorMarkMilli`
 * either side of the step's place, lit in the hull rim's white: breathing on
 * its beat on the tapper's screen with the window running down round the
 * dial, and only faint on the braking seat's, so the one holding the pads
 * can see where the needle has to be without being handed a mark to tap.
 * **Six studs on the face** are the two runs, the pilot's three on the left
 * of the hub and the navigator's on the right, lit as each tap lands. Only
 * the hub is ever a cannon's colour (`governor-draw.ts`).
 */

/** How faint the other seat's mark is. */
const OTHER = 0.3;
/** Where a run's studs sit, in thousandths round the face, and how far out. */
const STUDS_AT = [750, 250] as const;
const STUD_GAP = 55;
const STUD_REACH = 0.55;
const STUD = 0.08;
/** How far out the window's arc runs, in radii. */
const WINDOW = 1.1;

/**
 * The lit mark on the track. `full` is the tapper's screen: the band pulses
 * and an arc outside the rim runs down with the step's window.
 */
export function drawGovernorMark(
  ctx: CanvasRenderingContext2D,
  d: Dial,
  markMilli: number,
  width: number,
  left: number,
  full: boolean,
  beatPhase: number,
): void {
  const band = trackBand(d, markMilli - width, markMilli + width, TRACK_IN, TRACK_OUT);
  if (!full) {
    ctx.fillStyle = rgba(PALETTE.hullRim, OTHER * 0.4);
    ctx.fill(band);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.hullRim, OTHER);
    ctx.stroke(band);
    return;
  }
  const pulse = 0.65 + 0.35 * Math.cos(beatPhase * Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.35 * pulse);
  ctx.fill(band);
  strokeGlow(ctx, band, PALETTE.hullRim, STROKE.inner, pulse, 1);
  const arc = new Path2D();
  const n = 32;
  for (let i = 0; i <= n; i++) {
    const at = dialAt(d, (1000 * left * i) / n, WINDOW);
    if (i === 0) arc.moveTo(at.x, at.y);
    else arc.lineTo(at.x, at.y);
  }
  strokeGlow(ctx, arc, PALETTE.hullRim, STROKE.inner, 0.55, 1);
}

/** The two runs' studs on the face, one lit for each tap its seat has landed. */
export function drawGovernorStuds(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  taps: readonly [number, number],
): void {
  const r = STUD * l.tile;
  for (let side = 0; side < 2; side++) {
    const home = STUDS_AT[side] ?? 0;
    for (let i = 0; i < GOVERNOR_RUN; i++) {
      const at = dialAt(d, home + (i - (GOVERNOR_RUN - 1) / 2) * STUD_GAP, STUD_REACH);
      const stud = new Path2D();
      stud.ellipse(at.x, at.y, r, r * (0.5 + 0.5 * d.tilt), 0, 0, Math.PI * 2);
      if (i < (taps[side] ?? 0)) {
        ctx.fillStyle = PALETTE.hullRim;
        ctx.fill(stud);
        strokeGlow(ctx, stud, PALETTE.hullRim, STROKE.inner, 1, 0.8);
      } else {
        ctx.fillStyle = PALETTE.governorFace;
        ctx.fill(stud);
        ctx.lineWidth = STROKE.inner;
        ctx.strokeStyle = rgba(PALETTE.governorBrass, 0.6);
        ctx.stroke(stud);
      }
    }
  }
}

/**
 * The brake's ask on the yoke: its jaws edged in the rim's white while a
 * chord is wanted, breathing on the braking seat's screen and faint on the
 * tapper's, and steady once the chord is whole.
 */
export function drawGovernorYokeAsk(
  ctx: CanvasRenderingContext2D,
  jaws: readonly Path2D[],
  whole: boolean,
  full: boolean,
  beatPhase: number,
): void {
  const pulse = whole ? 0.9 : 0.55 + 0.4 * Math.cos(beatPhase * Math.PI * 2);
  for (const jaw of jaws) {
    if (full) strokeGlow(ctx, jaw, PALETTE.hullRim, STROKE.inner, pulse, 1);
    else {
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.hullRim, OTHER);
      ctx.stroke(jaw);
    }
  }
}
