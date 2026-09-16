/**
 * **Everything THE STARE does that neither screen already says**, as one
 * event.
 *
 * Its own file on `events-splice.ts`' terms exactly — one boss taken apart
 * rather than incidents that share a body — and one arm of `SimEvent`, so
 * every consumer still switches over the whole list. It is a file rather than
 * one more line in `events.ts` because that file had come back to its 250-line
 * limit, which is where the last boss left it.
 *
 * **One event, and it is the failure.** Everything else about this boss is
 * already on both screens as world: where the eye is in its cycle, how much of
 * the turn is left and which seat it settled on are all read off `StareState`
 * every frame (`stare.ts`). What is *not* in the world a frame later is the
 * moment a watched thumb landed anyway — so that is the one thing worth an
 * event, and it is the one thing the pair will argue about afterwards.
 */

/**
 * THE STARE caught a seat pressing something while it was being looked at.
 *
 * `control` is the command's own kind rather than a button id, because what
 * was pressed reached the simulation as a verb and the panel it came from is
 * the picture's business — a swipe on the hull and the strip under it send
 * the same `cannonCol`, and the pair wants to be told *you moved*, not which
 * of the two doors it came through (`stare-step.ts`).
 */
export type StareEvent = { type: "stareCaught"; player: 1 | 2; control: string };
