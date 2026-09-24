import type { Color } from "./types.js";

/**
 * **Everything THE TASTER does that neither screen already says**, as events.
 *
 * Its own file on `events-gorge.ts`' terms, and one arm of `SimEvent`.
 *
 * Which blades are standing, what each edge is, how thick it is and how far
 * the crest is cut are all read off `TasterState` every frame (`taster.ts`).
 * What is **not** in the world a frame later is the moment a blade started
 * growing, the moment its colour set, the shot that thickened it, the shear,
 * the cut, the shiver along the crest when the majority flipped — so each of
 * these is one such edge.
 *
 * Every one of them but three names a column, because a column is a blade and
 * a blade is what the pair has to say to each other. The three that do not are
 * the three that are about the **whole fan**: the crest opening for good, the
 * re-edge, and the interlock — and a re-edge that named a column would be
 * eleven sounds on one beat.
 *
 * **The three hands have one event each and no more** (`taster-hand.ts`). What
 * a thumb is *doing* — which blade it holds, how far it has carried the crest
 * or the interlock — is on the boss and drawn off it every frame; what is gone
 * a frame later is the moment it took hold, the moment a carry spent its cut,
 * and the moment the interlock came apart. A hand that lets go says nothing:
 * the picture stops showing it, which is the whole of the news. The cut a wipe
 * makes is a `tasterCrest` like any other, because it **is** one — the hand is
 * a second way to make the same cut, and the ear should not have to learn two
 * meanings for one thing happening (`tasterWipe` is the thumb, not the cut).
 */

/** A blade's column, for the events that name one. */
interface TasterColEvent {
  /** The column the blade stands over. */
  col: number;
}

export type TasterEvent =
  /** The crest is in and settled across `col` onward; `width` blades to come. */
  | ({ type: "tasterRise"; width: number } & TasterColEvent)
  /** A blade is out of the crest and growing, with no colour yet. */
  | ({ type: "tasterGrow" } & TasterColEvent)
  /** Its edge **set** to `color`: the tell, and the beat THE SLOW holds. */
  | ({ type: "tasterSet"; color: Color } & TasterColEvent)
  /** Its own colour went in and widened the edge; `layers` is what it takes now. */
  | ({ type: "tasterThick"; layers: number } & TasterColEvent)
  /** The other colour took one layer off a thickened blade; `layers` is what is left. */
  | ({ type: "tasterPare"; layers: number } & TasterColEvent)
  /** The blade is struck off; `left` is how many are still standing. */
  | ({ type: "tasterShear"; left: number } & TasterColEvent)
  /** A shot went into the soft crest where a blade used to be; `cuts` so far. */
  | ({ type: "tasterCrest"; cuts: number } & TasterColEvent)
  /** The crest is cut through: the fan can never re-edge itself again. */
  | { type: "tasterLift" }
  /** The majority flipped and every standing blade re-edged to `color`. */
  | { type: "tasterTaste"; color: Color }
  /** The last blades interlock over the body: no single bolt touches them. */
  | ({ type: "tasterClose"; left: number } & TasterColEvent)
  /** A bolt the interlock turned away. */
  | ({ type: "tasterRefused" } & TasterColEvent)
  /** The pilot's thumb down on a growing blade: it cannot decide while he holds it. */
  | ({ type: "tasterPin" } & TasterColEvent)
  /** The navigator's thumb carried across a soft column: the cut it made is a `tasterCrest`. */
  | ({ type: "tasterWipe" } & TasterColEvent)
  /** The interlock carried apart: it stands open `tasterPryBeats`, and only then does the beam reach. */
  | ({ type: "tasterPry" } & TasterColEvent)
  /** A right beam of `color` into the pried interlock, and it held; `owed` more open the fan. */
  | ({ type: "tasterPryFill"; color: Color; owed: number } & TasterColEvent)
  /** The beam in the colour it never tasted: the fan unlocks outward, and it is over. */
  | ({ type: "tasterOut"; color: Color } & TasterColEvent);
