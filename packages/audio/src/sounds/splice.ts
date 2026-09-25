import { after, air, burst, chime, glint, metal, soft, spore, sub, thud } from "../grain.js";
import type { SoundDef } from "../types.js";

/**
 * THE SPLICE, as four sounds, and the ear is carrying the *waiting*.
 *
 * The fight's one press is three beats from its own answer (`spliceFeedBeats`),
 * on purpose: the number has to be seen travelling down its straw, and the
 * pair has to watch it come. So the first of these four is the press landing
 * and the next two are the arrival — the split THE FLEET already has, arrived
 * at from a different direction. Without the first one the pilot sucks into
 * silence and waits three beats to find out whether anything happened at all.
 *
 * They are spaced by *material*, like the fleet's: a draw of air up a hollow
 * tube, a swallow, a refusal, and the knot coming apart. Nothing here is
 * pitched by row. A straw runs the whole height of the field and has no row to
 * be at, and a pitch that meant a row would be the one coordinate in this
 * fight that is not the navigator's to say.
 *
 * `family: "boss"` and their own file, for `sounds/fleet.ts`' two reasons.
 */
export const SPLICE_SOUNDS: SoundDef[] = [
  {
    id: "boss.spliceFeed",
    family: "boss",
    blurb: "A draw of air up a hollow tube, and something letting go at the far end of it.",
    status: "bound",
    use: "The beat a suck takes hold of a straw on THE SPLICE.",
    level: 0.3,
    // Rising, like `boss.fleetLaunch` and for its reason turned upside down:
    // there the thing goes away from the press, here it is being pulled
    // towards it — so the air rises and the little release sits on top of it,
    // which is the shape of a straw being drawn on rather than fired.
    layers: [air(400, 2600, 0.36, 0.13, 1.1), after(0.06, glint(3200, 0.2, 0.12))],
  },
  {
    id: "boss.spliceFed",
    family: "boss",
    blurb: "The maw taking it: a soft swallow with a bell inside it.",
    status: "bound",
    use: "A number arriving at the maw on THE SPLICE, in the order it was wanted.",
    level: 0.38,
    // The one sound in the fight that is unambiguously *good*, and it has to
    // be told from the one below it across a room with somebody counting out
    // loud over the top of it. The bell is what does that: nothing else in
    // this file rings.
    layers: [thud(220, 70, 0.2, 0.5), after(0.05, chime(2600, 0.34, 0.2, 900))],
  },
  {
    id: "boss.spliceWrong",
    family: "boss",
    blurb: "The tube closing on it: a dull knock, and the air backing up the straw.",
    status: "bound",
    use: "The wrong number arriving on THE SPLICE, or the round's beats running out.",
    level: 0.44,
    // Falling where the feed rose, and no ring at all. It is the same body of
    // air going the other way, which is the plainest thing a wrong answer in
    // this fight could sound like — and the hull damage under it
    // (`hull.breach`) is where the cost is heard (`sim/wave-fail.ts`).
    layers: [
      thud(150, 44, 0.3, 0.6),
      metal(90, 0.3, 0.24, 120),
      after(0.08, air(2200, 500, 0.4, 0.14, 1.2)),
    ],
  },
  {
    id: "boss.spliceDown",
    family: "boss",
    blurb: "The whole tangle pulling through and coming loose, and the field going quiet.",
    status: "bound",
    use: "The last number of THE SPLICE's last round — the fight is over.",
    level: 0.56,
    // No `pierce`, for `boss.fleetDown`'s reason: one of the catalogue's five
    // permissions is already spent on a boss dying.
    layers: [
      thud(260, 30, 0.9, 0.72),
      after(0.18, burst(glint(3600, 0.34, 0.18), 4, 0.13, 0.76)),
      after(0.9, soft(0.6, spore(54, 1.1, 0.4, 60))),
      after(1.1, soft(0.5, sub(44, 1.2, 0.4))),
    ],
  },
];
