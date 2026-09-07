import type { Page } from "playwright-core";
import type { FrameSpec } from "./spec.js";

/**
 * **Driving a rehearsal**, which is a clock of its own and not the world's.
 *
 * A wave is stepped by the simulation. A **film** is a run drawn off the *frame*
 * clock — one tick per `dt * tickHz` (`render/guide-play.ts`) — and it plays
 * once and then holds on its last frame until a thumb presses REPLAY. Both
 * halves are load-bearing for a camera and neither is visible to one, so both
 * of them were got wrong: `--opening guide` painted a plain sixtieth per count,
 * which moved the film by two ticks a frame, and the settle before the first
 * photograph ran a whole second of it. `--frames 6 --stride 30` came back as
 * six copies of the last frame, and the moment a film is *about* was the one
 * moment a session could not send the owner.
 *
 * Its own file beside `capture.ts` rather than four more branches inside it:
 * every one of these asks the page something no other capture asks, and none of
 * them is about a screenshot. `opening-hold.ts` is the neighbour that gets a
 * capture *into* a guide; this is what moves one once it is there.
 */

/** The simulation's tick rate, off the page. A film's ticks are counted in it,
 * and a build too old to expose it falls back to the shipped 120. */
export async function filmTickHz(page: Page): Promise<number> {
  return await page.evaluate(() => window.neonSpore?.world.cfg?.tickHz ?? 120);
}

/**
 * Back to the page's first tick, before a strip is taken.
 *
 * The settle a capture does first is about the *opening's words*, which arrive
 * over painted frames — but on a guide the same sixty frames are a whole second
 * of film, and a page that reaches its last tick holds there for good. This is
 * the guide's own middle button: `SceneRun.restart` rebuilds the rehearsal and
 * runs the ticks before this page silently, so what a strip starts from is
 * where those ticks really left it. The caption stays where the settle put it.
 */
export async function rewindFilm(page: Page): Promise<void> {
  await page.evaluate(() => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing before a rehearsal");
    if (!ns.replayGuide) {
      throw new Error(
        "this build has no window.neonSpore.replayGuide — --opening guide needs a commit at " +
          "or after the one that added it, or the strip is six copies of the page's last frame",
      );
    }
    ns.replayGuide();
  });
}

/** Whether the page has played out and is holding on its last frame.
 * `undefined` on a build too old to answer, where "cannot tell" is honest. */
export async function filmHeld(page: Page): Promise<boolean | undefined> {
  return await page.evaluate(() => window.neonSpore?.guideFinished?.());
}

/**
 * A strip taken from past the end of a page, said out loud.
 *
 * A first picture asked for beyond a page's end gets its last frame, and every
 * stride after it gets the same one again. The capture cannot refuse — one
 * still of a page is a perfectly good picture — so this says it and names the
 * number that would fix it. A silent version would be the same trap wearing the
 * fix as a disguise.
 *
 * The page is asked rather than the pictures compared: the light behind the
 * field moves on its own clock, so two photographs of a held page differ in
 * every pixel that is not the film.
 */
export function heldPageNote(spec: FrameSpec, held: boolean | undefined): string | null {
  if (!held || (spec.frames ?? 1) < 2) return null;
  return (
    "held: this page had already played out when the first picture was taken, so every " +
    `frame is its last one. Lower --ticks (${spec.ticks ?? 0}) to land inside the page, ` +
    "or --guide-page one that runs longer."
  );
}
