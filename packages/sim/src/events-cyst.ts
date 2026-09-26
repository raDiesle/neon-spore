import type { CystAsk } from "./cyst.js";

/**
 * What THE CYST says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The sac hangs over the middle, so nearly every one is there — a
 * spore's turn and a bud's pop are over their own column, and so is a miss
 * of either; the ones about a flank say which with `side`, the left nought
 * and the right one.
 */

interface CystColEvent {
  /** The column it happened over. */
  col: number;
}

export type CystEvent =
  /** The sac settles into frame, both flanks whole and shuddering. */
  | ({ type: "cystEnter" } & CystColEvent)
  /** A step lit: a flank shuddering for the partner's tap, or the core to shoot. */
  | ({ type: "cystLight"; ask: CystAsk } & CystColEvent)
  /** The partner's tap stilled the lit flank: the pinch may count. */
  | ({ type: "cystStill"; side: 0 | 1 } & CystColEvent)
  /** A lit flank was never tapped still: it shudders on, to be tried again. */
  | ({ type: "cystShudder"; side: 0 | 1 } & CystColEvent)
  /** A pinch on the stilled flank widened back past shut: the count starts over. */
  | ({ type: "cystSlip"; side: 0 | 1 } & CystColEvent)
  /** A flank cracked. */
  | ({ type: "cystCrack"; side: 0 | 1 } & CystColEvent)
  /** A stilled flank's time ran out before the pinch counted: it springs wide, to be tried again. */
  | ({ type: "cystSpring"; side: 0 | 1 } & CystColEvent)
  /** Both flanks cracked and the core lies bare. */
  | ({ type: "cystBare" } & CystColEvent)
  /** The core shot in its colour; `hits` is how many it has taken. */
  | ({ type: "cystHit"; hits: number } & CystColEvent)
  /** A guard made: the flank held off the core, which lies bare. */
  | ({ type: "cystGuard"; side: 0 | 1 } & CystColEvent)
  /** A guard missed: the flank closes over the core, to be held off again. */
  | ({ type: "cystSeal"; side: 0 | 1 } & CystColEvent)
  /** A step ran out unanswered — the core unshot, a swell let go, a spore unturned, a bud unshot: the hull takes it. */
  | ({ type: "cystMiss" } & CystColEvent)
  /** A swell held: both flanks kept shut together its beats, and the sac sinks back. */
  | ({ type: "cystClench" } & CystColEvent)
  /** A spore turned by the shield under its column. */
  | ({ type: "cystTurn" } & CystColEvent)
  /** A bud shot in its colour over its column, and burst. */
  | ({ type: "cystPop" } & CystColEvent)
  /** The script is done and the sac splits wide. */
  | ({ type: "cystSplit" } & CystColEvent)
  /** The split sac has fallen `cystSplitBeats`; the wave may end. */
  | ({ type: "cystOut" } & CystColEvent);
