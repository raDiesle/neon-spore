import type { CapstanAsk } from "./capstan.js";

/**
 * What THE CAPSTAN says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The drum stands over the middle, so every one is there; the ones
 * about a band say which with `side`, the left nought and the right one.
 */

interface CapstanColEvent {
  /** The column it happened over. */
  col: number;
}

export type CapstanEvent =
  /** The drum settles into frame, rusted, its cradle centred. */
  | ({ type: "capstanEnter" } & CapstanColEvent)
  /** A step lit: a band's mark, the rust creeping back, or the core to shoot. */
  | ({ type: "capstanLight"; ask: CapstanAsk } & CapstanColEvent)
  /** The steering lean rocked the cradle over: `side`'s face is bared to the thumb. */
  | ({ type: "capstanRock"; side: 0 | 1 } & CapstanColEvent)
  /** The steering lean came back inside the mark: the cradle centres, both faces hidden. */
  | ({ type: "capstanDrift" } & CapstanColEvent)
  /** Fresh reversals wore the bared band; `wear` is how many it has taken. */
  | ({ type: "capstanWear"; side: 0 | 1; wear: number } & CapstanColEvent)
  /** A band worn bright for good. */
  | ({ type: "capstanBright"; side: 0 | 1 } & CapstanColEvent)
  /** Both bands bright and the core lies bare. */
  | ({ type: "capstanBare" } & CapstanColEvent)
  /** A hold made: the rust held off, the core bare. */
  | ({ type: "capstanKept" } & CapstanColEvent)
  /** A band window ran out uncracked: the step is tried again, its wear kept. */
  | ({ type: "capstanStall" } & CapstanColEvent)
  /** A hold ran out unmade: the rust closes over the core, to be held off again. */
  | ({ type: "capstanCover" } & CapstanColEvent)
  /** The core shot in its colour; `hits` is how many it has taken. */
  | ({ type: "capstanHit"; hits: number } & CapstanColEvent)
  /** A fire step ran out with the core unshot: the hull takes it. */
  | ({ type: "capstanMiss" } & CapstanColEvent)
  /** The script is done and the cap swings open, spent. */
  | ({ type: "capstanOpen" } & CapstanColEvent)
  /** The spent drum has stood `capstanOpenBeats`; the wave may end. */
  | ({ type: "capstanOut" } & CapstanColEvent);
