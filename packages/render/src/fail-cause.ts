import { type FailCause, failHolds, lostAsks, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **Why the wave was lost, in words, from the tick it was.** The owner, 10
 * October 2026, of a boss shot in the wrong colour: *it should tell reason in
 * very visible text why the wave failed in the exact moment the shot hit
 * wrong.* A breach says itself — the tear is on the hull where it came in —
 * but a shot in the wrong colour leaves the field exactly as it was, and a
 * pair looking at a held field with nothing broken on it cannot tell what
 * they did.
 *
 * So the reason is stamped onto the held field on the hit's own tick, across the
 * middle of it and as large as the width allows, and stays through the pause;
 * the lost screen that follows says it again under the wave's name
 * (`lost-words.ts`). A hit on the hull says nothing here: its tear is the
 * reason, and it is already drawn.
 *
 * Stateless: the clock is the world's own, the ticks since `failTick`.
 */

/** What each cause says, or null where the field already shows it. */
const REASON: Record<FailCause, string | null> = {
  hull: null,
  wasted: null,
  wrongColour: "WRONG COLOUR",
};

/** The words a lost wave's reason is said in, or null when the field says it. */
export function failReason(world: World): string | null {
  return failHolds(world) ? REASON[world.failCause] : null;
}

/** Where the line stands, as a share of the play area, and its size. */
const AT = 0.4;
const PX = 44;
const MIN_PX = 22;
const MARGIN = 14;
/** Seconds the stamp takes to settle. */
const PUNCH = 0.16;

function font(px: number): string {
  return `700 ${px}px "Courier New",monospace`;
}

/** The pause after the hit: the reason over the held field, until the lost screen takes it. */
export function drawFailCause(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  const text = failReason(world);
  if (text === null || lostAsks(world) || world.failTick < 0) return;
  const age = (world.tick - world.failTick) / world.cfg.tickHz;
  const mid = l.width / 2;
  const y = l.playHeight * AT;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font(PX);
  const wide = ctx.measureText(text).width;
  const room = l.width - MARGIN * 2;
  const px = wide > room && wide > 0 ? Math.max(MIN_PX, Math.floor((PX * room) / wide)) : PX;
  ctx.font = font(px);
  // **Whole on the hit's own frame**, which is the point of it: no fade and no
  // fall, only a stamp — a fifth larger for a sixth of a second, then set.
  const punch = 1 + 0.2 * Math.max(0, 1 - age / PUNCH);
  // A band of the field's own dark behind it, so the words stand on nothing
  // the field is drawing — a boss's own red is under this line on most waves.
  ctx.globalAlpha = 0.78;
  ctx.fillStyle = PALETTE.redDark;
  ctx.fillRect(0, y - px * 0.95, l.width, px * 1.9);
  ctx.globalAlpha = 1;
  const r = Math.round(px * 1.3);
  for (const dx of [-l.width / 4, 0, l.width / 4]) halo(ctx, mid + dx, y, r, PALETTE.red, 0.22);
  ctx.translate(mid, y);
  if (punch > 1) ctx.scale(punch, punch);
  ctx.fillStyle = PALETTE.redDark;
  ctx.fillText(text, 0, 3);
  ctx.fillStyle = PALETTE.red;
  ctx.fillText(text, 0, 0);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = PALETTE.redRim;
  ctx.fillText(text, 0, -2);
  ctx.restore();
}
