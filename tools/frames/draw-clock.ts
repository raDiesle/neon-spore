import type { Page } from "playwright-core";

/**
 * The page's draw clock, held and set: the counter `performance.now` becomes
 * for a capture (`freezeClocks`), and the one verb that moves it on purpose
 * (`clockTo`, `--time`). Cut out of `page.ts`, which stood at the ceiling.
 */

/**
 * **Take the page's clocks away, so two captures of one build are the same
 * picture.**
 *
 * They were not. Two runs at the same wave, tick and zoom against one preview
 * came back with different digests, so `run.ts`'s `identical:` guard — which
 * exists to refuse a before-and-after pair that shows nothing — could never
 * fire. The cause is that the opening is cleared by *polling*: `clearOpening`
 * waits `OPENING_POLL_MS` between attempts, the real `requestAnimationFrame`
 * loop paints an unpredictable number of frames in that window, and everything
 * drawn on `time` — the wobble, the sway, every own-motion — is at a different
 * phase on the second run.
 *
 * So the loop is stopped **before** anything is driven, and `performance.now`
 * becomes a counter that advances by exactly one sixtieth of a second per
 * painted frame. Wrapping `paint` rather than asking every call site to count
 * is what keeps that true everywhere: `capture.ts` settles, `launch.ts` paints
 * the rings out, `opening.ts` crosses a gate, and none of them has to know.
 *
 * **A build with no `advanceOpening` keeps its loop**, and returns false. That
 * one clears its opening on nothing but rAF and wall-clock time, so freezing
 * either would hang it — and it is only ever the *parent* of the commit that
 * added the handle, which is a pair this cannot make deterministic anyway.
 */
export async function freezeClocks(page: Page): Promise<boolean> {
  return await page.evaluate((step) => {
    const ns = window.neonSpore;
    const thaw = (window as unknown as { __thaw?: () => void }).__thaw;
    if (!ns || typeof ns.advanceOpening !== "function") {
      thaw?.();
      return false;
    }
    let now = 0;
    performance.now = () => now;
    // `--time`'s way in: the next paint sees exactly `ms` (`clockTo`).
    (window as unknown as { __clockTo?: (ms: number) => void }).__clockTo = (ms) => {
      now = ms - step;
    };
    const painted = ns.paint.bind(ns);
    // The frame's `dt` goes through. A rehearsal is run off it — one film tick
    // per `paint(1 / tickHz)` (`guide-film.ts`) — and the wrapper used to drop
    // it, so every count of a guide capture was a sixtieth of a second and two
    // film ticks, and `--ticks 80` on a page photographed its tick 160.
    ns.paint = (dt?: number) => {
      now += step;
      painted(dt);
    };
    return true;
  }, 1000 / 60);
}

/**
 * **Put the next paint at `seconds` of draw time** (`FrameSpec.time`).
 *
 * Everything drawn on `time` — a boss's drift, a part's rock, a slime's wobble
 * — is at a phase set by how many frames the capture happened to paint first,
 * and how many the opening and the settle cost is nobody's number. The *Big
 * enough to be seen* test (`docs/looks.md`) wants the two stills at the moment
 * a movement is widest, and that moment is a time the tests can find
 * (`cairn-rock.test.ts` finds the apex's). The simulation is not moved: this
 * is the picture's clock, and a frame's `dt` does not read it.
 *
 * False on a build whose clock is still its own (`freezeClocks` returned
 * false), where there is nothing to set.
 */
export async function clockTo(page: Page, seconds: number): Promise<boolean> {
  return await page.evaluate((ms) => {
    const set = (window as unknown as { __clockTo?: (ms: number) => void }).__clockTo;
    if (!set) return false;
    set(ms);
    return true;
  }, seconds * 1000);
}
