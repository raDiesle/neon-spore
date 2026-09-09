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
 *   bun run frames . --wave 19 --boss-round 3    this tree, once, with no pair
 *   bun run frames <sha> --wave 21               wave 21, matching the HUD's W21
 *   bun run frames <sha> --wave "THE SHELL"        a wave by name — what a person has in hand
 *   bun run frames <sha> --wave 21 --ticks 240   an absolute world.tick, not a count of steps
 *   bun run frames <sha> --wave 21 --frames 6 --stride 4   a short strip, for motion
 *   bun run frames <sha> --wave 21 --seat p1    one player's screen, not the rig's
 *   bun run frames . --wave "THE CLASP" --raster   the baked looks, which are off by default
 *   bun run frames <sha> --wave 20 --hold wardenTether=0,y=7000  a thumb on a cord
 *   bun run frames <sha> --wave 21 --hold balloonLeft=-1600,id=1 --hold balloonRight=1600,id=1   both hands
 *   bun run frames <sha> --wave 19 --hold mazeString=1400@240 --press 300:2:fire=cyan   turn, then shoot
 *   bun run frames <sha> --wave 21 --press 60:1:cannonCol=3,64:2:fire=red   a shot, or 90:1:salvo
 *   bun run frames <sha> --wave 21 --press 60:1:grip=lowest   a hand on the body nearest the hull
 *   bun run frames <sha> --wave 21 --settle 8 --frames 6 --stride 0   a burst, as a strip
 *   bun run frames <sha> --wave 21 --at 120,400,150,150 --zoom 3   one body, close up
 *   bun run frames <sha> --wave 19 --boss-round 3   a later sheet of THE MAZE
 *   bun run frames <sha> --wave 2 --opening guide|intro --frames 8 --stride 6   its opening
 *   bun run frames <sha> --wave 7 --opening guide --guide-page 3   a later page of a rehearsal
 *   bun run frames <sha> --wave 21 --out docs/frames/<sha>
 *
 * `--guide-page N` turns the rehearsal N pages on before the picture, because a
 * page of a film plays once and then waits for its reader: without it every
 * capture came back with page one, and a lane that added a page to an existing
 * guide could not photograph the thing it had added.
 *
 * `--opening` stands in the wave's opening instead of running past it, which
 * every capture before it did unconditionally. A wave opens on its **guide**
 * and its introduction stands behind that, so `intro` on a guided wave crosses
 * the ready gate on the way (`opening.ts`). On `guide`, `--ticks` and
 * `--stride` are the **rehearsal's** own ticks: a film is a run drawn off the
 * frame clock rather than stepped by the world's, and the page is rewound to
 * its first tick before the strip because a page plays once and then holds on
 * its last frame. A strip taken from past that says `held:` (`guide-film.ts`).
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
 * **`.` in place of a sha photographs the working tree**, once, with no
 * worktree, no parent and no `identical:` guard. The pair stays the default
 * because a picture with nothing to compare it to is the weaker report — but a
 * change whose parent cannot produce the picture at all, a new handle or a new
 * flag, has no pair to take, and hand-rolling a preview and a browser for it is
 * the friction this tool exists to end.
 *
 * `--wave` takes the number a person reads off the HUD (`W21` is `--wave 21`,
 * not `--wave 20`) or a wave's own name. Both convert to the 0-based index
 * `jumpToWave` and `world.wave` actually use.
 */
import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { sameFrames } from "./crop.js";
import { parseFrameSpec } from "./flags.js";
import { heldPageNote } from "./guide-film.js";
import { say, tickNote } from "./report.js";
import { scratchDir } from "./scratch.js";
import { captureAt, captureHere, git, root } from "./serve.js";
import { waveNamesAt, waveNamesHere } from "./wave.js";

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const sha = argv[0];
  if (!sha || sha.startsWith("--")) {
    throw new Error(
      'usage: bun run frames <sha>|. --wave N|"NAME" [--ticks N] [--seat p1|p2|test] ' +
        "[--hold prime|mazeString=N|wardenTether=N[,y=N]|lidString=N,id=N][@TICK] (repeatable) " +
        "[--hold-ticks N] " +
        "[--settle N] [--at x,y,w,h] [--zoom N] [--boss-round N] [--raster] " +
        "[--press TICK:SEAT:control=value,…] [--opening intro|guide] [--out DIR]",
    );
  }
  // `.` is the working tree: one picture of what is on disk, with no commit to
  // check out and no parent to compare it to. Every change to a *look* wants
  // the pair, so that stays the default and this is asked for by name — but a
  // change whose parent cannot produce the picture at all (a new handle, a new
  // flag) has no pair to take, and hand-rolling a preview and a browser is
  // exactly the friction this tool exists to end.
  const here = sha === ".";
  const outFlag = argv.indexOf("--out");
  const out =
    outFlag === -1 ? join(root, "docs/frames", here ? "working" : sha) : (argv[outFlag + 1] ?? "");
  if (!out) throw new Error("--out needs a directory");

  const parent = here ? "" : await git(["rev-parse", `${sha}^`]);
  const full = here ? "" : await git(["rev-parse", sha]);

  // The name → index answer belongs to `full`'s own tree, not the working
  // tree's — a wave inserted since `full` shifts everything after it. For `.`
  // the working tree *is* the tree in question.
  const historicalWaves = here ? await waveNamesHere() : await waveNamesAt(full);

  const { spec, waveValue } = parseFrameSpec(argv, historicalWaves);
  console.log(
    `wave: ${waveValue} → index ${spec.wave} (${historicalWaves[spec.wave]?.name ?? "beyond the authored waves"})`,
  );

  const start = Date.now();
  if (here) {
    await mkdir(out, { recursive: true });
    const { paths, atTick, heldPage } = await captureHere(spec, join(out, "frame"));
    const seconds = Math.round((Date.now() - start) / 1000);
    console.log(`wrote ${paths.length} frame(s) to ${out} in ${seconds}s`);
    paths.forEach((p, i) => {
      console.log(`  ${p}${tickNote(atTick[i])}`);
    });
    say(heldPageNote(spec, heldPage));
    return;
  }

  const scratchOut = await scratchDir("out-");
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
    const both = [...before.atTick, ...after.atTick];
    written.forEach((p, i) => {
      console.log(`  ${p}${tickNote(both[i])}`);
    });
    say(heldPageNote(spec, after.heldPage));
  } finally {
    await rm(scratchOut, { recursive: true, force: true }).catch(() => {});
  }
}

if (import.meta.main)
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
