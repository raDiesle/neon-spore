import { type Creature, type QueenState, queenTorchCol, spanCenterCol } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, showsQueenHint, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawDropHint } from "./queen-drop.js";
import { drawTorchRock, torchRadius, torchRotation } from "./torch.js";

/** Never quite zero — a degenerate radius is what `frame.test.ts` exists to catch. */
const EGG_FLOOR = 0.02;

/**
 * The pulsing ring that tells player 2, and only player 2
 * (`showsQueenHint`), which of her two marks is real.
 *
 * It used to say which flank the next torch came off as well, on the argument
 * that the two are the same kind of thing to know — a call this player has to
 * make to the other rather than a hazard either can dodge. The owner asked for
 * them to be pulled apart, and `queen-drop.ts` carries why: a mark is a column
 * to name, a drop is a clock to watch, and a ring pulsing on its own tempo
 * could never say how long was left of one.
 */
export function drawSideHint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cx: number,
  cy: number,
  r: number,
  time: number,
): void {
  if (!showsQueenHint(l.role)) return;
  const pulse = 0.4 + 0.25 * Math.sin(time * 3);
  ctx.strokeStyle = PALETTE.shieldRim;
  ctx.lineWidth = 2.4;
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  halo(ctx, cx, cy, r * 2.4, PALETTE.shieldRim, pulse * 0.7);
}

/**
 * How much of the egg is there this beat.
 *
 * 0 on the beat the torch on that side broke off: it is standing in the
 * socket as a creature of its own now (`spit` in sim/boss.ts, drawn by
 * `drawCreatures`), and an egg drawn here as well is exactly the doubling
 * this replaces — one shape shrinking while an identical one grew beside it.
 * Then back to full over `growShare` of the beat after, so the next torch
 * visibly grows into the empty socket instead of appearing whole in it.
 */
function eggScale(
  boss: QueenState,
  side: -1 | 1,
  beat: number,
  beatPhase: number,
  growShare: number,
): number {
  if (boss.releaseSide !== side) return 1;
  if (beat === boss.releaseBeat) return 0;
  if (beat !== boss.releaseBeat + 1) return 1;
  return Math.max(EGG_FLOOR, Math.min(1, beatPhase / Math.max(1e-3, growShare)));
}

/**
 * One flanking torch, drawn by the torch's own hand (`drawTorchRock`) at the
 * torch's own radius and facing, in the tile column the rock will be pushed
 * into — so the beat it breaks off, the creature takes over the picture
 * without anything moving, changing size or turning. It wears NEXT TO FALL,
 * for player 2 only, while it is the side the next one comes from. No tail: a
 * torch only drags one once it is falling (`drawTorch`).
 */
export function drawEgg(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  queen: Creature,
  boss: QueenState,
  side: -1 | 1,
  ox: number,
  oy: number,
  beat: number,
  waveBeat: number,
  beatPhase: number,
  time: number,
  growShare: number,
): void {
  const scale = eggScale(boss, side, beat, beatPhase, growShare);
  if (scale <= 0) return;

  const cx = tileCX(l, spanCenterCol("torch", queenTorchCol(queen.col, side))) + ox;
  const cy = tileCY(l, queen.row) + oy;
  const r = torchRadius(l) * scale;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(torchRotation(cx));
  drawTorchRock(ctx, r, time);
  ctx.restore();

  if (boss.dropSide === side) drawDropHint(ctx, l, cx, cy, r, side, waveBeat, beatPhase, time);
}
