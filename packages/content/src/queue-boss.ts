import type { BossEntry } from "@neon-spore/sim";
import { mapCol } from "./queue.js";
import type { Wave } from "./waves.js";

/**
 * A wave's boss, remapped onto the field the pair is actually playing.
 *
 * Split out of `queue.ts` when THE TELL's branch took that file past its
 * 250-line limit, and the seam is the honest one: next door is what a wave
 * sends *down the columns*, which is `mapCol` applied to a list of arrivals,
 * and this is the one question about a boss that the remap has to answer. It
 * is a chain of eleven branches that says "not this one" ten times, and every
 * round designed adds an eleventh — so it is the half that grows.
 *
 * `queue.ts` re-exports it, so nothing that already reached for
 * `bossFromWave` through that file had to move.
 */

/**
 * `buildBoss` for an unsaved wave. The sibling of `podsFromWave`, narrowed the
 * same way and for the same reason — a rehearsal can be played against a boss.
 *
 * Only the queen has a column to remap — THE MIRROR stands over the ship
 * wherever the ship is, and THE WARDEN is a fixture dead centre, so neither
 * entry names a place at all and both pass through untouched.
 */
export function bossFromWave(wave: Pick<Wave, "boss">, cols: number): BossEntry | null {
  const boss = wave.boss;
  if (!boss) return null;
  if (boss.kind === "mirror") return { ...boss, rounds: boss.rounds.map((r) => [...r]) };
  if (boss.kind === "warden") return { ...boss };
  // THE VANE hangs dead centre off the top edge, so it has no authored column
  // to remap either.
  if (boss.kind === "vane") return { ...boss };
  // THE MAZE has no authored column either: `mazeMouthCol` spreads its three
  // mouths across whatever field it is played on.
  if (boss.kind === "maze") return { ...boss, rounds: boss.rounds.map((t) => ({ ...t })) };
  // THE GAUGE has no field to have a column on. Its wave is its own screen.
  if (boss.kind === "gauge") return { ...boss };
  // THE FLEET is the one boss authored in the *real* field's squares, and it
  // is the exception this function otherwise exists to prevent. `mapCol`
  // rounds, and a rounded run of squares is not a run: a five-long hull put
  // through it comes out with gaps, which is a ship the pair can shoot
  // straight through the middle of. So a chart passes through untouched, and
  // `FleetShip` is where that is argued.
  if (boss.kind === "fleet") return { ...boss, ships: boss.ships.map((s) => ({ ...s })) };
  // SNAKE has an arena instead of a field, and it is the same size whatever
  // the field would have been — so there is nothing here to remap either.
  if (boss.kind === "snake") return { ...boss, rounds: boss.rounds.map((r) => ({ ...r })) };
  // PINBALL has a table instead of a field, and the table is authored in its
  // own thousandths of a tile rather than in columns — so, like the snake's
  // arena, there is nothing here to remap.
  if (boss.kind === "pinball") {
    return {
      ...boss,
      rounds: boss.rounds.map((r) => ({ beats: r.beats, pieces: r.pieces.map((p) => ({ ...p })) })),
    };
  }
  // THE PULSE has four lanes instead of a field, and a lane is not a column:
  // there are always four of them however wide the grid is, so a chart passes
  // through with nothing remapped either.
  if (boss.kind === "pulse") {
    return {
      ...boss,
      stages: boss.stages.map((s) => ({
        name: s.name,
        steps: s.steps,
        notes: s.notes.map((n) => ({ ...n })),
      })),
    };
  }
  return { ...boss, col: mapCol(boss.col, cols) };
}
