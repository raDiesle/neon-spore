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
import { FILAMENT_PILOT, filamentLateBeat, filamentWaitingOn } from "./filament-turn.js";
import { breachHull } from "./hull-damage.js";
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
 * **And the line's clock closes on the beat.** The design had no strike in
 * it and a filament nobody traced hung lit for as long as it took; the owner
 * answered that on 25 September 2026 — *not infinite, and the ship takes
 * damage*. So a line standing still past `filamentLateBeat` strikes the hull
 * under the thumb it was waiting on (`filament-turn.ts`), and so does every
 * fault the thumbs make (`filament-hand.ts`) — one strike, which is the wave
 * (`wave-fail.ts`), and the filament back to its free end for a hull that
 * cannot be struck (`hullInvulnerable`).
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
    stillBeat: world.beat,
    grab: [NO_GRAB, NO_GRAB],
  };
  world.events.push({ type: "filamentEnter", col: midCol(world.cfg) });
  return s;
}

/** The armed filament back to its free end: nothing lit past it, no thumb on
 * it, and its clock starting again from `beat`. */
export function restartFilament(s: FilamentState, beat: number): void {
  s.head = 0;
  s.tail = 0;
  s.headBeat = NOT_DRAWN;
  s.stillBeat = beat;
  s.grab = [NO_GRAB, NO_GRAB];
}

/**
 * A fault on the line: one strike on the hull in the column it happened
 * over, and the filament back to its free end. The strike is the wave
 * (`wave-fail.ts`), so the restart only matters to a hull that cannot be
 * struck — there, the pair gets the filament again rather than a line
 * frozen half drawn.
 */
export function strikeFilament(world: World, s: FilamentState, col: number, row: number): void {
  breachHull(world, col, "meteorFastest", row, "heavy");
  restartFilament(s, world.beat);
}

/** The line stood still past its clock: it strikes under the thumb it waited on. */
function late(world: World, s: FilamentState): void {
  const seat = filamentWaitingOn(s, world.cfg) & FILAMENT_PILOT ? 1 : 2;
  const tiles = filamentTiles(s);
  const at = tiles?.[seat === 1 ? s.head : s.tail] ?? tiles?.[0];
  const col = at?.col ?? midCol(world.cfg);
  const row = at?.row ?? 0;
  world.events.push({ type: "filamentLate", seat, col });
  strikeFilament(world, s, col, row);
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
    restartFilament(s, world.beat);
    world.events.push({ type: "filamentArm", index: s.cursor, col: filamentCol(cfg, tiles) });
    return;
  }
  if (s.phase === "trace") {
    if (world.beat >= filamentLateBeat(s, cfg)) late(world, s);
    return;
  }
  if (s.phase !== "pull") return;
  // Pulled: the filament comes out of the body, then the next or the end.
  if (world.beat - s.phaseBeat < cfg.filamentPullBeats) return;
  s.cursor += 1;
  s.phaseBeat = world.beat;
  restartFilament(s, world.beat);
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
