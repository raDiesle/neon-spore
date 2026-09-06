import { mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { type Browser, chromium } from "playwright-core";
import { REMOVE_ATTEMPTS, readdirSafe, removeUntilGone, retryOpts } from "../retry.js";
import { PROFILE_PREFIX, staleProfiles, tmpRoot } from "../tmp-litter.js";
import { findChrome } from "./chrome.js";
import { root } from "./exec.js";

/**
 * THE ONE PLACE A BROWSER IS OPENED, and the one place it is shut.
 *
 * Nine tools used to call `chromium.launch()` themselves, and every one of them
 * had the same two faults.
 *
 * **Its profile went somewhere nothing here could find.** A launch with no
 * `userDataDir` makes a throwaway one under the *system* temp directory and
 * removes it on `browser.close()`, so an ordinary run is tidy and a run that is
 * killed or times out never reaches its `finally`. That debris lands outside the
 * repository, where `git status` is clean and no sweep looks — 46 of them, 508
 * MB, one with a headless Chrome still attached to it (`tools/tmp-litter.ts`).
 * Here the profile lands under `.claude/tmp`, beside the spent delegate specs
 * `tools/land/specs.ts` already clears, and both sweeps reach it.
 *
 * **Its teardown returned before it had let go.** Two `bun run perf` sweeps one
 * after another in the same shell: the second died four waves in with
 * `waitForTimeout: Target page, context or browser has been closed`, and so did
 * the third. `sleep 25` between them fixed it, which is the shape of the answer
 * — `browser.close()` resolves while Chrome is still unwinding its profile, so
 * the next launch came up against the last one. `closeBrowser` below waits for
 * the profile to actually be gone, which is a wait on the thing itself rather
 * than on a guessed number of seconds.
 */

/** Where this run's profile goes: `.claude/tmp`, which the repository owns. */
function profileRoot(): string {
  return tmpRoot(root);
}

/**
 * Playwright refuses `--user-data-dir` in `args` and tells the caller to use
 * `launchPersistentContext`, which returns a `BrowserContext` and would change
 * what all nine callers hold. It reads `os.tmpdir()` *at launch* to place the
 * profile, though, and `os.tmpdir()` reads the environment every time — so the
 * directory is chosen by pointing the whole temp root at one this tool made,
 * for the length of one launch.
 *
 * Serialised, because the environment is process-wide and the placement happens
 * across an `await`. Two concurrent launches would otherwise land in each
 * other's directory and one of them would have its profile swept out from under
 * it by the other's close. Contention is nil in practice — every one of these
 * tools opens a browser once — and the lock costs nothing when it is.
 */
let launching: Promise<unknown> = Promise.resolve();

const TMP_VARS = ["TMPDIR", "TMP", "TEMP"] as const;

async function underTmp<T>(dir: string, use: () => Promise<T>): Promise<T> {
  const mine = launching.then(async () => {
    const saved = TMP_VARS.map((name) => [name, process.env[name]] as const);
    for (const name of TMP_VARS) process.env[name] = dir;
    try {
      return await use();
    } finally {
      for (const [name, value] of saved) {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      }
    }
  });
  // The chain must not break on a failed launch, or every later one deadlocks.
  launching = mine.catch(() => {});
  return mine;
}

/** The profile directory a browser was launched with, so its close can remove it. */
const profiles = new WeakMap<Browser, string>();

/**
 * A headless Chrome whose litter this repository can find afterwards.
 *
 * A launch that fails says so in one line naming the reason. It used to fail a
 * hundred lines later inside a page helper — `clearOpening` reporting that the
 * target had been closed, which is true and says nothing about a browser that
 * never opened — and a session then spent a turn establishing that the crash
 * was not about the code under test.
 */
export async function launchBrowser(): Promise<Browser> {
  await sweepProfiles();
  const dir = await profileDir();
  try {
    const browser = await underTmp(dir, () =>
      chromium.launch({ executablePath: findChrome(), headless: true }),
    );
    profiles.set(browser, dir);
    return browser;
  } catch (error) {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
    throw new Error(`could not open a browser: ${(error as Error).message.split("\n")[0]}`);
  }
}

async function profileDir(): Promise<string> {
  const at = profileRoot();
  await mkdir(at, { recursive: true });
  return mkdtemp(join(at, PROFILE_PREFIX));
}

/**
 * Shut a browser and wait until its profile is off disk.
 *
 * The wait is the point: `close()` resolves while Chrome is still letting go of
 * the directory, and on Windows a removal in that window fails on a handle that
 * is about to be released anyway. `removeUntilGone` retries it rather than
 * sleeping past it, so the next launch starts when the last one has finished
 * rather than when a guessed number of seconds is up.
 *
 * Nothing here throws. A tool that produced its pictures or its numbers has done
 * what it was asked, and a directory that will not go is worth a line on stderr
 * — the next launch sweeps it by age.
 */
export async function closeBrowser(browser: Browser): Promise<void> {
  await browser.close().catch(() => {});
  const dir = profiles.get(browser);
  if (dir === undefined) return;
  profiles.delete(browser);
  const failed = await removeUntilGone(
    dir,
    () => rm(dir, { recursive: true, force: true }),
    retryOpts(REMOVE_ATTEMPTS),
  );
  if (failed !== undefined) {
    console.error(`could not remove ${dir}: ${failed} — the next launch will sweep it`);
  }
}

/**
 * The profiles older runs left behind, removed best-effort.
 *
 * Called before making one rather than only after using one, because the
 * leavings that matter are exactly the ones whose run never reached its own
 * cleanup. Returns how many went, for the tests.
 */
export async function sweepProfiles(now = Date.now()): Promise<number> {
  const at = profileRoot();
  const entries: { name: string; mtimeMs: number }[] = [];
  for (const name of await readdirSafe(at)) {
    if (!name.startsWith(PROFILE_PREFIX)) continue;
    const info = await stat(join(at, name)).catch(() => null);
    if (info?.isDirectory()) entries.push({ name, mtimeMs: info.mtimeMs });
  }

  let swept = 0;
  for (const name of staleProfiles(entries, now)) {
    const failed = await removeUntilGone(
      join(at, name),
      () => rm(join(at, name), { recursive: true, force: true }),
      retryOpts(1),
    );
    if (failed === undefined) swept++;
  }
  return swept;
}
