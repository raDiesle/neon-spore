import { strokeGlowFaded } from "./glow.js";
import { type Dial, dialAt, TRACK_IN, TRACK_OUT, trackBand } from "./governor-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE GOVERNOR's marks**: what says what a step asks and what is spent.
 * **A lit mark** is a piece of the track itself, `governorMarkMilli` either
 * side of its place, lit in the hull rim's white: breathing on its beat on
 * its own seat's screen while it is open, and only faint on the other's, so
 * each sees the partner's mark without being handed it to tap. A mark landed
 * stays lit, steady, until the step is answered. On an ordered step each mark
 * is **numbered** outside the rim, and one waiting its turn is faint on every
 * screen.
 *
 * **Studs on the face** count each seat's taps over the fight, the pilot's on
 * the left of the hub and the navigator's on the right, lit as each lands.
 * Only the hub is ever a cannon's colour (`governor-draw.ts`).
 */

/** How faint a mark is that this screen is not asked to tap now. */
const OTHER = 0.3;
/** Where a seat's studs sit, in thousandths round the face, and how far out. */
const STUDS_AT = [750, 250] as const;
const STUD_GAP = 38;
const STUD_REACH = 0.55;
const STUD = 0.07;
/** How far out a mark's number stands, in radii. */
const NUMBER_AT = 1.22;

/** What a mark is to this screen: open to its thumb, someone else's or waiting, or landed. */
export type GovernorMarkLook = "open" | "other" | "landed";

/** One mark on the track, and its number on an ordered step. */
export function drawGovernorMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  markMilli: number,
  width: number,
  look: GovernorMarkLook,
  beatPhase: number,
  number: number | null,
): void {
  const band = trackBand(d, markMilli - width, markMilli + width, TRACK_IN, TRACK_OUT);
  if (look === "other") {
    ctx.fillStyle = rgba(PALETTE.hullRim, OTHER * 0.4);
    ctx.fill(band);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.hullRim, OTHER);
    ctx.stroke(band);
  } else {
    const pulse = look === "landed" ? 0.9 : 0.65 + 0.35 * Math.cos(beatPhase * Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, (look === "landed" ? 0.6 : 0.35) * pulse);
    ctx.fill(band);
    strokeGlowFaded(ctx, band, PALETTE.hullRim, STROKE.inner, pulse, 1);
  }
  if (number === null) return;
  const at = dialAt(d, markMilli, NUMBER_AT);
  ctx.save();
  ctx.font = `bold ${Math.round(l.tile * 0.42)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(PALETTE.hullRim, look === "other" ? 0.55 : 1);
  ctx.fillText(String(number), at.x, at.y);
  ctx.restore();
}

/** Each seat's studs on the face, `owed` of them, one lit for each tap the seat has landed. */
export function drawGovernorStuds(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  taps: readonly [number, number],
  owed: readonly [number, number],
): void {
  const r = STUD * l.tile;
  for (let side = 0; side < 2; side++) {
    const home = STUDS_AT[side] ?? 0;
    const count = owed[side] ?? 0;
    for (let i = 0; i < count; i++) {
      const at = dialAt(d, home + (i - (count - 1) / 2) * STUD_GAP, STUD_REACH);
      const stud = new Path2D();
      stud.ellipse(at.x, at.y, r, r * (0.5 + 0.5 * d.tilt), 0, 0, Math.PI * 2);
      if (i < (taps[side] ?? 0)) {
        ctx.fillStyle = PALETTE.hullRim;
        ctx.fill(stud);
        strokeGlowFaded(ctx, stud, PALETTE.hullRim, STROKE.inner, 1, 0.8);
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
