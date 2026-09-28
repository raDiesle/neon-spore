import { type SimConfig, type SinewState, sinewHeld } from "@neon-spore/sim";
import { drawVerdictRing, type GripVerdict } from "./grip-verdict.js";
import type { Circle } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { sinewWord } from "./sinew-word.js";

/**
 * **THE SINEW's two handles answer a touch the way every mark does**
 * (`mark-feedback.ts`, `.claude/skills/new-boss` §5), and all of the
 * convention applies, because both handles are drawn on both screens
 * (`sinew-handles.ts`) — this seat's bright, the partner's dim.
 *
 * A handle **asks** while its owner's hand is off it and the field has a word
 * for that hand (`sinew-word.ts`): `PULL` before the zone, `APART` through the
 * snap-back, `SWAY` on the fall. The silences are the word's own — a slack
 * tendon asks nothing of the free hand — so the halo is never a second prompt
 * arguing with the first. An asking handle wears the halo on its owner's
 * screen and the partner's turning ring and clock on the other's.
 *
 * The verdict is keyed by the owner's seat (`sinew-fx.ts`) and drawn on both
 * screens round wherever the handle stands this frame, whip and all, since
 * the handle is there on both: green on the grip, red on the other seat's
 * refused press, and red on both at the snap.
 */

/** The verdict's radius round the handle, in handle radii. */
const RING = 1.5;

/** Whether `player`'s handle is asking for its hand this frame. */
export function sinewHandleAsks(
  cfg: SimConfig,
  s: SinewState,
  player: 1 | 2,
  falling: boolean,
  swinging: boolean,
): boolean {
  return !sinewHeld(s, player) && sinewWord(cfg, s, player, falling, swinging) !== null;
}

/** Under the ring: the halo, on this seat's asking handle. */
export function drawSinewHandleHalo(
  ctx: CanvasRenderingContext2D,
  head: Circle,
  mine: boolean,
  asks: boolean,
  time: number,
): void {
  if (!mine || !asks) return;
  const fade = ctx.globalAlpha;
  drawMarkHalo(ctx, head.x, head.y, head.r, time);
  ctx.globalAlpha = fade;
}

/** Over the ring: the partner's ring and clock on theirs, and the verdict on either. */
export function drawSinewHandleMarks(
  ctx: CanvasRenderingContext2D,
  head: Circle,
  mine: boolean,
  asks: boolean,
  time: number,
  verdict: GripVerdict | null,
): void {
  if (!mine && asks) {
    drawMarkTheirs(ctx, head.x, head.y, head.r, time);
    drawMarkWait(ctx, head.x, head.y, head.r, time);
  }
  if (verdict !== null) drawVerdictRing(ctx, head.x, head.y, head.r * RING, verdict);
}
