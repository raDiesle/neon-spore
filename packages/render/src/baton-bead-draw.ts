import { blobPoints, circleSubpath } from "@neon-spore/content";
import {
  type BatonBead,
  type BatonState,
  batonBeadCol,
  batonBeadRowMilli,
  batonLandTick,
  batonLead,
  type SimConfig,
} from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE BATON's bead — and its second, and the one the two become. Split off
 * `baton-draw.ts` when the second bead arrived (`sim/baton-pair.ts`).
 *
 * **Both beads are their colour first**, because the colour is the whole of
 * what the navigator's shot depends on, and a mark that dimmed it would cost
 * her the one fact the picture owes her. So the second bead is told apart by
 * a *pupil* — a dark centre the first does not have — and by being a shade
 * smaller: *the one with the eye* is a thing a pilot can say in a beat, and
 * it reads the same in flight and sitting. Which is the second is the one
 * that is not the lead (`batonLead`), the way the arm bends: the bead lower
 * down the arm is the fight's, and the other is the one riding it.
 *
 * **Merged, the bead is twice as bright** — the design's own words for step
 * 13 (`docs/spec/bosses-choreographed.md` §10): a wider body, a halo of
 * twice the reach and a second ring, so the last bead reads as the two it
 * was, and nothing on the field is mistaken for the one that drops.
 */

/** The bead, as a share of a tile. */
const BEAD_R = 0.22;

/** How far a flight bows sideways at its middle, in tiles. */
const ARC = 0.28;

/** The second bead's size against the first. */
const TWIN = 0.85;

/** The second bead's pupil, as a share of its radius, and its fill — a
 * violet-black no socket or spine uses, so the eye is only ever the twin's. */
const PUPIL = 0.42;
const PUPIL_FILL = "#0B0614";

/** The merged bead's size against one. */
const MERGED = 1.3;

/**
 * The bead: sitting in its socket, or in the air between two.
 *
 * A flight bows sideways rather than going straight down the spine, one side
 * on the odd handovers and the other on the even, so two flights in a row are
 * two different curves and the eye can tell a fresh launch from the last one
 * settling. The bow is only sideways: the bead's *row* on any tick is the
 * simulation's own (`batonBeadRowMilli`), because that row is what a shot
 * has to meet and a picture that eased it would put the bead somewhere the
 * shot is not.
 */
export function drawBead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  bead: BatonBead,
  tick: number,
  beatPhase: number,
  time: number,
): void {
  const rowMilli = batonBeadRowMilli(cfg, bead, tick);
  const y = l.gridTop + (rowMilli / 1000) * l.tile + l.tile / 2;
  let x = tileCX(l, batonBeadCol(cfg, b, bead, tick));
  const flying = bead.flying;
  if (flying) {
    const span = Math.max(1, batonLandTick(cfg, bead) - bead.flightTick);
    const f = Math.min(1, Math.max(0, (tick - bead.flightTick) / span));
    const side = b.handovers % 2 === 0 ? 1 : -1;
    x += side * Math.sin(f * Math.PI) * l.tile * ARC;
  }
  const twin = b.beads.length > 1 && bead !== batonLead(b);
  const merged = b.merged && b.beads.length === 1;
  const hex = bead.color === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = bead.color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  // Sitting, it pulses on the beat: the two beats it is given are the two the
  // pilot has to press in, and a bead that sat still would not say the clock
  // was running. Struck, it burns: the navigator's turn is spent and the
  // landing is owed.
  const pulse = flying ? 0 : (1 - beatPhase) * (1 - beatPhase);
  const size = twin ? TWIN : merged ? MERGED : 1;
  const r = l.tile * BEAD_R * size * (1 + 0.12 * pulse);
  const reach = bead.struck ? 4 : 2.6;
  halo(ctx, x, y, r * reach, hex, bead.struck ? 0.7 : 0.3 + 0.25 * pulse);
  if (merged) halo(ctx, x, y, r * reach * 2, hex, 0.35 + 0.2 * pulse);
  const body = splinePath(blobPoints(x, y, r, r, 3, 0.1, 0.05, time * 1.4, 11, 20), true);
  ctx.save();
  ctx.fillStyle = hex;
  ctx.fill(body);
  if (twin) {
    ctx.fillStyle = PUPIL_FILL;
    ctx.fill(new Path2D(circleSubpath(x, y, r * PUPIL)));
  }
  ctx.restore();
  strokeGlow(ctx, body, rim, STROKE.inner, bead.struck ? 1 : 0.5 + 0.4 * pulse);
  // A struck bead wears a ring round it for the rest of the flight — the
  // receipt both seats get for a shot the pilot never saw leave. The merged
  // bead wears one always, and a second, wider one: two beads in one.
  if (bead.struck || merged) {
    const ring = new Path2D(circleSubpath(x, y, r * 1.8));
    strokeGlow(ctx, ring, rim, STROKE.inner, 0.6);
  }
  if (merged) {
    const outer = new Path2D(circleSubpath(x, y, r * 2.4));
    strokeGlow(ctx, outer, rim, STROKE.inner, 0.3 + 0.3 * pulse);
  }
}
