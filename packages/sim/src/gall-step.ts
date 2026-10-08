import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { freshGall, GALL_POINTS, type GallState, type GallStep, gallPointCol } from "./gall.js";
import { nextInt } from "./rng.js";
import { closeSlow, openSlow } from "./slow.js";
import { MILLI, type World } from "./world.js";

/**
 * THE GALL's clock: the alien dropping in, each step lighting on the beat it
 * lands, a leap in the air, a step running out, and the alien shot down.
 *
 * The taps and the pull are heard on the tick (`gall-hand.ts`), and the shot
 * where the bolt meets the alien (`gall-shot.ts`); this is everything that
 * waits for a beat.
 *
 * **The clock is the fuse, and the slow is the leap** — the owner, 8 October
 * 2026: *the slow effect should be around the enemy jumping in the moment it
 * is jumping … the progress bar timer is there on no slow, and when jumping
 * not the progress bar.* So a lit step opens an asking window **at the
 * ordinary pace**, which is a fuse and nothing slowed (`render/slow-intake.ts`
 * draws no light for one), and a leap opens a `"show"` at THE SLOW's rate,
 * which is light and no fuse.
 *
 * **A step that runs out is the hull**, leap or fire: the owner, the same
 * day, *one miss will lose the wave anyway*.
 */

export function installGall(world: World, steps: readonly GallStep[]): GallState {
  const s = freshGall(world.beat, steps);
  world.events.push({ type: "gallEnter", point: s.point, col: gallPointCol(world.cfg, s.point) });
  return s;
}

export function stepGall(world: World, s: GallState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "flat") {
    if (since >= cfg.gallFlatBeats) {
      world.events.push({ type: "gallOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "slack" && since >= cfg.gallSlackBeats) next(world, s);
  else if (s.phase === "rest" && since >= cfg.gallRestBeats) next(world, s);
  else if (s.phase === "leap" && since >= cfg.gallLeapBeats) land(world, s);
  else if (s.phase === "lit") {
    const step = s.steps[s.cursor];
    if (step !== undefined && since >= step.beats) miss(world, s);
  }
}

/**
 * A charged pull: it leaves its point for one on the other half, drawn off
 * the seeded `Rng`, and is in the air for `gallLeapBeats` under THE SLOW.
 */
export function gallThrown(world: World, s: GallState): void {
  const half = GALL_POINTS / 2;
  const from = s.point;
  const to = (from < half ? half : 0) + nextInt(world.rng, half);
  s.from = from;
  s.point = to;
  s.leaps += 1;
  s.taps = 0;
  s.down = [-1, -1];
  s.cursor += 1;
  s.phase = "leap";
  s.phaseBeat = world.beat;
  closeSlow(world);
  openSlow(world, world.cfg.gallLeapBeats, "show");
  world.events.push({
    type: "gallLeap",
    from,
    to,
    leaps: s.leaps,
    col: gallPointCol(world.cfg, from),
  });
}

/** A shot took a limb: the window shuts, the cursor moves on and it rests. */
export function gallAnswered(world: World, s: GallState): void {
  closeSlow(world);
  s.cursor += 1;
  s.phase = "rest";
  s.phaseBeat = world.beat;
}

/** It came down: the slow lets go and the next step lights on the beat it landed. */
function land(world: World, s: GallState): void {
  closeSlow(world);
  world.events.push({ type: "gallLand", point: s.point, col: gallPointCol(world.cfg, s.point) });
  next(world, s);
}

/** The next step lights with its fuse; or, with the script done, it drops dead. */
function next(world: World, s: GallState): void {
  const step = s.steps[s.cursor];
  s.phaseBeat = world.beat;
  s.taps = 0;
  if (step === undefined) {
    s.phase = "flat";
    world.events.push({ type: "gallFlat", col: gallPointCol(world.cfg, s.point) });
    return;
  }
  s.phase = "lit";
  openSlow(world, step.beats, "ask", MILLI);
  const col = gallPointCol(world.cfg, s.point);
  world.events.push({ type: "gallLight", ask: step.ask, point: s.point, col });
}

/** A step ran out unanswered: the hull takes it, and the wave is lost. */
function miss(world: World, s: GallState): void {
  const col = gallPointCol(world.cfg, s.point);
  world.events.push({ type: "gallMiss", col });
  closeSlow(world);
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.cursor += 1;
  s.down = [-1, -1];
  bossStrikesHull(world, "gall", col);
}
