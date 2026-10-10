import type { DragTargetC } from "./drag-targets-c.js";

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
 * knows there are four pages.
 *
 * **This page is full.** THE LEDGER's four would have put it six lines over,
 * which is what THE VANE's two did to the first, so the same cut was made
 * again: `drag-targets-c.ts` carries the last boss on this page — THE TASTER,
 * whose paragraph went with its names — and every boss from there on. It is
 * the *last* set here that moves, never the one being written, so nobody's
 * comment is ever separated from the names it explains. That page filled in
 * its turn and was cut the same way, onto `drag-targets-d.ts`.
 */
export type DragTargetB =
  | "fleetBreach"
  | "fleetRake"
  | "fleetWreck"
  | "vaneArm"
  | "vaneHousing"
  | "snakeJaws"
  | "pinPlunger"
  | "scoutLine"
  | "scoutPrime"
  | "pulseMeter"
  | "batonSocket"
  | "undertowTap"
  | "throatAim"
  | "throatPump"
  | "curtainHem"
  // THE TASTER's three and THE LEDGER's four, argued beside themselves on the
  // third page: this one filled the way the first did.
  | DragTargetC;

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
 * `snakeJaws` is the thirty-second, and the first on a **round** rather than
 * on a field boss: the arena is not the field and the body is the whole of the
 * picture in it. Past `snakeGorgeTiles` the jaws stick and player 1 prises
 * them apart on the head (`fromYMilli` against `snakeJawsMilli`) in place of
 * the MAW press, which from there does nothing (`snake-controls.ts`). No `id`:
 * there is one body. `snakeTail`, player 2's thumb holding the tail clear of
 * the arena, was the thirty-third until the owner took it out on 6 October
 * 2026.
 */

/**
 * `pinPlunger` is the thirty-fourth, and the second round to be given a hand
 * on its own picture. A launch above `pinballHardMilli` leaves the spring
 * slack and player 1 has to carry the plunger back (`fromYMilli` against
 * `pinballWindMilli`) before the bar will run again (`pinball-hand.ts`). No
 * `id`: one plunger. `pinTable`, the shove carried across the table, stood
 * beside it until the owner made the nudge two presses on 10 October 2026
 * (`pinNudge`, `command-round.ts`).
 */

/**
 * `scoutLine` and `scoutPrime` are the thirty-sixth and -seventh, and the pair
 * that comes closest to breaking a round's own split without doing it. Player
 * 2 cannot move the little ship by a thousandth of a tile and still cannot:
 * her thumb on the line pulls it **straight home** and nowhere else, at under
 * half its own top speed, with player 1's hands dead while it runs. His is a
 * thumb held off the ship's stern that lights a thruster the load has made
 * labour, for as long as it stays (`scout-hand.ts`). No `id`: one ship
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
 * `undertowTap` is the fortieth, and the first handle on a boss that is
 * **under** the floor: it is on the hull itself rather than on either panel,
 * because the hull is the only part of that fight both seats can point at.
 * A thumb on a lobe that has grown tall shrinks it back to standing, where
 * its colour's control can take it — and from **either seat**, for
 * `pulseMeter`'s reason: both screens draw the hull, and whoever sees it grow
 * first is the one who should reach (`undertow-press.ts`). `id` is the column,
 * which is the whole of what the hand says.
 */

/**
 * `throatAim` and `throatPump` are the forty-second and -third: THE THROAT's
 * carry and its pump, one to each seat (`throat-hand.ts`).
 *
 * `throatAim` is the navigator's thumb on the mouth, and both its numbers are
 * read: `fromMilli` across and `fromYMilli` down, from where the thumb went
 * down, so the mouth follows the thumb anywhere inside its box. No `id`:
 * there is one mouth.
 *
 * `throatPump` is the pilot's handle, and only `fromYMilli` is read — a
 * stroke is the thumb carried far enough down and then far enough up again,
 * and how quick the strokes come is how wide the mouth sucks.
 */

/**
 * `curtainHem` is the forty-fifth, and the only handle in this union that is
 * a **way past** the fight's own first gesture rather than a gesture of its
 * own standing. THE CURTAIN is shoved along its rail by either seat's hands,
 * and a hit jams that rail for `curtainPinBeats` (`curtain-shove.ts`): while
 * it is jammed the pilot takes the hem under the core's shadow and carries it
 * **up**, `fromYMilli` negated against `curtainLiftMilli` the way THE STARE's
 * lid is read. No `id`: there is one sheet, and it is the boss.
 *
 * What it buys is a gap rather than a phase — the one hold in this union whose
 * whole worth is that it is still held. The core is bare while the hem is at
 * the top and covered the tick it is not (`curtainHemHigh`), so the shot has
 * to be fired into a hand that has not let go. Player 1's alone, for
 * `queenMark`'s reason: the shadow to call is already hers, and the fight
 * ends on the two of them doing different things.
 */
