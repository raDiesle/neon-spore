/**
 * **What a finished capture prints**, which is the half of the tick fix that a
 * flag's own meaning cannot carry.
 *
 * `--ticks` is an absolute `world.tick` now (`spec.ts`), but a strip's steps
 * are still relative to it, so the tick of every frame after the first is a
 * number nobody wrote anywhere — and reading a frame against the wrong tick is
 * the failure this whole fix is about. So every line that names a file names
 * the tick it was taken at as well.
 */
export function tickNote(at: number | undefined): string {
  return at === undefined ? "" : `  (world.tick ${at})`;
}

/** A note, when there is one. `heldPageNote` answers null for the ordinary
 * case, which is every capture that is not a strip of a rehearsal. */
export function say(note: string | null): void {
  if (note) console.log(note);
}

/** One press as it went into the page: the tick it was stamped on, and
 * whether that tick would have heard it — null on a build that cannot say. */
export interface Sent {
  tick: number;
  player: 1 | 2;
  kind: string;
  heard: boolean | null;
}

/**
 * **The presses the simulation refused**, which a picture cannot show.
 *
 * A round in its opening, a seat that does not own the control, a body not yet
 * grown into its grip — each drops a press in silence, and the capture comes
 * back as if no press had been written. `--press 400:1:snakeFire` on SNAKE
 * cost four captures that way before a probe found the morph (`docs/queue.md`,
 * 20 September 2026). Null when every press was heard, or none was asked.
 */
export function pressNote(sent: readonly Sent[]): string | null {
  const refused = sent.filter((s) => s.heard === false);
  if (refused.length === 0) return null;
  const which = refused.map((s) => `${s.tick}:${s.player}:${s.kind}`).join(", ");
  return (
    `  unheard: ${refused.length} of ${sent.length} press(es) changed nothing on the tick ` +
    `they landed — ${which}. The round refused them: a phase that takes no press, ` +
    "or a state the control does nothing in"
  );
}
