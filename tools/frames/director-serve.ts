import { root } from "./exec.js";

/**
 * GETTING A DIRECTOR RUNNING SO A PICTURE CAN BE TAKEN OFF IT — the other half
 * of what `serve.ts` does for the game's built preview, and its neighbour for
 * that reason.
 *
 * `bun run shot` photographs an element of the running director and takes a
 * `--port`, which means somebody has to be serving on one. Nobody in a cloud
 * session can be: CLAUDE.md forbids starting a server with a backgrounded
 * shell command, and `.claude/launch.json` is a person at a desk pressing a
 * button. So every lane that changed the director — which is where every look
 * is decided — wrote the same throwaway to get one picture, and this was
 * private to `versus-shot.ts` while they did.
 *
 * Every line of it is a thing that went wrong once:
 *
 * **`dev:once` rather than `dev`**, for the reason CLAUDE.md gives about every
 * server here: this must not retire a director somebody is looking at, and it
 * must not answer from one either.
 *
 * **The port is read rather than derived** — `--pin` settles it and prints it,
 * and it is also written down for `bun run port` while this runs
 * (`tools/running.ts`).
 *
 * **`Bun.spawn`, not `node:child_process` through a shell.** On Windows the
 * shell was the only thing `kill()` reached: the director it had started lived
 * on, holding the caller's stdout pipe, until its own idle exit a hundred and
 * fifty seconds later (`tools/director/server.ts`) — so every shot took two and
 * a half minutes after its picture was written, and the lane that filed the
 * scale hang had read that wait as part of the hang.
 *
 * **`stop()` reaches one process, and the rest is other people keeping their
 * word.** This line used to read *`Bun.spawn`'s kill takes the tree*, which is
 * not a thing a kill does: it signals `bun run dev:once`, which passes it to
 * the supervisor, which takes the server down and only then leaves. Two of
 * those three links were broken on 14 September 2026 and the same director was
 * still answering after every `--serve` shot and every `versus:shot` — on the
 * port this had just reported free, until its own idle exit. Nothing said so,
 * which is what a sentence like the old one costs. `tools/running.ts` and
 * `tools/dev/supervise.ts` carry the two halves and a test each.
 *
 * **`DIRECTOR_HOST=127.0.0.1`**, which is what a sandbox needs to bind at all
 * (`docs/cloud-session.md`).
 */

/** How long the director is given to print the line with its port in it. */
const START_MS = 60_000;

export interface RunningDirector {
  /** The port it actually bound, off its own startup line. */
  port: string;
  /** Kills the process tree and waits for it to be gone. */
  stop: () => Promise<void>;
}

export async function startDirector(): Promise<RunningDirector> {
  const proc = Bun.spawn(["bun", "run", "dev:once"], {
    cwd: root,
    env: { ...process.env, DIRECTOR_HOST: "127.0.0.1" },
    stdout: "pipe",
    stderr: "pipe",
  });
  const reader = proc.stdout.getReader();
  const decoder = new TextDecoder();
  const deadline = Date.now() + START_MS;
  let buffered = "";
  let port: string | null = null;
  while (!port) {
    if (Date.now() > deadline) throw new Error("the director never printed its port");
    const { value, done } = await reader.read();
    if (done) throw new Error(`the director exited:\n${buffered.trim()}`);
    buffered += decoder.decode(value, { stream: true });
    port = portIn(buffered);
  }
  reader.releaseLock();
  return {
    port,
    stop: async () => {
      proc.kill();
      await proc.exited;
    },
  };
}

/**
 * The port out of whatever the director has printed so far, or null while it
 * has not printed one yet.
 *
 * Its own exported function because it is the whole of what can go wrong here
 * without a browser: the supervisor's line is the only contract between this
 * file and `tools/dev/supervise.ts`, and a line that stops matching would hang
 * for a minute and then say the director never started — which is true and
 * useless. `test/director-serve.test.ts` holds the shapes it has to read.
 */
export function portIn(output: string): string | null {
  return output.match(/http:\/\/localhost:(\d+)/)?.[1] ?? null;
}
