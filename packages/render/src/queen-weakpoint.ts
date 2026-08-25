import { BULB, blobPath } from "@neon-spore/content";
import type { BossState, Creature } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";

/** Breath speed at full health, out of bloom. */
const BREATH_BASE = 1.5;
/** How much faster the breath speed gets by the time she is down to her last petal. */
const BREATH_LOW_HEALTH_BONUS = 2.5;
/** Multiplier while a bloom is announced but not yet open — the original "coming" tell. */
const BREATH_ANNOUNCED_MULT = 3;

/**
 * The one place a shot actually lands: sized and coloured like a regular
 * creature, embedded in the queen's armoured body. Everything that used to be
 * the whole queen — open colour, the announced tell, the closed rock look —
 * lives here now, because only this much of her is ever vulnerable.
 */
export function drawWeakPoint(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  queen: Creature,
  boss: BossState,
  beat: number,
  time: number,
  healthShare: number,
): void {
  const shape = BULB;
  const scale = r / Math.max(shape.rx, shape.ry);
  const phase = (queen.id % 7) * 0.9;

  const isAnnounced = queen.color == null && boss.tellColor != null && beat < boss.openBeat;
  const baseBreath = BREATH_BASE + (1 - healthShare) * BREATH_LOW_HEALTH_BONUS;
  const breathSpeed = isAnnounced ? baseBreath * BREATH_ANNOUNCED_MULT : baseBreath;
  const t = time * (breathSpeed / BREATH_BASE) + phase;
  const pump = Math.sin(t * breathSpeed);
  const sx = 1 + pump * 0.15;
  const sy = 1 - pump * 0.15;

  const d = blobPath(
    0,
    0,
    shape.rx,
    shape.ry,
    shape.lobes,
    shape.depth,
    shape.wobble,
    t,
    shape.seed,
  );
  const path = new Path2D(d);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale * sx, scale * sy);

  let fill: string;
  let rim: string = PALETTE.rock;
  let hex: string | null = null;

  if (queen.color != null) {
    // Open: full colour, body and border alike.
    fill = queen.color === "red" ? PALETTE.redDark : PALETTE.cyanDark;
    hex = queen.color === "red" ? PALETTE.red : PALETTE.cyan;
  } else if (isAnnounced) {
    // Announced: the border is already the colour that is coming, at full
    // strength, so it reads at a glance — only the body stays dark rock,
    // which is what still separates "coming" from "open".
    fill = PALETTE.rockDark;
    hex = boss.tellColor === "red" ? PALETTE.red : PALETTE.cyan;
  } else {
    // Closed: no colour anywhere.
    fill = PALETTE.rockDark;
    rim = PALETTE.rock;
  }

  ctx.fillStyle = fill;
  ctx.fill(path);

  if (hex != null) {
    strokeGlow(ctx, path, hex, Math.max(1, r * 0.14) / scale, 1);
  } else {
    ctx.strokeStyle = rim;
    ctx.lineWidth = Math.max(1, r * 0.14) / scale;
    ctx.stroke(path);
  }

  ctx.restore();

  if (hex != null) {
    halo(ctx, cx, cy, r * 1.9, hex, 0.16);
  }
}
