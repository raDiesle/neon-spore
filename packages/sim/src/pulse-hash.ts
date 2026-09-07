import { PULSE_LANES, PULSE_PHASES, type PulseNote, type PulseState } from "./pulse.js";

/**
 * What THE PULSE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `snake-hash.ts` and `maze-hash.ts` are ones:
 * `hash-boss.ts` grows by a whole boss at a time, and every rule in here is
 * about what two devices could come to disagree about rather than about a
 * song.
 *
 * **Both seats, in the same order, twice.** This round is the first whose
 * state is two mirrored halves, and the fingerprint is where that stops being
 * a convenience: a field added to player 1 and forgotten for player 2 is a
 * field one device could be right about and the other silently wrong. So the
 * seat halves are written as one loop over `[1, 2]` rather than as two blocks,
 * and forgetting one is not something this file lets you do.
 */

/** One note, as three numbers. `veil` is 0 for an arrow both seats can read. */
function pushNote(push: (n: number) => void, note: PulseNote): void {
  push(note.step);
  push(PULSE_LANES.indexOf(note.lane));
  push(note.veil ?? 0);
}

/**
 * A stage's name, folded into one number.
 *
 * It is drawn on the screen and nothing reads it, so it could have been one of
 * `hash.ts`'s named exceptions — but a name is *authored*, and the whole
 * argument `mazeHashParts` makes about authored data is that two phones on two
 * builds of `content` are exactly what a fingerprint is for. A fold is cheaper
 * than an exception with a paragraph under it.
 */
function foldName(name: string): number {
  let out = 0;
  for (let i = 0; i < name.length; i++) {
    out = (out * 31 + name.charCodeAt(i)) % 1_000_003;
  }
  return out;
}

/**
 * Everything about THE PULSE that goes into `hashWorld`, in a fixed order.
 *
 * The authored stages are in for THE MIRROR's reason: two phones on two builds
 * of `content` would be reading different charts by the second stage, and
 * nothing else in the world would say a word about it. A stage is a hundred or
 * so notes and there are one or two of them, which is the same order of
 * numbers THE MIRROR's six sequences already cost.
 */
export function pulseHashParts(b: PulseState): number[] {
  const parts: number[] = [];
  const push = (n: number): void => {
    parts.push(n);
  };
  push(PULSE_PHASES.indexOf(b.phase));
  push(b.phaseBeat);
  push(b.openBeat);
  push(b.passed ? 1 : 0);
  push(b.stage);
  push(b.startTick);
  push(b.stages.length);
  for (const stage of b.stages) {
    push(foldName(stage.name));
    push(stage.steps);
    push(stage.notes.length);
    for (const note of stage.notes) pushNote(push, note);
  }
  push(b.notes.length);
  for (const note of b.notes) pushNote(push, note);
  // The meter, once, because there is one of it and it belongs to the pair.
  push(b.meter);
  for (const seat of [1, 2] as const) {
    const judged = seat === 1 ? b.judged1 : b.judged2;
    push(judged.length);
    for (const j of judged) push(j);
    push(seat === 1 ? b.from1 : b.from2);
    push(seat === 1 ? b.combo1 : b.combo2);
    push(seat === 1 ? b.last1 : b.last2);
    push(seat === 1 ? b.lastTick1 : b.lastTick2);
    push(seat === 1 ? b.lastLane1 : b.lastLane2);
  }
  return parts;
}
