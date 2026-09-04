import { WAVES } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";
import { wrapText } from "./wrap-text.js";

/**
 * A wave's number, its name and its sentence, as **plain text on the field**.
 * No panel, no border, no card — the owner asked for exactly that, and the
 * reason is that the three lines are not a thing to be dismissed. A frame
 * around text says "press me"; text on the field says "read this, it is about
 * to start".
 *
 * It stands in two places now. Alone, on a timer, for a wave whose guide is
 * prose or which has no guide at all; and on the last page of a stepped guide,
 * over the ready button, where it is what the pair says READY *to*
 * (`ready-page.ts`).
 *
 * ## The drop
 *
 * The owner asked for the words to arrive rather than to appear — *maybe
 * dropping from above like a water drop shaping the text* — with one condition
 * attached, in his own emphasis: **the text must be well readable**. So the
 * whole entrance is over in six tenths of a second, each line is fully opaque
 * long before it stops moving, and the only thing still happening after that is
 * nothing at all. A line falls, stretched the way a drop is stretched by its
 * own speed, lands, flattens once, and is then ordinary type standing still.
 *
 * The three lines are staggered, so the eye is led down them in the order they
 * are meant to be read: the number, then the name, then the sentence.
 */

/**
 * How long the introduction stands when it is standing alone.
 *
 * **Here rather than in the app that counts it**, because the fade at the end
 * of it is drawn here and the countdown is run there — two numbers that have to
 * be the same number, which is the definition of one that should only be
 * written once. `apps/game/src/waves.ts` imports it.
 */
export const INTRO_SECONDS = 5.5;

/** How long the exit takes. The entrance is `text-drop.ts`'s own. */
const FADE = 0.55;

export function drawIntroduction(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  age = Number.POSITIVE_INFINITY,
  fading = false,
): void {
  const wave = WAVES[world.wave];
  const name = wave?.name ?? "BEYOND THE AUTHORED WAVES";
  const sentence = wave?.sentence ?? "";
  // The exit is the entrance played backwards into nothing, and it only exists
  // where something is counting: on the ready page the pair is what ends this,
  // and text that had begun to fade would be text that looked like a mistake.
  const out = fading ? Math.max(0, Math.min(1, (age - (INTRO_SECONDS - FADE)) / FADE)) : 0;

  ctx.textAlign = "center";
  const mid = l.width / 2;
  // Centred in the play area rather than low down where the old wave banner
  // sat. That banner shared the screen with a wave already running and had to
  // keep off a boss; nothing is on the field behind this, because the wave has
  // not started, and the middle is where an eye already is.
  let y = l.playHeight * 0.42;
  let line = 0;

  drop(ctx, mid, y, age, line++, out, () => {
    ctx.font = '600 11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${world.wave + 1}`, 0, 0);
  });

  y += 30;
  drop(ctx, mid, y, age, line++, out, () => {
    ctx.font = '700 21px "Courier New",monospace';
    ctx.fillStyle = PALETTE.hullRim;
    ctx.fillText(name, 0, 0);
  });

  y += 28;
  ctx.font = '13px "Courier New",monospace';
  // The sentence's own lines share one place in the stagger, so they fall
  // together. Staggered against each other they overlapped on the way down —
  // two lines of type through one another is the one thing the entrance is not
  // allowed to cost.
  for (const text of wrapText(ctx, sentence, l.width - 64)) {
    drop(ctx, mid, y, age, line, out, () => {
      ctx.font = '13px "Courier New",monospace';
      ctx.fillStyle = PALETTE.text;
      ctx.fillText(text, 0, 0);
    });
    y += 18;
  }

  ctx.textAlign = "left";
}
