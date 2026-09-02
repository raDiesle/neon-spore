import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { captureFrames, type FrameSpec } from "./capture.js";

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

/** The checkout this tool is running out of — where a scratch worktree is
 * cut from, and where `docs/frames/` lives. */
export const root = Bun.fileURLToPath(new URL("../../", import.meta.url));

export async function git(args: string[], cwd = root): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, code, err] = await Promise.all([
    new Response(proc.stdout).text(),
    proc.exited,
    new Response(proc.stderr).text(),
  ]);
  if (code !== 0) throw new Error(`git ${args.join(" ")} failed: ${err.trim() || out.trim()}`);
  return out.trim();
}

export async function run(cmd: string[], cwd: string): Promise<void> {
  const proc = Bun.spawn(cmd, { cwd, stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`${cmd.join(" ")} exited ${code} in ${cwd}`);
}

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
    },
  };
}

/** One tree, built and served, screenshotted, torn down. */
export async function captureAt(
  rev: string,
  spec: FrameSpec,
  outPrefix: string,
): Promise<string[]> {
  const scratch = await mkdtemp(join(tmpdir(), "neon-spore-frames-"));
  await rm(scratch, { recursive: true, force: true }); // `worktree add` wants the path free
  await git(["worktree", "add", "--detach", scratch, rev]);
  try {
    await run(["bun", "install"], scratch);
    const preview = await startPreview(scratch);
    try {
      return (await captureFrames(preview.url, spec, outPrefix)).paths;
    } finally {
      await preview.stop();
    }
  } finally {
    await git(["worktree", "remove", "--force", scratch]).catch(() => {});
    await rm(scratch, { recursive: true, force: true }).catch(() => {});
  }
}
