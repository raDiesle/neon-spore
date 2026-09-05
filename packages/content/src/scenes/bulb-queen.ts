import type { GuideScene } from "../scene-types.js";

/**
 * BULB QUEEN's rehearsal: the first boss, and the first film with no shot in
 * it.
 *
 * Her wave's guide is entirely about *seeing*: he is shown the shape and the
 * colour, she is shown which of the two marks under her middle is the real one
 * and which wing the next torch drops out of. Neither half is a new control —
 * once the pair has agreed on a column and a colour, killing her is the
 * ordinary thing they have been doing since wave one. So the film is the two
 * marks, and the torch that arrives on a clock of its own while they are still
 * talking about them.
 *
 * **It opened on a fourth page and no longer does.** *THE QUEEN · SHE OPENS*
 * stood in front of all of this, and the owner's answer to reading it was that
 * it does not mean anything: her opening is not a thing the pair does, it has
 * no page's worth of instruction in it, and the film says more in three pages
 * that each name a job than in four where the first one is scenery.
 *
 * **The last page is a real petal coming off her.** It is aimed at her weak
 * side rather than at the mark her middle is showing — those are two different
 * columns, and telling them apart is exactly what the pair has to do — and it
 * is fired on the second of her two open beats, because the third is already
 * shut.
 *
 * The torch is the film's one shared page and it is spent well: it is the
 * thing on her that neither screen owns, it lands while the pair is reading
 * about the marks, and the hull paying for it is the sentence *she is doing two
 * things at once and you are only answering one of them*.
 */
export const BULB_QUEEN: GuideScene = {
  ticks: 1020,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "queen", col: 3, petals: 9 },
  acts: [
    // Under the *weak* mark rather than under the tell, and they are not the
    // same column: `tellCol` is what her middle is showing and the petal comes
    // off at `col + weakSide` (`bullet-hit-boss.ts`). Both of them move with
    // her, so this is a measurement of where she has drifted to by beat twelve
    // rather than a place chosen for her.
    { tick: 630, control: "cannon", col: 3 },
    { tick: 670, control: "cannon", col: 2 },
    { tick: 770, control: "fireRed" },
  ],
  steps: [
    // `marks` and not `body`: the ring has to hold *both* of them, or a page
    // about one of two being real is drawn around neither.
    { tick: 0, seat: 2, text: "ONE MARK IS REAL", anchor: { at: "marks" } },
    { tick: 440, seat: 1, text: "A TORCH EVERY EIGHT BEATS", anchor: { at: "health" } },
    {
      tick: 700,
      seat: 2,
      text: "FIRE THE MARK SHE SHOWED",
      anchor: { at: "control", control: "fireRed" },
    },
  ],
};
