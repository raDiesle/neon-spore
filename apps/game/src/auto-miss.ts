import { slowing, type World } from "@neon-spore/sim";

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
 */
export interface AskMisser {
  /** Whether AUTO keeps its hands off this tick. */
  withholds(w: World): boolean;
}

export function askMisser(): AskMisser {
  let window = -1;
  let seen = 0;
  return {
    withholds(w) {
      if (!slowing(w) || !w.slowAsks) return false;
      if (w.slowFromBeat !== window) {
        window = w.slowFromBeat;
        seen++;
      }
      return seen % 2 === 1;
    },
  };
}
