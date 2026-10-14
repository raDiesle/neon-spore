import { coreRowMilli, midCol } from "@neon-spore/sim";
import type { HelperDef, HelperGroup } from "./helpers-def.js";
import { EMPTY_FIELD, LOCKED, MINE_UP } from "./helpers-poses.js";
import { firstOfKind } from "./pose-kit.js";

/**
 * CONTROLS › HELPERS, after the siren, the split and the shield: where a
 * shot goes, the words and counts that stand on a body, and the marks every
 * boss's part wears.
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
      name: "EMBER",
      where: "round what a boss's FIRE or SHOOT asks the bolt to reach",
      seat: "the seat the shot is asked of",
      says:
        "Shoot this. A ring of neon round the whole target, never across it, and " +
        "four arrows on the diagonals swinging in at it, in the colour of the " +
        "fire button to press. Where this screen is not told the colour it " +
        "flickers instead — A COLOUR NOT KNOWN, under the split.",
      source: "aim-ember.ts (emberEither), called by cue-helper.ts for every boss",
      pose: "BULB QUEEN · HELD",
      role: "p1",
      lookAt: "the ring and four arrows round the real mark, in the colour to fire",
    },
    {
      name: "EMBER ON THE FIRE BUTTON",
      where: "round the fire button on the band, while EMBER stands on a target",
      seat: "the screen with the fire buttons",
      says: "Press this one. The same mark as on the target, in the button's colour.",
      source: "fire-button-mark.ts",
      pose: "BULB QUEEN · HELD",
      role: "p2",
      crop: "ship",
      lookAt: "the ring and arrows round a fire button at the bottom",
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
      name: "THE TURNED SHOT",
      where: "off a magnet's plate, when a bolt comes in from the wrong side",
      seat: "BOTH",
      says: "Turned away, not lost: fire again from the side the pilot names.",
      source: "magnet-bounce.ts",
      pose: "MAGNET · A SHOT TURNED AWAY",
      role: "test",
      lookAt: "the bolt glancing off the plate",
    },
  ],
};

export const BODY_GROUP: HelperGroup = {
  title: "ON A BODY",
  sub: "a word, a frame or a count standing on one falling body",
  rows: [
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
      name: "THE PIPS",
      where: "a ring round a mine, and round a blister",
      seat: "BOTH",
      says: "How many are still owed: one pip a fuse, one pip a blow.",
      source: "pip-ring.ts",
      pose: MINE_UP,
      role: "test",
      lookAt: "the ring of pips round the body",
    },
    {
      name: "THE CHOIR'S PROMPT",
      where: "a scanner box round the middle of a membrane, the gesture under it",
      seat: "the screen with the cannon — the phone that has to be shaken",
      says:
        "Do this with the phone: SHAKE SCREEN, SHAKE AGAIN, KEEP RUBBING. The one " +
        "answer in the game that is on no panel, so it is written on the body.",
      source: "choir-prompt.ts",
      pose: "CHOIR · RUB OR SHAKE",
      role: "p1",
      lookAt: "the box on the membrane and the words under it",
    },
    {
      name: "THE BLISTER'S HELP",
      where: "on a blister that is up",
      seat: "the hand that may knock it down: a halo and the gesture — the other: a waiting clock",
      says:
        "Knock this one, and how: the halo inside, the tap's dots over it, a TURN's " +
        "channel and knob. The seat that may not is shown the clock, never the gesture.",
      source: "blister-help.ts, blister-turn-help.ts",
      pose: "BLISTER · RUBBED ONCE",
      role: "p2",
      zoom: { at: firstOfKind("blister"), span: 4 },
      lookAt: "the halo and the gesture over the blister",
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
