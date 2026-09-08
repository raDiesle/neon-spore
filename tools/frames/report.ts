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
