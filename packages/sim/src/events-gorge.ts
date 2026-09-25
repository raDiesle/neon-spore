import type { Color } from "./types.js";

/**
 * **Everything THE GORGE does that neither screen already says**, as events.
 *
 * Its own file on `events-warden.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * What every intake holds, in what colour, which are ruptured and which is
 * the mouth are all read off `GorgeState` every frame (`gorge.ts`). What is
 * *not* in the world a frame later is the moment a bead went in, the moment
 * one came out, the pierce, the vent, the spit — so each of these is one such
 * edge, and every one but the last names the column it happened in, because
 * a column is the whole of what the pair has to say to each other.
 */

/** A column's worth of THE GORGE, for the events that name one. */
interface GorgeColEvent {
  /** The column the intake hangs over. */
  col: number;
}

export type GorgeEvent =
  /** The sack is in and settled across `col` onward, its intakes empty. */
  | ({ type: "gorgeSettle"; width: number } & GorgeColEvent)
  /** A shot went in and hangs as a bead of `color`; `beads` is the intake's tally now. */
  | ({ type: "gorgeSwallow"; color: Color; beads: number } & GorgeColEvent)
  /** The wrong colour went in and took a bead back out; `beads` is what is left. */
  | ({ type: "gorgeEmptied"; beads: number } & GorgeColEvent)
  /** The intake came full in `color`: transparent, and the vent counting. */
  | ({ type: "gorgeFull"; color: Color } & GorgeColEvent)
  /** A full intake was pierced and hangs open for good; `left` is how many can still be. */
  | ({ type: "gorgeRupture"; left: number } & GorgeColEvent)
  /** A full intake took a shot of the `gorgeVentShots` and held; `owed` more rupture it. */
  | ({ type: "gorgeNick"; color: Color; owed: number } & GorgeColEvent)
  /** A full intake nobody pierced let go: a torch down `col`, and the intake empty. */
  | ({ type: "gorgeVent" } & GorgeColEvent)
  /** A bead returned down its own column as a body of `color`. */
  | ({ type: "gorgeSpit"; color: Color } & GorgeColEvent)
  /** The intake over `col` is the mouth, filling itself in `color`: the beam ends it. */
  | ({ type: "gorgeMouth"; color: Color } & GorgeColEvent)
  /** The beam stood in the mouth's column: `beads` leave at once, and the fight is over. */
  | ({ type: "gorgeOut"; beads: number } & GorgeColEvent)
  /** Player 1's thumb closed on a full intake: its vent held off while the thumb stays. */
  | ({ type: "gorgePinch" } & GorgeColEvent)
  /** Player 2's thumb pried the mouth open: for `gorgePryBeats`, the beam can end it. */
  | ({ type: "gorgePry" } & GorgeColEvent)
  /** A beam of `color` went into the pried mouth and it held; `owed` more end the fight. */
  | ({ type: "gorgePryFill"; color: Color; owed: number } & GorgeColEvent)
  /**
   * The mouth clenched: on a beam with no thumb prying it, which went in as
   * nothing, or on a thumb held past its window, thrown off with a bead spat.
   */
  | ({ type: "gorgeClench" } & GorgeColEvent);
