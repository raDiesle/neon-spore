import type { FlueAsk } from "./flue.js";

/**
 * What THE FLUE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the ember's column for a tap and a lapse, the middle for the core
 * and the damper. A seat is `side`, nought the pilot.
 */

interface FlueColEvent {
  /** The column it happened over. */
  col: number;
}

export type FlueEvent =
  /** The flue slides into frame with the ember drifting loose. */
  | ({ type: "flueEnter" } & FlueColEvent)
  /** A step lit: a vent, the damper creeping shut, or the core to shoot. */
  | ({ type: "flueLight"; ask: FlueAsk } & FlueColEvent)
  /** The lit vent's rester has sent nothing to the threshold: the ember stops dead. */
  | ({ type: "flueSteady" } & FlueColEvent)
  /** The rester stirred with the ember steady and no tap landed yet: it drifts on. */
  | ({ type: "flueStir"; side: 0 | 1 } & FlueColEvent)
  /** A tap landed on the steady ember; `taps` so far in the vent. */
  | ({ type: "flueTick"; side: 0 | 1; taps: number } & FlueColEvent)
  /** A tap from the tapper that landed nowhere: the ember drifting, or another column. */
  | ({ type: "flueSkid"; side: 0 | 1 } & FlueColEvent)
  /** The rester stirred mid-count: the `taps` landed are lost and the ember drifts on. */
  | ({ type: "flueLapse"; side: 0 | 1; taps: number } & FlueColEvent)
  /** Three taps spent a vent; `vents` so far. */
  | ({ type: "flueVent"; vents: number } & FlueColEvent)
  /** Both vents spent: the core is bared. */
  | ({ type: "flueBare" } & FlueColEvent)
  /** A vent window ran out: the ember drifts on, to be steadied again. */
  | ({ type: "flueChoke" } & FlueColEvent)
  /** Both hands kept off to the threshold: the damper swings back and the core stays bared. */
  | ({ type: "flueHeld" } & FlueColEvent)
  /** A damper window ran out: it shuts over the core until it is held open. */
  | ({ type: "flueShut" } & FlueColEvent)
  /** The core shot in its colour; `hits` is how many it has taken. */
  | ({ type: "flueHit"; hits: number } & FlueColEvent)
  /** A fire step ran out with the core unshot: the hull takes it. */
  | ({ type: "flueMiss" } & FlueColEvent)
  /** The script is done: the damper swings open wide and the ember goes still. */
  | ({ type: "flueSpent" } & FlueColEvent)
  /** The open damper has stood `flueSpentBeats`; the wave may end. */
  | ({ type: "flueOut" } & FlueColEvent);
