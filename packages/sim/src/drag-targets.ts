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
  | "orreryRing"
  | "sinewLeft"
  | "sinewRight"
  | "surgeBulb"
  | "antiphonOrgan"
  | "instarMark"
  | "filament";

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
 * **There used to be a `gum` target**, the tenth, player 2's, and the first
 * handle that was the whole body: a gum stuck to the ship was swiped where it
 * sat. The owner took the sticking out on 14 September 2026 — a gum is
 * swiped in the air now, and that is `gripBody` below, the carry every hand
 * on the field already reports (`gum.ts`).
 */

/**
 * `orreryRing` is the tenth, and it is the crank's gesture put back on the
 * field: a bearing in thousandths of a turn, reported by a thumb going round
 * one of THE ORRERY's orbits (`orrery-hand.ts`). It is the second target in
 * this list that is not a distance, and the first that is a bearing on
 * something the field is carrying rather than on a control of the panel.
 *
 * It carries no `id`, and the reason is this boss's own: **the hand never
 * names the ring.** Which ring answers is the outermost one still standing,
 * which is the boss's business and not the thumb's — and it has to be, because
 * two of the three rings are drawn as a blank grey arc on one of the two
 * screens, so a hand that named a ring could name one it cannot see.
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
 * `sinewLeft` and `sinewRight` are the eleventh and twelfth, and they are the
 * balloon's pair put on a fixture: one gesture in two **seats**, player 1's
 * on the left of THE SINEW's mass and player 2's on the right, always
 * (`sinew-hand.ts`). What is new is the axis — these are pulled **down**, and
 * `fromYMilli` is the depth, the first handle in this list to be read on the
 * y — and what the two report is **added**: a sum on a band neither seat can
 * read whole, which is the first magnitude the pair has ever had to say to
 * each other. No `id`, for `orreryRing`'s reason: there is one tendon, and it
 * is the boss.
 */

/**
 * `surgeBulb` is the thirteenth, and the first handle **both seats** take
 * hold of at once and the first whose gesture is the *lift*. A thumb
 * anywhere on THE SURGE's bulb charges it, from either phone, and the wire
 * says whose (`Command.player`); the press reports nothing — no depth, no
 * sway — and the `on: false` a lift already sends is the whole command
 * (`surge-hand.ts`): the second lift inside a beat of the first is what the
 * pressure is judged on. No `id`, for `orreryRing`'s reason: one bulb, and
 * it is the boss.
 */

/**
 * `antiphonOrgan` is the fourteenth, and the first that is **an aid rather
 * than an action**: a thumb resting on THE ANTIPHON's organ turns it slowly
 * in place and lifting stops it, and nothing about the fight is changed by
 * it — what is bought is a second viewing angle on a shape one seat has to
 * describe to the other (`antiphon-hand.ts`). The press reports nothing but
 * `on`, like the bulb's, and either seat may send it; the organ is drawn on
 * the pilot's screen alone, so his is the thumb that finds it. No `id`, for
 * `orreryRing`'s reason: whatever stands turns, and it is the boss.
 */

/**
 * `instarMark` is the fifteenth, and the first that is **many gestures on
 * one name**: every mark on THE INSTAR's body is this target with `id`
 * naming which, and what the thumb is to do there — tap, pull, swipe, turn,
 * hold — is the mark's own, authored in the script and read by the
 * simulation off the fields a drag already carries (`instar-hand.ts`). It is
 * the panel of a boss with no control set at all, which is why one name and
 * not six: the hand reports what it did, and the mark decides what that was
 * worth. Which seat may send which is the mark's too, and the wrong one is
 * refused with a sound rather than dropped in silence.
 */

/**
 * `filament` is the sixteenth, and the first that is a **trace**: a drag
 * whose grab is at a tile the simulation already knows — THE FILAMENT's head
 * for the pilot, its tail for the navigator — so the displacement it carries
 * resolves to a tile of the field, and the tile is either the next one on
 * the filament or nothing (`filament-hand.ts`). No `id`, because there is
 * one line lit at a time and both thumbs are on it; which seat is which is
 * the seat's. `TraceDrag` on the design page is this member and the head
 * and tail it is read against, hashed (`filament-hash.ts`).
 */
