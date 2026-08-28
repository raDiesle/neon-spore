#!/usr/bin/env bun

/**
 * `bun run frames <sha>` — a before-and-after picture for a landed check.
 *
 * `docs/queue.md`, "A CHECK THAT LANDED YESTERDAY HAS NO BEFORE" — the owner
 * wants a picture beside a check, not a sentence describing one, and every
 * commit already has a parent to compare against. This checks the parent and
 * the commit itself out into two scratch worktrees, builds each, serves it
 * with `bun run preview:once` and drives the real loop with
 * `window.neonSpore` the same way `CLAUDE.md`'s testing handle describes —
 * `jumpToWave`, `dismissBriefing`, `advance`, `paint` — then screenshots
 * `#stage` at both. No wall clock, no random number, and the same wave, tick
 * count and viewport both times: that is the whole of what makes the two
 * pictures comparable at all.
 *
 * Not every check can be answered this way. One about a sound, about two
 * devices agreeing, or about the relay has no frame to take — `--report`
 * counts, over the restated checks under `docs/checks/`, how many even name a
 * place a picture could settle (`bun run preview`, a wave, a seat) against how
 * many name something a camera cannot reach.
 *
 *   bun run frames <sha>                       one still, wave 1, one second in
 *   bun run frames <sha> --wave 2 --ticks 240   a different wave, two seconds in
 *   bun run frames <sha> --frames 6 --stride 4  a short strip, for motion
 *   bun run frames <sha> --out docs/checks/frames/<sha>
 *   bun run frames --report                     how many restated checks a frame could answer
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { captureFrames, type FrameSpec } from "./capture.js";

const root = Bun.fileURLToPath(new URL("../../", import.meta.url));

async function git(args: string[], cwd = root): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [out, code, err] = await Promise.all([
    new Response(proc.stdout).text(),
    proc.exited,
    new Response(proc.stderr).text(),
  ]);
  if (code !== 0) throw new Error(`git ${args.join(" ")} failed: ${err.trim() || out.trim()}`);
  return out.trim();
}

async function run(cmd: string[], cwd: string): Promise<void> {
  const proc = Bun.spawn(cmd, { cwd, stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`${cmd.join(" ")} exited ${code} in ${cwd}`);
}

/** Reads `preview (built) on http://localhost:PORT` off the server's own stdout, rather
 * than guessing a port — the same rule `CLAUDE.md`'s verification section gives a human. */
async function startPreview(cwd: string): Promise<{ url: string; stop: () => Promise<void> }> {
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
async function captureAt(rev: string, spec: FrameSpec, outPrefix: string): Promise<string[]> {
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

/**
 * Over the restated checks already under `docs/checks/`, how many name a
 * place `bun run frames` could point a browser at, versus how many ask about
 * something no frame holds — a sound, two devices, the relay. Printed rather
 * than assumed, because the brief this tool answers asks for the number
 * before anything is captured in bulk.
 */

/** One restated `.md` file can carry more than one `- **badge**` entry
 * (see `docs/checks/16efb33.md`) — split on the marker rather than counting
 * files, so the number matches what a human counts scrolling the file. */
export function splitEntries(text: string): string[] {
  return text.split(/\n(?=- \*\*badge\*\*)/).filter((e) => e.includes("**badge**"));
}

const UNPHOTOGRAPHABLE = /\b(sound|audio|relay|desync|two devices|both devices|second phone)\b/i;

/** Whether a check's own `where` and `decide` fields name something a frame
 * could settle at all — a sound or a second device is not in any screenshot. */
export function isPhotographable(entry: string): boolean {
  const where = entry.match(/\*\*where\*\*\s*(.*)/)?.[1] ?? "";
  const decide = entry.match(/\*\*decide\*\*\s*(.*)/)?.[1] ?? "";
  return !UNPHOTOGRAPHABLE.test(`${where} ${decide}`);
}

async function report(): Promise<void> {
  const glob = new Bun.Glob("*.md");
  let total = 0;
  let photographable = 0;
  for await (const name of glob.scan(join(root, "docs/checks"))) {
    if (name === "restated.md") continue; // legacy, never written to
    const text = await Bun.file(join(root, "docs/checks", name)).text();
    for (const entry of splitEntries(text)) {
      total++;
      if (isPhotographable(entry)) photographable++;
    }
  }
  console.log(
    `${total} restated checks; ${photographable} name a place a frame could settle, ${total - photographable} do not (sound, a second device, the relay).`,
  );
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv[0] === "--report" || argv.length === 0) {
    await report();
    return;
  }

  const sha = argv[0];
  if (!sha) throw new Error("usage: bun run frames <sha> [--wave N] [--ticks N] [--out DIR]");
  const flag = (name: string, fallback: number): number => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? fallback : Number(argv[i + 1]);
  };
  const outFlag = argv.indexOf("--out");
  const out = outFlag === -1 ? join(root, "docs/checks/frames", sha) : (argv[outFlag + 1] ?? "");
  if (!out) throw new Error("--out needs a directory");

  const spec: FrameSpec = {
    wave: flag("wave", 1),
    ticks: flag("ticks", 120),
    frames: flag("frames", 1),
    strideTicks: flag("stride", 4),
  };

  const parent = await git(["rev-parse", `${sha}^`]);
  const full = await git(["rev-parse", sha]);

  const start = Date.now();
  console.log(`before: ${parent.slice(0, 7)}`);
  const before = await captureAt(parent, spec, join(out, "before"));
  console.log(`after: ${full.slice(0, 7)}`);
  const after = await captureAt(full, spec, join(out, "after"));
  const seconds = Math.round((Date.now() - start) / 1000);

  console.log(`wrote ${before.length + after.length} frame(s) to ${out} in ${seconds}s`);
  for (const p of [...before, ...after]) console.log(`  ${p}`);
}

if (import.meta.main)
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
