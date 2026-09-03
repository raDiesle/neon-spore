/**
 * THE GHOST's camouflage: the thing it is wearing instead of being invisible.
 *
 * **Invisible is what player 1 gets, and it is not a picture.** Player 2 has
 * to be able to see this body well enough to read a column off it in under a
 * second, so the disguise on their screen cannot be transparency — it has to
 * be something that plainly *is* a body and plainly is not sitting still in
 * the frame. What that looks like is torn horizontal bands: slabs of the body
 * shifted sideways against each other, and a scatter of the same slabs thrown
 * clear of the outline entirely, as though the field behind it had kept a few.
 *
 * **It is deterministic, from the body's own id.** Two phones draw one ghost
 * the same way for the reason every other wobble in this package does — the
 * pair says "the torn one on four" across a voice delay, and a picture that
 * differed between the seats would make that sentence a lie. `slabAt` is the
 * whole of the randomness: an id, a slab number and the wall clock in, a
 * displacement out, and nothing anywhere holds state between frames.
 *
 * **It gets worse as the thing gets angry.** `rage` is `ghostRage` — how far
 * through its temper a crossing ghost is — and it is the one input here that
 * is not a clock: wider throws, more of them, and a reach outside the body
 * that grows until the last turn, when the whole disguise comes off and the
 * body dives. A falling ghost sits at zero and never changes.
 *
 * **`slabAt` has a second reader, and only that one.** THE WISP's bands
 * (`wisp-static.ts`) borrow the jitter and nothing else: one copy of the
 * three-frequency trick rather than two that drift apart. What they do with it
 * is the opposite of what happens below — a ghost's bands all stay and slide,
 * a wisp's hold their place and drop out — so the two creatures never read as
 * one treatment. Everything from `Slab` down is this creature's alone.
 */

/** How many bands the body is cut into. Enough to read as torn, few enough
 * that each one is a slab rather than a scanline at 26 px. */
const BANDS = 7;

/**
 * One band's sideways throw, as a share of the body's half-width.
 *
 * Three frequencies with no common period, spread by the id and the band
 * number, so a body never settles into a rhythm and two ghosts on one field
 * are never one picture drawn twice. The same argument `TREMBLE` makes in
 * `content/motions.ts`, and the same shape of answer.
 */
export function slabAt(id: number, band: number, time: number, rage: number): number {
  const k = id * 0.7 + band * 1.37;
  const jitter =
    Math.sin(time * 5.3 + k * 2.1) * 0.5 +
    Math.sin(time * 8.9 + k * 3.7) * 0.3 +
    Math.sin(time * 2.3 + k * 1.1) * 0.2;
  // A band is still most of the time and thrown for a moment, which is what
  // makes it read as a glitch rather than as a body shivering: the fourth
  // power keeps the small values small and leaves the peaks alone.
  const gate = Math.abs(Math.sin(time * 1.7 + k)) ** 4;
  return jitter * gate * (0.35 + rage * 0.65);
}

/** Whether this band is one of the few thrown clear of the body this frame. */
export function slabIsLoose(id: number, band: number, time: number, rage: number): boolean {
  return Math.abs(slabAt(id, band, time, rage)) > 0.42 - rage * 0.2;
}

/**
 * The bands, top to bottom, each as a fraction of the body's height: where it
 * starts, how tall it is, and how far sideways it is thrown.
 *
 * Returned as data rather than drawn here so that the body's fill, the loose
 * shards outside it and the shape sheet can all be laid out from one list —
 * a second copy of where a band is would show as a shard that belongs to no
 * tear.
 */
export interface Slab {
  /** −1 at the top of the body, 1 at the bottom. */
  top: number;
  height: number;
  /** Sideways throw, as a share of half-width. */
  shift: number;
  loose: boolean;
}

export function slabs(id: number, time: number, rage: number): Slab[] {
  const out: Slab[] = [];
  const height = 2 / BANDS;
  for (let band = 0; band < BANDS; band++) {
    out.push({
      top: -1 + band * height,
      height,
      shift: slabAt(id, band, time, rage),
      loose: slabIsLoose(id, band, time, rage),
    });
  }
  return out;
}
