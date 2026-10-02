/**
 * Which handle is whose, what it is called on the wire, and what it needs.
 *
 * Split off `hold.ts` on line count when the six handles of `queen-hand.ts`,
 * `filament-hand.ts`, `stare-hand.ts`, `maze-hand.ts` and `throat-hand.ts`
 * arrived (21 September 2026), along the seam that file already had: `hold.ts`
 * reads text and builds commands, and every fact about a *particular* handle —
 * the seat that may send it, the name it goes out under, whether it hangs off
 * a body — is one of these tables. It is the half that grows with the
 * bestiary, and it grew by a third in one lane.
 *
 * **Every row here is read off the simulation's own hand file**, named beside
 * it, and never guessed from the picture: a seat wrong by one is a capture
 * that photographs a thumb the round silently ignored and reports it as the
 * gesture (`docs/queue.md`, 18 September 2026 — THE MAZE's tear was
 * photographed by writing `gripThumb` into the boss instead, which shows the
 * picture and proves nothing about the hand).
 *
 * The rows written one at a time are here; the forty-three that caught the
 * list up with the wire's own on 23 September 2026 are `hold-targets-b.ts`,
 * a table folded into each list below.
 */

import { ROWS } from "./hold-targets-b.js";

const rows = Object.entries(ROWS);

/**
 * The seat a handle is sent from, where it is not the pilot's.
 *
 * A name per thumb rather than a seat flag: THE SURGE, THE INSTAR, THE MIRROR,
 * THE FILAMENT and THE STARE all have **one** target both seats send, so the
 * navigator's is named with a `2` and `TARGET` puts the name back.
 */
export const SEAT: Record<string, 1 | 2> = {
  balloonRight: 2,
  sinewRight: 2,
  surgeBulb2: 2,
  instarMark2: 2,
  mirrorLobe2: 2,
  /** THE WARDEN's eye is player 2's alone (`sim/warden-hand.ts`). */
  wardenEye: 2,
  /** THE ANTIPHON's rail is the navigator's alone (`sim/antiphon-hand.ts`). */
  antiphonRail: 2,
  /** THE FILAMENT: the pilot draws, the navigator follows (`filament-hand.ts`). */
  filament2: 2,
  /** THE STARE's lashes take both seats at once, so they have a name each. */
  stareLash2: 2,
  /** THE MAZE's heart takes either seat's thumb (`maze-hand.ts`); a capture
   * holds the navigator's, one thumb of the two the shake needs. */
  mazeHeart: 2,
  /** THE THROAT's carry is hers; the pump is his (`throat-hand.ts`). */
  throatAim: 2,
  ...Object.fromEntries(rows.flatMap(([name, r]) => (r.seat ? [[name, r.seat]] : []))),
};

/** The name a second seat's thumb goes out under, which is the first's. */
export const TARGET: Record<string, string> = {
  surgeBulb2: "surgeBulb",
  instarMark2: "instarMark",
  mirrorLobe2: "mirrorLobe",
  filament2: "filament",
  stareLash2: "stareLash",
  ...Object.fromEntries(rows.flatMap(([name, r]) => (r.as ? [[name, r.as]] : []))),
};

/**
 * Handles that hang off a body, and so need `id=N` to say which.
 *
 * **Named by the thumb, not by the wire**, so a second seat's name is listed
 * here in its own right: THE HIVE's lobe is one target, and the navigator's
 * pinch reads `id` as the lobe where the pilot's haul reads nothing
 * (`hive-hand.ts`), so an id demanded of both would be a number he types for
 * no reason and one refused of both would be a pinch she cannot aim.
 *
 * THE LID's reason: a wave puts several on the field at once on purpose, and a
 * capture that picked one would be picking it in a tree that cannot see them.
 *
 * THE SCUTTLE's is the same fact about a frame rather than a field: two parts
 * hang at once from `scuttleTwinParts` left, and `scuttleHeard` reads `id` as
 * the **socket** — row-major over `scuttleRows` x `scuttleCols`, which is 21
 * of them. A press on a socket that is not in `s.loose` is dropped in
 * silence, and which socket comes loose is drawn from the seeded `Rng`
 * (`scuttle-step.ts`, `pickLive`), so the recipe in `hold.ts` writes the
 * loose list with `--boss-json` rather than guessing the draw.
 */
export const NEEDS_ID = [
  "lidString",
  "balloonLeft",
  "balloonRight",
  "instarMark",
  "instarMark2",
  "mirrorLobe",
  "mirrorLobe2",
  "antiphonRail",
  "queenMark",
  "scuttlePart",
  ...rows.flatMap(([name, r]) => (r.id ? [name] : [])),
];

/**
 * Handles whose `id` is a **choice** rather than a body, and what the choices
 * are. BULB QUEEN has two marks and `queenHeard` reads `id` as the side —
 * 0 is her left and 1 her right, and **anything else is a side of zero**,
 * which is a thumb the round hears and does nothing with. That is exactly the
 * silence this flag exists to stop, so it is refused here by name.
 */
export const ID_CHOICES: Record<string, readonly number[]> = {
  queenMark: [0, 1],
};

/**
 * Handles that are **let go of** rather than held, and whose picture is what
 * the lift bought.
 *
 * THE THROAT's old haul was the first, refused with `on` set so a tap could
 * not move the mouth by a fingertip's jitter; it went with the rework of 1
 * October 2026, and the rule stays for the rows that set `lift`. The carry is
 * the grab, the travel, **and the lift** — three things a finger does and two
 * commands on the wire, the second with `on` false. Without this the flag
 * could build the gesture's shape and never the gesture, which is the failure
 * a picture cannot show.
 */
export const CARRIES = rows.flatMap(([name, r]) => (r.lift ? [name] : []));

/**
 * Handles that are carried **and then** let go of: THE INSTAR's swipe arms on
 * the carry and counts on the lift (`instar-hand.ts`), so neither a hold nor
 * a `CARRIES` pair is the gesture — the first never lifts, the second never
 * carries while down. Three commands, all on the one tick.
 */
export const SWIPES = rows.flatMap(([name, r]) => (r.swipe ? [name] : []));

/** Every handle this flag knows, in the order the recipes list them. */
export const DRAGS = [
  "mazeString",
  "wardenTether",
  "lidString",
  "choirLeft",
  "choirRight",
  "balloonLeft",
  "balloonRight",
  "sinewLeft",
  "sinewRight",
  "surgeBulb",
  "surgeBulb2",
  "antiphonOrgan",
  "antiphonRail",
  "instarMark",
  "instarMark2",
  "mirrorLobe",
  "mirrorLobe2",
  "wardenEye",
  "wardenHatch",
  "queenMark",
  "filament",
  "filament2",
  "stareLash",
  "stareLash2",
  "mazeHeart",
  "throatAim",
  "throatPump",
  "scuttlePart",
  ...rows.map(([name]) => name),
];
