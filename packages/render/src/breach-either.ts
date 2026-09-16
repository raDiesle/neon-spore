import { HAMMER_SECONDS, hammer } from "./breach-hammer.js";
import type { StrikePaint } from "./breach-look.js";
import { REND_SECONDS, rend } from "./breach-rend.js";
import { sinHash } from "./hash.js";

/**
 * **Which of the two pictures this breach gets.**
 *
 * The owner took `rend` and `hammer` together out of the three
 * `ship:breach-strike` was opened with, on 16 September 2026 — *can we use
 * both and randomly use either the one or the other in game*. So a hit is a
 * tear or a blow, and the ship does not lose the same way twice running.
 *
 * **It is not random, and it must not be.** Two phones draw the same hit, and
 * the whole of this game is two people saying out loud what they just saw. A
 * `Math.random` here would have one of them describing a black patch with
 * forks coming out of it while the other watched a white core and a crest —
 * and the picture is the thing they are looking at together on a held field.
 * So the coin is `s.seed`, which `breach-strike.ts` builds out of the column
 * and the beat: the same number on both devices, different for every hit, and
 * already the thing that makes two hits in one wave two different pictures
 * (`breach-look.ts`). Through `sinHash`, because the seed is `col * 97 +
 * beat` and its own parity would alternate along a row rather than scatter.
 *
 * **The record carries one `seconds` and the two answers do not agree about
 * it.** A tear spreads for 1.2 seconds and a blow is over in 0.55, and that
 * gap is most of what separates them — a hammer slowed to a tear's length is
 * a press, which is the sentence its own file opens with. So the record asks
 * for the longer, and the blow is handed its own clock run at the ratio and
 * then dropped: `t` past 1 draws nothing at all rather than a shape held at
 * zero alpha, which would still bake its halo (`glow.ts`). The field is held
 * for `waveFailBeats` either way, so the quiet after a hammer costs the pair
 * nothing they were going to do.
 */

/** The record's clock: the longer of the two, so neither is cut short. */
export const STRIKE_SECONDS = REND_SECONDS;

/** How much of that clock a blow actually spends. */
const HAMMER_SHARE = HAMMER_SECONDS / REND_SECONDS;

/** Which way the coin came down. Half each, and a fact about the hit. */
function isHammer(seed: number): boolean {
  return sinHash(seed) < 0.5;
}

export function either(ctx: CanvasRenderingContext2D, s: StrikePaint): void {
  if (!isHammer(s.seed)) {
    rend(ctx, s);
    return;
  }
  const t = s.t / HAMMER_SHARE;
  if (t >= 1) return;
  hammer(ctx, { ...s, t });
}
