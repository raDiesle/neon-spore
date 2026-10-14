import { coreRowMilli, midCol } from "@neon-spore/sim";
import type { HelperDef, HelperGroup } from "./helpers-def.js";

/**
 * CONTROLS › HELPERS, **ON A BOSS'S MARK**: the few pictures every boss's
 * parts wear, called rather than drawn anew (`cue-helper.ts`) — what a mark
 * asks for, whose it is, how it is going and whether it was right. Out of
 * `helpers-aim.ts` on line count.
 */

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
      name: "THE BOSS CUE",
      where: "on the part of a boss a step asks for, while it asks",
      seat: "the seat that can act — the other is shown nothing there",
      says:
        "Do this, here: a scanner box on the mark, the verb under it — TAP, FIRE, " +
        "SHIELD, MOVE, PULL — and what kind of part it is over it, in rock grey.",
      source:
        "boss-cue.ts, boss-cue-draw.ts, boss-cue-text.ts, boss-cue-frame.ts, boss-cue-read.ts",
      pose: "BULB QUEEN · HER MARKS ASKING A PRESS",
      role: "p1",
      lookAt: "the box round a mark and the word under it",
    },
    {
      name: "THE WORD BESIDE A MARK",
      where: "beside a mark, outside its ring, on the side away from the middle",
      seat: "bright on the seat the mark wants, dim on the other",
      says:
        "The gesture the ring wants, in one or two words in a scanner box — the " +
        "body's own label on the part, not a caption over it.",
      source: "instar-word.ts",
      pose: "INSTAR · THE JAW HALF PULLED",
      role: "p1",
      lookAt: "the bracketed word beside the mark",
    },
    {
      name: "THE HOLD",
      where: "on a boss's HOLD",
      seat: "the seat asked to hold",
      says:
        "Keep your thumb here: the HOLD LAB's drop, the pull's sibling, and no " +
        "word. The old red ring with a thumbprint is left only on a print TAP.",
      source: "soak-hold.ts, rub-drop.ts, hold-mark.ts",
      pose: "BULB QUEEN · HELD",
      role: "p1",
      lookAt: "the drop on the held mark",
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
    {
      name: "THE SLOW'S FUSE",
      where: "a bar under THE SLOW, and light drawn in round it",
      seat: "BOTH",
      says: "How long the pair has before this step fails and the hull takes it.",
      source: "slow-fuse.ts, slow-intake.ts",
      pose: "THE SLOW · A WINDOW RUNNING OUT",
      role: "test",
      lookAt: "the fuse under the boss and how much of it is left",
    },
  ],
};
