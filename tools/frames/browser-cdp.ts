import { type ChildProcess, spawn } from "node:child_process";

import { type Browser, chromium } from "playwright-core";

/**
 * THE SECOND WAY IN, for a machine where `chromium.launch()` cannot open one.
 *
 * Playwright talks to the browser it launches over `--remote-debugging-pipe`,
 * which is fixed inside `playwright-core` and is not an `args` a caller can
 * turn off. In the cloud sandbox that pipe is where the launch dies: Chrome
 * exits with `SIGTRAP` the instant it is opened, silently, and every tool that
 * takes a picture — `frames`, `shot`, `png`, `raster`, `icons` — fails with
 * *Target page, context or browser has been closed*, which names nothing that
 * is actually wrong. The same Chrome, the same flags, started by hand with
 * `--remote-debugging-port` instead, answers CDP perfectly well.
 *
 * The same session found a second cause with the same cure: a profile path a
 * few characters too long for `AF_UNIX`'s 108-byte `sun_path`, which is
 * reachable from any worktree whose directory name is long enough. Retrying
 * over a port sidesteps both without either being settled first, which is why
 * this is a fallback rather than a replacement — where the ordinary launch
 * works it is still what runs, and this file is never reached.
 *
 * The port is asked for as `0` and read back off the line Chrome prints, so
 * two of these side by side cannot collide on a number somebody chose.
 */

/** A browser opened this way, and the one call that puts it away again.
 * `close()` on its own only disconnects: the process is ours to end. */
export interface OverCdp {
  browser: Browser;
  stop: () => Promise<void>;
}

/** Chrome prints this once it is listening, on stderr, and nowhere else. */
const LISTENING = /ws:\/\/\S+/;

/** Long enough for a cold start on a loaded machine; short enough that a
 * browser which will never answer is not the whole of a turn. */
const READY_MS = 30_000;

export async function launchOverCdp(chrome: string, profile: string): Promise<OverCdp> {
  const child = spawn(
    chrome,
    [
      "--headless",
      // Already passed by the ordinary launch, and for the same reason: the
      // sandbox runs Chrome as root, where it refuses its own sandbox.
      "--no-sandbox",
      "--disable-gpu",
      `--user-data-dir=${profile}`,
      "--remote-debugging-port=0",
      "about:blank",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  const endpoint = await listeningAt(child).catch(async (error: Error) => {
    await end(child);
    throw error;
  });
  const browser = await chromium.connectOverCDP(endpoint).catch(async (error: Error) => {
    await end(child);
    throw new Error(error.message.split("\n")[0] ?? "connectOverCDP failed");
  });
  return {
    browser,
    stop: async () => {
      await browser.close().catch(() => {});
      await end(child);
    },
  };
}

/**
 * The websocket Chrome says it is listening on.
 *
 * Read off stderr rather than out of the profile's `DevToolsActivePort` file:
 * the file is written at the same moment, and a process that dies before
 * either exists is then two waits to notice instead of one. Whatever the
 * process said before it died is the error, because Chrome's own reason —
 * a bad flag, a profile it cannot lock — is on that stream and nowhere else.
 */
function listeningAt(child: ChildProcess): Promise<string> {
  return new Promise((resolve, reject) => {
    let said = "";
    const timer = setTimeout(() => {
      reject(new Error(`no debugging port after ${READY_MS / 1000}s: ${tail(said)}`));
    }, READY_MS);
    const done = (fn: () => void): void => {
      clearTimeout(timer);
      fn();
    };
    child.stderr?.on("data", (chunk: Buffer) => {
      said += chunk.toString();
      const found = LISTENING.exec(said);
      if (found) done(() => resolve(found[0]));
    });
    child.on("error", (error: Error) => done(() => reject(error)));
    child.on("exit", (code) => {
      done(() => reject(new Error(`chrome exited with ${code}: ${tail(said)}`)));
    });
  });
}

/** The last thing the browser said, on one line, for an error message. */
function tail(said: string): string {
  const lines = said.trim().split("\n");
  return lines.at(-1)?.trim() || "it said nothing";
}

/** Ends the process and waits for it, so the profile is free for its removal. */
function end(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();
  return new Promise((resolve) => {
    child.once("exit", () => resolve());
    child.once("error", () => resolve());
    child.kill();
  });
}
