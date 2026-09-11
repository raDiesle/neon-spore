/**
 * **Every thing on this field a hand may take hold of**, as a closed list of
 * names, with the argument for each of them beside it.
 *
 * Cut out of `command-types.ts` when THE BALLOON's pair took that file over its
 * 250-line limit, along the seam that file's own header draws one level down:
 * next door is the shape of a **press** — the flat union a replay is a list of
 * — and this is the vocabulary its one draggable arm is written in. It is also
 * the half that grows: the union has not gained a member in a while, and this
 * list has gained one for nearly every creature with a handle on it.
 *
 * `command-types.ts` re-exports `DragTarget`, so nothing that already reached
 * for one through that file had to move.
 */

/** The draggable elements: one name per thing a hand may take hold of. A closed
 * list rather than a creature id, because THE MAZE's string is not a creature —
 * a drag that could only name one could not reach the first thing that wanted
 * it, and THE WARDEN's rope is one that is. THE LID's cord is the third, and
 * the first that is *many*: the target says what kind of handle this is and
 * `id` above says which body it hangs off. */
export type DragTarget =
  | "mazeString"
  | "wardenTether"
  | "lidString"
  | "gripBody"
  | "choirLeft"
  | "choirRight"
  | "balloonLeft"
  | "balloonRight"
  | "crank"
  | "gum"
  | "choke";

/**
 * `choirLeft` and `choirRight` are the fifth and sixth, and the first pair
 * that is one gesture in two places: the two arrows standing against the walls
 * of the field while a membrane is up (`choir-gesture.ts`). Two names rather
 * than one target and a side, for the reason `id` is absent on `mazeString` —
 * there is exactly one of each, so each has exactly one name, and a side
 * carried beside a shared name would be a second, weaker way of saying which
 * arrow the hand is on.
 */

/**
 * `balloonLeft` and `balloonRight` are the seventh and eighth, and the first
 * pair that is one gesture in two **seats**. THE CHOIR's two arrows are one
 * hand making one gesture twice; these are two hands making one gesture once,
 * and which seat may send which is the whole of the coupling — the pilot has
 * the left of every balloon and the navigator the right, always
 * (`balloonHeard`). They carry `id` for THE LID's reason with more riding on
 * it: a wave puts several on the field at once on purpose, and *which one*
 * is the sentence this creature exists to make the pair say.
 */

/**
 * `crank` is the ninth, and the only one that is **not on the field at all**:
 * it is a control on player 1's half of the band, turned rather than pressed,
 * and what it winds is THE CLAW's arm back down its column (`crank.ts`).
 *
 * It carries no `id` — there is one crank and it is a fixture of the panel —
 * and it is the one target whose `fromMilli` is not a distance. A hand going
 * round a circle is back where it grabbed once a turn, so what it reports is
 * its **bearing**, in thousandths of a turn clockwise from the top, and the
 * simulation turns the step between two of them into rope. The reasoning, at
 * length, is in `crank.ts`'s own header.
 */

/**
 * `gum` is the tenth, and the second that is **player 2's** after
 * `balloonRight` — and the first handle that is the whole body rather than a
 * thing hanging off it: a stuck gum is swiped where it sits on the ship
 * (`gum.ts`). It carries `id` for THE LID's reason, a wave may drop several,
 * and its `fromMilli` is a distance across the hull, signed the way the field
 * is: toward the nearer wall flings it and away from that wall spreads it.
 */

/**
 * `gripBody` is the fourth and the first that is not a handle at all: it is
 * **the body the grip is already holding**, carried sideways. The hold that
 * sends it is a `grip` rather than a `drag` (`render/touch-hold.ts`) — one
 * hold, two gestures, exactly as a press on the cannon that slides it and a
 * lift that opens the maw are one hold and two controls. `id` says which body,
 * for THE LID's reason: a wave may have several on the field and either seat
 * may have a hand on a different one.
 */

/**
 * `choke` is the eleventh, and the second that is not on the field: it is
 * **player 1's own cannon strip**, while THE CHOKE has the cannon by the
 * throat (`choke.ts`). A press on the strip then is not a column — the strip
 * answers nobody — so the panel sends a grab on the choke instead, and what
 * the simulation counts is the *grab*, not the distance: one tap per hand
 * that lands, with a lift between. `fromMilli` is carried and ignored, which
 * is what makes it a tap rather than a swipe. It carries `id` for THE LID's
 * reason, though a wave is unlikely to have two on the cannon at once.
 */
