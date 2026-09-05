import { MAZE_PHASES } from "./maze.js";
import type { MazeState } from "./maze-round.js";

/**
 * What THE MAZE puts into `hashWorld`, and nothing else.
 *
 * Its own file because `maze.ts` was at the ceiling `CLAUDE.md` sets and this
 * is the one subject in it that is not about where the drum stands: it is read
 * by `hash-boss.ts` and by no one else, and every rule in it is about what two
 * devices could come to disagree about rather than about a maze.
 */

/**
 * Everything about THE MAZE that goes into `hashWorld`, in a fixed order.
 *
 * The angle is the first of them and the most important: two devices that
 * disagree about where the wheel stands are lighting different columns, and
 * everything after it is downstream of that. The wheel itself is in there
 * although it is authored, because that is precisely the assumption worth
 * checking — a wave list that drifted by one entry would deal the pair
 * different drums and nothing else would say a word about it.
 */
export function mazeHashParts(m: MazeState): number[] {
  const parts = [
    m.round,
    MAZE_PHASES.indexOf(m.phase),
    m.phaseBeat,
    m.angleMilli,
    m.turn,
    m.armed ? 1 : 0,
    // The hand on the string, and where it grabbed. The wheel turns by the
    // change in this between two messages, so two devices that disagree about
    // the origin turn it by different amounts on the very next drag — THE
    // WARDEN's rope is hashed for this reason, field for field.
    m.dragging ? 1 : 0,
    m.dragFromMilli,
    m.lockedCol,
    m.lockedWay,
    m.way,
    m.shotColor,
    m.step,
    m.hullMilli,
    m.verdict,
    m.verdictCol,
  ];
  // Every wheel, not only the one in front of the pair. `m.round` above says
  // which is current; what these cover is the assumption that both devices
  // were dealt the same drums, which is the one worth checking rather than the
  // one that is safe.
  parts.push(m.rounds.length);
  for (const wheel of m.rounds) {
    parts.push(wheel.rings, wheel.coreMilli, wheel.openMilli, wheel.startMilli);
    // The walls themselves, and not only the way through them: a drum whose
    // circles were dealt differently draws a different maze round the same
    // route, and the two screens would be arguing about which gap is which.
    for (const list of [...wheel.walls, ...wheel.openings]) {
      parts.push(list.length);
      for (const angle of list) parts.push(angle);
    }
    parts.push(wheel.entrances.length);
    for (const entrance of wheel.entrances) {
      parts.push(entrance.angleMilli, entrance.route.length);
      for (const cell of entrance.route) parts.push(cell.ring, cell.angleMilli);
    }
  }
  parts.push(m.tried.length);
  for (const way of m.tried) parts.push(way);
  parts.push(m.scars.length);
  for (const scar of m.scars) parts.push(scar.col, scar.beat);
  return parts;
}
