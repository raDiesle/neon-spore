import type { DavitAsk } from "./davit.js";

/**
 * What THE DAVIT says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The boom is pivoted mid-hull, so every one is there; the ones about
 * a seat say which with `side`, the pilot's nought and the navigator's one,
 * and the ones about a swing with `swing`, the left nought and the right one.
 */

interface DavitColEvent {
  /** The column it happened over. */
  col: number;
}

export type DavitEvent =
  /** The boom arrives swinging loose, hook empty, pivot dark. */
  | ({ type: "davitEnter" } & DavitColEvent)
  /** A step lit: a swing or a reland steered toward `leanMilli`, or a shot at the pivot. */
  | ({ type: "davitLight"; ask: DavitAsk; leanMilli: number } & DavitColEvent)
  /** A steering lean left its target: the draw it was steering loses its count. */
  | ({ type: "davitDrift"; side: 0 | 1 } & DavitColEvent)
  /** A lift too soon, unsteered, the wrong way or with no swipe: the draw springs slack, the step still lit. */
  | ({ type: "davitSlack"; side: 0 | 1 } & DavitColEvent)
  /** A loose landed on a swing; `looses` is how many that swing has now. */
  | ({ type: "davitLoose"; swing: 0 | 1; looses: number } & DavitColEvent)
  /** A swing step ran out: the boom swings free, to be steered again. */
  | ({ type: "davitSway"; swing: 0 | 1 } & DavitColEvent)
  /** Both swings locked and the pivot lights. */
  | ({ type: "davitPivot" } & DavitColEvent)
  /** The pivot shot in its colour; `hits` is how many it has taken. */
  | ({ type: "davitHit"; hits: number } & DavitColEvent)
  /** The boom relanded under the pivot by `side`'s loose. */
  | ({ type: "davitReland"; side: 0 | 1 } & DavitColEvent)
  /** A reland ran out: the pivot dims, to be relanded. */
  | ({ type: "davitDim" } & DavitColEvent)
  /** A fire step ran out with the pivot unshot: the hull takes it. */
  | ({ type: "davitMiss" } & DavitColEvent)
  /** The script is done and the boom swings hard over, spent. */
  | ({ type: "davitSpent" } & DavitColEvent)
  /** The spent boom has hung `davitSpentBeats`; the wave may end. */
  | ({ type: "davitOut" } & DavitColEvent);
