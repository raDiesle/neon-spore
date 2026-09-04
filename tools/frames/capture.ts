import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { chromium } from "playwright-core";
import { findChrome } from "./chrome.js";
import { clearOpening } from "./opening.js";
import type { FrameSpec, PressSpec } from "./spec.js";

/**
 * One picture, or a short strip of them, off the running game — driven the
 * same way "A CHECK THAT LANDED YESTERDAY HAS NO BEFORE" asked for: `window.neonSpore.advance` and `paint`, the same handle
 * `CLAUDE.md` already names for a headless loop check. Nothing here reads a
 * clock or a random number — the comparability a before/after pair needs
 * comes entirely from asking for the same wave, the same tick count and the
 * same seat every time.
 */

/** Which browser a capture opens. Six callers across `tools/` ask this file
 * for it, so it is re-exported rather than moved — the subject itself lives in
 * `chrome.ts`, out of the way of driving a frame. */
export { findChrome, pickChrome } from "./chrome.js";
/** Which half of a wave's opening a capture stands in, and the flag that says
 * so — the subject is `opening.ts`'s, and a caller wants the name without it. */
export { type OpeningStop, parseOpening } from "./opening.js";
/** The shape of what a capture asks for, and of the handle it drives. Its own
 * file because this one was at the ceiling CLAUDE.md sets, and because a caller
 * usually wants the spec without the browser behind it. */
export type { FrameSpec, HoldSpec, PressSpec } from "./spec.js";

export interface CaptureResult {
  /** One path per frame, in capture order. */
  paths: string[];
}

const DEFAULT_VIEWPORT = { width: 390, height: 844 } as const;

/** Painted frames spent settling a wave's opening before the frame that is
 * kept — a second, longer than its longest entrance (`render/text-drop.ts`). */
const SETTLE_FRAMES = 60;

/** Half a second at 60Hz: THE LID's plates are fully parted by then and THE
 * LANCE's lobe is well into filling, so the picture shows the hold rather than
 * the instant it began. */
const DEFAULT_HOLD_TICKS = 30;

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

/**
 * Drive one preview to an agreed frame (or a strip of them) and screenshot
 * `#stage`, the canvas the game and the director both draw the field into.
 *
 * `baseUrl` is a running `bun run preview`-shaped server — the caller starts
 * it and owns its lifetime. This function only opens one tab, drives it and
 * closes the browser; it never touches a port or a process.
 */
export async function captureFrames(
  baseUrl: string,
  spec: FrameSpec,
  outPrefix: string,
): Promise<CaptureResult> {
  const frames = spec.frames ?? 1;
  const strideTicks = spec.strideTicks ?? 6;
  if (frames < 1) throw new Error("frames must be at least 1");

  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  try {
    const page = await browser.newPage({ viewport: spec.viewport ?? DEFAULT_VIEWPORT });
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

    // `?play` is the way past the menu, which is the game's front door now
    // (`apps/game/src/menu.ts`). Without it every frame would be photographed
    // through a title screen. A build from before the flag existed ignores it,
    // which is what `bun run frames <sha>` needs it to do.
    await page.goto(`${baseUrl}${baseUrl.includes("?") ? "&" : "?"}play=1`, { waitUntil: "load" });
    await page.waitForFunction(() => Boolean(window.neonSpore));

    await page.evaluate((wave) => {
      const ns = window.neonSpore;
      if (!ns) throw new Error("window.neonSpore missing after load");
      ns.jumpToWave(wave);
    }, spec.wave);

    await clearOpening(page, spec.opening);

    /**
     * What `ticks` and `strideTicks` actually move.
     *
     * A wave is stepped by the simulation and a **rehearsal is not**: the
     * guide's loop is drawn by `paint` off the frame clock, so a strip of it
     * counted in ticks would be one picture repeated. On the guide, then, the
     * two numbers count painted frames — the same numbers the caller wrote,
     * against the only clock the thing in front of the camera runs on.
     */
    const paintDriven = spec.opening === "guide";
    const advance = async (n: number): Promise<void> => {
      await page.evaluate(
        ([count, byFrame]) => {
          const ns = window.neonSpore;
          if (!ns) throw new Error("window.neonSpore missing mid-capture");
          for (let i = 0; i < (count as number); i++) {
            if (byFrame) ns.paint();
            else ns.advance(1);
          }
        },
        [n, paintDriven] as [number, boolean],
      );
    };

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

    // **The loop stops here, and not one line earlier.** Everything this tool
    // promises rests on the two pictures being the same instant of the same
    // wave — and until this line the page has gone on ticking between
    // `paint()` and the screenshot, a couple of hundred milliseconds of round
    // trip being a few dozen ticks, so the frame that landed was at whatever
    // beat phase the loop happened to reach and the parent and the commit
    // reached different ones. Anything that only shows for part of a beat was
    // caught or missed at random. THE VEIL's lightning is what found it: three
    // captures in a row of a creature whose whole picture is a strike on the
    // beat came back with no strike in them.
    //
    // Not in an init script, because the loop above *needs* the loop: a build
    // from before `advanceOpening` existed clears its own opening on nothing
    // but rAF and wall-clock time, which is the whole of what
    // `OPENING_POLL_MS` is waiting for. So it runs until the opening lets go
    // and then stops, and from here the only clock is `advance`.
    await page.evaluate(() => {
      window.requestAnimationFrame = () => 0;
    });

    /** Send one press into the page, refusing a build too old to take it. */
    const press = async (one: PressSpec): Promise<void> => {
      await page.evaluate((sent) => {
        const ns = window.neonSpore;
        if (!ns) throw new Error("window.neonSpore missing before a press");
        if (!ns.send) {
          throw new Error(
            "this build has no window.neonSpore.send — --press needs a commit at or after the " +
              "one that added it, and a before/after pair cannot press anything on its parent",
          );
        }
        ns.send(sent.player, sent.command);
      }, one);
    };

    // **An opening's words arrive rather than appear**, on painted frames rather
    // than on ticks (`render/text-drop.ts`), so a capture that painted one frame
    // caught them at zero opacity. Settled first, the way `pose-art.ts` settles
    // the frame it keeps; the count goes over the wire because `evaluate` runs
    // in the browser, where a constant declared here does not exist.
    if (spec.opening) {
      await page.evaluate((n) => {
        for (let i = 0; i < n; i++) window.neonSpore?.paint();
      }, SETTLE_FRAMES);
    }

    const paths: string[] = [];
    for (let i = 0; i < frames; i++) {
      const advanceBy = i === 0 ? spec.ticks : strideTicks;
      if (i === 0 && spec.press) {
        // The presses walk the same tick line the first advance does, so a
        // shot lands while its target is on the field rather than at whatever
        // tick the wave happens to have reached. `parsePress` sorted them.
        let at = 0;
        for (const one of spec.press) {
          const step = Math.min(one.tick, advanceBy) - at;
          if (step > 0) {
            await advance(step);
            at += step;
          }
          await press(one);
        }
        if (advanceBy - at > 0) await advance(advanceBy - at);
      } else {
        await advance(advanceBy);
      }

      // **After the wave's own ticks, never before them.** A hand takes hold of
      // something that is already there: a `drag` names a creature by the id
      // the simulation dealt it, and at tick zero of a wave that creature has
      // not arrived — the command lands on a stale id, `setGrip` drops it, and
      // the frame comes back released while every number in the capture says
      // the hold was sent. That is the exact failure this flag exists to end,
      // so the press goes in here and gets its own short run of ticks to show
      // in.
      if (i === 0 && spec.hold) {
        await press({ ...spec.hold, tick: spec.ticks });
        await advance(spec.holdTicks ?? DEFAULT_HOLD_TICKS);
      }

      await page.evaluate(() => {
        window.neonSpore?.paint();
      });

      if (pageErrors.length > 0) {
        throw new Error(`page threw while driving the loop: ${pageErrors[0]}`);
      }

      const path =
        frames === 1 ? `${outPrefix}.png` : `${outPrefix}-${String(i).padStart(2, "0")}.png`;
      await mkdir(dirname(path), { recursive: true });
      await page.locator("#stage").screenshot({ path });
      paths.push(path);
    }
    return { paths };
  } finally {
    await browser.close();
  }
}
