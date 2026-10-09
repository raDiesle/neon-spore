import { rgba } from "./hex.js";
import type { DropDraw, LeadDropping } from "./lead-drop.js";
import { PALETTE } from "./palette.js";

/** When the strand parts, as a share of the drop's beat. */
const SNAP = 0.55;

/**
 * TORN — the torch and the rock fall out of the body rather than arrive.
 * The ridge's underside tears open over the column, and what drops hangs a
 * moment from it on a strand of the body's flesh before the strand parts
 * and the two ends draw back: an ember-lit strand for a torch, a grey one
 * for a rock. On the navigator's screen, the one shown where the body
 * stands, a cord runs under the ridge from the mound to the tear, so the
 * drop is seen coming out of *it*; on the pilot's there is no cord,
 * because a cord from the middle of his screen would say a column that is
 * not his to know.
 */
export function paintTornDrops(d: DropDraw): void {
  const { ctx, l, drops, foot, placed } = d;
  ctx.save();
  ctx.lineCap = "round";
  for (const drop of drops) {
    if (placed) cord(ctx, l.tile, foot.x, drop);
    tear(ctx, l.tile, drop);
  }
  ctx.restore();
}

function cord(ctx: CanvasRenderingContext2D, tile: number, footX: number, d: LeadDropping): void {
  const fade = 1 - d.age;
  const p = new Path2D();
  p.moveTo(footX, d.from);
  p.quadraticCurveTo((footX + d.x) / 2, d.from + tile * 0.35, d.x, d.from);
  ctx.strokeStyle = rgba(PALETTE.hull, 0.85 * fade);
  ctx.lineWidth = tile * 0.08;
  ctx.stroke(p);
}

function tear(ctx: CanvasRenderingContext2D, tile: number, d: LeadDropping): void {
  const fade = 1 - d.age;
  const flesh = d.kind === "torch" ? PALETTE.ember : PALETTE.rock;
  // The mouth in the underside, closing as the beat runs out.
  const open = tile * 0.6 * (1 - 0.6 * d.age);
  ctx.fillStyle = rgba(PALETTE.sheenDeep, 0.95 * fade);
  ctx.strokeStyle = rgba(PALETTE.hull, 0.9 * fade);
  ctx.lineWidth = tile * 0.06;
  ctx.beginPath();
  ctx.ellipse(d.x, d.from, open, tile * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // The strand: the whole drop at first, two stubs drawing back once it parts.
  // What drops hangs lower as the strand stretches, and goes with it when it parts.
  const sag = Math.min(1, d.age / SNAP);
  const end = d.from + (d.to + tile * 0.2 - d.from) * (0.35 + 0.65 * sag * sag);
  const reach = end - d.from;
  const strands: [number, number][] =
    d.age < SNAP
      ? [[d.from, end]]
      : [
          [d.from, d.from + reach * 0.5 * (1 - (d.age - SNAP) / (1 - SNAP))],
          [end - reach * 0.25 * (1 - (d.age - SNAP) / (1 - SNAP)), end],
        ];
  const w = tile * (d.age < SNAP ? 0.3 - 0.16 * (d.age / SNAP) : 0.12);
  for (const [a, b] of strands) {
    ctx.strokeStyle = rgba(PALETTE.hull, 0.9 * fade);
    ctx.lineWidth = w + tile * 0.06;
    ctx.beginPath();
    ctx.moveTo(d.x, a);
    ctx.lineTo(d.x, b);
    ctx.stroke();
    ctx.strokeStyle = rgba(flesh, fade);
    ctx.lineWidth = w;
    ctx.stroke();
  }
  if (d.age < SNAP) lump(ctx, tile, d.x, end, d.kind, flesh);
}

/** The torch or the rock on the end of the strand, before it parts: an ember-lit sac, a grey lump. */
function lump(
  ctx: CanvasRenderingContext2D,
  tile: number,
  x: number,
  y: number,
  kind: LeadDropping["kind"],
  flesh: string,
): void {
  const r = tile * 0.36;
  ctx.fillStyle = rgba(flesh, 0.95);
  ctx.strokeStyle = rgba(kind === "torch" ? PALETTE.hull : PALETTE.rockDark, 0.95);
  ctx.lineWidth = tile * 0.07;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y,
    r * (kind === "torch" ? 0.85 : 1),
    r * (kind === "torch" ? 1.15 : 0.9),
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.stroke();
}
