import type { Point } from "@neon-spore/content";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { Shard } from "./shatter.js";
import type { ShardPose } from "./shatter-fall.js";

/**
 * How one piece of a broken body is painted.
 *
 * Kept apart from the record that names it (`break-look.ts`) for
 * `magnet-look.ts`'s reason: a record living at the bottom of the file that
 * holds the paint makes the geometry and the paint import each other, and
 * `magnet-coil.ts` was split from `magnet.ts` on exactly that.
 *
 * **The inside is darker than the outside, and that is the whole picture.** A
 * body on this field is a lit skin over a colour nobody has ever seen — the
 * interior is the one surface a player has no picture of, because until
 * something breaks there is no way to look at it. A piece painted in the rim's
 * own bright colour says a shape moved; a piece whose cut faces are the deep
 * value and whose *outer* edge still carries the rim says a shape was opened.
 * `Shard.depth` is what carries that: 0 at the fracture origin, 1 at the
 * contour, and it is the only reason this is a paint rather than a fill.
 */

/** How much of the body's own colour is left in a piece that came from the
 * fracture origin — nearly none, because that face was never outside. */
const CORE_LIT = 0.15;
/** And how much is left in one that carried the contour. Under half, still: it
 * is a fragment lit from an edge, not the body it used to be part of. */
const RIND_LIT = 0.75;

/** Where a settled piece stops carrying a lit edge. Something lying on the
 * band is not being lit from the direction it was lit while it turned, and a
 * rim that stayed bright reads as a piece still in the air. */
const LANDED_RIM = 0.35;

/** What a paint is handed: one piece, where it is, and what it was made of. */
export interface PiecePaint {
  readonly shard: Shard;
  readonly pose: ShardPose;
  /** The body's own colour — the same hex the burst is thrown in. */
  readonly hex: string;
  /** The body's own deep value, behind the cut faces. */
  readonly dark: string;
  /** Body-local units to pixels. */
  readonly scale: number;
}

/**
 * What one piece is *filled* with, and the only place the depth rule is
 * written down.
 *
 * Exported because the bench draws the same pieces as SVG (`tools/breaks`), and
 * a sheet that mixed its own two colours would be a second copy of the one
 * decision this file makes — the sheet would then keep looking right on the day
 * the field stopped.
 */
export function faceHex(depth: number, hex: string, dark: string): string {
  const lit = CORE_LIT + (RIND_LIT - CORE_LIT) * Math.max(0, Math.min(1, depth));
  return mixHex(dark, hex, lit);
}

/** And how bright the edge that used to face outward still is. Zero for a
 * piece that was never on the rim, and dimmed again once it is lying still. */
export function edgeLit(depth: number, landed: boolean): number {
  return depth * (landed ? LANDED_RIM : 1);
}

/** The piece's outline as a path in its own frame, walked straight rather than
 * splined: a fracture edge is a cut, and a cut is not smooth. */
function outline(ctx: CanvasRenderingContext2D, pts: readonly Point[], scale: number): void {
  ctx.beginPath();
  const first = pts[0] as Point;
  ctx.moveTo(first.x * scale, first.y * scale);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i] as Point;
    ctx.lineTo(p.x * scale, p.y * scale);
  }
  ctx.closePath();
}

/**
 * The shipped piece: a flat facet of the body's own material, dark where it was
 * inside and lit along the edge that used to be the rim.
 *
 * It sets no shadow and no gradient. Thirty pieces on the field at once is the
 * worst case a wave of small bodies makes, and both of those cost per piece
 * rather than per body — `docs/performance.md`'s rule, and the reason the depth
 * is a mix of two hex values computed once per piece per frame instead.
 */
export function facet(ctx: CanvasRenderingContext2D, p: PiecePaint): void {
  const { pose, shard, scale } = p;
  if (pose.alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = pose.alpha;
  ctx.translate(pose.x * scale, pose.y * scale);
  ctx.rotate(pose.angle);
  outline(ctx, shard.points, scale);
  ctx.fillStyle = faceHex(shard.depth, p.hex, p.dark);
  ctx.fill();
  // The lit edge, and the one thing that says which side of this used to face
  // out. It fades with the piece and again when it is lying still.
  const rim = edgeLit(shard.depth, pose.landed);
  if (rim > 0.02) {
    ctx.strokeStyle = rgba(mixHex(p.hex, PALETTE.text, 0.25), rim);
    ctx.lineWidth = Math.max(0.8, scale * 0.03);
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  ctx.restore();
}
