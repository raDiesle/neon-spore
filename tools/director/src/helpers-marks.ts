import {
  batonBoss,
  batonSocketCol,
  batonSocketRow,
  coreRowMilli,
  midCol,
  type World,
} from "@neon-spore/sim";
import type { HelperDef, HelperGroup } from "./helpers-def.js";
import { VERDICT_GIVEN } from "./helpers-poses-marks.js";

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

/** The navigator's thumb on her own mark, the drum's left one, rubbing it. */
const ON_HER_MARK = (w: World): { col: number; row: number } => ({
  col: midCol(w.cfg) - 2.3,
  row: coreRowMilli("capstan") / 1000,
});

/** Round THE BATON's two lowest sockets, where the draw is asked for and its label stands. */
const AT_THE_DRAW: HelperDef["zoom"] = {
  at: (w) => {
    const b = batonBoss(w);
    if (b === null) return { col: midCol(w.cfg), row: 6 };
    const last = w.cfg.batonSockets - 1;
    const row = (batonSocketRow(w.cfg, b, last - 1) + batonSocketRow(w.cfg, b, last)) / 2;
    return { col: batonSocketCol(w.cfg, b, last) - 1, row };
  },
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
        "word. The old red ring with a thumbprint is gone from every mark.",
      source: "soak-hold.ts, rub-drop.ts, press-drop.ts",
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
      name: "THE THUMB'S RING",
      where: "round the mark under this device's own thumb, while it is down",
      seat: "the seat whose thumb it is — never shared, the other screen draws its own",
      says:
        "Still holding, and still going: the thumb covers the mark and its arc, so " +
        "a ring opens round it, quickly and then slowly, and beats green on the " +
        "beat. It goes red and stops when the mark judges the touch wrong.",
      source: "thumb-aura.ts, thumb-aura-ring.ts",
      pose: "CAPSTAN · THE LEFT BAND RUBBED",
      role: "p2",
      zoom: ON_THE_DRUM,
      thumb: ON_HER_MARK,
      lookAt: "the green ring round the rubbed mark, wider than the mark itself",
    },
    {
      name: "THE VERDICT",
      where: "on the mark a thumb touched, the moment the touch is judged",
      seat: "BOTH",
      says:
        "Was that right? The mark washes green and a green ring opens off it when " +
        "the touch moved the part; red when it was refused or let the part slip. " +
        "Gone in a little over half a second.",
      source: "grip-verdict.ts — fed by each boss's verdicts, here capstan-verdicts.ts",
      pose: VERDICT_GIVEN,
      role: "p2",
      zoom: ON_THE_DRUM,
      lookAt: "the green wash on the two marks and the ring opening off them",
    },
    {
      name: "THE BATON'S WORDS",
      where:
        "a banner across the field while a new part of the arm is coming, then a label beside it while it runs",
      seat: "each screen its own job — the two halves are said out loud",
      says:
        "What the arm is about to do, two or three beats ahead, and then what this " +
        "seat does about it. The first time a part comes in on a wave, and never again.",
      source: "baton-explain.ts, baton-explain-when.ts",
      pose: "THE BATON · MERGING",
      role: "p1",
      zoom: AT_THE_DRAW,
      lookAt: "the label beside the beads: HOLD THE UPPER BEAD WITH P2",
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
