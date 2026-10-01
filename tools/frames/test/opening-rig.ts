import { afterAll, beforeAll } from "bun:test";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import type { Browser } from "playwright-core";
import { closeBrowser, launchBrowser } from "../capture.js";
import { within } from "../deadline.js";
import { scratchDir, sweepScratch } from "../scratch.js";
import { root, startPreview } from "../serve.js";

/**
 * **The built game, served, and one browser to drive it**: what
 * `opening.test.ts` and `capture-shots.test.ts` both stand on. They were one
 * file of 552 lines until 1 October 2026, and each half raises its own rig, so
 * the two land in different shards and run side by side.
 *
 * ## One browser, and a budget that says why
 *
 * These are the only tests in the repository that start a real server and
 * drive a real browser, and `bun test` runs 280-odd files at once. Under that
 * they used to launch **a headless Chrome each** — six of them by the time
 * `--settle` landed — and twice in five full runs one lost the race: a case
 * took longer than bun's default, bun killed the file's subprocesses along
 * with it, and every test after it failed against a dead preview with
 * `ERR_CONNECTION_REFUSED`. So there is one browser a file, lent to
 * `captureFrames`, and every case carries `STARVED_MS`.
 *
 * ## Every step of the rig has a clock, and the hook's is their sum
 *
 * At a load average of about 31, `bun run land` went red on this file's hook
 * alone: a `beforeAll`/`afterAll` ran out a 120 s budget shared by four
 * pieces of setup and four of teardown, and bun reported it as an unnamed
 * case. Playwright gives a launch three minutes and a close none, so either
 * could eat the hook's whole budget without saying it was the one. Measured
 * on 1 October 2026 on an idle fourteen-core machine: the preview up in 0.3 to
 * 1.8 s, the browser in 0.2 to 0.5 s, and closing both in under 0.4 s. Each
 * step below is given twenty times its worst and more, and the hook its
 * steps' sum and a margin, so the step that stalls is the one that throws, by
 * name, well inside the hook.
 *
 * Teardown that stalls says so and carries on: every case has already been
 * answered by then, and a slow close is the next launch's to sweep.
 */

/** What one case is allowed to take on a machine that is being fought over.
 * On an idle machine a capture costs about two seconds. */
export const STARVED_MS = 120_000;

/** The preview up: a build of `apps/game` and the serve behind it. */
const PREVIEW_MS = 45_000;
/** A headless Chrome up. */
const LAUNCH_MS = 45_000;
/** The browser closed and its profile removed. */
const CLOSE_MS = 30_000;
/** The preview stopped, and an earlier run's scratch swept. */
const STOP_MS = 15_000;
/** What the hooks are given beyond their steps: the scratch directory, the clock's own lateness. */
const MARGIN_MS = 15_000;

export interface OpeningRig {
  readonly url: string;
  readonly out: string;
  readonly browser: Browser;
}

/**
 * `p`, or a throw naming `what` once `ms` has passed. What `p` brings after
 * that is handed to `late`, so a preview or a browser that came up past its
 * clock is taken down rather than left running behind the failure.
 */
function step<T>(
  p: Promise<T>,
  ms: number,
  what: string,
  late: (t: T) => unknown = () => {},
): Promise<T> {
  return within(p, Date.now() + ms, `${what} took longer than ${ms / 1000} s`).catch((error) => {
    p.then(late, () => {});
    throw error;
  });
}

/** Teardown's `step`: a stall is said on stderr rather than thrown. */
async function settle(p: Promise<unknown>, ms: number, what: string): Promise<void> {
  await step(p, ms, what).catch((error: Error) => console.error(`opening rig: ${error.message}`));
}

/**
 * Raises the rig for the file that calls it, in `beforeAll`, and takes it
 * down in `afterAll`. Read its fields inside a case, never at the top of one's
 * file: they are filled in when the hook has run.
 */
export function openingRig(scratchPrefix: string): OpeningRig {
  const rig = {} as { url: string; out: string; browser: Browser };
  let stop: (() => Promise<void>) | undefined;

  beforeAll(
    async () => {
      // `startPreview` reads the port off the server's own stdout, and it is the
      // one reader (`serve.ts`). The build goes into this rig's own scratch,
      // never `dist/`: the two halves raise theirs at once, and on 1 October
      // 2026 one served a bundle the other was still writing, and a page
      // never came up.
      rig.out = await scratchDir(scratchPrefix);
      const dist = join(rig.out, "dist");
      const preview = await step(startPreview(root, dist), PREVIEW_MS, "the preview", (p) =>
        p.stop(),
      );
      rig.url = preview.url;
      stop = preview.stop;
      rig.browser = await step(launchBrowser(), LAUNCH_MS, "the browser's launch", closeBrowser);
    },
    PREVIEW_MS + LAUNCH_MS + MARGIN_MS,
  );

  afterAll(
    async () => {
      if (rig.browser) await settle(closeBrowser(rig.browser), CLOSE_MS, "closing the browser");
      if (stop) await settle(stop(), STOP_MS, "stopping the preview");
      if (rig.out) await rm(rig.out, { recursive: true, force: true }).catch(() => {});
      // And whatever an earlier run left when it was killed before reaching
      // here — the pictures are throwaway, but the directories are not throwing
      // themselves away.
      await settle(sweepScratch(), STOP_MS, "sweeping the scratch");
    },
    CLOSE_MS + 2 * STOP_MS + MARGIN_MS,
  );

  return rig;
}
