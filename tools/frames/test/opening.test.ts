import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type Browser, chromium } from "playwright-core";
import { captureFrames, findChrome } from "../capture.js";
import { clearOpening } from "../opening.js";

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
  let stop: () => void;
  let scratchOut: string;
  let browser: Browser;

  beforeAll(async () => {
    const proc = Bun.spawn(["bun", "run", "--cwd", "apps/game", "preview:once"], {
      cwd: join(import.meta.dir, "../../.."),
      env: { ...process.env, PREVIEW_HOST: "127.0.0.1" },
      stdout: "pipe",
      stderr: "pipe",
    });
    const reader = proc.stdout.getReader();
    const decoder = new TextDecoder();
    let buffered = "";
    const deadline = Date.now() + 30_000;
    let url: string | null = null;
    while (!url) {
      if (Date.now() > deadline) throw new Error("preview:once never printed its port");
      const { value, done } = await reader.read();
      if (done) throw new Error("preview:once exited before printing its port");
      buffered += decoder.decode(value, { stream: true });
      const found = buffered.match(/preview \(built\) on (http:\/\/[^\s]+)/);
      if (found?.[1]) url = found[1];
    }
    reader.releaseLock();
    baseUrl = url;
    stop = () => proc.kill();
    scratchOut = await mkdtemp(join(tmpdir(), "neon-spore-frames-opening-test-"));
    browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  }, STARVED_MS);

  afterAll(async () => {
    await browser?.close().catch(() => {});
    stop?.();
    if (scratchOut) await rm(scratchOut, { recursive: true, force: true }).catch(() => {});
  });

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

  it(
    "refuses a guide the wave has not got, rather than photographing the field",
    async () => {
      // ALTERNATING teaches nothing new, so it carries no guide: its
      // introduction passes straight onto the field and there is no second
      // screen to stand on.
      await expect(
        captureFrames(baseUrl, { wave: 3, ticks: 6, opening: "guide" }, join(scratchOut, "none")),
      ).rejects.toThrow("carries no guide");
    },
    STARVED_MS,
  );
});
