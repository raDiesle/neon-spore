import { BULB, blobPath } from "@neon-spore/content";
import type { BossState, Creature } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { PALETTE } from "./palette.js";

/** Breath speed at full health, out of bloom. */
const BREATH_BASE = 1.5;
/** How much faster the breath speed gets by the time she is down to her last petal. */
const BREATH_LOW_HEALTH_BONUS = 2.5;
/** Multiplier while a bloom is announced but not yet open — the original "coming" tell. */
const BREATH_ANNOUNCED_MULT = 3;

/** A bloom is named but not open yet — the original "coming" tell. */
function isAnnounced(queen: Creature, boss: BossState, beat: number): boolean {
  return queen.color == null && boss.tellColor != null && beat < boss.openBeat;
}

/**
 * The colour the mark is showing, or null when it is showing none — open, or
 * announced and not yet open, or shut. Split out because the shell is drawn
 * over the mark's top and both sides (`drawQueen`), so the glow that says
 * which colour it wants has to go on last, after the body, rather than from
 * inside the mark's own drawing where the shell would bury it.
 */
export function weakPointHex(queen: Creature, boss: BossState, beat: number): string | null {
  if (queen.color != null) return queen.color === "red" ? PALETTE.red : PALETTE.cyan;
  if (isAnnounced(queen, boss, beat)) {
    return boss.tellColor === "red" ? PALETTE.red : PALETTE.cyan;
  }
  return null;
}

/**
 * The one place a shot actually lands: sized and coloured like a regular
 * creature, cradled in the queen's armoured body. Everything that used to be
 * the whole queen — open colour, the announced tell, the closed rock look —
 * lives here now, because only this much of her is ever vulnerable.
 *
 * The halo is not drawn here. See `weakPointHex`.
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

  const announced = isAnnounced(queen, boss, beat);
  const baseBreath = BREATH_BASE + (1 - healthShare) * BREATH_LOW_HEALTH_BONUS;
  const breathSpeed = announced ? baseBreath * BREATH_ANNOUNCED_MULT : baseBreath;
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

  const hex = weakPointHex(queen, boss, beat);
  // Open: full colour, body and border alike. Announced: the border is
  // already the colour that is coming, at full strength, so it reads at a
  // glance — only the body stays dark rock, which is what still separates
  // "coming" from "open". Closed: no colour anywhere.
  const fill =
    queen.color != null
      ? queen.color === "red"
        ? PALETTE.redDark
        : PALETTE.cyanDark
      : PALETTE.rockDark;
  const rim = PALETTE.rock;

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
}
