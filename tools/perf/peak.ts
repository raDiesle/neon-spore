import type { Page } from "playwright-core";
import { clearOpening } from "../frames/opening.js";
import { type Held, HOLD_SETTLE_TICKS } from "./held.js";
import { PEAK_SEARCH_STEP, PEAK_SEARCH_TICKS, peakTick } from "./sweep-timing.js";

/**
 * STANDING A WAVE WHERE IT IS MEASURED.
 *
 * Split out of `measure.ts` on the 250-line limit, and along the seam that was
 * already there: next door is *how a paint is timed*, and everything here is
 * about the state the paint is taken of — which wave, which tick, and what is
 * being held down while it happens. The two grew apart the day a round stopped
 * being photographed at its count-in and a wave gained a thumb.
 *
 * `clearOpening` is `tools/frames`' own, not a second copy — a wave's opening
 * is one rule and this tool has no business restating it.
 */

/**
 * Put one wave on the field and step it to its busiest tick.
 *
 * The search is run twice over: once to find where the peak is, then the wave
 * is restarted and replayed to exactly that tick. Stopping at the peak the
 * first time round is not the same thing — the search has to run *past* it to
 * know it was a peak.
 *
 * **Busiest means two different things, and which one applies is asked of the
 * world rather than of a list.** An ordinary wave is busiest where it carries
 * the most bodies. A boss round carries none at all — its picture is in
 * `world.boss` — so a body count never improves on tick 0 and the whole sweep
 * used to photograph every round during its count-in. A round that never put
 * a body on the field is stepped to `BOSS_SONG_FRACTION` of the length it
 * actually ran instead, which is one number, needs no per-kind reader, and is
 * wrong for none of them.
 */
export async function toPeak(page: Page, waveIndex: number): Promise<number> {
  const enter = async (): Promise<void> => {
    await page.evaluate((w) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing");
      ns.jumpToWave(w);
    }, waveIndex);
    await clearOpening(page);
  };

  await enter();
  const peak = await page.evaluate(
    ([wave, limit, step]) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing");
      let best = { tick: 0, bodies: ns.world.creatures.length };
      // A round is a round from the moment it is entered, and how long it runs
      // is the last tick the search reached before the wave moved on.
      const round = ns.world.boss !== null && ns.world.boss !== undefined;
      let ran = 0;
      for (let t = step; t <= limit; t += step) {
        ns.advance(step);
        // The wave moved on; anything past here belongs to the next one.
        if (ns.world.wave !== wave) break;
        ran = t;
        const bodies = ns.world.creatures.length;
        if (bodies > best.bodies) best = { tick: t, bodies };
      }
      return { ...best, round, ran };
    },
    [waveIndex, PEAK_SEARCH_TICKS, PEAK_SEARCH_STEP] as const,
  );
  // A round that put nothing on the field has no busiest body count to find,
  // so it is stepped into its own song instead (`peakTick`).
  const at = peakTick(peak);

  await enter();
  if (at > 0) {
    await page.evaluate((ticks) => window.neonSpore?.advance(ticks), at);
  }
  return peak.bodies;
}

/**
 * Press what this wave is measured with, and let it become a picture.
 *
 * Sent through `neonSpore.send`, which is the same door a finger goes through
 * — `drain(tick)` stamps it on the next tick `advance` runs, including the
 * seat check the round does on it — so nothing here reaches a state the game
 * cannot reach (`apps/game/src/handle.ts`). A wave this table does not name
 * sends nothing and is measured exactly as it was (`held.ts`).
 */
export async function holdControls(page: Page, held: readonly Held[]): Promise<void> {
  if (held.length === 0) return;
  await page.evaluate((sent) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing");
    if (!ns.send) {
      throw new Error(
        "this build has no window.neonSpore.send — a wave with held controls cannot be measured " +
          "against a commit older than the one that added it",
      );
    }
    for (const one of sent) ns.send(one.player, one.command);
  }, held as Held[]);
  await page.evaluate((ticks) => window.neonSpore?.advance(ticks), HOLD_SETTLE_TICKS);
}
