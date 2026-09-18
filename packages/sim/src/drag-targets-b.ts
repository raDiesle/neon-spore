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
  | "pinTable";

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
