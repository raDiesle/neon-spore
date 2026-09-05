import type { Browser, Page } from "playwright-core";
import { clearOpening } from "./opening.js";
import type { FrameSpec } from "./spec.js";

/**
 * **Getting a tab to the moment the world is ours**, which is everything a
 * capture has to do before the first tick it actually asked for.
 *
 * Cut out of `capture.ts` when `--settle` took that file past its 250-line
 * limit, along the seam it already had: below this line the page belongs to
 * the caller and the only clock is `advance` and `paint`; above it the game is
 * still running itself, and every step here is a thing that has to happen
 * while that is still true. The frame loop is next door, and so is the
 * argument for each of the numbers it spends.
 */

const DEFAULT_VIEWPORT = { width: 390, height: 844 } as const;

/**
 * `STORAGE_KEY` from `apps/game/src/view.ts`, copied for `OPENING_PLAY`'s
 * reason: the line that reads it runs in the browser, before the bundle loads,
 * where nothing this file imports exists. The view switch restores the seat
 * from this key on startup, so writing it is the same as having pressed the
 * button — and a key that went stale would leave every seated capture silently
 * back on the test rig, which is why the string is named here rather than
 * inlined at the call.
 */
const SEAT_KEY = "neon-spore.view";

/** Where a page's own thrown errors are collected, so the frame loop can
 * refuse to keep photographing a broken build. */
export interface Stage {
  page: Page;
  errors: string[];
}

/**
 * Open one tab, put it on the wave, and stop the game running itself.
 *
 * Returns the page and the errors it has thrown, which is what a caller checks
 * between frames: a picture taken after the bundle threw is a picture of half
 * a field, and it looks like a rendering change.
 */
export async function openStage(
  browser: Browser,
  baseUrl: string,
  spec: FrameSpec,
): Promise<Stage> {
  // `deviceScaleFactor` and not a resize afterwards: the layout is computed
  // from the CSS viewport either way, so this buys real pixels for the same
  // picture rather than stretching the ones a phone would have had.
  const page = await browser.newPage({
    viewport: spec.viewport ?? DEFAULT_VIEWPORT,
    deviceScaleFactor: spec.zoom ?? 1,
  });
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  // Before the bundle runs, not after: the view switch reads its seat once
  // on startup and the layout is computed from it, so a seat set afterwards
  // would be a second frame's worth of work and a first frame of the wrong
  // screen.
  if (spec.seat) {
    // A refusal to store leaves the capture on whatever the build defaults
    // to, which is the same shape `view.ts` takes when storage says no.
    await page.addInitScript(
      ([key, seat]: string[]) => {
        try {
          localStorage.setItem(key as string, seat as string);
        } catch {}
      },
      [SEAT_KEY, spec.seat],
    );
  }

  // **The loop is parked before the bundle can start it**, and that is the only
  // place it can be parked from: `window.neonSpore` appears during module
  // init, so anything that waits for it has already let a variable number of
  // frames — and therefore of *ticks* — go by. Two captures of one build came
  // back one tick apart because of exactly that, which is why the guard in
  // `run.ts` could never fire. A build too old to be driven is thawed again
  // straight after the check below, and the parked callback is what lets its
  // loop pick up where it was rather than never starting.
  await page.addInitScript(() => {
    const real = window.requestAnimationFrame.bind(window);
    const parked: FrameRequestCallback[] = [];
    let frozen = true;
    window.requestAnimationFrame = (cb) => {
      if (!frozen) return real(cb);
      parked.push(cb);
      return 0;
    };
    (window as unknown as { __thaw: () => void }).__thaw = () => {
      frozen = false;
      for (const cb of parked.splice(0)) real(cb);
    };
  });

  // `?play` is the way past the menu, which is the game's front door now
  // (`apps/game/src/menu.ts`). Without it every frame would be photographed
  // through a title screen. A build from before the flag existed ignores it,
  // which is what `bun run frames <sha>` needs it to do.
  await page.goto(`${baseUrl}${baseUrl.includes("?") ? "&" : "?"}play=1`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(window.neonSpore));

  const driven = await freezeClocks(page);

  await page.evaluate((wave) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing after load");
    ns.jumpToWave(wave);
  }, spec.wave);

  // Straight after the jump and before the opening lets go: the round is the
  // *fight's* state rather than the wave's, so standing it up early means the
  // rehearsal and the introduction are already showing the sheet that will be
  // photographed (`FrameSpec.bossRound`).
  if (spec.bossRound !== undefined) {
    const stood = await page.evaluate((round) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing before a boss round");
      if (!ns.bossRound) {
        throw new Error(
          "this build has no window.neonSpore.bossRound — --boss-round needs a commit at or " +
            "after the one that added it, and a before/after pair cannot set it on its parent",
        );
      }
      return ns.bossRound(round);
    }, spec.bossRound);
    if (!stood) {
      throw new Error(`--boss-round ${spec.bossRound}: this wave's boss is not played in rounds`);
    }
  }

  await clearOpening(page, spec.opening, driven);

  // The PC key toast (`apps/game/src/key-hint.ts`) sits over the top of the
  // field for its first six seconds, and headless Chrome reports `pointer:
  // fine` — so every frame this tool has ever taken had the hull bar and
  // the siren's corner behind a black box. It runs on a real clock, which
  // `advance` is not, so it cannot be waited out once rAF is frozen: it is
  // removed outright, here, while the page is still its own.
  //
  // Matched on its own text rather than an id, because a commit and its
  // parent both come through here — an id added today is missing from the
  // parent, and a toast cleared on one side of a before/after pair is worse
  // than one left on both.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("div")) {
      if (el.textContent?.startsWith("Keyboard")) el.remove();
    }
  });

  // **The loop stops here** on a build too old to be driven — `freezeClocks`
  // has already stopped it on every other. Everything this tool promises rests
  // on the two pictures being the same instant of the same wave, and while the
  // loop runs the page goes on ticking between `paint()` and the screenshot: a
  // couple of hundred milliseconds of round trip is a few dozen ticks, so the
  // frame that landed was at whatever beat phase the loop happened to reach
  // and the parent and the commit reached different ones. THE VEIL's lightning
  // is what found it — three captures in a row of a creature whose whole
  // picture is a strike on the beat came back with no strike in them.
  //
  // An old build *needs* the loop up to here: it clears its own opening on
  // nothing but rAF and wall-clock time, which is the whole of what
  // `OPENING_POLL_MS` is waiting for.
  if (!driven) {
    await page.evaluate(() => {
      window.requestAnimationFrame = () => 0;
    });
  }

  return { page, errors: pageErrors };
}

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
async function freezeClocks(page: Page): Promise<boolean> {
  return await page.evaluate((step) => {
    const ns = window.neonSpore;
    const thaw = (window as unknown as { __thaw?: () => void }).__thaw;
    if (!ns || typeof ns.advanceOpening !== "function") {
      thaw?.();
      return false;
    }
    let now = 0;
    performance.now = () => now;
    const painted = ns.paint.bind(ns);
    ns.paint = () => {
      now += step;
      painted();
    };
    return true;
  }, 1000 / 60);
}
