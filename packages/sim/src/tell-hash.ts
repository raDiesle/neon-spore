import { TELL_PHASES, type TellState, tellThrows } from "./tell.js";

/**
 * What THE TELL puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `pulse-hash.ts` and `snake-hash.ts` are ones:
 * `hash-boss.ts` grows by a whole boss at a time, and every rule in here is
 * about what two devices could come to disagree about rather than about a
 * ladder.
 *
 * **The authored ladder is in.** Two phones on two builds of `content` would
 * be answering different windows by the third rung — one of them feinting
 * where the other is not — and nothing else in the world would say a word
 * about it. It is three numbers a rung and there are a handful of rungs, which
 * is cheaper than every other round's authored half.
 *
 * **What the boss is *about* to throw is in, and it has to be.** `bossThrow`
 * is the one field here that neither screen draws before the reveal, and that
 * is exactly why it is hashed: a value nobody can see is a value nobody would
 * notice two devices disagreeing about until the moment it decided the rung.
 */
export function tellHashParts(b: TellState): number[] {
  const parts: number[] = [];
  const push = (n: number): void => {
    parts.push(n);
  };
  push(TELL_PHASES.indexOf(b.phase));
  push(b.phaseBeat);
  push(b.openBeat);
  push(b.beats);
  push(b.passed ? 1 : 0);
  push(b.rungs.length);
  for (const rung of b.rungs) {
    push(rung.beats);
    push(rung.feint === true ? 1 : 0);
    push(rung.answers === true ? 1 : 0);
    push(tellThrows(rung));
  }
  push(b.rung);
  push(b.lost);
  push(b.shorten);
  push(b.bossThrow);
  push(b.bossShown);
  push(b.bossColor);
  push(b.thrown);
  push(b.thrownColor);
  push(b.thrownBy);
  push(b.fumbled ? 1 : 0);
  push(b.thrownTick);
  push(b.outcome);
  push(b.lastThrow);
  // **The exchanges already played are in, and the length before them.** On
  // every rung but the last this is one entry that says again what the scalars
  // above say; on a rung of three it is the only record that the first two
  // throws happened at all, and two devices that disagreed about one of them
  // would agree about everything on screen right up to the fold that decides
  // the rung (`tell-ladder.ts`).
  push(b.at);
  push(b.played.length);
  for (const e of b.played) {
    push(e.bossThrow);
    push(e.bossColor);
    push(e.thrown);
    push(e.thrownColor);
    push(e.thrownBy);
    push(e.fumbled ? 1 : 0);
    push(e.thrownTick);
    push(e.outcome);
  }
  return parts;
}
