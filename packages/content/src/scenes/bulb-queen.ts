import type { GuideScene } from "../scene-types.js";

/**
 * BULB QUEEN's rehearsal: the first boss, and the first film with no shot in
 * it.
 *
 * Her wave's guide is entirely about *seeing*: he is shown the shape and the
 * colour, she is shown which of the two marks under her middle is the real one
 * and which wing the next torch drops out of. Neither half is a new control —
 * once the pair has agreed on a column and a colour, killing her is the
 * ordinary thing they have been doing since wave one. So the film is her
 * opening, the two marks, and the torch that arrives on a clock of its own
 * while they are still talking about the first two.
 *
 * **There is no shot, and that is a limitation rather than a decision.** Her
 * two marks stand one column either side of her, she is held at the middle of
 * the field so her whole span stays on it, and a scene's acts are authored in
 * the seven-column grid every wave is authored in — which reaches seven of the
 * field's eleven columns and neither of hers. `docs/queue.md` carries the
 * finding; when a film can send the cannon to a real column, the fourth page
 * of this one is a shot up the mark she was showing.
 *
 * The torch is the film's one shared page and it is spent well: it is the
 * thing on her that neither screen owns, it lands while the pair is reading
 * about the marks, and the hull paying for it is the sentence *she is doing two
 * things at once and you are only answering one of them*.
 */
export const BULB_QUEEN: GuideScene = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "queen", col: 3, petals: 9 },
  acts: [],
  steps: [
    { tick: 0, seat: 1, text: "THE QUEEN · SHE OPENS", anchor: { at: "body" } },
    { tick: 220, seat: 2, text: "ONE MARK IS REAL", anchor: { at: "body" } },
    { tick: 440, seat: 1, text: "A TORCH EVERY EIGHT BEATS", anchor: { at: "health" } },
  ],
};
