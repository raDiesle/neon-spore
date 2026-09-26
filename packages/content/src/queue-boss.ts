import type { BossEntry } from "@neon-spore/sim";
import { mapCol, mapColMilli } from "./queue.js";
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
  // THE CAIRN is a fixture dead centre as well, and its two lanes are the
  // pile's own edges rather than authored columns — `installCairn` reads them
  // off `cols`, so a narrower field moves both and the entry says nothing
  // about either.
  if (boss.kind === "cairn") return { ...boss };
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
  // THE WELL has no authored anything: it is a projection of whatever field
  // the pair is playing on, so a narrower one simply makes wider sectors
  // (`render/src/well.ts`).
  if (boss.kind === "well") return { ...boss };
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
  // THE SPLICE authors only a beat count. Both its rows of ends are spread
  // across whatever field it is played on (`spliceSpreadCol`) and the tangle
  // between them is laid from the rng at the moment the round opens, so there
  // is not a column in the entry to remap — the shortest of the ten reasons
  // above and the same one THE MAZE has.
  if (boss.kind === "splice") return { ...boss, rounds: boss.rounds.map((r) => ({ ...r })) };
  // THE REPRISE authors one beat count and no column: the mechanism hangs at
  // the top middle, and the bodies it sends again are the wave's own arrivals
  // read back out of the queue — which `mapCol` has already put on this
  // field's columns by the time they are sent (`reprise.ts`).
  if (boss.kind === "reprise") return { ...boss };
  // THE STARE has no column and nothing else to remap: the eye is in the sky,
  // and what it does is decided by the clock rather than by a place
  // (`sim/stare.ts`). The shortest entry of the fourteen, with THE WELL's.
  if (boss.kind === "stare") return { ...boss };
  // THE BATON has nothing to remap either, and that is a *geometric* claim
  // rather than an absence: the arm hangs
  // in `midCol` of the field being played and swings a column either side of
  // it, so it is as centred on eleven columns as on the seven it was authored
  // against (`sim/baton.ts`).
  if (boss.kind === "baton") return { ...boss };
  // THE THROAT has nothing to remap, and like THE BATON that is geometry
  // rather than absence: the mouth starts at `midCol` of whatever field is
  // actually played and its travel reflects inside that field's own walls, so
  // the gullet is centred on eleven columns as exactly as on the seven it was
  // authored against (`sim/throat.ts`).
  if (boss.kind === "throat") return { ...boss };
  // THE UNDERTOW has nothing to remap: every column it comes up through is
  // drawn from the field being played, and the last one is `midCol` of it
  // (`sim/undertow-step.ts`).
  if (boss.kind === "undertow") return { ...boss };
  // THE GORGE is centred on `midCol` of whatever field is played and is as
  // wide as `gorgeIntakes` lets it be, so there is nothing to remap
  // (`sim/gorge-step.ts`).
  if (boss.kind === "gorge") return { ...boss };
  // THE CURTAIN unrolls centred on whatever field is played and its core is
  // rolled behind it, so there is nothing authored to remap (`sim/curtain-step.ts`).
  if (boss.kind === "curtain") return { ...boss };
  // THE TASTER has nothing to remap for THE GORGE's reason exactly: the crest
  // is centred on `midCol` of whatever field is played and is as wide as
  // `tasterBlades` lets it be, so a fan authored on seven columns opens over
  // eleven with the same blade in the middle (`sim/taster-step.ts`).
  if (boss.kind === "taster") return { ...boss };
  // THE SINEW hangs its mass over `midCol` of whatever field is played and
  // the mass walks from there, so there is nothing authored to remap
  // (`sim/sinew-step.ts`).
  if (boss.kind === "sinew") return { ...boss };
  // THE LEDGER stands over `midCol` of whatever field is played and roots its
  // cord under itself, and the socket walks from there — so nothing is
  // authored and nothing remaps (`sim/ledger-step.ts`).
  if (boss.kind === "ledger") return { ...boss };
  // THE SURGE hangs its bulb over `midCol` of whatever field is played and
  // is as wide as `surgeBulbCols` lets it be, so there is nothing to remap
  // (`sim/surge-step.ts`).
  if (boss.kind === "surge") return { ...boss };
  // THE LEAD comes in over `midCol` of whatever field is played and walks
  // between whatever walls it has, so there is nothing to remap
  // (`sim/lead-step.ts`).
  if (boss.kind === "lead") return { ...boss };
  // THE SCUTTLE hangs its frame over `midCol` of whatever field is played,
  // as wide as `scuttleCols` lets it be, and throws nothing but its own
  // parts — so there is nothing to remap (`sim/scuttle-step.ts`).
  if (boss.kind === "scuttle") return { ...boss };
  // THE ANTIPHON draws its rail's columns from whatever field is played and
  // drops nothing but what the pair got wrong — nothing to remap
  // (`sim/antiphon-rail.ts`).
  if (boss.kind === "antiphon") return { ...boss };
  // THE HIVE sows its sites across the inner columns of whatever field is
  // played (`sim/hive.ts` `hiveSiteCols`) and spills nothing but rocks from
  // them — so there is nothing to remap (`sim/hive-step.ts`).
  if (boss.kind === "hive") return { ...boss };
  // THE INSTAR's marks, and THE NETTLE's, are authored in thousandths of the field's width and
  // height, which is already a fraction of whatever field is played — so
  // there is nothing to remap (`sim/instar.ts`).
  if (boss.kind === "instar" || boss.kind === "nettle") return { ...boss };
  // THE FILAMENT's filaments hang from a free end, and the free end is a
  // column like any other; the word after it is the line's own shape and is
  // not bent to the field (`sim/filament.ts`).
  if (boss.kind === "filament")
    return {
      ...boss,
      filaments: boss.filaments.map((f) => ({ ...f, col: mapCol(f.col, cols) })),
    };
  // THE GIMBAL hangs its drum over `midCol` of whatever field is played and
  // everything authored about it is a bearing, which is a fraction of a turn
  // and has nothing to do with how wide the field is (`sim/gimbal-step.ts`).
  if (boss.kind === "gimbal") return { ...boss };
  // THE SPOOL is slung across the top of the field and its line runs to the
  // hull under `midCol`, so it names no column either (`sim/spool-step.ts`).
  // The one thing it ever throws is thrown down the column the cannon is
  // already standing in, which is the pilot's column in the only sense this
  // game has one.
  if (boss.kind === "spool") return { ...boss };
  // THE HASP hangs its wheel over `midCol` too, and its loose bolt works its
  // way out of the same column — the only figure in the fight that is a place
  // at all, and it is read off the field rather than authored
  // (`sim/hasp-step.ts`).
  if (boss.kind === "hasp") return { ...boss };
  // THE RATCHET the same: its rack and its bolt are both `midCol` (`sim/ratchet-step.ts`).
  if (boss.kind === "ratchet") return { ...boss };
  // THE MANTLE the same: its shell and its bared core's spark are both
  // `midCol` (`sim/mantle-step.ts`).
  if (boss.kind === "mantle") return { ...boss };
  // THE KEEL the same: its segments are spread across whatever width the
  // field has, and its socket is `midCol` (`sim/keel.ts` `keelSegCol`).
  if (boss.kind === "keel") return { ...boss };
  // THE VALVE the same: its marks are bearings, and its drum is `midCol`.
  if (boss.kind === "valve") return { ...boss };
  // THE SEAM the same: its ridge is `midCol` and a rock is authored as an
  // offset from it, clamped to whatever width the field has.
  if (boss.kind === "seam") return { ...boss };
  // THE OCULUS the same: its eye is `midCol` and nothing else has a place.
  if (boss.kind === "oculus") return { ...boss };
  // THE VISE the same: its kernel is `midCol` and nothing else has a place.
  if (boss.kind === "vise") return { ...boss };
  // THE SCOUT is authored in the arena's own thousandths of a tile, which is
  // the field's width in the units the little ship flies in — so it is the
  // only boss whose places are remapped as *fractions* rather than as columns.
  // `mapCol` rounds to a whole column, and a mote rounded to a column would
  // sit a third of a tile from where the author put it; `mapColMilli` is the
  // same arithmetic with the rounding left until the end.
  if (boss.kind === "scout") {
    return {
      ...boss,
      arenas: boss.arenas.map((a) => ({
        ...a,
        startColMilli: mapColMilli(a.startColMilli, cols),
        motes: a.motes.map((m) => ({ ...m, colMilli: mapColMilli(m.colMilli, cols) })),
        hazards: a.hazards.map((h) => ({
          ...h,
          colMilli: mapColMilli(h.colMilli, cols),
          // The travel is scaled with the place, or a hazard authored to cross
          // a seven-column arena in four beats would take six on an eleven.
          vColMilli: mapColMilli(h.vColMilli, cols),
        })),
      })),
    };
  }
  return { ...boss, col: mapCol(boss.col, cols) };
}
