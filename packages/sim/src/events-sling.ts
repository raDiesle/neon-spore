import type { SlingAim, SlingAsk } from "./sling.js";

/**
 * What THE SLING says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The fork is bolted mid-hull, so every one is there; the ones about
 * an arm say which with `side`, the pilot's nought and the navigator's one.
 */

interface SlingColEvent {
  /** The column it happened over. */
  col: number;
}

export type SlingEvent =
  /** The fork arrives, both arms slack, the cup empty, the yoke dark. */
  | ({ type: "slingEnter" } & SlingColEvent)
  /** A step lit: an arm's draw toward `aim`, a shot at the yoke, or both redrawn. */
  | ({ type: "slingLight"; ask: SlingAsk; aim: SlingAim } & SlingColEvent)
  /** A lift too soon, the wrong way or with no swipe: the arm springs slack, the step still lit. */
  | ({ type: "slingSlack"; side: 0 | 1 } & SlingColEvent)
  /** A draw loosed true; `draws` is how many that arm has now. */
  | ({ type: "slingLoose"; side: 0 | 1; draws: number } & SlingColEvent)
  /** A one-arm draw step ran out: the arm springs back, to be drawn again. */
  | ({ type: "slingSpring"; side: 0 | 1 } & SlingColEvent)
  /** Both arms locked drawn and the yoke lights. */
  | ({ type: "slingYoke" } & SlingColEvent)
  /** The yoke shot in its colour; `hits` is how many it has taken. */
  | ({ type: "slingHit"; hits: number } & SlingColEvent)
  /** Both arms redrawn true under the yoke. */
  | ({ type: "slingSteady" } & SlingColEvent)
  /** A `both` step ran out: the yoke springs loose, to be redrawn. */
  | ({ type: "slingDim" } & SlingColEvent)
  /** A fire step ran out with the yoke unshot: the hull takes it. */
  | ({ type: "slingMiss" } & SlingColEvent)
  /** The script is done and the fork snaps forward, spent. */
  | ({ type: "slingFree" } & SlingColEvent)
  /** The spent fork has fallen away `slingFreeBeats`; the wave may end. */
  | ({ type: "slingOut" } & SlingColEvent);
