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

  const url = await previewUrlFrom(proc.stdout, proc.stderr);

  return {
    url,
    stop: async () => {
      await stopServerBehind(url);
      proc.kill();
      await proc.exited;
      await waitUntilQuiet(url);
    },
  };
}

/**
 * The server itself, killed by the pid it reports at `/__preview`.
 *
 * `proc` is `bun run … preview:once`, and the server is its grandchild: the
 * kill above takes the runner and leaves `bun preview.ts` standing, holding
 * the stdout pipe this process gave the runner. A pipe still open is a handle
 * Bun's event loop waits on, so `room-shot` printed its last line and then
 * sat — for as long as the orphan took to notice it was idle, ten minutes by
 * `preview.ts`'s own rule — and on 15 September 2026 four runs were each
 * killed by hand. Asking the server for its pid is the one thing every
 * preview answers (`preview.ts` puts it in the marker); one that has already
 * gone answers nothing, and that is fine.
 */
async function stopServerBehind(url: string): Promise<void> {
  try {
    const marker = (await fetch(`${url}/__preview`, { signal: AbortSignal.timeout(500) }).then(
      (r) => r.json(),
    )) as { pid?: number };
    if (marker.pid && marker.pid !== process.pid) process.kill(marker.pid);
  } catch {
    // Not answering, or already gone: nothing to kill.
  }
}

/** How long the server is given to print its port before this stops waiting
 * for it: a build of `apps/game` and the serve behind it, on a busy machine. */
const PORT_MS = 30_000;
/** How many of stderr's last lines an early exit carries in its message. */
const TAIL_LINES = 12;

/**
 * The server's URL off its stdout, or the reason it never printed one.
 *
 * Its own function, and given the two streams rather than the process, so
 * `serve.test.ts` can feed it a stdout made from a string: what it is
 * guarding is a sentence, and the sentence was wrong for a day. A worktree
 * without its `bun install` fails in `apps/game`'s build with a line naming
 * the package it cannot resolve, and that line was on a stderr nobody read —
 * the session saw *exited before printing its port* and had to run
 * `preview:once` by hand to find out why. So an early close reads stderr and
 * puts its last lines after the sentence.
 */
export async function previewUrlFrom(
  stdout: ReadableStream<Uint8Array>,
  stderr: ReadableStream<Uint8Array>,
  patienceMs = PORT_MS,
): Promise<string> {
  const reader = stdout.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  const deadline = Date.now() + patienceMs;
  try {
    while (true) {
      // The deadline is raced against the read, not checked between reads: a
      // build that prints nothing at all would otherwise hold `read()` open
      // for as long as it liked, and the thirty seconds meant nothing.
      const { value, done } = await within(reader.read(), deadline, "never printed its port");
      if (done) {
        const said = (await new Response(stderr).text()).trim();
        const tail = said.split("\n").slice(-TAIL_LINES).join("\n");
        throw new Error(`preview:once exited before printing its port${tail ? `:\n${tail}` : ""}`);
      }
      buffered += decoder.decode(value, { stream: true });
      // The URL has to be followed by something — the ` — pid` the server
      // prints after it, or the line's end. A pipe hands over what it has, and
      // a chunk ending at `:4` of `:41733` matched the old pattern whole; every
      // fetch after that went to a port nobody was on.
      const found = buffered.match(/preview \(built\) on (http:\/\/\S+)\s/);
      if (found?.[1]) return found[1];
    }
  } finally {
    reader.releaseLock();
  }
}

/** `p`, or a throw saying `preview:once <what>` once the clock passes `deadline`. */
async function within<T>(p: Promise<T>, deadline: number, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`preview:once ${what}`)),
      Math.max(0, deadline - Date.now()),
    );
  });
  try {
    return await Promise.race([p, late]);
  } finally {
    clearTimeout(timer);
  }
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
