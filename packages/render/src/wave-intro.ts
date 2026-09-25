import { WAVES } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { SETTLED_AGE } from "./opening-fx.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";

/**
 * A wave's number and its name, as **plain text on the field**. No panel, no
 * border, no card — the owner asked for exactly that, and the reason is that
 * the two lines are not a thing to be dismissed. A frame
 * around text says "press me"; text on the field says "read this, it is about
 * to start".
 *
 * It stands in one place or the other, never both. Alone, on a timer, for a
 * wave with no guide or one gone again; or on the last page of a guide, over
 * the ready circles, where it is what the pair says READY *to*
 * (`ready-page.ts`) — and then the field follows the gate with no second
 * showing (`sim/briefing.ts`).
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
 * The two lines are staggered, so the eye is led down them in the order they
 * are meant to be read: the number, then the name.
 *
 * **There is no third line.** A wave's sentence stood under its name until the
 * owner took it off every wave, 25 September 2026: *name of wave and number is
 * good enough*.
 */

/**
 * How long the introduction stands when it is standing alone.
 *
 * **Here rather than in the app that counts it**, because the fade at the end
 * of it is drawn here and the countdown is run there — two numbers that have to
 * be the same number, which is the definition of one that should only be
 * written once. `apps/game/src/waves.ts` imports it, by way of `introSeconds`.
 */
export const INTRO_SECONDS = 5.5;

/**
 * How long it stands on every try after the first. The owner, 20 September
 * 2026: *when players lost the same wave, try and retry, shorten the time to
 * show the text and start the wave rows earlier.* A pair going again has read
 * these two lines already; what they need is the TRY count and the field.
 *
 * **One shorter value, not a fall per retry**, and half the first: the whole
 * opening plays at double speed — entrance, standing and fade alike — so the
 * words still finish arriving well before they leave, and the fourth try
 * waits no less than the second. A floor rather than nothing, because the
 * count beside the number is new every time and is worth the glance.
 */
export const RETRY_INTRO_SECONDS = INTRO_SECONDS / 2;

/** How long the introduction stands on this try of the wave. */
export function introSeconds(tries: number): number {
  return tries > 1 ? RETRY_INTRO_SECONDS : INTRO_SECONDS;
}

/** How long the exit takes. The entrance is `text-drop.ts`'s own. */
const FADE = 0.55;
/** The gap between the two baselines. */
const NAME_DROP = 30;

/**
 * What this wave is called, or the honest thing to say past the last authored
 * one. Exported because the band names the wave on every page of its guide and
 * must call it what this page calls it (`guide-tide.ts`).
 */
export function waveName(world: World): string {
  return WAVES[world.wave]?.name ?? "BEYOND THE AUTHORED WAVES";
}

export function drawIntroduction(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  age = SETTLED_AGE,
  fading = false,
  /**
   * Where the block's **first** line sits, when the caller is laying a column
   * out around it. The gate does: the owner asked for that whole page to move
   * to the top of the screen, so the wave's name starts it and the question,
   * the circles and the line about who is waiting follow underneath. Left out,
   * the block sits where a standing introduction always has — centred in the
   * play area, with nothing above or below it to meet.
   */
  top?: number,
): void {
  const name = waveName(world);
  // The exit is the entrance played backwards into nothing, and it only exists
  // where something is counting: on the ready page the pair is what ends this,
  // and text that had begun to fade would be text that looked like a mistake.
  // A retry's shorter stand is the same opening played faster, so its words
  // arrive and leave inside the seconds `waves.ts` counts for it.
  const t = fading ? age * (INTRO_SECONDS / introSeconds(world.waveTries)) : age;
  const out = fading ? Math.max(0, Math.min(1, (t - (INTRO_SECONDS - FADE)) / FADE)) : 0;

  ctx.textAlign = "center";
  const mid = l.width / 2;
  // Centred in the play area rather than low down where the old wave banner
  // sat. That banner shared the screen with a wave already running and had to
  // keep off a boss; nothing is on the field behind this, because the wave has
  // not started, and the middle is where an eye already is.
  let y = top ?? l.playHeight * 0.42;
  let line = 0;

  drop(ctx, mid, y, t, line++, out, () => {
    ctx.font = '600 11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    // A wave gone again says which try this is, beside its number: the pair
    // is counting, and the run counts with them (`wave-start.ts`).
    const tries = world.waveTries > 1 ? ` · TRY ${world.waveTries}` : "";
    ctx.fillText(`WAVE ${world.wave + 1}${tries}`, 0, 0);
  });

  y += NAME_DROP;
  drop(ctx, mid, y, t, line++, out, () => {
    ctx.font = '700 21px "Courier New",monospace';
    ctx.fillStyle = PALETTE.hullRim;
    ctx.fillText(name, 0, 0);
  });

  ctx.textAlign = "left";
}
