import {
  type Command,
  filamentBoss,
  filamentTracing,
  gallBoss,
  gallLitStep,
  midCol,
  slowing,
  type World,
} from "@neon-spore/sim";

/**
 * **AUTO that lets every other ask run out**, so a boss's own blow at the
 * hull can be reached without a scratch script (`bun run frames --auto both
 * --auto-miss --until breach`).
 *
 * With no hand on them, THE OCULUS, THE VISE, THE HASP and five more never
 * miss: the fight never gets as far as asking. With AUTO on both seats it gets
 * there and never misses either. What was wanted is the fight played right up
 * to an ask and then left alone — and only that ask, because a *hold* that is
 * left alone slips and is asked again (`oculus-step.ts`), and a run that let
 * every ask go would stand on the same hold forever.
 *
 * So the windows alternate: the first asking window THE SLOW opens is let go,
 * the next is answered, the one after is let go. An ask whose miss is a blow
 * lands it on the first; a hold slips, is answered on its retry, and the
 * fight moves on to an ask that does strike. Nothing here knows a boss by
 * name — an asking window is the one thing every choreographed boss opens
 * the same way (`openSlow(…, "ask")`).
 *
 * A window is named by the beat it opened on: `openSlow` moves only the end of
 * a window already up, so a window extended is the same window, and one opened
 * after another has closed starts on a later beat.
 *
 * **THE GALL's fire step is the one ask with no window** (`gall-step.ts`
 * `next` opens THE SLOW only for a close), and the one a withheld hand does
 * not let go: the cannon fires by itself every half beat, under the root on
 * the middle column. So a lit fire step on a bared root is withheld every
 * time — its miss is the blow, and a run that reached it is done — and the
 * misser slides the cannon one column off the middle for as long as it is lit
 * (`presses`). The closes before it alternate like any other window.
 *
 * **THE FILAMENT's trace is the other**: its SLOW is the pause between two
 * lines, not an ask, and the ask is the line itself — stood still past its
 * clock, it strikes (`filament-step.ts` `late`). So the lines alternate as
 * windows do, by the one they are on: the first is let run out, and its
 * strike is the wave (`wave-fail.ts`).
 */
export interface AskMisser {
  /** Whether AUTO keeps its hands off this tick. */
  withholds(w: World): boolean;
  /** The misser's own presses this tick, pushed in AUTO's place while it withholds. */
  presses(w: World): readonly { player: 1 | 2; command: Command }[];
}

/** Whether a line of THE FILAMENT is being traced that is to be let run out. */
function unansweredLine(w: World): boolean {
  const s = filamentBoss(w);
  return s !== null && filamentTracing(s) && s.cursor % 2 === 0;
}

/** The column a lit shot with no asking window must leave by, or null. */
function unwindowedShot(w: World): number | null {
  const s = gallBoss(w);
  if (s === null || !s.bared || gallLitStep(s)?.ask !== "fire") return null;
  return midCol(w.cfg);
}

export function askMisser(): AskMisser {
  let window = -1;
  let seen = 0;
  return {
    withholds(w) {
      if (unwindowedShot(w) !== null || unansweredLine(w)) return true;
      if (!slowing(w) || !w.slowAsks) return false;
      if (w.slowFromBeat !== window) {
        window = w.slowFromBeat;
        seen++;
      }
      return seen % 2 === 1;
    },
    presses(w) {
      const col = unwindowedShot(w);
      if (col === null || w.cannonCol !== col) return [];
      const off = col > 0 ? col - 1 : col + 1;
      return [{ player: 1, command: { kind: "cannonCol", col: off } }];
    },
  };
}
