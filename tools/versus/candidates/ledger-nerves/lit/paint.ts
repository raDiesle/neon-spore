import { rgba } from "../../../../../packages/render/src/hex.js";
import type { LedgerNerveDraw } from "../../../../../packages/render/src/ledger-nerves.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * The ship's nerves under the socket, lit as a return comes down the cord:
 * the cord's line carried on into the plating as a trunk, a nerve running out
 * under the skin either way, and two dropping off each to the plating's
 * underside. Faint
 * as soon as a bead is on the cord, lit from the socket outward as it comes,
 * and the whole tree bright on the beat it lands — so the navigator sees where
 * the bill will go into the ship before the plating takes it.
 */

/** One nerve: offsets from the socket in tiles, `dx` across and `dy` down
 * under the plating, from where it leaves the socket to where it ends. */
type Nerve = readonly (readonly [dx: number, dy: number])[];

const TRUNK: Nerve = [
  [0, 0],
  [0.06, 0.4],
  [-0.08, 0.75],
  [0.04, 1.05],
];
/** Out under the skin, the way the plating runs. */
const RUN: Nerve = [
  [0, 0.05],
  [0.7, 0.3],
  [1.5, 0.42],
  [2.4, 0.48],
  [3.3, 0.5],
  [4.2, 0.52],
];
/** Down off the run, to the plating's underside: the ship below it is the
 * panel's and is drawn over anything here. */
const DIVE: Nerve = [
  [0.7, 0.3],
  [1.15, 0.7],
  [1.7, 1.05],
];
const TWIG: Nerve = [
  [2.4, 0.48],
  [2.7, 0.8],
  [2.6, 1.05],
];
/** Each nerve and how far out along the tree it starts, 0..1, so the light
 * reaches a twig after the run it leaves. */
const TREE: readonly (readonly [Nerve, -1 | 1, number])[] = [
  [TRUNK, 1, 0],
  [RUN, -1, 0],
  [RUN, 1, 0],
  [DIVE, -1, 0.2],
  [DIVE, 1, 0.2],
  [TWIG, -1, 0.55],
  [TWIG, 1, 0.55],
];

/** How far ahead of the bead the light has got: the front reaches the ends
 * of the tree a little before the return lands. */
const LEAD = 1.25;

export function paintLitNerves(d: LedgerNerveDraw): void {
  const { ctx, l, at, near, time } = d;
  if (near <= 0 || l.tile <= 0) return;
  const front = near * LEAD;
  const throb = 0.85 + 0.15 * Math.sin(time * 9);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [nerve, side, from] of TREE) {
    const pts = nerve.map(([dx, dy]) => {
      const x = at.x + side * dx * l.tile;
      // Under the plating where it actually is, so a run follows the skin's bow.
      return { x, y: d.surfaceY(x) + dy * l.tile + (at.y - d.surfaceY(at.x)) };
    });
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1] as { x: number; y: number };
      const b = pts[i] as { x: number; y: number };
      const u = from + (1 - from) * (i / (pts.length - 1));
      const lit = Math.max(0, Math.min(1, (front - u) / 0.25));
      const seg = new Path2D();
      seg.moveTo(a.x, a.y);
      seg.lineTo(b.x, b.y);
      // The halo, the nerve and its hot core: faint everywhere a bead is on
      // the cord, and lit where the front has passed.
      ctx.strokeStyle = rgba(PALETTE.hull, (0.12 + 0.4 * lit) * throb);
      ctx.lineWidth = l.tile * (0.22 + 0.18 * lit);
      ctx.stroke(seg);
      ctx.strokeStyle = rgba(PALETTE.hull, 0.35 + 0.6 * lit);
      ctx.lineWidth = l.tile * (0.09 + 0.05 * lit);
      ctx.stroke(seg);
      if (lit > 0) {
        ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85 * lit * throb);
        ctx.lineWidth = Math.max(0.6, l.tile * 0.03);
        ctx.stroke(seg);
      }
    }
    // A knot where each nerve ends, swelling as the light reaches it.
    const end = pts[pts.length - 1] as { x: number; y: number };
    const lit = Math.max(0, Math.min(1, (front - 1) / 0.25 + 1));
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.25 + 0.6 * lit * throb);
    ctx.beginPath();
    ctx.arc(end.x, end.y, l.tile * (0.06 + 0.07 * lit), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
