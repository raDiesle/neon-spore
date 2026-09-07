import type { PulseLane, PulseState } from "./pulse.js";
import { pulseAim, pulseJudgeIndex, pulseLaneIndex } from "./pulse-chart.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * The four verbs of the round — and the first round in the game where both
 * seats have all of them.
 *
 * Every other round splits the verbs: THE GAUGE's valve is player 1's and its
 * call is player 2's, SNAKE's turns are player 2's and its trigger player 1's,
 * PINBALL's bucket is player 1's and its launch player 2's. This one splits
 * nothing. Both panels carry the same four arrows, both seats press them
 * against the same chart, and a press is judged the same way whichever thumb
 * it came from.
 *
 * That is a deliberate reversal and it needs saying, because the rule it looks
 * like it is breaking is a real one: neither player may be able to play a
 * round alone (`docs/spec/interludes.md`). This round obeys it somewhere else.
 * The split here is not in the verbs, it is in **what each screen can read** —
 * a veiled arrow arrives on one seat's screen with its direction taken off it,
 * and only the other seat can say what it is (`pulse.ts`). Identical hands,
 * different eyes. It is the same shape THE VEIL and THE GHOST already have on
 * the field, arriving in a round for the first time.
 *
 * So there is no seat check in this file, and its absence is the design rather
 * than an omission.
 */

/**
 * The seat's own half of the state, gathered so a press is written once.
 *
 * The meter is deliberately not in here: there is one of it and it belongs to
 * the pair (`PulseState.meter`). What a seat owns is which arrows it has
 * resolved and how many it has strung together.
 */
interface Seat {
  judged: number[];
  from: number;
  combo: number;
}

function seatOf(state: PulseState, player: 1 | 2): Seat {
  return player === 1
    ? { judged: state.judged1, from: state.from1, combo: state.combo1 }
    : { judged: state.judged2, from: state.from2, combo: state.combo2 };
}

/**
 * Write the shared meter, and this seat's combo and last judgement, back.
 *
 * `judged` is written through, being the same array either way — only the
 * numbers beside it come back here. Two branches rather than an index, for the
 * reason `PulseState` gives: `1 | 2` is how a seat is spelled everywhere in
 * this game and an index would be a third spelling.
 */
export function pulseMark(
  world: World,
  state: PulseState,
  player: 1 | 2,
  judge: number,
  lane: number,
  meter: number,
  combo: number,
): void {
  state.meter = Math.max(0, Math.min(world.cfg.pulseMeterMaxMilli, meter));
  if (player === 1) {
    state.combo1 = combo;
    state.last1 = judge;
    state.lastTick1 = world.tick;
    state.lastLane1 = lane;
    return;
  }
  state.combo2 = combo;
  state.last2 = judge;
  state.lastTick2 = world.tick;
  state.lastLane2 = lane;
}

/**
 * One press, from either seat.
 *
 * **A press at nothing costs.** It has to, and the veil is why: a seat that
 * cannot read its own arrow could otherwise hold all four buttons through the
 * bar and never be wrong, which would take the round's whole subject away. So
 * the meter is spent on a thumb that landed on empty air, and it is spent more
 * heavily than waiting is — a wrong move has to hurt.
 */
export function pulseHeard(world: World, state: PulseState, player: 1 | 2, command: Command): void {
  if (command.kind !== "pulseStep") return;
  pulsePress(world, state, player, command.lane);
}

export function pulsePress(world: World, state: PulseState, player: 1 | 2, lane: PulseLane): void {
  const cfg = world.cfg;
  const seat = seatOf(state, player);
  const at = pulseAim(cfg, state.startTick, state.notes, seat.judged, seat.from, lane, world.tick);
  const drawn = pulseLaneIndex(lane);
  const note = at < 0 ? undefined : state.notes[at];
  if (at < 0 || note === undefined) {
    // A stray. The combo goes with it: a press at nothing is a mistake the
    // pair should hear about, and a run of clean hits with a mash in the
    // middle of it is not a run.
    pulseMark(world, state, player, 4, drawn, state.meter - cfg.pulseStrayMilli, 0);
    return;
  }
  const judge = pulseJudgeIndex(cfg, state.startTick, note, world.tick);
  seat.judged[at] = judge;
  const gain = judge === 1 ? cfg.pulsePerfectMilli : cfg.pulseGoodMilli;
  pulseMark(world, state, player, judge, drawn, state.meter + gain, seat.combo + 1);
}
