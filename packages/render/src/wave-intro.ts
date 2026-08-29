import { WAVES } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { wrapText } from "./wrap-text.js";

/**
 * The first of the two states a wave opens in: its number, its name and its
 * sentence, as **plain text on the field**. No panel, no border, no card — the
 * owner asked for exactly that, and the reason is that the three lines are not
 * a thing to be dismissed. A frame around text says "press me"; text on the
 * field says "read this, it is about to start".
 *
 * The same on both screens, because all three lines are the same on both
 * devices — the split begins with the guide behind it, not here. Nothing is
 * pressed: it passes on a timer the app counts (`apps/game/src/waves.ts`), and
 * the world is what decides it is still standing.
 *
 * Its own file rather than the head of `briefing.ts` because that file was
 * already at the line limit and these two states are drawn nothing like each
 * other — one is a panel with two halves and a footer, this is three lines of
 * type.
 */
export function drawIntroduction(ctx: CanvasRenderingContext2D, l: Layout, world: World): void {
  const wave = WAVES[world.wave];
  const name = wave?.name ?? "BEYOND THE AUTHORED WAVES";
  const sentence = wave?.sentence ?? "";

  ctx.textAlign = "center";
  const mid = l.width / 2;
  // Centred in the play area rather than low down where the old wave banner
  // sat. That banner shared the screen with a wave already running and had to
  // keep off a boss; nothing is on the field behind this, because the wave has
  // not started, and the middle is where an eye already is.
  let y = l.playHeight * 0.42;

  ctx.font = '600 10px "Courier New",monospace';
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText(`WAVE ${world.wave + 1}`, mid, y);

  y += 30;
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillStyle = PALETTE.hullRim;
  ctx.fillText(name, mid, y);

  y += 26;
  ctx.font = '12px "Courier New",monospace';
  ctx.fillStyle = PALETTE.text;
  for (const line of wrapText(ctx, sentence, l.width - 48)) {
    ctx.fillText(line, mid, y);
    y += 17;
  }

  ctx.textAlign = "left";
}
