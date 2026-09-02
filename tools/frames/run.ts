#!/usr/bin/env bun

/**
 * `bun run frames <sha> --wave N` — a before-and-after picture for a landing.
 *
 * The owner wants a picture beside a change, not a sentence describing one, and
 * every commit already has a parent to compare against. This checks the parent
 * and the commit itself out into two scratch worktrees, builds each, serves it
 * with `bun run preview:once` and drives the real loop with `window.neonSpore`
 * the same way `CLAUDE.md`'s testing handle describes — `jumpToWave`,
 * `dismissBriefing`, `advance`, `paint` — then screenshots `#stage` at both. No
 * wall clock, no random number, and the same wave, tick count and viewport both
 * times: that is the whole of what makes the two pictures comparable at all.
 *
 * **`--wave` is required.** It used to be optional: a sha alone was enough,
 * because `docs/checks/<sha>.md` carried a `where` field naming the place a
 * person should stand and this derived the wave from it. Those restatements are
 * gone along with the `Check:` mechanic that produced them, and guessing a wave
 * from a commit message would be the same trap in a new place — a frame of the
 * wrong wave proves nothing, and proves it convincingly.
 *
 *   bun run frames <sha> --wave 21               wave 21, matching the HUD's W21
 *   bun run frames <sha> --wave "THE THIRD SHOT" a wave by name — what a person has in hand
 *   bun run frames <sha> --wave 21 --ticks 240   a different point in the wave
 *   bun run frames <sha> --wave 21 --frames 6 --stride 4   a short strip, for motion
 *   bun run frames <sha> --wave 21 --out docs/frames/<sha>
 *
 * `--wave` takes the number a person reads off the HUD (`W21` is `--wave 21`,
 * not `--wave 20`) or a wave's own name, case-insensitive. Both convert to the
 * 0-based index `jumpToWave` and `world.wave` actually use.
 */
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
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
 * One entry of `WAVES`, reduced to the two things a `where` field can name a
 * wave by. Kept narrow so `resolveWaveText` and its tests do not need the
 * whole `Wave` shape from `@neon-spore/content`.
 */
export interface WaveName {
  name: string;
}

/**
 * The wave list as it stood at `rev`, read out of *that* commit's own
 * `packages/content/src/waves.ts` — not the working tree's copy.
 *
 * The ask this answers — "FRAMES PUTS THE WRONG WAVE IN THE PICTURE, AND SAYS
 * THE RIGHT NAME WHILE IT DOES": a name only lived at the index it held in the
 * tree that named it. `captureAt` already makes a scratch worktree and runs
 * `bun install` in it to build the game at a historical commit; this makes
 * the same kind of checkout to answer the name → index question inside it,
 * so the answer and the build it feeds are never talking about two different
 * lists. `bun install` is needed because `waves.ts` reaches `@neon-spore/sim`
 * through `maze-rounds.ts`, and that import only resolves once the workspace
 * link exists in this checkout's own `node_modules`.
 */
export async function waveNamesAt(rev: string): Promise<WaveName[]> {
  const scratch = await mkdtemp(join(tmpdir(), "neon-spore-frames-waves-"));
  await rm(scratch, { recursive: true, force: true }); // `worktree add` wants the path free
  await git(["worktree", "add", "--detach", scratch, rev]);
  try {
    await run(["bun", "install"], scratch);
    const url = pathToFileURL(join(scratch, "packages/content/src/waves.ts")).href;
    const mod = (await import(url)) as { WAVES: readonly WaveName[] };
    return mod.WAVES.map((w) => ({ name: w.name }));
  } finally {
    await git(["worktree", "remove", "--force", scratch]).catch(() => {});
    await rm(scratch, { recursive: true, force: true }).catch(() => {});
  }
}

/** `--wave` on the command line: the HUD's own number (`21` is `W21`) or a
 * wave's own name, either converted to the 0-based index `jumpToWave` takes. */
export function resolveWaveFlag(value: string, waves: readonly WaveName[]): number {
  const asNumber = Number(value);
  if (Number.isInteger(asNumber)) {
    if (asNumber < 1) {
      throw new Error(`--wave ${value}: wave numbers start at 1, matching the HUD's W1`);
    }
    return asNumber - 1;
  }
  const index = waves.findIndex((w) => w.name.toLowerCase() === value.toLowerCase());
  if (index === -1) {
    throw new Error(
      `--wave "${value}": no wave with that name. Known names: ${waves.map((w) => w.name).join(", ")}`,
    );
  }
  return index;
}

/** Byte-identical, frame for frame, in order — the guard against writing an
 * honest, comparable, completely useless pair. */
export async function framesIdentical(before: string[], after: string[]): Promise<boolean> {
  if (before.length !== after.length) return false;
  for (let i = 0; i < before.length; i++) {
    const beforePath = before[i] as string;
    const afterPath = after[i] as string;
    const [a, b] = await Promise.all([
      Bun.file(beforePath).arrayBuffer(),
      Bun.file(afterPath).arrayBuffer(),
    ]);
    if (Buffer.compare(Buffer.from(a), Buffer.from(b)) !== 0) return false;
  }
  return true;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const sha = argv[0];
  if (!sha || sha.startsWith("--")) {
    throw new Error('usage: bun run frames <sha> --wave N|"NAME" [--ticks N] [--out DIR]');
  }
  const flag = (name: string, fallback: number): number => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? fallback : Number(argv[i + 1]);
  };
  const outFlag = argv.indexOf("--out");
  const out = outFlag === -1 ? join(root, "docs/frames", sha) : (argv[outFlag + 1] ?? "");
  if (!out) throw new Error("--out needs a directory");

  const parent = await git(["rev-parse", `${sha}^`]);
  const full = await git(["rev-parse", sha]);

  // The name → index answer belongs to `full`'s own tree, not the working
  // tree's — a wave inserted since `full` shifts everything after it.
  const historicalWaves = await waveNamesAt(full);

  const waveFlagIndex = argv.indexOf("--wave");
  const waveValue = waveFlagIndex === -1 ? "" : (argv[waveFlagIndex + 1] ?? "");
  if (!waveValue) {
    throw new Error(
      '--wave is required: --wave N (the number the HUD prints) or --wave "NAME". A frame of ' +
        "the wrong wave proves nothing, so this tool will not pick one for you.",
    );
  }
  const waveIndex = resolveWaveFlag(waveValue, historicalWaves);
  console.log(
    `wave: ${waveValue} → index ${waveIndex} (${historicalWaves[waveIndex]?.name ?? "beyond the authored waves"})`,
  );

  const spec: FrameSpec = {
    wave: waveIndex,
    ticks: flag("ticks", 120),
    frames: flag("frames", 1),
    strideTicks: flag("stride", 4),
  };

  const scratchOut = await mkdtemp(join(tmpdir(), "neon-spore-frames-out-"));
  const start = Date.now();
  try {
    console.log(`before: ${parent.slice(0, 7)}`);
    const before = await captureAt(parent, spec, join(scratchOut, "before"));
    console.log(`after: ${full.slice(0, 7)}`);
    const after = await captureAt(full, spec, join(scratchOut, "after"));
    const seconds = Math.round((Date.now() - start) / 1000);

    if (await framesIdentical(before, after)) {
      console.log(
        `identical: before and after look the same at this wave and tick (${seconds}s) — nothing written to ${out}. A picture of an unchanged field teaches nothing; try a different --wave or --ticks.`,
      );
      return;
    }

    await mkdir(out, { recursive: true });
    const written: string[] = [];
    for (const p of [...before, ...after]) {
      const rel = p.slice(scratchOut.length + 1);
      const dest = join(out, rel);
      await mkdir(dirname(dest), { recursive: true });
      await Bun.write(dest, Bun.file(p));
      written.push(dest);
    }

    console.log(`wrote ${written.length} frame(s) to ${out} in ${seconds}s`);
    for (const p of written) console.log(`  ${p}`);
  } finally {
    await rm(scratchOut, { recursive: true, force: true }).catch(() => {});
  }
}

if (import.meta.main)
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
