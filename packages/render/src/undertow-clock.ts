import { beatSeconds, undertowBoss, undertowLevelLeft, type World } from "@neon-spore/sim";
import { clockText, drawDrainBar } from "./fleet-clock.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { shipTopFoot } from "./ship-top-chrome.js";

/**
 * How long THE UNDERTOW's level has left, as a bar and as a number.
 *
 * **The owner asked for it by name** (1 October 2026): a level ends on its
 * clock, not on a count of lobes taken, so surviving it is the win — and a
 * win the pair cannot see coming is one they cannot pace. It is THE FLEET's
 * instrument (`fleet-clock.ts`), the drain bar and the `0:14` numeral, so a
 * pair who learnt one clock read the other; with the level written beside it,
 * `LEVEL 2/3`, because three levels are the fight's whole length.
 *
 * **Never red.** THE FLEET's clock turns red because running out breaks the
 * hull; this one running out is the level won, and an alarm on it would say
 * the opposite of what happens.
 *
 * Both screens, at the top of the field under the ship's own chrome. Nothing
 * is stored: the bar is the beat the level began on against the beat now.
 */

const LEVELS = { one: 1, two: 2, three: 3 } as const;
const LEVEL_COUNT = Object.keys(LEVELS).length;

/** The row the numeral's baseline sits on, under whatever chrome is up. */
export function undertowClockY(l: Layout, world: World): number {
  const foot = shipTopFoot(l, world);
  const top = Math.max(l.gridTop, foot ?? l.gridTop);
  return top + Math.max(16, l.tile * 0.7);
}

export function drawUndertowClock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
): void {
  const u = undertowBoss(world);
  if (u === null) return;
  const { cfg } = world;
  const beats = undertowLevelLeft(cfg, u, world.beat);
  const smooth = Math.max(0, beats - (beats > 0 ? beatPhase : 0));
  const left = smooth / Math.max(1, cfg.undertowLevelBeats);
  const size = Math.max(12, l.tile * 0.5);
  const y = undertowClockY(l, world);
  const w = l.gridWidth * 0.6;
  const x = l.gridLeft + (l.gridWidth - w) / 2;
  const h = Math.max(2, l.tile * 0.09);

  ctx.save();
  ctx.font = `700 ${Math.round(size)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.85;
  const text = `LEVEL ${LEVELS[u.phase]}/${LEVEL_COUNT}  ${clockText(smooth * beatSeconds(cfg))}`;
  ctx.fillText(text, l.gridLeft + l.gridWidth / 2, y);
  ctx.globalAlpha = 1;
  drawDrainBar(ctx, x, y + size * 0.4, w, h, left, false);
  ctx.restore();
}
