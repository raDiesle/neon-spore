import type { HelperGroup } from "./helpers-def.js";
import {
  LURE_UP,
  MAGNET_UP,
  SIREN_ON,
  STRIP_BUSY,
  TORCH_COMING,
  VEIL_UP,
  WISP_UP,
} from "./helpers-poses.js";

/**
 * CONTROLS › HELPERS, the first half: the helpers that tell the pair **to
 * talk**, and the scanner box that says *found, and the rest is withheld*.
 * The second half — where a shot goes and the marks on a body — is
 * `helpers-aim.ts`. Split on the seam the page itself is cut along.
 */

export const CALL_GROUP: HelperGroup = {
  title: "TIME TO TALK",
  sub: "one seat has something the other has not — said where both of them look",
  rows: [
    {
      name: "THE SIREN",
      where: "top centre of the field, while anything on it needs a call",
      seat: "BOTH — a chip each side names the seat and what that seat has to do",
      says:
        "Someone has to speak, and whose turn it is. It replaced five private " +
        "marks over five creatures: the pair learns one place to look, and it " +
        "never moves, because the answer — talk — is the same wherever the body is.",
      source: "siren.ts, siren-dial.ts, siren-seats.ts — the roster is comms.ts",
      pose: SIREN_ON,
      role: "p2",
      lookAt: "the lit dial at the top and the two chips either side of it",
    },
    {
      name: "THE STRIP AND ITS BLIPS",
      where: "the warning strip along the top, before a body reaches the field",
      seat: "per creature — a torch is on player 1's strip and nobody else's",
      says:
        "What is coming and in which column. An eye over a blip says this one " +
        "needs a call. The seat without the blip has to be told.",
      source: "radar-blip.ts, field.ts (drawRadar), comms-glyphs.ts",
      pose: STRIP_BUSY,
      role: "test",
      lookAt: "the blips along the top strip, and the eye over the one that needs a call",
    },
    {
      name: "THE TORCH ALARM",
      where: "a grey band across the strip and down both edges, a torch's fall ahead",
      seat: "BOTH, different words — P1: TORCH · COLUMN n · CALL IT; P2: TORCH INBOUND · TAKE THE COLUMN",
      says:
        "The fastest thing in the game is coming. The pilot can see where and must " +
        "say it; the navigator must move the shield there on the word.",
      source: "torch-alarm.ts",
      pose: TORCH_COMING,
      role: "p1",
      lookAt: "the grey band under the strip and the column it names",
    },
    {
      name: "THE MAGNET'S CALL",
      where: "a line on the strip while a magnet is on the way",
      seat: "P1 only — the navigator is not warned until it is on the field",
      says:
        "Which side to fire from. The pilot has the strip and the aim; the " +
        "navigator has the triggers, so the pilot says it.",
      source: "magnet-alarm.ts",
      pose: MAGNET_UP,
      role: "p1",
      lookAt: "the magnet and the line that says which side",
    },
  ],
};

export const LOCK_GROUP: HelperGroup = {
  title: "THE SCANNER BOX",
  sub: "four corners, a sweep and a flicker: this body is picked out, and this screen is not told the rest",
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
      name: "IGNORE",
      where: "over a lure, beside its target lock",
      seat: "P2 only — on player 1's screen the lure is an ordinary body",
      says:
        "Do not shoot this one. The navigator must say so before the pilot " +
        "fires at what looks like any other creature. White, the colour nothing " +
        "else on the field is drawn in.",
      source: "lure-alarm.ts, lure-hole.ts",
      pose: LURE_UP,
      role: "p2",
      lookAt: "the white frame and the word IGNORE beside the lure",
    },
    {
      name: "THE CLOUD'S CLOCK",
      where: "over a cloud, in place of the lock",
      seat: "P1 only — player 2 gets the lock and nothing else",
      says:
        "How long until it turns, and into which colour: a ring that drains, " +
        "with two arrows inside drawn in the colour it turns into.",
      source: "veil-marks.ts",
      pose: VEIL_UP,
      role: "p1",
      lookAt: "the draining ring over the cloud and the colour of the arrows in it",
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
      name: "NEXT TO FALL",
      where: "round the flank torch the queen drops next",
      seat: "P2 only",
      says:
        "Which wing drops, and when: the lock, the words, and a bar that fills " +
        "over the eight beats to the drop. A column to call and a clock to watch, " +
        "kept apart from the ring that says which mark is real.",
      source: "queen-drop.ts",
      pose: "BULB QUEEN · SHUT",
      role: "p2",
      lookAt: "the box round one wing's torch, NEXT TO FALL under it, and the bar under that",
    },
  ],
};
