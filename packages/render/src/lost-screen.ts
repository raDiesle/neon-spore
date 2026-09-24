import { waveHasGuide } from "@neon-spore/content";
import { spanOf, type World } from "@neon-spore/sim";
import { breachHue } from "./breach-hue.js";
import { strikeSeed } from "./breach-strike.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { drawLostAnswer, lostButtons } from "./lost-answer.js";
import { LOST_LOOK } from "./lost-look.js";
import { waveName } from "./wave-intro.js";

/**
 * A lost wave stops on a friendly screen: RETRY WAVE, TUTORIAL AGAIN or QUIT.
 *
 * The owner asked for it by name, 13 September 2026, in place of the hold
 * that used to open the same wave again by itself. The field stays under it,
 * greyed, with the breach still where it was seen — the point of the pause was
 * that the pair look at where it got through, and a screen that hid it would
 * be a screen that took that away. Over it, in the introduction's own type:
 * WAVE 7 LOST, and under it the wave's name and the run's tries
 * (`lost-words.ts`).
 * Then the buttons, the guide bar's own grown bodies with a word on the face
 * instead of a sign, because these are the one place in the game where a
 * sign would not do: a wave can be *left*, and the word for that has to be
 * read, not guessed. TUTORIAL AGAIN is drawn only on a wave that has a guide
 * to watch, and it opens the wave the way it opened the first time
 * (`lost-answer.ts`).
 *
 * **One press answers for both phones.** Either seat's RETRY opens the wave
 * again on both; either seat's QUIT ends the run on both, and the other phone
 * is told who it was (`sim/wave-fail.ts`). The screen printed a line saying so
 * until 22 September 2026, when the owner had it taken off with the rest of
 * the prose: it is a rule a pair learns by one of them pressing, and this is
 * the one screen where nobody is reading.
 *
 * The words fall in the way the introduction's do (`text-drop.ts`), off the
 * opening's clock: `openingKey` names this screen as a page of its own, so
 * the drop replays every time the wave is lost and never while it is held.
 *
 * **A rehearsal never draws it.** A film is a real world and a page that
 * teaches a breach loses its wave in it, so this screen used to be drawn
 * inside the tutorial plate, shrunk to fit under the band. The owner took that
 * away on 18 September 2026: a question about a run nobody is playing, with
 * two buttons no thumb on that page can press. `briefing.ts` is the one line
 * of order that decides it, and the fitting that used to make it sit under the
 * band went with it.
 */

export interface LostView {
  /** Seconds the screen has been up; the words fall in over the first of them. */
  age: number;
  /** Where a mouse is resting, in stage coordinates. Absent on a phone. */
  pointer?: { x: number; y: number };
  /** The membrane the frame drew, for an answer that replays the breach on it.
   * Absent where there is no ship under the screen at all (`briefing.ts`). */
  surfaceY?: SurfaceY;
}

export function drawLostScreen(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  v: LostView,
): void {
  // The veil and the words are `LOST_LOOK`'s, and the shipped record draws
  // exactly what this function used to draw in these two places. The split is
  // the seam a candidate reaches through (`lost-look.ts`).
  const scarred = world.scars[world.scars.length - 1];
  const paint = {
    l,
    age: v.age,
    wave: world.wave + 1,
    name: waveName(world),
    tries: Math.max(1, world.runTries),
    breachX: scarred === undefined ? null : tileCX(l, scarred.col),
    // **The colour the hit arrived in, off the scar itself.** A `Scar` carried
    // what hit the ship and not what colour it was wearing until 17 September
    // 2026, so a body that was shot cyan replayed in the red `breachHue` gives
    // a colourless one and the live strike and its own replay a second later
    // disagreed about what broke the hull. The field is `Scar.color`, and it
    // is absent exactly where a colour is not a fact about the hit — a rock, a
    // round from off the field — which is the `null` this passed always.
    breach:
      scarred === undefined
        ? null
        : {
            span: spanOf(scarred),
            hex: breachHue(scarred.kind, scarred.color ?? null),
            seed: strikeSeed(scarred.col, scarred.beat),
          },
    surfaceY: v.surfaceY ?? (() => l.hullY),
    hullY: l.hullY,
    buttonsY: lostButtons(l).retry.y,
  };
  LOST_LOOK.veil(ctx, paint);
  LOST_LOOK.words(ctx, paint);
  // Whether there is a tutorial to watch again, which is content's fact and
  // not the world's: `world.brief.guide` says whether *this opening* carried
  // one, and a wave gone again opens without it — so the button would have
  // vanished after the first retry, which is the one case it exists for.
  drawLostAnswer(ctx, l, { ...v, guided: waveHasGuide(world.wave) });
}

export { type LostButtons, lostButtons, lostHit } from "./lost-answer.js";
