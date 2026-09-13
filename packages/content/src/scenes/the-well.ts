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
 * one both screens share. The third page folds back — the navigator's flat
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
      text: "PLAYER 2 FIRES THE SAME LANE",
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
