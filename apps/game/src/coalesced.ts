/**
 * Every position a `pointermove` actually carries, not just the last one.
 *
 * The browser does not hand this app a move per sample. It coalesces them to
 * roughly one event per animation frame, and the samples in between are kept
 * on the event for whoever asks — `getCoalescedEvents` — which nothing in this
 * repository did. So the true rate on a gesture that reads a *bearing* was
 * ~60 Hz, and `MAX_BEARING_STEP` is built on the opposite assumption: its own
 * comment says a real finger reports many times a second and cannot cover half
 * a circle between two of them (`sim/bearing.ts`). Half a turn of a small
 * crank inside 16.7 ms is a flick a thumb can make, and a step past the mark
 * is read as that much of a turn **the other way** — the winch pays out while
 * the hand is winding in.
 *
 * It costs nothing on the cannon and the shield, which report a column and are
 * idempotent: the same column sent four times is the same column. The gain is
 * entirely on the gestures that read a bearing — the crank, THE INSTAR's
 * `turn` mark and THE GIMBAL's rings.
 *
 * **The fallback is the event itself, twice over.** The method is absent in
 * older browsers and in the fake DOM a test drives, and it is specified to
 * return an empty list for an event a script dispatched — so an empty answer
 * is treated as no answer rather than as "this move carried no positions",
 * which would drop the gesture entirely.
 */

/** The least an event has to be for the pointer path to be read out of it. */
export interface Sampled {
  clientX: number;
  clientY: number;
  getCoalescedEvents?: () => { clientX: number; clientY: number }[];
}

/** The positions this move carries, oldest first, never empty. */
export function samplesOf(e: Sampled): { clientX: number; clientY: number }[] {
  const coalesced = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : null;
  return coalesced && coalesced.length > 0 ? coalesced : [e];
}
