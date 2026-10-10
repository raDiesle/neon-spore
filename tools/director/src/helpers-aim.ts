import { coreRowMilli, midCol } from "@neon-spore/sim";
import type { HelperDef, HelperGroup } from "./helpers-def.js";
import { EMPTY_FIELD, LOCKED, MINE_UP, PUSHED_ONCE } from "./helpers-poses.js";

/**
 * CONTROLS › HELPERS, the second half: where a shot goes, the words and
 * counts that stand on a body, and the marks every boss's part wears. The
 * first half is `helpers-calls.ts`.
 */

export const AIM_GROUP: HelperGroup = {
  title: "WHERE THE SHOT GOES",
  sub: "the cannon's own sight, the mark on a target, and the button it asks for",
  rows: [
    {
      name: "THE GUNSIGHT",
      where: "the cannon's own column, straight up from the muzzle",
      seat: "BOTH — in the cannon's colour, which is the seat's own: violet on P1's, amber on P2's",
      says:
        "This is the column a bolt will take. It stands still and brightens only " +
        "on the beat: a light moving up the column is what a bolt is, and the " +
        "sight must never be read as one.",
      source: "cannon-column.ts",
      pose: EMPTY_FIELD,
      role: "p1",
      crop: "ship",
      lookAt: "the soft column above the cannon, its rails and the ticks up its middle",
    },
    {
      name: "EMBER, AND A COLOUR NOT KNOWN",
      where: "round what a boss's FIRE or SHOOT asks the bolt to reach",
      seat: "the seat the shot is asked of",
      says:
        "Shoot this. A ring of neon round the whole target, never across it, and " +
        "four arrows on the diagonals swinging in at it, in the colour of the " +
        "fire button to press. Where this screen is not told the colour — the " +
        "other seat has to say it — the mark flickers fast between red and cyan, " +
        "torn at each change like a signal caught between two channels: shoot " +
        "this, and ask which colour.",
      source: "aim-ember.ts (emberEither), called by cue-helper.ts for every boss",
      pose: "BULB QUEEN · HELD",
      role: "p2",
      lookAt:
        "the ring and four arrows round the real mark — caught here on red; on " +
        "player 2's screen it switches between red and cyan, because player 1 is " +
        "the one told the colour",
    },
    {
      name: "EMBER ON THE FIRE BUTTON",
      where: "round the fire button on the band, while EMBER stands on a target",
      seat: "the screen with the fire buttons",
      says:
        "Press this one. The same mark as on the target, in the button's colour; " +
        "where the colour is not known it jumps between the two buttons, one at " +
        "a time, never both.",
      source: "fire-button-mark.ts",
      pose: "BULB QUEEN · HELD",
      role: "p2",
      crop: "ship",
      lookAt: "the ring and arrows round a fire button at the bottom",
    },
  ],
};

export const BODY_GROUP: HelperGroup = {
  title: "ON A BODY",
  sub: "a word, a frame or a count standing on one falling body",
  rows: [
    {
      name: "ONE LAST CHANCE",
      where: "over a body the shield has already pushed back up once",
      seat: "BOTH — both hands were in the push, and both must change what they do",
      says:
        "The shield will not save this one again: this fall is the cannon's or " +
        "the hull's. The body itself looks the same as the first time.",
      source: "last-chance.ts",
      pose: PUSHED_ONCE,
      role: "test",
      lookAt: "the words over the body",
    },
    {
      name: "THE LOCK",
      where: "round a body player 1's hand is holding",
      seat: "BOTH — the value of the lock is on the other screen",
      says:
        "The cannon has this one: a shot will steer to it. Amber, the hand's " +
        "colour, so it never says which colour to load.",
      source: "lock-mark.ts",
      pose: LOCKED,
      role: "p2",
      lookAt: "the amber scanner box round the held body",
    },
    {
      name: "THE PUSH'S PAUSE",
      where: "either side of a rock that has just been carried a column",
      seat: "BOTH",
      says:
        "Not yet. Two white arrows fade out over the beat the rock must stand " +
        "still; a side with a wall behind it gets none.",
      source: "grip-arrows.ts",
      pose: "GRIP · THE PUSH PAUSE",
      role: "test",
      lookAt: "the two arrows beside the rock",
    },
    {
      name: "THE HEAT",
      where: "on a lobe a harpoon has caught",
      seat: "BOTH, each in its own seat's colour",
      says:
        "About to blow. The lobe glows hotter and faster the longer it stays " +
        "still, and starts again from cold the moment it moves.",
      source: "harpoon-danger.ts",
      pose: "LEECH · ON THE CANNON",
      role: "p1",
      lookAt: "the glow on the caught lobe",
    },
    {
      name: "THE COUNT",
      where: "on a countdown's rim",
      seat: "P1 only — on player 2's screen the body is bare",
      says:
        "When it opens. The navigator holds the trigger and cannot see the count, " +
        "so the pilot has to say the beat out loud.",
      source: "countdown.ts, countdown-look.ts",
      pose: "COUNT · THREE BLADES LEFT",
      role: "p1",
      lookAt: "the blades closing across the body",
    },
    {
      name: "THE PIPS",
      where: "a ring round a mine, and round a blister",
      seat: "BOTH",
      says: "How many are still owed: one pip a fuse, one pip a blow.",
      source: "pip-ring.ts",
      pose: MINE_UP,
      role: "test",
      lookAt: "the ring of pips round the body",
    },
  ],
};

/** THE CAPSTAN's drum, close enough that the marks on its bands read. */
const ON_THE_DRUM: HelperDef["zoom"] = {
  at: (w) => ({ col: midCol(w.cfg) - 1, row: coreRowMilli("capstan") / 1000 }),
  span: 5,
};

export const MARK_GROUP: HelperGroup = {
  title: "ON A BOSS'S MARK",
  sub: "the same few marks on every boss — whose a part is, how it is going, whether it was right",
  rows: [
    {
      name: "THE HALO, THE TURNING RING, THE CLOCK",
      where: "on a boss's open mark",
      seat: "yours: a red halo inside it — your partner's: a dim turning ring and a clock",
      says:
        "Act on this now, or wait: it is the other seat's. The clock replaces the " +
        "gesture, so the waiting seat never reads it as its own next move.",
      source: "mark-feedback.ts, part-light.ts",
      pose: "CAPSTAN · THE LEFT BAND RUBBED",
      role: "p2",
      zoom: ON_THE_DRUM,
      lookAt: "the light inside one mark and the dashed ring and clock on the other",
    },
    {
      name: "THE HOLD MARK",
      where: "on a boss's HOLD",
      seat: "the seat asked to hold",
      says: "Keep your thumb here: a red ring that breathes, a thumbprint in it.",
      source: "hold-mark.ts",
      pose: "BULB QUEEN · HELD",
      role: "p1",
      lookAt: "the red ring with the thumbprint",
    },
    {
      name: "THE GREEN RING AND THE ARC",
      where: "round a mark held where it is wanted, and round one being worked",
      seat: "BOTH — the working seat's count is the waiting seat's reason to keep holding",
      says:
        "Right, keep it there; and how far the partner has got — a green arc from " +
        "twelve o'clock, in segments where the part needs a count.",
      source: "mark-progress.ts",
      pose: "CAPSTAN · THE LEFT BAND RUBBED",
      role: "p1",
      zoom: ON_THE_DRUM,
      lookAt: "the steady green ring and the green arc round the mark",
    },
  ],
};
