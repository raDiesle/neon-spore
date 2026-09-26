import type { ViseAsk } from "./vise.js";

/**
 * What THE VISE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The case hangs over the middle, so every one is there; the ones
 * about a lobe say which with `side`, the pilot's nought and the navigator's
 * one. The seed's burst is the one heard off the middle, over its column.
 */

interface ViseColEvent {
  /** The column it happened over. */
  col: number;
}

export type ViseEvent =
  /** The case settles into frame, both lobes whole. */
  | ({ type: "viseEnter" } & ViseColEvent)
  /** A step lit: a lobe to pinch, a shot at the kernel, or both lobes to hold off it. */
  | ({ type: "viseLight"; ask: ViseAsk } & ViseColEvent)
  /** A pinched gap widened back past shut in a lit pinch step: the count starts over. */
  | ({ type: "viseSlip"; side: 0 | 1 } & ViseColEvent)
  /** A seam cracked; `cracks` is how many that lobe has now. */
  | ({ type: "viseCrack"; side: 0 | 1; cracks: number } & ViseColEvent)
  /** A one-lobe pinch step ran out: the gap springs wide, to be tried again. */
  | ({ type: "viseSpring"; side: 0 | 1 } & ViseColEvent)
  /** Both lobes split open and the kernel lies bare. */
  | ({ type: "viseBare" } & ViseColEvent)
  /** The kernel shot in its colour; `hits` is how many it has taken. */
  | ({ type: "viseHit"; hits: number } & ViseColEvent)
  /** Both lobes held off the kernel. */
  | ({ type: "viseBrace" } & ViseColEvent)
  /** A `both` step ran out: the lobes close over the kernel, to be held open again. */
  | ({ type: "viseCover" } & ViseColEvent)
  /** The bite met by the shield under the case. */
  | ({ type: "viseBlock" } & ViseColEvent)
  /** The spat seed shot in its colour, over the column it hung over. */
  | ({ type: "viseSeedBurst" } & ViseColEvent)
  /** A shot, bite or seed ran out unanswered: the hull takes it. */
  | ({ type: "viseMiss" } & ViseColEvent)
  /** The script is done and the case splits down its spine. */
  | ({ type: "viseSplit" } & ViseColEvent)
  /** The split case has fallen `viseSplitBeats`; the wave may end. */
  | ({ type: "viseOut" } & ViseColEvent);
