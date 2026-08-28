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
 * A sha alone is enough. `docs/checks/<sha>.md` carries a `where` field
 * naming the place a person should stand for that check, and most of them
 * name a wave — by number, by name, or "any wave". This reads that field and
 * opens the wave it names, the same one a human would walk to. `where` naming
 * a director page instead of the game (SHAPES, VERSUS, the wave list, NOT
 * BUILT YET) has no frame here — the tool says so and refuses rather than
 * screenshotting the field. `--wave` overrides the derivation for the checks
 * `where` cannot express as one wave.
 *
 *   bun run frames <sha>                        the wave its own `where` names
 *   bun run frames <sha> --wave 21               wave 21, matching the HUD's W21
 *   bun run frames <sha> --wave "THE THIRD SHOT" a wave by name — what a person has in hand
 *   bun run frames <sha> --ticks 240             a different point in the wave
 *   bun run frames <sha> --frames 6 --stride 4   a short strip, for motion
 *   bun run frames <sha> --out docs/checks/frames/<sha>
 *   bun run frames --report                      how many restated checks a frame could answer
 *
 * `--wave` takes the number a person reads off the HUD (`W21` is `--wave 21`,
 * not `--wave 20`) or a wave's own name, case-insensitive. Both convert to
 * the 0-based index `jumpToWave` and `world.wave` actually use.
 */

import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { WAVES } from "@neon-spore/content";
import { findRestatedForCommit, parseRestated, type Restated } from "../checks/restated.js";
import { checksIn } from "../checks/trailers.js";
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

/**
 * One entry of `WAVES`, reduced to the two things a `where` field can name a
 * wave by. Kept narrow so `resolveWaveText` and its tests do not need the
 * whole `Wave` shape from `@neon-spore/content`.
 */
export interface WaveName {
  name: string;
}

/** Regex-escapes a wave name so `SHIELD, THEN CANNON` can be searched for
 * literally instead of as a character class. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type WaveResolution =
  | { kind: "hud"; hudNumber: number; reason: string }
  | { kind: "name"; name: string; index: number; reason: string }
  | { kind: "director"; reason: string }
  | { kind: "unknown"; reason: string };

/**
 * Phrases that name a director page rather than the running game — the
 * places `bun run frames` cannot stand in, because it only builds and serves
 * `apps/game`. Substring, case-insensitive: `DIRECTOR_HOST` matches on
 * `director` the same way a spelled-out "director" would.
 */
const DIRECTOR_MARKERS = [
  "director",
  "not built yet",
  "shapes",
  "versus",
  "parked",
  "backlog",
  "music tab",
  "to check",
  "control sets",
  "demos",
  "wave list",
  "checks sheet",
];

/**
 * What a `where` field's own text names, read the way a person reading it
 * would: a wave by the HUD's number (`wave 21` is `W21`, not `jumpToWave`'s
 * 0-based 21), a wave by its own name (`THE THIRD SHOT`), "any wave" (nothing
 * turns on which one), a director page with no single wave to stand at, or
 * nothing this can place at all.
 *
 * Order matters: a named or numbered wave wins even where a director marker
 * also appears (`docs/checks/18036b0.md`'s "`bun run dev` → THE THIRD SHOT
 * wave" names a real wave despite naming the wave editor to find it in), and
 * a `bun run frames <sha> --wave N` example embedded in a `where` field
 * (`docs/checks/943c4f4.md`, about the tool itself) is deliberately not read
 * as an instruction to this run — a check about `bun run frames` is not a
 * place to stand.
 */
export function resolveWaveText(text: string, waves: readonly WaveName[]): WaveResolution {
  if (/\bbun run frames\b/i.test(text)) {
    return {
      kind: "unknown",
      reason: "where describes running `bun run frames` itself, not a place to stand",
    };
  }

  const numbered = text.match(/\bwave\s*#?\s*(\d{1,3})\b/i);
  if (numbered) {
    const hudNumber = Number(numbered[1]);
    return { kind: "hud", hudNumber, reason: `"wave ${hudNumber}" in the where field` };
  }

  let earliest: { index: number; name: string; waveIndex: number } | null = null;
  waves.forEach((w, waveIndex) => {
    const m = text.match(new RegExp(`\\b${escapeRegExp(w.name)}\\b`));
    if (m && m.index !== undefined && (!earliest || m.index < earliest.index)) {
      earliest = { index: m.index, name: w.name, waveIndex };
    }
  });
  if (earliest) {
    const found = earliest as { index: number; name: string; waveIndex: number };
    return {
      kind: "name",
      name: found.name,
      index: found.waveIndex,
      reason: `"${found.name}" named in the where field`,
    };
  }

  if (/\bany wave\b/i.test(text)) {
    return { kind: "hud", hudNumber: 1, reason: '"any wave" said — using wave 1' };
  }

  const marker = DIRECTOR_MARKERS.find((m) => text.toLowerCase().includes(m));
  if (marker) {
    return { kind: "director", reason: `where names a director page ("${marker}"), not the game` };
  }

  return { kind: "unknown", reason: "no wave named in the where field" };
}

/**
 * Every restatement under `docs/checks/`, from every `.md` file there — one
 * `readdir` and one parse, shared by every call this run makes rather than
 * one per commit. `tools/checks/repo.ts`'s `readRestated` reads the same
 * directory for the same reason (a restatement can live in any file since
 * three lanes collided writing one shared document); this is deliberately
 * not imported from there, because `tools/checks` is owned by nobody in this
 * task and this file's brief is not to restructure it, only to stop guessing
 * a filename from a sha.
 */
async function readAllRestated(): Promise<Restated[]> {
  const dir = join(root, "docs/checks");
  const names = await readdirSafe(dir);
  const all: Restated[] = [];
  for (const name of names.filter((n) => n.endsWith(".md")).sort()) {
    all.push(...parseRestated(await Bun.file(join(dir, name)).text()));
  }
  return all;
}

async function readdirSafe(dir: string): Promise<string[]> {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

/**
 * Resolves a commit's own `Check:` trailers — read straight off the commit,
 * not guessed from a filename — to whichever restated entries quote them,
 * and picks the first `where` among those that names an actual wave.
 *
 * `docs/queue.md`, "THIRTY-ONE OF THIRTY-THREE CHECK FILES ARE NAMED AFTER A
 * COMMIT THAT NEVER LANDED": this used to open `docs/checks/<sha>.md`, which
 * only exists for the pre-rebase sha a lane committed under — `bun run land`
 * rebases, so the sha this function is actually called with (a commit on
 * `main`) is a different one, and the file is gone. The join that survives a
 * rebase is the one `bun run checks` already uses: the trailer's own text,
 * via `findRestatedForCommit`. A trailer with several `Check:` lines, or a
 * restatement naming only a director page, is skipped in favour of a later
 * one that does name a wave (`docs/checks/16efb33.md` carries two, and the
 * first already resolves); if none of them do, the first non-"unknown"
 * reason is reported so the refusal explains itself instead of just saying
 * "no wave".
 */
export async function deriveWaveFromChecks(sha: string): Promise<WaveResolution> {
  const full = await git(["rev-parse", sha]).catch(() => null);
  if (!full) return { kind: "unknown", reason: `no commit found for ${sha}` };
  const body = await git(["log", "-1", "--format=%B", full]);
  const checks = checksIn(body, sha);
  if (checks.length === 0) {
    return { kind: "unknown", reason: `${sha} carries no Check: trailer` };
  }
  const entries = await readAllRestated();
  const restated = findRestatedForCommit(
    entries,
    full,
    checks.map((c) => c.text),
  );
  if (restated.length === 0) {
    return {
      kind: "unknown",
      reason: `no restatement quotes any of ${sha}'s Check: trailer(s) word for word`,
    };
  }
  let fallback: WaveResolution | null = null;
  for (const r of restated) {
    if (!r.where) continue;
    const resolved = resolveWaveText(r.where, WAVES);
    if (resolved.kind === "hud" || resolved.kind === "name") return resolved;
    if (!fallback) fallback = resolved;
  }
  return fallback ?? { kind: "unknown", reason: `restatement(s) for ${sha} have no where field` };
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
  if (argv[0] === "--report" || argv.length === 0) {
    await report();
    return;
  }

  const sha = argv[0];
  if (!sha) {
    throw new Error('usage: bun run frames <sha> [--wave N|"NAME"] [--ticks N] [--out DIR]');
  }
  const flag = (name: string, fallback: number): number => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? fallback : Number(argv[i + 1]);
  };
  const outFlag = argv.indexOf("--out");
  const out = outFlag === -1 ? join(root, "docs/checks/frames", sha) : (argv[outFlag + 1] ?? "");
  if (!out) throw new Error("--out needs a directory");

  const waveFlagIndex = argv.indexOf("--wave");
  let waveIndex: number;
  if (waveFlagIndex !== -1) {
    const value = argv[waveFlagIndex + 1];
    if (!value) throw new Error("--wave needs a number or a wave name");
    waveIndex = resolveWaveFlag(value, WAVES);
    console.log(
      `wave: ${value} → index ${waveIndex} (${WAVES[waveIndex]?.name ?? "beyond the authored waves"})`,
    );
  } else {
    const resolution = await deriveWaveFromChecks(sha);
    if (resolution.kind === "director") {
      throw new Error(
        `${resolution.reason} — nothing to screenshot here. Pass --wave to point this at a wave instead.`,
      );
    }
    if (resolution.kind === "unknown") {
      throw new Error(`${resolution.reason} — pass --wave N or --wave "NAME" explicitly.`);
    }
    waveIndex = resolution.kind === "hud" ? resolution.hudNumber - 1 : resolution.index;
    const name = WAVES[waveIndex]?.name ?? "beyond the authored waves";
    console.log(`wave: ${resolution.reason} → index ${waveIndex} (${name})`);
  }

  const spec: FrameSpec = {
    wave: waveIndex,
    ticks: flag("ticks", 120),
    frames: flag("frames", 1),
    strideTicks: flag("stride", 4),
  };

  const parent = await git(["rev-parse", `${sha}^`]);
  const full = await git(["rev-parse", sha]);

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
