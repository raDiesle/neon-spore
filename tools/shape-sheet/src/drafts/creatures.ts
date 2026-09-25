import type { CatalogueEntry } from "../catalogue.js";
import { cluster, glyphed, heeled, hooked, sac, slab } from "../forms/index.js";
import { CANT, DRIFT, HEAVE, LURCH, SHIVER, SLITHER, SWELL, TURN, TWITCH } from "../motions.js";
import { blob, crystal } from "../subjects.js";

/**
 * Draft creatures: one shape each for the creature ideas in
 * `docs/spec/ideas.md` that are accepted and not worked out.
 *
 * Every one of them is drawn at the *mechanic*, not at a mood. The idea store
 * describes behaviours — appears early for one player, can only be hit at zero,
 * never leaves when it reaches the hull — and a silhouette earns its place here
 * by making that behaviour legible before it happens. A creature whose picture
 * gives no warning of what it does is a creature the pair cannot talk about,
 * and talking about it is the whole game.
 *
 * None of this is a decision. Each entry names the idea it is offered to, and
 * a person hands it over — or does not.
 */
export const CREATURE_DRAFTS: CatalogueEntry[] = [
  {
    subject: cluster("HERALD", "a body and its earlier self, never quite together", {
      bodies: 2,
      radius: 30,
      spread: 2.2,
      period: 7,
      floor: 0.55,
    }),
    motion: DRIFT,
    status: "draft",
    slot: "creature",
    suggests: "Herald",
    owner:
      "the one creature the two players do not see the same: the shape is doubled so the lagging copy is a thing on screen rather than a discrepancy. It was drawn for an idea then called the Echo; that name went to the creature that shipped, which divides rather than lags (bestiary.md, Name clash), so the draft follows the idea rather than the word",
  },
  {
    subject: blob(
      "REVERB",
      { lobes: 3, depth: 0.24, wobble: 0.06, rx: 46, ry: 40, seed: 6.1 },
      "one body, arriving twice",
    ),
    motion: LURCH,
    status: "taken",
    slot: "creature",
    owner:
      "THE ANTIPHON, taken 17 September 2026, as the head of one of its four families of contours (`content/antiphon-contours.ts`): the body grows it and three that differ from it by the one thing a sentence can say, and the pilot has to say it. Before that: travels, stops, waits, travels again — the delay is in the motion, which is where a repeat belongs; the contour stays plain so it is not mistaken for the Herald",
  },
  {
    subject: glyphed("COUNTDOWN · MARKS", "a rim of marks, one fewer each pass", 42, 42, 7, 0.9),
    motion: TWITCH,
    status: "taken",
    slot: "creature",
    owner:
      "THE COUNT, built 11 September 2026 (act 3, after THE THROB) — and taken in two halves, which is the interesting part. The disc is the body (`content/silhouettes-countdown.ts`, the four numbers under these teeth) and it is what both phones draw; the marks are *not* in the contour, because the whole creature is that only the pilot may see the count, and a silhouette carries its notches on both screens. So `render/countdown.ts` cuts them on player 1's screen off the world's beat, `countdownBeats` slots from twelve o'clock, one fewer each beat, and lights the rim while none are left; player 2 is drawn this disc bare. The card keeps the marching teeth because that is the idea it was drawn to say. The motion went too: a body whose rim is being counted must not twitch under the reading, so it ships on HOLD, the throb's stillness",
  },
  {
    subject: crystal(
      "MOULT",
      { sides: 11, depth: 0.26, wobble: 0.03, seed: 12.0 },
      50,
      "11 facets · a shell under pressure",
    ),
    motion: SWELL,
    status: "taken",
    slot: "creature",
    owner:
      "THE ANTIPHON, taken 17 September 2026, as the head of one of its four families of contours (`content/antiphon-contours.ts`): the body grows it and three that differ from it by the one thing a sentence can say, and the pilot has to say it. Free from 16 September 2026, and the one shape on this sheet released by the thing it was drawn for being *built*. It was offered to Moulting — a shell that comes off mid-fall, leaving a killable body — and the owner redesigned that creature before anybody built it: THE MOULT is a rock for five beats and a supply cargo for five, off the wave's own beat, and it wears the two contours the game already draws rather than one of its own (`render/moult-shape.ts` blends them vertex by vertex). So nothing carries these eleven facets and nothing is going to on that argument. Faceted, because a shell is the non-living material the rock already uses; it swells and does nothing else, so the moment it splits is the only event it ever has — which is still a good shape for anything whose whole story is one opening",
  },
  {
    subject: cluster("SYMBIOSIS", "two bodies in one membrane, safe while touching", {
      bodies: 2,
      radius: 26,
      spread: 2.4,
      period: 9,
      floor: 0.12,
    }),
    motion: SHIVER,
    status: "taken",
    slot: "creature",
    owner:
      "THE SPLICE eater's head, taken 25 September 2026 (`render/splice-eater-head.ts`): held merged, a cranium and a jaw in one membrane, the jaw dropping away from it as the mouth opens, on TENDRIL's neck. Before that: vulnerable only while apart, so the window is a shape and not a timer: the membrane thins to a waist and finally parts, and both players can see the same instant coming",
  },
  {
    subject: blob(
      "SMOKE",
      { lobes: 6, depth: 0.07, wobble: 0.17, rx: 44, ry: 40, seed: 7.4 },
      "shallow lobes, a wobble deep enough to blur the edge",
    ),
    motion: DRIFT,
    status: "taken",
    slot: "creature",
    owner:
      "THE ANTIPHON, taken 17 September 2026, as the head of one of its four families of contours (`content/antiphon-contours.ts`): the body grows it and three that differ from it by the one thing a sentence can say, and the pilot has to say it. Before that: the only draft whose outline is deliberately hard to fix on — it wanders rather than rocks, so aiming beside it is a decision rather than a mistake",
  },
  {
    subject: cluster("COLONY", "five small bodies sharing one skin", {
      bodies: 5,
      radius: 17,
      spread: 3.8,
      period: 11,
      floor: 0.35,
    }),
    motion: SHIVER,
    status: "draft",
    slot: "creature",
    suggests: "The Colony",
    owner:
      "reads as several things at once at any size, which is what a thing that spreads has to do; each body is small enough that losing one changes the silhouette",
  },
  {
    subject: crystal(
      "PRISM",
      { sides: 3, depth: 0.1, wobble: 0.01, seed: 2.4 },
      44,
      "3 facets · a wedge, and the angle is the mechanic",
    ),
    motion: TURN,
    status: "taken",
    slot: "creature",
    owner:
      "THE ANTIPHON, taken 17 September 2026, as the head of one of its four families of contours (`content/antiphon-contours.ts`): the body grows it and three that differ from it by the one thing a sentence can say, and the pilot has to say it. Before that: the one draft whose rotation is not decoration: a shot leaves along the face it struck, so the face a player can see is the aim, and a triangle has no ambiguous face",
  },
  {
    subject: slab("GATE", "a bar across the lane, square-shouldered", 62, 20, 4),
    motion: HEAVE,
    status: "draft",
    slot: "creature",
    suggests: "Wave gate",
    owner:
      "flat, made and wider than its column is generous — nothing else on the field looks like an obstruction, which is the whole point of a creature that arrives and refuses to leave",
  },
  {
    subject: sac("TENDRIL", "long, hanging, boneless", 0.34, 24, 66),
    motion: SLITHER,
    status: "taken",
    slot: "creature",
    owner:
      "THE SPLICE's eater, taken 25 September 2026 (`render/splice-eater-body.ts`): the round's clock, a neck through the hold's right wall that lengthens as the beats are spent under SYMBIOSIS's head, and the back end of the same body through the wall lower down, which eats the number the pair did not suck in time. Before that: the Colony's root or brood fibre — taller than it is wide, so it reads against every round thing on the field, and the wave runs its length rather than around it",
  },
  {
    subject: hooked("NOTCH 1", "a barb, and the barb is the aim", 32, 30, 0.85, 5),
    motion: CANT,
    status: "draft",
    slot: "creature",
    suggests: "Notch",
    owner:
      "direction as a *feature*: one barb on an otherwise ordinary contour, pointing at the column it takes on the next accent, retracting before it comes out the other side so the body commits rather than popping between poses. Unmistakable at card size, and the thing most likely to disappear at 26 px — which is what variant 2 is for",
  },
  {
    subject: heeled("NOTCH 2", "no barb — the whole mass leans", 33, 31, 0.42, 5),
    motion: CANT,
    status: "draft",
    slot: "creature",
    suggests: "Notch",
    owner:
      "the same commitment on the same beats, said with the whole body instead: fat on the leading side, lean behind, nothing small enough to be lost at creature size. Its risk is the opposite one — the bulb already sways and the slick already tilts, so a lopsided blob may read as one more of those rather than as a claim about the next column",
  },
];
