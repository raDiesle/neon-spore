import type { HelperGroup } from "./helpers-def.js";
import { BEATBOX_UP, FENCE_UP, MINE_BLIND, VEIL_UP, WISP_UP } from "./helpers-poses.js";
import { TELL } from "./helpers-tell.js";

/**
 * CONTROLS › HELPERS, **what one screen has and the other has not**, cut in
 * two by which side of the split a helper is drawn on (the owner, 14 October
 * 2026): the seat that is shown *something is here, and you are not told
 * what* — so it asks — and the seat that is shown the fact itself — so it
 * tells. Every body under here also lights THE SIREN (`helpers-siren.ts`).
 * The telling half is `helpers-tell.ts`, on line count.
 */

const ASK: HelperGroup = {
  title: "NOT ON THIS SCREEN — ASK",
  sub: "this seat is shown that something is there and not what it is: the other seat sees it",
  rows: [
    {
      name: "THE TARGET LOCK",
      where: "round one body on the field — a lure, a dart, a cloud, the queen's marks",
      seat: "the seat that is NOT told — what the frame holds says what is withheld",
      says:
        "Found, and that is all. One picture for one idea, the owner's call: a " +
        "pair was learning four marks for the same sentence. What is inside the " +
        "frame tells the four apart.",
      source: "target-lock.ts",
      pose: VEIL_UP,
      role: "p2",
      lookAt: "the corner brackets round the cloud and the line sweeping down through them",
    },
    {
      name: "THE DART'S QUESTION",
      where: "round a dart while it hangs and takes aim",
      seat: "P1: two arrows, one down each diagonal, in a lock — P2: the one way it will go",
      says:
        "It will jump one way and this screen does not know which. Ask. Player 2 " +
        "sees the single arrow and says it.",
      source: "dart-query.ts (P1), dart.ts and dart-path.ts (P2)",
      pose: "DART · THE RUN",
      role: "p1",
      lookAt: "the lock round the dart and the two arrows inside it",
    },
    {
      name: "THE SEARCH",
      where: "anywhere on the grid, while a wisp is on the field",
      seat: "P1 only — the seat that cannot see the wisp",
      says:
        "Something is out there and this machine has not found it. A lock that " +
        "blinks onto a grid crossing — never a tile — and is gone, so it cannot " +
        "be read as where the body is. The position has to come from player 2.",
      source: "wisp-search.ts",
      pose: WISP_UP,
      role: "p1",
      lookAt: "the scanner box that blinks between the tiles, holding nothing",
    },
    {
      name: "THE GHOST'S ROW",
      where: "a scanner box sweeping along the row a ghost is in, several times a second",
      seat: "P1 only — player 2 is drawn the ghost itself",
      says:
        "Something is in this row and this screen is not shown where. The sweep " +
        "runs off the clock and never the column, so it cannot give it away: ask.",
      source: "ghost-row.ts",
      pose: "GHOST · TORN",
      role: "p1",
      lookAt: "the scanner box on the row — caught here at one point of its sweep",
    },
    {
      name: "THE VEER'S ASK",
      where: "over a rock riding down that will step a lane",
      seat: "P2 — player 1 is shown the one arrow",
      says:
        "It will step one way, and this screen holds the shield that must meet it " +
        "and does not know which. Two faint arrows in a lock: ask, then move.",
      source: "veer-marks.ts",
      pose: "VEER · RIDING DOWN",
      role: "p2",
      lookAt: "the lock over the rock and the two faint arrows in it",
    },
    {
      name: "THE STRAND'S GUESS",
      where: "on the two beads of a strand the next shot could be meant for",
      seat: "P1 — player 2 is shown which bead",
      says: "One of these two, and this screen cannot tell which: ask before you shoot.",
      source: "strand-mark.ts",
      pose: "STRAND · THE NAVIGATOR'S BEAD",
      role: "p1",
      lookAt: "the lock and the question mark on a bead it could be",
    },
    {
      name: "THE BEATBOX'S LOCK",
      where: "round a beatbox, over its row of dots",
      seat: "P2 — player 1 is shown the number",
      says:
        "There is a count and it is not on this screen: CLICK X TIMES TO BEAT. The " +
        "dots fill as beats land; how many it wants has to be said by player 1.",
      source: "beatbox-marks.ts, beatbox-count.ts",
      pose: BEATBOX_UP,
      role: "p2",
      lookAt: "the lock round the box and the words under it",
    },
    {
      name: "THE FENCE'S SWEEP",
      where: "a scan head running along the wire, wall to wall and back",
      seat: "P2 — the seat that moves the shield and is shown an unbroken wire",
      says:
        "Somewhere along this wall there is a way through, and this screen is " +
        "not finding it. Player 1 sees the gap; ask for the column.",
      source: "fence-sweep.ts",
      pose: FENCE_UP,
      role: "p2",
      lookAt: "the bright head on the wire and the trail behind it",
    },
    {
      name: "THE MINE'S FUSE",
      where: "a row of fuse rings at the top, under the siren — one for each mine not drawn here",
      seat: "the seat NOT drawn the mine — player 1 unless the wave says otherwise",
      says:
        "A mine is on the field and this screen is not shown where. The ring " +
        "burns down to the blast; the tile has to come from the seat that sees it.",
      source: "mine.ts (drawMineFuses), ship-top-rows.ts",
      pose: MINE_BLIND,
      role: "p1",
      lookAt: "the fuse ring in the row under the siren",
    },
    {
      name: "A COLOUR NOT KNOWN",
      where: "round what a boss's FIRE or SHOOT asks the bolt to reach, and on the fire buttons",
      seat: "the seat asked to shoot, when the other seat is the one told the colour",
      says:
        "Shoot this, and ask which colour. EMBER flickers fast between red and " +
        "cyan, torn at each change like a signal caught between two channels, " +
        "and on the band it jumps between the two fire buttons, one at a time.",
      source: "aim-ember.ts (emberEither), fire-button-mark.ts",
      pose: "BULB QUEEN · HELD",
      role: "p2",
      lookAt:
        "the ring and four arrows round the real mark — caught here on red; on " +
        "player 2's screen it switches between red and cyan",
    },
  ],
};

export const HIDDEN_GROUP: HelperGroup = {
  title: "WHAT ONE SCREEN HAS AND THE OTHER HAS NOT",
  sub:
    "the split itself, drawn: one seat is shown that something is withheld, the " +
    "other is shown the thing — and every one of them lights the siren",
  parts: [ASK, TELL],
};
