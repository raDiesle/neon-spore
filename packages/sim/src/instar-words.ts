/**
 * **The words THE INSTAR's script is written in**: whose thumb, which part,
 * which gesture, which pose, which flight, which phase — and the step and the
 * mark they make up. Cut from `instar.ts` on 25 September 2026 at its line
 * limit, at the seam between what a script *says* and what the scene *does*
 * with it; `instar.ts` re-exports every name, so nobody imports from here.
 */

/** Whose thumb a mark wants. Geometry, not colour, says which seat is which
 * (the choreographed page's rule); every mark is drawn the same red the owner
 * asked for by name. */
export const INSTAR_SEATS = ["p1", "p2", "both"] as const;
export type InstarSeat = (typeof INSTAR_SEATS)[number];

/** The parts of the body a mark can sit on — each one a threat if its mark
 * is left undone, which is what the strike is named after. `eye` is last
 * because the hash names a part by its place in this list (`instar-hash.ts`):
 * the lunge's second visit strikes the right eye while the brow is held. */
export const INSTAR_PARTS = ["jaw", "hand", "eggs", "tongue", "tail", "head", "eye"] as const;
export type InstarPart = (typeof INSTAR_PARTS)[number];

/**
 * The six gestures, and what `need` counts for each:
 * `pullDown`/`pullUp` — thousandths of a tile the thumb must carry the part,
 * and hold there; `tap` — presses; `swipeDown` — carries past
 * `instarSwipeMilli` that end in a lift; `turn` — thousandths of a turn wound
 * clockwise; `hold` — beats the mark's own thumbs stay on it: both seats' on a
`both` mark, one seat's on its own.
 */
export const INSTAR_GESTURES = ["pullDown", "pullUp", "tap", "swipeDown", "turn", "hold"] as const;
export type InstarGesture = (typeof INSTAR_GESTURES)[number];

/** The poses the body morphs between, one per step, named for the picture:
 * the jaws open on a fire it is about to breathe, its side with the brood on
 * its back, its tail swung at the ship, its head thrust down at the ship to
 * butt it, and its tail wound up high over the back to spring. A pose may
 * come round again in a later step with other marks on it; the list is the
 * pictures, not the steps. */
export const INSTAR_POSES = ["breath", "brood", "lash", "lunge", "coil"] as const;
export type InstarPose = (typeof INSTAR_POSES)[number];

/**
 * **How the body comes into a pose**, over the step's `morphBeats` with the
 * marks hidden — the owner's choreography of 25 September 2026. `approach` is
 * the entrance: small and far off, flying in at the ship until it fills the
 * field. `passes` flies it out of the frame and across twice before it comes
 * in to stay. `cross` takes it out one side and back in from the other.
 * `stay` does not fly at all: the body is where the last step left it, and
 * the morph is only the pose coming back — the jaws forced open again after
 * a bite, the second and third time of three (the owner, 25 September 2026:
 * *the dragon tries to keep mouth open and it tries to push back*). Last in
 * the list because the hash names an arrival by its place.
 *
 * The flight is the picture's, drawn in `packages/render`; the simulation
 * only knows the morph takes its beats. It is authored here because a script
 * is the whole of the scene, and two devices handed different flights would
 * be showing different scenes.
 */
export const INSTAR_ARRIVALS = ["approach", "passes", "cross", "stay"] as const;
export type InstarArrival = (typeof INSTAR_ARRIVALS)[number];

/** Where the scene is: the body morphing with its marks hidden, the marks up
 * and the window open, the beat landed and the body settling, or beaten. */
export const INSTAR_PHASES = ["morph", "act", "land", "down"] as const;
export type InstarPhase = (typeof INSTAR_PHASES)[number];

export interface InstarMark {
  seat: InstarSeat;
  part: InstarPart;
  gesture: InstarGesture;
  /** Where on the field it sits, in thousandths of the field's width and height. */
  xMilli: number;
  yMilli: number;
  /** How much, in the gesture's own unit (`INSTAR_GESTURES`). Never nought. */
  need: number;
}

/** One beat of a choreographed scene: a pose, its marks and its three clocks. */
export interface BossSequenceStep {
  pose: InstarPose;
  /** How the body flies into the pose while it morphs. */
  arrive: InstarArrival;
  /** Beats the body takes to morph into the pose, marks hidden. */
  morphBeats: number;
  /** Beats the marks stay up before the undone part strikes. */
  windowBeats: number;
  /** Beats the landed beat plays out before the next morph. */
  landBeats: number;
  /** **How hard the part pushes back against a pull**, in thousandths of a
   * tile a beat: every beat a thumb is on a `pullDown`/`pullUp` mark, the
   * part takes back this much of the carry, and the thumb has to go that much
   * further to stand where it stood — a jaw already shut opens again under
   * it, so a pull done early and left waiting for its partner is lost. The
   * owner, 25 September 2026: *pulling it is required to be stronger*.
   * Absent is nought: the part stays where the thumb puts it. */
  pushMilli?: number;
  marks: readonly InstarMark[];
}

/** What a wave authors: the script, and nothing else. */
export interface InstarEntry {
  kind: "instar";
  steps: readonly BossSequenceStep[];
}
