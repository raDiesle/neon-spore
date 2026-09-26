import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import type { Browser } from "playwright-core";
import { type CaptureResult, captureFrames, closeBrowser, launchBrowser } from "../capture.js";
import { clearOpening } from "../opening.js";
import { pictureDelta, pictureDiff, pictureDigest } from "../pixels.js";
import { scratchDir, sweepScratch } from "../scratch.js";
import { root, startPreview } from "../serve.js";

/**
 * The gap this landing closes: `bun run check` stayed green the whole time
 * the opening replaced `world.brief.due`, because nothing here ever drove
 * `captureFrames` against a real page — `capture.test.ts` covers only
 * `pickChrome`, which never touches a browser. This does, against the actual
 * built game, the same way `bun run frames` does, and it fails the way the
 * real bug failed: `captureFrames` throwing instead of a picture landing.
 *
 * It builds and serves *this* checkout (`preview:once`, an OS-assigned port,
 * torn down in `afterAll`) rather than a scratch worktree of some commit —
 * `run.ts` already proves the worktree machinery works, and rebuilding one
 * per test run would be the slow, indirect way to ask a much smaller
 * question: does the handle `capture.ts` drives still exist and still let a
 * wave's opening go?
 *
 * ## One browser, and a budget that says why
 *
 * These are the only tests in the repository that start a real server and
 * drive a real browser, and `bun test` runs 280-odd files at once. Under that
 * they used to launch **a headless Chrome each** — six of them by the time
 * `--settle` landed — which is the one cost here that is neither measured nor
 * bounded, and twice in five full runs one of them lost the race: a case took
 * longer than bun's default, bun killed the file's subprocesses along with it,
 * and every test after that failed against a dead preview with
 * `ERR_CONNECTION_REFUSED`. One slow test poisoned the whole file.
 *
 * So there is one browser for the file, lent to `captureFrames`, and every
 * case carries `STARVED_MS` — a budget written for a machine with three other
 * copies of the suite on it rather than for an idle one. Four copies of this
 * file running at once is the reproduction: it failed two of four before, and
 * passes now.
 */

/**
 * What one of these is allowed to take on a machine that is being fought over.
 *
 * On an idle machine a capture costs about two seconds. The number is not a
 * deadline anybody is trying to meet — a browser that genuinely hangs still
 * fails here, and one that is merely starved still passes — and it is written
 * down once, at the top, because the failure it prevents is not one case
 * timing out. It is bun tearing the file's preview server down underneath
 * every case that had not run yet.
 */
const STARVED_MS = 120_000;
describe("captureFrames past a wave's opening", () => {
  let baseUrl: string;
  let stop: () => Promise<void>;
  let scratchOut: string;
  let browser: Browser;

  beforeAll(async () => {
    // `startPreview` reads the port off the server's own stdout, and it is
    // the one reader: this file carried a copy of that loop until 14 September
    // 2026, with the regex `serve.ts` had already found could match an address
    // cut short at `:4` of `:41733`.
    const preview = await startPreview(root);
    baseUrl = preview.url;
    stop = preview.stop;
    scratchOut = await scratchDir("opening-test-");
    browser = await launchBrowser();
  }, STARVED_MS);

  // `STARVED_MS` here as well as on `beforeAll`, and for the same reason said
  // about the other end: closing a browser, stopping a preview and sweeping
  // the scratch is four pieces of teardown on a machine running eight shards,
  // and bun's default for a hook is five seconds. Without it the file failed
  // as an unnamed case with a timed-out hook and no mention of what it was
  // waiting for — every case green above it.
  afterAll(async () => {
    if (browser) await closeBrowser(browser);
    if (stop) await stop();
    if (scratchOut) await rm(scratchOut, { recursive: true, force: true }).catch(() => {});
    // And whatever an earlier run of this file left when it was killed before
    // reaching here — the pictures are throwaway, but the directories are not
    // throwing themselves away.
    await sweepScratch();
  }, STARVED_MS);

  it(
    "gets past the wave's own opening and writes a picture of the field",
    async () => {
      const { paths } = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60 },
        join(scratchOut, "still"),
        browser,
      );
      expect(paths).toHaveLength(1);
      expect(await Bun.file(paths[0] as string).exists()).toBe(true);
    },
    STARVED_MS,
  );

  /**
   * And the other direction, which is what `--opening` added: the two screens
   * a wave puts in front of a player were the one part of the game this tool
   * could not photograph, because `clearOpening` ran through both of them on
   * the way to every picture it ever took.
   *
   * Both of these stop somewhere the field is *held*, so what they prove is
   * that the stop happened at all — a capture that quietly ran on would come
   * back with a picture, and it would be a picture of the field.
   */
  it(
    "stands on the introduction instead of running past it",
    async () => {
      // ALTERNATING, which carries no guide: its introduction is the only thing
      // in front of the field. FIRST STEP cannot answer this any more — its guide
      // is stepped, so the introduction is that guide's last page rather than a
      // phase behind it (`sim/guide-steps.ts`). It is index 3 since CYAN was
      // written into act one; both of these are the *wave the field is behind*
      // rather than any particular number, so they move when act one does.
      const { paths } = await captureFrames(
        baseUrl,
        { wave: 3, ticks: 30, opening: "intro" },
        join(scratchOut, "intro"),
        browser,
      );
      expect(paths).toHaveLength(1);
      expect(await Bun.file(paths[0] as string).exists()).toBe(true);
    },
    STARVED_MS,
  );

  it(
    "stands on the guide, and a strip of it counts painted frames",
    async () => {
      // Wave 1 carries a guide (`packages/content/src/waves/act-1.ts`), and its
      // rehearsal is drawn rather than stepped — so the strip below is four
      // paints apart on the frame clock, not four ticks apart on the world's.
      const { paths } = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 6, frames: 3, strideTicks: 4, opening: "guide" },
        join(scratchOut, "guide"),
        browser,
      );
      expect(paths).toHaveLength(3);
      for (const path of paths) expect(await Bun.file(path).exists()).toBe(true);
    },
    STARVED_MS,
  );

  /**
   * `--settle`, and the clock it exists to reach.
   *
   * `advance` steps the simulation and never paints; `paint` moves every render
   * effect by a sixtieth of a second and never steps. So a capture had one
   * painted frame per photograph however many ticks it ran, and anything living
   * in painted seconds — a spark's 0.4 s, a rock's last-step fall replay — was
   * uncapturable: four captures were once spent on a burst at the hull and not
   * one frame of them held a spark.
   *
   * Two halves, and the second is the one that would have caught a `settle`
   * wired to `advance` by mistake: it moves the picture, and it does not move
   * the world.
   */
  it(
    "settles the picture into a different frame",
    async () => {
      const bare = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60 },
        join(scratchOut, "unsettled"),
        browser,
      );
      const settled = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60, settle: 30 },
        join(scratchOut, "settled"),
        browser,
      );
      const before = await Bun.file(bare.paths[0] as string).bytes();
      const after = await Bun.file(settled.paths[0] as string).bytes();
      expect(Buffer.from(after).equals(Buffer.from(before))).toBe(false);
    },
    STARVED_MS,
  );

  it(
    "settles without stepping the simulation",
    async () => {
      const page = await browser.newPage();
      try {
        await page.goto(`${baseUrl}?play=1`, { waitUntil: "load" });
        await page.waitForFunction(() => Boolean(window.neonSpore));
        await page.evaluate(() => window.neonSpore?.jumpToWave(0));
        await clearOpening(page);
        // The same line `captureFrames` runs before its own frame loop: until
        // rAF stops, the game is still ticking itself between two `evaluate`
        // round trips, and the question below would be answered by the loop
        // rather than by `paint`.
        await page.evaluate(() => {
          window.requestAnimationFrame = () => 0;
        });

        await page.evaluate(() => window.neonSpore?.advance(60));
        const tick = () => page.evaluate(() => window.neonSpore?.world.tick ?? -1);
        // **Wait for the loop to have stopped, rather than for it to be asked
        // to.** Stubbing rAF does not cancel the callback the browser had
        // already scheduled, so one more turn of the loop ran *after* the stub
        // went in and before the tick below was read — and the world then
        // moved a few more ticks on its own, against an exact `toBe`. This
        // failed two runs in three until the number it starts from was taken
        // once the clock was genuinely still.
        await page.waitForFunction(() => {
          const now = window.neonSpore?.world.tick ?? -1;
          const seen = (window as unknown as { __lastTick?: number }).__lastTick;
          (window as unknown as { __lastTick?: number }).__lastTick = now;
          return seen === now;
        });
        const before = await tick();
        expect(before, "the wave never started").toBeGreaterThan(0);

        await page.evaluate(() => {
          for (let i = 0; i < 30; i++) window.neonSpore?.paint();
        });
        expect(await tick(), "painting moved the simulation").toBe(before);
      } finally {
        await page.context().close();
      }
    },
    STARVED_MS,
  );

  /**
   * `--at` and `--zoom`, which is what a change the size of a creature needs.
   *
   * The picture written is the crop; the digest is of the whole frame, so the
   * `identical:` guard cannot be fooled by a rectangle that framed one
   * difference or cut the only one away.
   */
  it(
    "writes the rectangle it was asked for, and digests the whole frame anyway",
    async () => {
      const whole = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60 },
        join(scratchOut, "whole"),
        browser,
      );
      const cropped = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60, at: { x: 40, y: 200, width: 120, height: 120 } },
        join(scratchOut, "cropped"),
        browser,
      );
      // Uncropped, what was written *is* the whole frame, so the digest is the
      // picture that landed on disk. Cropped, it is not — which is the whole point: the guard in
      // `run.ts` has to be asking about the game rather than about the
      // rectangle somebody asked to look at.
      expect(whole.whole[0]).toBe(pictureDigest(await Bun.file(whole.paths[0] as string).bytes()));
      expect(cropped.whole[0]).not.toBe(
        pictureDigest(await Bun.file(cropped.paths[0] as string).bytes()),
      );
      const small = await Bun.file(cropped.paths[0] as string).bytes();
      const full = await Bun.file(whole.paths[0] as string).bytes();
      expect(small.byteLength).toBeGreaterThan(0);
      expect(small.byteLength).toBeLessThan(full.byteLength);
    },
    STARVED_MS,
  );

  it(
    "spends the zoom on real pixels rather than on a bigger file of the same ones",
    async () => {
      const at = { x: 40, y: 200, width: 120, height: 120 };
      const flat = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60, at },
        join(scratchOut, "flat"),
        browser,
      );
      const magnified = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60, at, zoom: 3 },
        join(scratchOut, "magnified"),
        browser,
      );
      // The same rectangle of the same frame at three times the density. The
      // layout is computed from the CSS viewport, so what grows is resolution.
      const small = await Bun.file(flat.paths[0] as string).bytes();
      const large = await Bun.file(magnified.paths[0] as string).bytes();
      expect(large.byteLength).toBeGreaterThan(small.byteLength);
    },
    STARVED_MS,
  );

  it(
    "spends the zoom on real pixels rather than on a bigger file of the same ones",
    async () => {
      const at = { x: 40, y: 200, width: 120, height: 120 };
      const flat = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60, at },
        join(scratchOut, "flat"),
        browser,
      );
      const magnified = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60, at, zoom: 3 },
        join(scratchOut, "magnified"),
        browser,
      );
      // The same rectangle of the same frame at three times the density. The
      // layout is computed from the CSS viewport, so what grows is resolution.
      const small = await Bun.file(flat.paths[0] as string).bytes();
      const large = await Bun.file(magnified.paths[0] as string).bytes();
      expect(large.byteLength).toBeGreaterThan(small.byteLength);
    },
    STARVED_MS,
  );

  /**
   * **What differs between two captures of one build, said out loud.**
   *
   * `whole` is one digest a frame, so an assertion on it can only ever report
   * that two runs disagreed — and this pair failed once inside a full
   * `bun run check` and then passed twelve times on its own, which is exactly
   * the case where the next session needs the answer and cannot get it by
   * re-running. There is no crop here, so the file on disk is what was
   * digested: the PNGs are read back and the difference is counted in pixels
   * and placed on the frame (`png.ts`). A pair that comes back with nothing to
   * say is two encodings of one picture, and the digest would already have
   * treated them as equal.
   *
   * **A speck is not a difference.** It failed once more, 25 September 2026:
   * frame 2 of the settled strip, 3 of 987480 channel bytes, one pixel at
   * x=81, y=271 — open sky, a faint mote at the edge of a light shaft drawn
   * with `lighter`. What a real clock slip looks like was measured then: one
   * extra paint moves 30 to 70 thousand bytes, and a change of rasterizer
   * (`--disable-gpu`, SwiftShader) 81 to 533 thousand. Twenty runs under a
   * loaded CPU, and four copies in parallel, never reproduced it. So a pair
   * that disagrees in a handful of bytes by a few levels is the GPU rounding
   * one blended pixel differently, and is let through; anything larger is
   * still reported in full, with how many levels it moved.
   */
  const SPECK_BYTES = 12;
  const SPECK_LEVELS = 8;

  async function shotDiff(a: CaptureResult, b: CaptureResult): Promise<string> {
    if (a.whole.join() === b.whole.join()) return "";
    const lines: string[] = [];
    for (let i = 0; i < a.whole.length; i++) {
      if (a.whole[i] === b.whole[i]) continue;
      const one = await Bun.file(a.paths[i] as string).bytes();
      const two = await Bun.file(b.paths[i] as string).bytes();
      const d = pictureDelta(one, two);
      if (d && d.differing <= SPECK_BYTES && d.most <= SPECK_LEVELS) continue;
      lines.push(`frame ${i}: ${pictureDiff(one, two)}`);
    }
    return lines.join("; ");
  }

  /**
   * **The same build twice is the same picture.**
   *
   * It was not, and that made `run.ts`'s `identical:` guard a comment: two
   * runs at the same wave, tick and zoom came back with different digests, so
   * a pair that showed nothing could never be refused. The opening is cleared
   * by polling, the real rAF loop painted an unpredictable number of frames in
   * each 150 ms window, and everything drawn on `time` was at a different
   * phase the second time round. `freezeClocks` is the answer and this is what
   * holds it.
   */
  it(
    "takes the same picture of the same build twice",
    async () => {
      const spec = { wave: 0, ticks: 90 } as const;
      const once = await captureFrames(baseUrl, spec, join(scratchOut, "once"), browser);
      const twice = await captureFrames(baseUrl, spec, join(scratchOut, "twice"), browser);
      expect(await shotDiff(once, twice)).toBe("");
    },
    STARVED_MS,
  );

  /** And a strip of them, where every frame after the first is a settle and a
   * stride on top of a clock that has to have stayed where it was left. */
  it(
    "takes the same strip twice, settles and all",
    async () => {
      const spec = { wave: 0, ticks: 60, frames: 3, strideTicks: 4, settle: 5 } as const;
      const once = await captureFrames(baseUrl, spec, join(scratchOut, "strip-a"), browser);
      const twice = await captureFrames(baseUrl, spec, join(scratchOut, "strip-b"), browser);
      expect(await shotDiff(once, twice)).toBe("");
      expect(once.whole).toHaveLength(3);
    },
    STARVED_MS,
  );

  /**
   * **`--until-back` really does land before the event**, and `--until-on`
   * after it, which is the one
   * thing the pure tests cannot say: they hold the arithmetic, and the tick a
   * picture is taken at is the page's answer rather than a number this process
   * computed.
   *
   * Asked relationally, so it knows nothing about how long wave 0's opening
   * costs: the same event is waited for twice, and the second run has to come
   * back exactly `back` ticks earlier. Ten of them because the first `beat` is
   * at world tick 75 and every opening this wave has is behind that — a step
   * back into the opening is refused rather than clamped (`until.ts`), and a
   * test that tripped that refusal would be testing the refusal.
   */
  it(
    "photographs the tick before or after an event, not the one it fired on",
    async () => {
      const until = { event: "beat", cap: 3000 } as const;
      const on = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 0, until },
        join(scratchOut, "on"),
        browser,
      );
      const before = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 0, until: { ...until, back: 10 } },
        join(scratchOut, "before"),
        browser,
      );
      expect(before.atTick[0]).toBe((on.atTick[0] as number) - 10);
      expect(await Bun.file(before.paths[0] as string).exists()).toBe(true);
      // And `--until-on`, its mirror, stepped on in the same drive.
      const spec = { wave: 0, ticks: 0, until: { ...until, on: 10 } };
      const after = await captureFrames(baseUrl, spec, join(scratchOut, "after"), browser);
      expect(after.atTick[0]).toBe((on.atTick[0] as number) + 10);
    },
    STARVED_MS,
  );

  /**
   * The rings, and the reason they were in every picture this tool ever took.
   *
   * Crossing the ready gate throws two of them over the top two thirds of the
   * field, on the **frame** clock. The capture steps the simulation and paints
   * once per photograph, so it handed the animation a sixtieth of a second per
   * picture and never got past it. `clearOpening` paints them out now, and the
   * page is the only thing that can say whether it worked.
   */
  it(
    "leaves the field with nothing arriving over it",
    async () => {
      const page = await browser.newPage();
      try {
        await page.goto(`${baseUrl}?play=1`, { waitUntil: "load" });
        await page.waitForFunction(() => Boolean(window.neonSpore));
        await page.evaluate(() => window.neonSpore?.jumpToWave(0));

        const asks = await page.evaluate(() => typeof window.neonSpore?.launching);
        expect(asks, "the handle no longer reports the arrival").toBe("function");

        await clearOpening(page);
        const launching = () => page.evaluate(() => window.neonSpore?.launching?.() ?? null);
        expect(await launching(), "the field is still behind two rings").toBe(false);

        // And ticks are the wrong clock, which is why `clearOpening`'s own loop
        // never cleared them: ten more seconds of simulation move nothing that
        // is painted.
        await page.evaluate(() => window.neonSpore?.advance(600));
        expect(await launching()).toBe(false);
      } finally {
        await page.context().close();
      }
    },
    STARVED_MS,
  );

  /**
   * `--hand`: the ring under this phone's own thumb, which no command can put
   * on the screen because it is the input layer's (`hand.ts`). Two captures of
   * the same tick on the same seat, one with the mouse down on the cannon's
   * grab circle and one without, and the whole frame differs — the difference
   * is the ring, and the press went through the game's own listeners to draw
   * it. A build whose handle cannot say where the circle is refuses by name.
   */
  it(
    "puts this phone's thumb on the cannon, and the frame shows it",
    async () => {
      const bare = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60, seat: "p1" },
        join(scratchOut, "no-hand"),
        browser,
      );
      const held = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60, seat: "p1", hand: { on: "cannon" } },
        join(scratchOut, "hand"),
        browser,
      );
      expect(held.atTick).toEqual(bare.atTick);
      expect(held.whole[0]).not.toEqual(bare.whole[0]);
    },
    STARVED_MS,
  );

  it(
    "refuses a guide the wave has not got, rather than photographing the field",
    async () => {
      // ALTERNATING teaches nothing new, so it carries no guide: its
      // introduction passes straight onto the field and there is no second
      // screen to stand on.
      await expect(
        captureFrames(
          baseUrl,
          { wave: 3, ticks: 6, opening: "guide" },
          join(scratchOut, "none"),
          browser,
        ),
      ).rejects.toThrow("carries no guide");
    },
    STARVED_MS,
  );

  /**
   * **And it asks the preview for everything and nobody else for anything.**
   *
   * Since the sign-in landed, the built game's first load reached
   * `fonts.googleapis.com` for the menu's face and `accounts.google.com` and
   * `www.google.com` for Firebase Auth — 37 refused connections in one run of
   * this file behind the egress proxy a cloud session runs under. None of it
   * failed a case; what it cost was the file's own clock, and a picture whose
   * fetches depend on a network is a picture `run.ts`'s `identical:` guard
   * cannot honestly say *nothing changed* about.
   *
   * `offline.ts` refuses every host but the preview's at the browser and keeps
   * what asked, so this is the list rather than a count: a failure here names
   * the URL and therefore the line that has to change.
   */
  it(
    "asks the preview for everything and no third party for anything",
    async () => {
      const { offOrigin } = await captureFrames(
        baseUrl,
        { wave: 0, ticks: 60 },
        join(scratchOut, "offline"),
        browser,
      );
      expect(offOrigin).toEqual([]);
    },
    STARVED_MS,
  );
});
