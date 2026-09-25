import type { GuideScene } from "../scene-types.js";

/**
 * THE MINE's rehearsal: the square crosses the room as words, and a finger
 * finds it.
 *
 * A body standing still on a tile, drawn on one screen and not the other, and
 * nothing the cannon does touches it — the only thing that answers it is the
 * blind seat's finger on that exact square (`sim/mine.ts`). So the film is the
 * sentence in the order the pair has to say it: the seat that sees it, the
 * seat that does not, the count between them, and the finger coming down.
 *
 * **The fuse is the shape of this film.** A mine runs `mineFuseBeats` — six —
 * from the beat it appears, and at nought it breaks the hull; at 120 and
 * pages of at least three beats, that is two pages between a body appearing
 * and the ship paying for it. So the seeing seat gets the first page with the
 * body and its ring on it, and the blind seat gets the second with an empty
 * field, the count standing in a row along the top, and the hand coming down.
 *
 * **The finger lands on the tick the page ends**, and that is not an
 * accident. A page plays once and then stands on its last tick
 * (`render/guide-play.ts`), and the tap destroys the mine the instant it
 * lands — so a page with the tap in its middle rests on an empty field with
 * no count, no ring and no caption, because every one of those is read off
 * the body. A tap on the boundary is the one placement where the resting
 * frame is the lesson: the finger down on the square, the count still up,
 * the mine still under it. The next page opens on it going.
 *
 * The third page is the one shared page a film is allowed, and it is the
 * cost: a second mine, set the other way round as the wave's own second one
 * is, and a finger **one tile under it** — near enough to have been meant,
 * which is why it costs the wave rather than a beat. Played blind on the
 * navigator's screen, so the hand is seen landing on nothing and the hull
 * breaking under it is the whole of what the page says.
 *
 * `tile` is the one act whose seat is authored, because which seat is blind
 * to a mine is the arrival's (`SpawnEntry.sees`) and not the kind's; the
 * two here are the two ways round the wave itself sends them.
 */
export const THE_MINE: GuideScene = {
  ticks: 720,
  bpm: 120,
  seed: 1,
  entries: [
    // The wave's own first two arrivals, on the wave's own tiles: one the
    // navigator sees, one the pilot does. The first comes a beat in, so its
    // fuse reaches past the page that ends on the finger; the second comes a
    // beat after that page ends, so the burst is seen before its count is.
    { beat: 1, col: 3, kind: "mine", color: "cyan", row: 6, sees: 2 },
    { beat: 7, col: 1, kind: "mine", color: "red", row: 9, sees: 1 },
  ],
  acts: [
    // The pilot's finger on the exact square, on the tick the page ends —
    // three beats after it opens, so the count is seen coming down before
    // the hand arrives, and the page rests on the finger rather than on the
    // empty field it leaves.
    { tick: 360, tile: 1, col: 3, row: 6 },
    // And the navigator's, one row under the second mine: beside it, never
    // on it, and the hull goes.
    { tick: 510, tile: 2, col: 1, row: 10 },
  ],
  steps: [
    { tick: 0, seat: 2, text: "PLAYER 2 SAYS THE SQUARE", anchor: { at: "body" } },
    // `body` on the seat the body is hidden from rings the empty square the
    // finger is about to land on — which is the page: *that* square, and
    // nothing drawn on it.
    { tick: 180, seat: 1, text: "PLAYER 1 PRESSES THAT SQUARE", anchor: { at: "body" } },
    { tick: 360, seat: 2, text: "ONE TILE OFF COSTS THE HULL", anchor: { at: "hit" } },
  ],
};
