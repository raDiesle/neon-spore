#!/usr/bin/env bun

import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
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
 * **Where each flag's argument is made.** It is not made here. A flag that
 * needed explaining used to get a paragraph in this header *as well as* one in
 * the file that implements it, so the header grew twice per flag and
 * `--boss-json` fitted only after two of its three lines were folded into the
 * paragraph above them (`docs/queue.md`, 18 September 2026). The reasoning
 * lives with the code that acts on it, once, and this is the index:
 *
 * | flag | argued in |
 * |---|---|
 * | `--fault` | `fault.ts` |
 * | `--boss`, `--boss-json`, `--creature` | `boss.ts`; the write in `boss-install.ts` |
 * | `--until`, `--until-ticks`, `--until-back`, `--until-on`, `--events` | `until.ts` |
 * | `--opening` | `opening.ts`; a rehearsal's own clock in `guide-film.ts` |
 * | `--guide-page` | `opening-hold.ts` |
 * | `--at`, `--zoom` | `crop.ts` |
 * | `--hold` | `hold.ts`; every one of them, not the first, in `flags.ts` |
 * | `--hand`, `--hand-over` | `hand.ts` |
 * | `--press` | `press.ts`; the column it names in `press-column.ts` |
 * | `--settle`, `--boss-round`, `--seat`, `--ticks` | `spec.ts`, on the field each one sets |
 * | `--wave` | `wave.ts`, which answers it against the right list |
 *
 * What is left here is one **recipe** per flag, which is what somebody reaching
 * for the command needs and not why the flag exists. A next flag costs one more
 * line of them:
 *
 *   bun run frames . --wave 19 --boss-round 3    this tree, once, with no pair
 *   bun run frames <sha> --wave 21               wave 21, matching the HUD's W21
 *   bun run frames <sha> --wave "THE SHELL"        a wave by name — what a person has in hand
 *   bun run frames <sha> --wave 21 --ticks 240   an absolute world.tick, not a count of steps
 *   bun run frames . --wave 21 --until breach   the tick the hull was holed, whenever that is
 *   bun run frames . --wave 21 --until destroy --frames 4 --stride 0 --settle 3   the break, as a strip
 *   bun run frames . --wave 50 --until needWave --until-back 200   the rest before an event, not the end of it
 *   bun run frames . --wave 1 --until waveFailed --until-on 150     the rest after one: the lost screen
 *   bun run frames . --wave 21 --events   what fired, and on which tick
 *   bun run frames <sha> --wave 21 --frames 6 --stride 4   a short strip, for motion
 *   bun run frames <sha> --wave 21 --seat p1    one player's screen, not the rig's
 *   bun run frames . --wave "THE CLASP" --raster   the baked looks, which are off by default
 *   bun run frames <sha> --wave 20 --hold wardenTether=0,y=7000  a thumb on a cord
 *   bun run frames <sha> --wave 21 --hold balloonLeft=-1600,id=1 --hold balloonRight=1600,id=1   both hands
 *   bun run frames <sha> --wave 19 --hold mazeString=1400@240 --press 300:2:fire=cyan   turn, then shoot
 *   bun run frames . --wave 0 --seat p1 --hand cannon   this phone's thumb on the lobe, and its ring
 *   bun run frames . --wave 0 --seat p2 --hand muzzle=red --hand-over   the navigator's, carried; or resting
 *   bun run frames <sha> --wave 21 --press 60:1:cannonCol=3,64:2:fire=red   a shot, or 90:1:salvo
 *   bun run frames <sha> --wave 21 --press 60:1:cannonCol=3 --press 64:2:fire=red   the same, a flag each
 *   bun run frames <sha> --wave 21 --press 60:1:grip=lowest   a hand on the body nearest the hull
 *   bun run frames <sha> --wave 21 --settle 8 --frames 6 --stride 0   a burst, as a strip
 *   bun run frames <sha> --wave 21 --at 120,400,150,150 --zoom 3   one body, close up
 *   bun run frames <sha> --wave 19 --boss-round 3   a later sheet of THE MAZE
 *   bun run frames . --wave "THE HANDOVER" --fault handover:4,3,6   a fault no wave names
 *   bun run frames . --wave 3 --fault cannon:alternating,2   a runaway cannon, twice as slow
 *   bun run frames . --wave "THE THROAT" --boss slack=5,phase=everts,phaseBeat=now   a boss's last phase
 *   bun run frames . --wave "THE BATON" --boss-json '{"sockets":[1,1,0]}'   a list the wave never reaches
 *   bun run frames . --wave "BULB QUEEN" --creature petals=6   a phase read off the boss's own body
 *   bun run frames <sha> --wave 2 --opening guide|intro --frames 8 --stride 6   its opening
 *   bun run frames <sha> --wave 7 --opening guide --guide-page 3   a later page of a rehearsal
 *   bun run frames <sha> --wave 21 --out docs/frames/<sha>
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
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { sameFrames } from "./crop.js";
import { parseFrameSpec } from "./flags.js";
import { heldPageNote } from "./guide-film.js";
import { columnNotes } from "./press-column.js";
import { standingNotes } from "./press-standing.js";
import { pressNote, say, tickNote } from "./report.js";
import { scratchDir } from "./scratch.js";
import { captureAt, captureHere, git, root } from "./serve.js";
import { firedNote } from "./until.js";
import { waveNamesAt, waveNamesHere } from "./wave.js";

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const sha = argv[0];
  if (!sha || sha.startsWith("--")) {
    throw new Error(
      'usage: bun run frames <sha>|. --wave N|"NAME" [--ticks N] [--seat p1|p2|test] ' +
        "[--hold prime|mazeString=N|wardenTether=N[,y=N]|lidString=N,id=N][@TICK] (repeatable) " +
        "[--hold-ticks N] [--hand cannon|shield|muzzle[=red|cyan]] [--hand-over] " +
        "[--settle N] [--at x,y,w,h] [--zoom N] [--boss-round N] [--boss-json '{…}'] " +
        "[--creature key=value,…] [--raster] " +
        "[--until EVENT] [--until-ticks N] [--until-back N | --until-on N] [--events] " +
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
  // A report flag rather than part of the spec: it changes nothing about the
  // picture, only whether the run says what it heard on the way (`until.ts`).
  const wantsEvents = argv.includes("--events") || spec.until !== undefined;
  console.log(
    `wave: ${waveValue} → index ${spec.wave} (${historicalWaves[spec.wave]?.name ?? "beyond the authored waves"})`,
  );
  // What each column named in `--press` actually points at. Said before the
  // capture rather than after it, so a number that was going to photograph an
  // empty lane is readable while the run is still worth stopping
  // (`press-column.ts`). Nothing is said on a seven-column field, where the
  // authored numbers and the field's are the same numbers.
  for (const said of columnNotes(spec.press ?? [], DEFAULT_CONFIG.cols)) console.log(`  ${said}`);
  // And whether the wave puts anything in that column on the beat the press
  // lands (`press-standing.ts`). The other half of the same failure: a column
  // that exists and is empty photographs as well as one that does not exist.
  for (const said of standingNotes(spec.press ?? [], spec.wave, DEFAULT_CONFIG)) {
    console.log(`  ${said}`);
  }

  const start = Date.now();
  if (here) {
    await mkdir(out, { recursive: true });
    const { paths, atTick, heldPage, fired, sent } = await captureHere(spec, join(out, "frame"));
    const seconds = Math.round((Date.now() - start) / 1000);
    console.log(`wrote ${paths.length} frame(s) to ${out} in ${seconds}s`);
    paths.forEach((p, i) => {
      console.log(`  ${p}${tickNote(atTick[i])}`);
    });
    if (wantsEvents) console.log(`  ${firedNote(fired)}`);
    say(heldPageNote(spec, heldPage));
    say(pressNote(sent, fired));
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
    // The **after** run's, and said so: a pair is two runs of two builds, and
    // the events of the one being landed are the ones a reader is asking about.
    if (wantsEvents) console.log(`  after ${firedNote(after.fired)}`);
    say(heldPageNote(spec, after.heldPage));
    say(pressNote(after.sent, after.fired));
  } finally {
    await rm(scratchOut, { recursive: true, force: true }).catch(() => {});
  }
}

if (import.meta.main)
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
