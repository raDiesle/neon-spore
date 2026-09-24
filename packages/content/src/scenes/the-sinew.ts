import type { GuideScene } from "../scene-types.js";

/**
 * THE SINEW's rehearsal: two hands pulling one tendon, and a number only one
 * of them can see.
 *
 * Nothing either seat fires touches it. The mass hangs from six fibres over
 * the middle column with a handle either side — the left the pilot's, the
 * right the navigator's, THE BALLOON's arrangement hung off a boss
 * (`sim/sinew-hand.ts`) — and a fibre parts when **the sum of the two pulls**
 * has sat inside a zone for `sinewHoldBeats`. The pilot's screen draws the
 * zone and the navigator's draws the sum (`render/view-role-clocks.ts`), so
 * the number one seat needs is on the other seat's glass and the whole boss
 * is two people saying numbers at each other. Pulled past the top of the
 * zone, the tendon snaps back, both hands are thrown off it and it sheds a
 * rock beside the mass, which is the ordinary meteor and the shield's to
 * answer.
 *
 * **The film is arithmetic, and the seed decides nothing that is not said.**
 * The zone is rolled at install (`sinewZoneLowMilli` and the band above it),
 * so its numbers are the seed's, and this seed's are the ones the pulls below
 * are authored against: 600 and 700 inside the first zone, 800 and 900 inside
 * the one that replaces it, and then 1000 and 1000 — one hand's whole reach
 * each — over the top of the third. Every hand is carried to a written
 * `toMilli` rather than taut (`scene-drag.ts`), because a hand at taut is a
 * snap and the film has two holds to show before its one.
 *
 * **Two hands on two phones at once, for the second time in the game.** Each
 * carry is two acts on the same tick, and the pages before them are one per
 * seat pointed at that seat's own handle, THE BALLOON's order: yours first,
 * then what the two of you together are being asked for.
 *
 * **What it shows of the rest is the snap, and what the snap costs.** The
 * third pull goes over the top on purpose, the hands are thrown off, the rock
 * comes down at the mass's right and the last two pages answer it with the
 * plate and the trigger — the one answer on this wave that is the ordinary
 * one. The fall and the sway after the last fibre are prose: a hand steering
 * a falling mass sideways is the drag's other axis, and a page about it would
 * be a page about two hands moving the same way at once with nothing on the
 * screen to say why, which is the second lesson and not this film's. **The
 * slack stays prose for the same reason**, and it is the stronger case: it
 * begins at `sinewDecayFibres` parted and this film parts two, so a page about
 * it would stand over a tendon that is not doing it. What the field says there
 * is `LIFT` and the guide's own steps say what it means, which is the pairing
 * `decisions.md` #34 asks for — the word on the glass at the moment, the
 * mechanic in the briefing beforehand.
 *
 * **And the two pages that said `PULL` no longer do.** The handles carry that
 * word themselves (`render/sinew-word.ts`), each on the ring it is asking and
 * on that seat's screen alone, so the pages over them say the thing no ring
 * can: that a pull is half of a sum, and that the halves add. The count, the
 * two numbers and the snap stay written, because the field says none of
 * them — a word derived from the sum is the navigator's gauge read out on the
 * pilot's glass, and *ease off* is that in one word.
 *
 * The rock is answered where the shield can answer it: the plate is carried
 * under it by `atBody` — its column is not one an author can write — and the
 * trigger goes off with the rock on the shield's row (`sim/hull.ts`), so the
 * film takes no hit and points at no retries.
 */
export const THE_SINEW: GuideScene = {
  ticks: 2160,
  bpm: 120,
  seed: 12,
  entries: [],
  boss: { kind: "sinew" },
  acts: [
    // The first hold: 600 + 700 = 1300, inside the seed's zone, four beats.
    { tick: 600, drag: "sinewLeft", toMilli: 600, by: 640, until: 905 },
    { tick: 600, drag: "sinewRight", toMilli: 700, by: 640, until: 905 },
    // The second, against the zone the part rolled: 800 + 900 = 1700.
    { tick: 1140, drag: "sinewLeft", toMilli: 800, by: 1180, until: 1445 },
    { tick: 1140, drag: "sinewRight", toMilli: 900, by: 1180, until: 1445 },
    // And over the top: both hands at their reach, 2000, and the tendon snaps
    // on the beat the sum is read. The hands are thrown off before `until`.
    { tick: 1500, drag: "sinewLeft", toMilli: 1000, by: 1550, until: 1700 },
    { tick: 1500, drag: "sinewRight", toMilli: 1000, by: 1550, until: 1700 },
    { tick: 1800, control: "shield", col: 4, atBody: true },
    { tick: 1880, control: "guard" },
  ],
  // The three pages about the number point at the hull, THE TASTER's
  // arrangement: a caption anchored at a handle stands over the collar the
  // number is drawn on, and the hull is the one anchor that leaves it clear.
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "A TENDON HOLDS A MASS UP",
      anchor: { at: "handle", target: "sinewLeft" },
    },
    {
      tick: 180,
      seat: 1,
      // `PULL` stands on this ring itself now (`render/sinew-word.ts`), so the
      // page spends its words on the half of the fight a ring cannot carry.
      text: "YOUR PULL IS HALF OF IT",
      anchor: { at: "handle", target: "sinewLeft" },
    },
    {
      tick: 360,
      seat: 2,
      // The other `PULL`, and the same trade: the two pulls adding is the one
      // fact neither handle can say by itself.
      text: "BOTH PULLS ADD TOGETHER",
      anchor: { at: "handle", target: "sinewRight" },
    },
    {
      tick: 540,
      seat: 1,
      text: "YOU SEE THE ZONE · SAY IT",
      anchor: { at: "boss" },
    },
    {
      tick: 720,
      seat: 2,
      text: "YOU SEE THE SUM · SAY IT",
      anchor: { at: "boss" },
    },
    {
      tick: 900,
      seat: 1,
      text: "FOUR BEATS IN · ONE PARTS",
      anchor: { at: "handle", target: "sinewLeft" },
    },
    {
      tick: 1140,
      seat: 2,
      text: "NEW ZONE · NEW NUMBERS",
      anchor: { at: "boss" },
    },
    {
      tick: 1440,
      seat: 1,
      text: "TOO HARD, AND IT SNAPS",
      anchor: { at: "handle", target: "sinewLeft" },
    },
    { tick: 1620, seat: 2, text: "A ROCK · THE SHIELD UNDER IT", anchor: { at: "body" } },
    {
      tick: 1860,
      seat: 1,
      text: "TRIGGER AS IT LANDS",
      anchor: { at: "control", control: "guard" },
    },
  ],
};
