import type { Page } from "playwright-core";
import {
  GATE_TICKS_ENOUGH,
  MAX_OPENING_ATTEMPTS,
  OPENING_GUIDE,
  OPENING_INTRO,
  OPENING_PLAY,
  OPENING_POLL_MS,
  type OpeningStop,
  openingPhase,
} from "./opening.js";

/**
 * **Standing *in* a wave's opening**, rather than getting past it.
 *
 * Cut out of `opening.ts` when the driven path took that file over its
 * 250-line limit, along the seam the two halves already had: next door is
 * everything about *clearing* the opening on the way to a picture of the
 * field, and this is the one caller that wants a picture of the opening
 * itself. Every refusal here names the wave rather than timing out — a frame
 * of the field returned for `--opening guide` would be an honest-looking
 * answer to a question nobody asked.
 */

/**
 * Stand *in* the opening at the phase asked for, rather than run through it.
 *
 * **The two are the other way round from how this was written.** A wave opens
 * on its *guide* now, and its introduction stands behind that
 * (`packages/sim/src/briefing.ts` — the introduction names the wave the pair is
 * about to play, so it wants to be the last thing before the field). So
 * `"guide"` is the phase a guided wave opens in and only has to be checked for,
 * and `"intro"` is the one with a screen to get past.
 *
 * Getting past a guide means **crossing its gate**, which is two thumbs held
 * for `readyHoldMs` — `dismissBriefing` is exactly that hold from both seats,
 * and the ticks after it are what fill the circles. That is the one move this
 * function used to refuse to make, on the grounds that acking the thing being
 * photographed cannot be undone; with the order swapped it is the only way to
 * reach the thing that *is* being photographed, and the guide is no longer it.
 *
 * Every refusal names the wave rather than timing out: a picture of the field
 * returned for `--opening guide` would be an honest-looking answer to a
 * question nobody asked.
 */
export async function holdOpening(page: Page, stopAt: OpeningStop, driven: boolean): Promise<void> {
  const want = stopAt === "intro" ? OPENING_INTRO : OPENING_GUIDE;
  for (let i = 0; i <= MAX_OPENING_ATTEMPTS; i++) {
    const opening = await openingPhase(page);
    if (opening === "old") {
      throw new Error(
        "--opening needs a build whose world.brief has a phase — this one predates the " +
          "introduction, so it has no introduction and no guide to photograph",
      );
    }
    const { phase, steps } = opening;
    if (phase === want) return;
    if (stopAt === "intro" && phase === OPENING_GUIDE && steps > 0) {
      throw new Error(
        "this wave's guide is stepped, so its introduction is the last page of the guide " +
          "rather than a screen behind it — photograph it with --opening guide",
      );
    }
    if (phase === OPENING_PLAY) {
      throw new Error(
        stopAt === "intro"
          ? "this wave is already on the field: nothing is holding it, so there is no " +
              "introduction to photograph"
          : "this wave carries no guide — it opened straight on its introduction",
      );
    }
    if (want === OPENING_GUIDE) {
      throw new Error(
        "this wave is on its introduction, which is *behind* the guide: it carries no " +
          "guide to photograph",
      );
    }
    // Standing on a guide with the introduction behind it. Cross the gate:
    // both thumbs down, then the ticks that fill the two circles.
    await page.evaluate((fillTicks) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing mid-capture");
      ns.dismissBriefing();
      ns.advance(1);
      ns.advance(fillTicks);
    }, GATE_TICKS_ENOUGH);
    // Nothing moves between attempts on a driven page, so the sleep is dead
    // time; on an old one it is the whole of what makes the loop turn.
    if (!driven) await page.waitForTimeout(OPENING_POLL_MS);
  }
  throw new Error("the guide never passed — the introduction never came up");
}
