import {
  type Color,
  gaugeRound,
  gaugeSeated,
  mazeCoreEntrance,
  mazeCurrent,
  mazeHeartColor,
  mazeRound,
  type TimedCommand,
} from "@neon-spore/sim";
import type { Hand } from "./poses-bosses-kit.js";

/**
 * **The pair's hands on the rounds a hand has to play** — THE MAZE, THE
 * GAUGE — each a `Hand` (`poses-bosses-kit.ts`). A round's other phases
 * arrive with nobody pressing (`poses-bosses-rounds.ts`); these are the two
 * whose played states do not, and each hand is the round's own test rig
 * played straight (`sim/test/maze-fixture.ts`'s `clickOnto` and `fireInto`,
 * `gauge.test.ts`'s `talking`): the string pulled until the way in clicks
 * onto a column, the shot up it; the valve turned toward the mark and the
 * call when the needle sits between them.
 */

type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });
const valve = (dir: -1 | 1): Press => ({ player: 1, command: { kind: "valve", on: true, dir } });

/**
 * THE MAZE: the pilot's thumb pulls the string until a way in clicks onto a
 * column (`mazeCommit`); a press while it is clicked breaks the detent and
 * pulls on, so the thumb presses once per click and waits for the next. On
 * the way in that reaches the middle the cannon slides under the lit column
 * and the navigator's shot goes up it in the heart's colour (`mazeHeard`).
 */
export const mazeHand: Hand = (w) => {
  const m = mazeRound(w);
  if (m === null || m.phase !== "read") return [];
  const wheel = mazeCurrent(m);
  if (wheel === null) return [];
  if (m.lockedWay === mazeCoreEntrance(wheel)) {
    const out: Press[] = [aim(m.lockedCol)];
    if (w.cannonCol === m.lockedCol) out.push(fire(mazeHeartColor(m.round)));
    return out;
  }
  return m.turn === 0 ? [valve(1)] : [];
};

/**
 * THE GAUGE: the pilot turns the valve toward the mark he cannot see, and
 * the navigator calls whenever the needle is seated between her marks
 * (`gaugeSeated`). A call wide of the band costs a rest and nothing else.
 */
export const gaugeHand: Hand = (w) => {
  const g = gaugeRound(w);
  if (g === null || g.phase !== "play") return [];
  const out: Press[] = [];
  const want = g.needleMilli < g.markMilli ? 1 : -1;
  if (g.valve !== want) out.push(valve(want));
  if (gaugeSeated(w, g)) out.push({ player: 2, command: { kind: "call" } });
  return out;
};
