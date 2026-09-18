import { midCol } from "./config.js";
import {
  type FilamentPath,
  type FilamentState,
  filamentCol,
  filamentTiles,
  NO_GRAB,
  NOT_DRAWN,
  walkFilament,
} from "./filament.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * THE FILAMENT's clock: the arm, the pull, the next filament, the end.
 *
 * The beat does little here on purpose. The thumbs decide everything about a
 * filament while it is lit (`filament-hand.ts`); what the beat owns is the
 * pauses *between* filaments — the beats one hangs lit at its free end before
 * a thumb counts, so the pair sees where it starts, and the beats a traced
 * one takes to come out of the body before the next is armed, which is THE
 * SLOW's window (`docs/decisions.md` #33) — and the end, `filamentOutBeats`
 * after the seventh, so the frame has its beats of the beaten body before
 * the wave may end (`bossHoldsWave`).
 *
 * **No window closes on the beat.** THE INSTAR's clock strikes when a mark is
 * still undone at the end of its window; this one does not, because the
 * design has no strike in it — a filament nobody traces hangs lit for as
 * long as it takes, and the cost of every fault is the filament, not the
 * hull. That is the one open figure written up for the owner
 * (`docs/spec/bosses.md` §11).
 */

export function installFilament(world: World, paths: readonly FilamentPath[]): FilamentState {
  const s: FilamentState = {
    kind: "filament",
    tiles: paths.map(walkFilament),
    cursor: 0,
    phase: "arm",
    phaseBeat: world.beat,
    head: 0,
    tail: 0,
    headBeat: NOT_DRAWN,
    grab: [NO_GRAB, NO_GRAB],
  };
  world.events.push({ type: "filamentEnter", col: midCol(world.cfg) });
  return s;
}

/** The armed filament back to its free end: nothing lit past it, no thumb on it. */
export function restartFilament(s: FilamentState): void {
  s.head = 0;
  s.tail = 0;
  s.headBeat = NOT_DRAWN;
  s.grab = [NO_GRAB, NO_GRAB];
}

export function stepFilament(world: World, s: FilamentState): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  if (s.phase === "down") {
    if (world.beat - s.phaseBeat >= cfg.filamentOutBeats) {
      world.events.push({ type: "filamentOut", col: mid });
      world.boss = null;
    }
    return;
  }
  const tiles = filamentTiles(s);
  if (tiles === null) return;
  if (s.phase === "arm") {
    if (world.beat - s.phaseBeat < cfg.filamentArmBeats) return;
    s.phase = "trace";
    s.phaseBeat = world.beat;
    restartFilament(s);
    world.events.push({ type: "filamentArm", index: s.cursor, col: filamentCol(cfg, tiles) });
    return;
  }
  if (s.phase !== "pull") return;
  // Pulled: the filament comes out of the body, then the next or the end.
  if (world.beat - s.phaseBeat < cfg.filamentPullBeats) return;
  s.cursor += 1;
  s.phaseBeat = world.beat;
  restartFilament(s);
  if (filamentTiles(s) === null) {
    s.phase = "down";
    world.events.push({ type: "filamentDown", col: mid });
    return;
  }
  s.phase = "arm";
}

/** The armed filament traced end to end: out of the body, under THE SLOW. */
export function pullFilament(world: World, s: FilamentState): void {
  const tiles = filamentTiles(s);
  if (tiles === null) return;
  s.phase = "pull";
  s.phaseBeat = world.beat;
  openSlow(world, world.cfg.filamentSlowBeats);
  world.events.push({
    type: "filamentPulled",
    index: s.cursor,
    col: filamentCol(world.cfg, tiles),
  });
}
