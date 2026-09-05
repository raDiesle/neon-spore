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
 *   bun run frames <sha> --wave 21 --seat p1    one player's screen, not the rig's
 *   bun run frames <sha> --wave 21 --hold lidString=800,id=3   a thumb on a cord
 *   bun run frames <sha> --wave 20 --hold wardenTether=0,y=7000  the rope pulled taut
 *   bun run frames <sha> --wave 21 --press 60:1:cannonCol=3,64:2:fire=red   a shot, or 90:1:salvo
 *   bun run frames <sha> --wave 21 --settle 8 --frames 6 --stride 0   a burst, as a strip
 *   bun run frames <sha> --wave 21 --at 120,400,150,150 --zoom 3   one body, close up
 *   bun run frames <sha> --wave 2 --opening guide|intro --frames 8 --stride 6   its opening
 *   bun run frames <sha> --wave 21 --out docs/frames/<sha>
 *
 * `--opening` stands in the wave's opening instead of running past it, which
 * every capture before it did unconditionally. A wave opens on its **guide**
 * and its introduction stands behind that, so `intro` on a guided wave crosses
 * the ready gate on the way (`opening.ts`). On `guide`, `--frames` and
 * `--stride` count **painted frames**: a rehearsal is drawn rather than
 * stepped, so a strip counted in ticks would be one picture over and over.
 *
 * `--settle N` paints N frames **without stepping the world**, before each
 * picture: the two clocks are separate, so anything living in painted seconds
 * had one frame per photograph however long a capture ran (`FrameSpec.settle`).
 *
 * `--at x,y,w,h` keeps a rectangle of the frame, in its own CSS pixels from the
 * top left of `#stage`, and `--zoom N` opens the page at N times the pixel
 * density. A body is forty pixels across on a phone, so a change to its shape
 * is a handful of them; together these are the same real frame at a size an
 * eye can judge. The `identical:` guard below reads the *whole* frame either
 * way, so a crop can neither hide the only difference nor invent one.
 *
 * `--wave` takes the number a person reads off the HUD (`W21` is `--wave 21`,
 * not `--wave 20`) or a wave's own name. Both convert to the 0-based index
 * `jumpToWave` and `world.wave` actually use.
 */
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { FrameSpec } from "./capture.js";
import { parseAt, sameFrames } from "./crop.js";
import { parseHold } from "./hold.js";
import { parseOpening } from "./opening.js";
import { parsePress } from "./press.js";
import { captureAt, git, root, run } from "./serve.js";

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

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const sha = argv[0];
  if (!sha || sha.startsWith("--")) {
    throw new Error(
      'usage: bun run frames <sha> --wave N|"NAME" [--ticks N] [--seat p1|p2|test] ' +
        "[--hold prime|mazeString=N|wardenTether=N[,y=N]|lidString=N,id=N] [--hold-ticks N] " +
        "[--settle N] [--at x,y,w,h] [--zoom N] " +
        "[--press TICK:SEAT:control=value,…] [--opening intro|guide] [--out DIR]",
    );
  }
  const flag = (name: string, fallback: number): number => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? fallback : Number(argv[i + 1]);
  };
  const seatFlag = argv.indexOf("--seat");
  const seat = seatFlag === -1 ? undefined : argv[seatFlag + 1];
  if (seat !== undefined && seat !== "p1" && seat !== "p2" && seat !== "test") {
    throw new Error(`--seat ${seat}: one of p1, p2 or test`);
  }
  const holdFlag = argv.indexOf("--hold");
  const hold = holdFlag === -1 ? undefined : parseHold(argv[holdFlag + 1] ?? "");
  const pressFlag = argv.indexOf("--press");
  const press = pressFlag === -1 ? undefined : parsePress(argv[pressFlag + 1] ?? "");
  const atFlag = argv.indexOf("--at");
  const at = atFlag === -1 ? undefined : parseAt(argv[atFlag + 1] ?? "");
  const openingFlag = argv.indexOf("--opening");
  const opening = openingFlag === -1 ? undefined : parseOpening(argv[openingFlag + 1] ?? "");

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
    // On the guide these two are painted frames rather than ticks, and a
    // rehearsal at 60Hz wants a wider step than a wave does — but the default
    // stays one number, because a caller who wants a strip is already writing
    // `--frames` and `--stride` next to each other.
    strideTicks: flag("stride", 4),
    seat,
    hold: hold as FrameSpec["hold"],
    holdTicks: flag("hold-ticks", 30),
    // Zero by default, which is what every capture before this flag existed
    // did: one painted frame per photograph, and nothing that lives in painted
    // seconds ever moving.
    settle: flag("settle", 0),
    at,
    zoom: flag("zoom", 1),
    press,
    opening,
  };

  // A press past the picture is a press nobody ever sees, and silently
  // clamping it would produce a frame that looks like the shot missed.
  const late = (press ?? []).find((one) => one.tick > spec.ticks);
  if (late) {
    throw new Error(
      `--press: a press at tick ${late.tick} is after --ticks ${spec.ticks}, so the picture is ` +
        "taken before it lands. Raise --ticks, or move the press earlier",
    );
  }

  const scratchOut = await mkdtemp(join(tmpdir(), "neon-spore-frames-out-"));
  const start = Date.now();
  try {
    console.log(`before: ${parent.slice(0, 7)}`);
    const before = await captureAt(parent, spec, join(scratchOut, "before"));
    console.log(`after: ${full.slice(0, 7)}`);
    const after = await captureAt(full, spec, join(scratchOut, "after"));
    const seconds = Math.round((Date.now() - start) / 1000);

    if (sameFrames(before.whole, after.whole)) {
      console.log(
        `identical: before and after look the same at this wave and tick (${seconds}s) — nothing written to ${out}. A picture of an unchanged field teaches nothing; try a different --wave or --ticks.`,
      );
      return;
    }

    await mkdir(out, { recursive: true });
    const written: string[] = [];
    for (const p of [...before.paths, ...after.paths]) {
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
