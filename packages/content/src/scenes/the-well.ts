import type { GuideScene } from "../scene-types.js";

/**
 * THE WELL's rehearsal: the same field, drawn two ways, and the seam.
 *
 * What the pilot has to believe before the first body falls is a *picture* —
 * "the field, turned inside out" — and no words do that as well as being shown
 * it fold. So the film is one body and a seat switch. The first page is the
 * navigator's: the flat field both of them have played all game, a red body
 * coming down the fourth column. The second is the pilot's, and the seat
 * switch *is* the fold: the rehearsal lays each page out for the seat it
 * shows (`render/guide-film.ts`), and the well is only ever drawn on the
 * pilot's screen (`render/well.ts`), so the same body, still falling, is
 * simply there at four o'clock on the clock, and the caption names the hour.
 * No new machinery, no second projection: the page is the game's own screen.
 *
 * On that page the pilot's own thumb carries the cannon to four o'clock: on
 * the ring the cannon is the clock's hand, and the strip that moves it is the
 * same straight rail it has been all game — the projection bends the field and
 * leaves the band alone, which is why one hour across the top of the picture is
 * the whole width of a phone under the hand. (The rail itself is his: player
 * 1's half of the band is drawn on `showsCannon` and nowhere else,
 * `render/band-lobes.ts`.) The third page folds back — the navigator's flat
 * field again, the cannon standing in the fourth column where the pilot put
 * it, and the navigator's red taking the body: *nothing falls differently and
 * nothing fires differently*, shown rather than said.
 *
 * The fourth page is the seam. The cannon is carried to one o'clock and then
 * to eleven — the two ends of the rail, which on the clock stand either side
 * of the gap over the ship and look like neighbours. The cannon on the ring
 * goes round the long way, through every hour between, because that is the
 * distance it is. The caption sits on the strip, where the thumb is.
 *
 * **And the pages the field took over: none, and this is the only film in the
 * set where that is a property of the boss rather than of the prose.** THE WELL
 * says nothing on either screen and cannot be made to — it has no state, no
 * step, no clock and no gesture, so there is no moment for a word to stand on,
 * and on the clock a mark's own angle *is* its hour, printed beside it on the
 * numeral ring, so every word it could carry would be a column
 * (`render/boss-cue-read-r.ts`, `docs/decisions.md` #34). So no caption here
 * lost a verb, because no cue took one: all four pages are the split or the
 * seam, which is what a briefing keeps in every case. What the pair is missing
 * is not a verb but two readings of a picture — that the pilot's clock carries
 * no warning marks at all, and that his rings crowd at the rim — and both went
 * into the wave's own guide rather than here, because neither is a thing a
 * thumb does and a rehearsal page is a thumb landing on something.
 *
 * The body is authored in column two, which `mapCol` puts in world column
 * three: four o'clock, the hour the wave's own guide names. It comes down a
 * row every two beats, so the first page turns at beat fourteen with it on
 * row six — the middle of the screen, where a page about a body holds
 * (`test/scene-pages.test.ts`) — and it is shot on the third, so the film
 * takes no hit and needs no page about one.
 */
export const THE_WELL: GuideScene = {
  ticks: 1230,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 2, color: "red" }],
  boss: { kind: "well" },
  acts: [
    // A beat and a half into the pilot's first page: the cannon carried to
    // four o'clock, under the body — authored column two, the body's own.
    { tick: 465, control: "cannon", col: 2 },
    // The navigator's shot, a beat and a half into the flat page: the same
    // lane, the same bolt, and the body it takes is the one at four o'clock.
    { tick: 765, control: "fireRed" },
    // The seam: one o'clock, then eleven, five beats later.
    { tick: 945, control: "cannon", col: 0 },
    { tick: 1095, control: "cannon", col: 6 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "PLAYER 2 SEES THE FLAT FIELD", anchor: { at: "body" } },
    { tick: 420, seat: 1, text: "PLAYER 1 SEES FOUR O'CLOCK", anchor: { at: "body" } },
    {
      tick: 720,
      seat: 2,
      text: "PLAYER 2 FIRES THAT COLUMN",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 900,
      seat: 1,
      text: "ONE TO ELEVEN · THE LONG WAY",
      anchor: { at: "control", control: "cannon" },
    },
  ],
};
