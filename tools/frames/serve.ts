import { type CaptureResult, captureFrames, type FrameSpec } from "./capture.js";
import { root, run } from "./exec.js";
import { sweepScratch, withScratchTree } from "./scratch.js";

/**
 * Getting one *revision* of this game running, so a frame can be taken off it:
 * a scratch worktree, an install, a built preview on a port nobody else holds,
 * and all three swept up afterwards whatever happened.
 *
 * Its own file beside `run.ts` because it is the half that knows about git and
 * ports and processes, and `run.ts` is the half that knows what a picture is
 * for. `waveNamesAt` next door needs the same checkout and the same `git`, so
 * both are exported rather than hidden.
 */

// Where the checkout is and how to run something in it. They live in
// `exec.ts` so `scratch.ts` can call git without importing the capture it is a
// part of, and are re-exported here because everything that needs them already
// asks this file.
export { git, root, run } from "./exec.js";

/** Reads `preview (built) on http://localhost:PORT` off the server's own stdout, rather
 * than guessing a port — the same rule `CLAUDE.md`'s verification section gives a human. */
export async function startPreview(
  cwd: string,
): Promise<{ url: string; stop: () => Promise<void> }> {
  const proc = Bun.spawn(["bun", "run", "--cwd", "apps/game", "preview:once"], {
    cwd,
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

  return {
    url,
    stop: async () => {
      proc.kill();
      await proc.exited;
      await waitUntilQuiet(url);
    },
  };
}

/** How long a stopped preview is given to stop answering before this gives up
 * on waiting for it and lets the caller carry on regardless. */
const QUIET_MS = 5_000;

/**
 * Wait until the port really is nobody's.
 *
 * `proc` is the outer `bun run --cwd apps/game preview:once`, and the server is
 * its *child*: killing the parent and awaiting its exit says nothing about
 * whether the socket has been released. Two `bun run perf` sweeps one after
 * another in the same shell hit this — the second died four waves in — and a
 * `sleep 25` between them was what made it stop, which is the shape of a
 * teardown that returns before it has let go rather than of a measurement
 * problem.
 *
 * The wait is on the thing itself: the port has stopped answering, or five
 * seconds have passed and it is worth carrying on rather than hanging. Nothing
 * throws — a preview that will not die is the next launch's problem to report,
 * and it now has a line for it (`browser.ts`).
 */
async function waitUntilQuiet(url: string): Promise<void> {
  const deadline = Date.now() + QUIET_MS;
  while (Date.now() < deadline) {
    try {
      await fetch(`${url}/__preview`, { signal: AbortSignal.timeout(500) });
    } catch {
      return; // Refused, reset or timed out: nobody is listening any more.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/** One tree, built and served, screenshotted, torn down. */
export async function captureAt(
  rev: string,
  spec: FrameSpec,
  outPrefix: string,
): Promise<CaptureResult> {
  // Before making one more of them: whatever earlier runs left behind, from a
  // process killed between the capture and its own cleanup. `scratch.ts` has
  // the age that keeps this off a checkout somebody is building in.
  await sweepScratch();

  return withScratchTree(rev, async (scratch) => {
    await run(["bun", "install"], scratch);
    const preview = await startPreview(scratch);
    try {
      return await captureFrames(preview.url, spec, outPrefix);
    } finally {
      await preview.stop();
    }
  });
}

/**
 * **This tree, built and served, screenshotted once.** No worktree, no parent,
 * nothing to compare it to.
 *
 * `captureAt` above is the pair: a commit and its parent, each in a scratch
 * checkout, refused if the two frames match. That is right for a change to a
 * look and it is the wrong shape for every change whose parent *cannot*
 * produce the picture — `--boss-round` calls a handle the parent has not got,
 * so the "before" side throws by design, and the only way to see THE MAZE's
 * fourth sheet was a throwaway script that did exactly what is written here.
 * That is the friction `shot.ts` exists to stop being paid again.
 */
export async function captureHere(spec: FrameSpec, outPrefix: string): Promise<CaptureResult> {
  const preview = await startPreview(root);
  try {
    return await captureFrames(preview.url, spec, outPrefix);
  } finally {
    await preview.stop();
  }
}
