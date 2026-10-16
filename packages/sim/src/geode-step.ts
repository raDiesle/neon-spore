import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import {
  freshGeode,
  type GeodeState,
  type GeodeStep,
  geodeCrackCol,
  geodeLeft,
  geodeLitStep,
  geodeNext,
} from "./geode.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE GEODE's clock: the stone sinking in, each level's cracks lighting, the
 * pieces flying apart between levels, and a level run out landing on the hull.
 *
 * The beam is heard where it burns its column (`geode-shot.ts`, called from
 * `lance-burn.ts`), and cuts its piece there, the instant it goes off, through
 * `geodeCuts`.
 *
 * **A level's window is THE SLOW** — the owner's rule of 22 September 2026
 * for every choreographed step, and a shot gets time (6 October 2026, on THE
 * GOVERNOR): opened as the cracks light, shut the instant the last is cut or
 * the time runs out.
 */

export function installGeode(world: World, steps: readonly GeodeStep[]): GeodeState {
  const s = freshGeode(world.beat, steps);
  world.events.push({ type: "geodeEnter", col: midCol(world.cfg) });
  return s;
}

/** One beat of THE GEODE: cracks light, a level runs out, the heart scatters. */
export function stepGeode(world: World, s: GeodeState): void {
  const cfg = world.cfg;
  const since = world.beat - s.phaseBeat;
  if (s.phase === "spent") {
    if (since >= cfg.geodeSpentBeats) {
      world.events.push({ type: "geodeOut", col: midCol(cfg) });
      world.boss = null;
    }
    return;
  }
  if (s.phase === "enter" && since >= cfg.geodeEnterBeats) light(world, s);
  else if (s.phase === "split" && since >= cfg.geodeSplitBeats) light(world, s);
  else if (s.phase === "crack") {
    const step = geodeLitStep(s);
    if (step !== null && since >= step.beats) strike(world, s);
  }
}

/** The next level's cracks light, every one of them, and the stone starts down. */
function light(world: World, s: GeodeState): void {
  const step = s.steps[s.cursor];
  if (step === undefined) return;
  s.phase = "crack";
  s.phaseBeat = world.beat;
  s.cutTick = step.cracks.map(() => -1);
  world.events.push({ type: "geodeCracks", level: s.cursor, col: midCol(world.cfg) });
  openSlow(world, step.beats + 1, "ask");
}

/**
 * The level ran out with a piece still whole: it lands on the hull and the
 * wave is lost (`bossStrikesHull`). One strike, because one is the wave.
 */
function strike(world: World, s: GeodeState): void {
  closeSlow(world);
  const piece = geodeNext(s);
  const col = piece < 0 ? midCol(world.cfg) : geodeCrackCol(world, s, s.cursor, piece);
  s.phase = "struck";
  s.phaseBeat = world.beat;
  world.events.push({ type: "geodeStrike", level: s.cursor, piece, col });
  bossStrikesHull(world, s.kind, col, 0, "stone");
}

/**
 * Piece `i` of the lit level is cut by the beam. The level's last breaks the
 * stone apart into the next level's pieces, and the script's last shatters
 * the heart.
 */
export function geodeCuts(world: World, s: GeodeState, i: number): void {
  const step = geodeLitStep(s);
  if (step === null || (s.cutTick[i] ?? 0) >= 0) return;
  s.cutTick[i] = world.tick;
  s.pieces += 1;
  if (geodeLeft(s) > 0) return;
  closeSlow(world);
  const level = s.cursor;
  s.cursor += 1;
  s.phaseBeat = world.beat;
  const col = midCol(world.cfg);
  world.events.push({ type: "geodeSplit", level, col });
  if (s.cursor < s.steps.length) {
    s.phase = "split";
    return;
  }
  s.phase = "spent";
  world.events.push({ type: "geodeShatter", col });
}
