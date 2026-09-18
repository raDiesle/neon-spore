/**
 * **Every thing on this field a hand may take hold of, the second page** — the
 * names from THE FLEET's chart on.
 *
 * Cut when THE VANE's two hands would have put `drag-targets.ts` six lines over
 * its 250-line limit, the way `bosses-clocks-b.ts` was cut off the boss barrel:
 * that file's own header calls this union *the half that grows*, and it has
 * grown by a boss's worth of hands three times in a week. The seam is the order
 * the targets were added in and nothing depends on it — `drag-targets.ts`
 * unions this in, so `DragTarget` is one name and nothing that reaches for it
 * knows there are two pages.
 */
export type DragTargetB =
  | "fleetBreach"
  | "fleetRake"
  | "fleetWreck"
  | "vaneArm"
  | "vaneHousing"
  | "snakeJaws"
  | "snakeTail"
  | "pinPlunger"
  | "pinTable"
  | "scoutLine"
  | "scoutPrime"
  | "pulseMeter"
  | "batonSocket"
  | "undertowPin"
  | "undertowFree";

/**
 * `fleetBreach`, `fleetRake` and `fleetWreck` are the twenty-seventh, -eighth
 * and -ninth, and the first three that are one gesture per *state*: her hold on
 * the plume of a holed hull, his rake along the hull from the hole, her pull
 * down the wreck's reach (`fleet-hand.ts`). No `id`: one hull is holed at a
 * time.
 *
 * `vaneArm` and `vaneHousing` are the thirtieth and thirty-first, one a phase:
 * the pilot's thumb resting on the sweeping arm, which stops it where it stands
 * and with it the fold line every arrival is bent about, and the navigator's
 * carry off the seized housing (`fromYMilli`, as THE WARDEN's hatch is read).
 * No `id`, for `mazeString`'s reason: there is one arm and one housing on it.
 * They are the first pair on a boss whose whole body is a *mechanism* rather
 * than a creature, so a hand on either is a hand on the thing deciding where
 * the wave lands — which is why the pin is in `hashWorld` (`vane-hash.ts`).
 */

/**
 * `snakeJaws` and `snakeTail` are the thirty-second and -third, and the first
 * two on a **round** rather than on a field boss: the arena is not the field
 * and the body is the whole of the picture in it. Past `snakeGorgeTiles` the
 * jaws stick and player 1 prises them apart on the head (`fromYMilli` against
 * `snakeJawsMilli`) in place of the MAW press, which from there does nothing;
 * past `snakeShedTiles` player 2 rests a thumb on the tail and its last
 * `snakeTailTiles` come off the arena while she keeps it there
 * (`snake-controls.ts`). No `id`: there is one body, and both ends of it are
 * named rather than numbered.
 */

/**
 * `pinPlunger` and `pinTable` are the thirty-fourth and -fifth, and the second
 * round to be given hands on its own picture. A launch above
 * `pinballHardMilli` leaves the spring slack and player 1 has to carry the
 * plunger back (`fromYMilli` against `pinballWindMilli`) before the bar will
 * run again; through a flight player 2 may shove the table sideways
 * (`fromMilli`, whose **sign is the direction** — the one place in this union
 * a carry's direction is the whole of what it says), once, and a second shove
 * tilts it (`pinball-hand.ts`). No `id`: one plunger and one table.
 */

/**
 * `scoutLine` and `scoutPrime` are the thirty-sixth and -seventh, and the pair
 * that comes closest to breaking a round's own split without doing it. Player
 * 2 cannot move the little ship by a thousandth of a tile and still cannot:
 * her thumb on the line pulls it **straight home** and nowhere else, at under
 * half its own top speed, with player 1's hands dead while it runs. His is a
 * carry on the ship itself (`fromYMilli` against `scoutPrimeMilli`) that lights
 * a thruster three motes have made labour (`scout-hand.ts`). No `id`: one ship
 * and one line onto it.
 */

/**
 * `pulseMeter` is the thirty-eighth, and the first target **both seats may
 * take hold of at once**. THE PULSE splits nothing in its verbs, so what it
 * gained a hand on is the one object in the game the pair owns together: the
 * meter. Under `flutter` a thumb on it takes that seat out of the song and
 * softens the other's misses; under `arrest` only both thumbs at once put
 * anything back into it (`pulse-hand.ts`). It carries nothing but `on`, for
 * `gaugeBand`'s reason — where on the bar a thumb landed says nothing the
 * round wants.
 */

/**
 * `batonSocket` is the thirty-ninth, and the first handle whose **seat is
 * decided by the beat**. THE BATON locks the seat that just acted out of the
 * ship for a beat, and that beat was empty; now it is the only beat in which
 * that seat may reach the arm. `id` names the socket, and the stage says what
 * a thumb there means: under `passing` a press on the socket whose shell is
 * swelling strips it off clean, and only from the locked seat — the other's is
 * refused with a sound, since both screens draw the arm and the seat can see
 * what it was refused. Under `merging` it is a thumb on one of the two beads,
 * player 1's on the upper and player 2's on the one that waited, and only both
 * at once draw them into one (`baton-hand.ts`). It carries nothing but `on` and
 * `id`: where on a socket a thumb landed says nothing the fight wants.
 */

/**
 * `undertowPin` and `undertowFree` are the fortieth and forty-first, and the
 * first pair on a boss that is **under** the floor: both are the navigator's,
 * and both are on the hull itself rather than on her panel, because the hull
 * is the only part of that fight either seat can point at
 * (`undertow-hand.ts`).
 *
 * `undertowPin` is a second plate, made of a thumb. Held on a lobe standing
 * in the hull it stops that breach widening exactly as the shield does, and —
 * for the same reason the shield does — **keeps the maw out of the column**,
 * so the pair has to say *let go* before he can take it. `id` is the column,
 * which is the whole of what the hand says; there is one pin, and a thumb
 * landing on a second lobe moves it.
 *
 * `undertowFree` is the one hand in this game that **gives a seat back**. The
 * floor comes up under the cannon and a pilot who did not slide off is dead
 * for `undertowUnseatedBeats`; her thumb held on his column for
 * `undertowFreeBeats` hauls the plate off him and he is his own again. It
 * carries nothing but `on`, for `pulseMeter`'s reason — the column is the one
 * the cannon is stuck in, and where on it her thumb landed says nothing the
 * fight wants.
 */
