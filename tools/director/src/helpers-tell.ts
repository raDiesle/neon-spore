import type { HelperGroup } from "./helpers-def.js";
import {
  BEATBOX_UP,
  FENCE_UP,
  HUSK_UP,
  LURE_UP,
  MAGNET_UP,
  MOULT_UP,
  VEIL_UP,
  WISP_UP,
} from "./helpers-poses.js";

/**
 * CONTROLS › HELPERS, the telling half of THE HIDDEN (`helpers-hidden.ts`):
 * a helper drawn on the one seat shown the fact the other seat needs. Each
 * is a sentence that seat owes out loud, and each body lights THE SIREN.
 * THE TORCH ALARM is one too, and stands in THE SHIELD (`helpers-shield.ts`),
 * because its answer is the dome.
 */

export const TELL: HelperGroup = {
  title: "ONLY ON THIS SCREEN — TELL",
  sub: "this seat is shown the fact the other one needs: it has to say it out loud",
  rows: [
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
      name: "THE WISP'S NEXT TILE",
      where: "a dotted arc from a wisp to the square it jumps to next",
      seat: "P2 only — player 1 is not drawn the wisp at all",
      says:
        "Where it will stand next, from the moment it lands: a whole dwell to " +
        "read the tile, say it, and have the cannon there before it arrives.",
      source: "wisp-aim.ts",
      pose: WISP_UP,
      role: "p2",
      lookAt: "the dotted arc and the square at its end",
    },
    {
      name: "THE VEER'S ARROW",
      where: "over a rock riding down, with how many tiles to the step",
      seat: "P1 only — player 2 gets the ask",
      says:
        "Which lane it steps into. The pilot cannot put anything under a rock; " +
        "the navigator can, so the side has to be said three rows early.",
      source: "veer-marks.ts",
      pose: "VEER · RIDING DOWN",
      role: "p1",
      lookAt: "the arrow over the rider and the number beside it",
    },
    {
      name: "THE STRAND'S NEXT BEAD",
      where: "on the bead of a strand that must be shot next",
      seat: "P2 — player 1 is shown the colours and no mark",
      says:
        "This bead, now: a glow behind it, a lock over it and an arrow down at " +
        "it. Player 1 has the colour; the two halves make one shot.",
      source: "strand-mark.ts",
      pose: "STRAND · THE NAVIGATOR'S BEAD",
      role: "p2",
      lookAt: "the glow, the lock and the arrow on one bead",
    },
    {
      name: "DO NOT TAKE",
      where: "a white frame beside a husk",
      seat: "P2 only — on player 1's screen it is an ordinary pod",
      says:
        "This pod is a husk: do not take it. IGNORE's frame on purpose, so one " +
        "picture means one thing — say it before the mouth opens.",
      source: "husk-mark.ts",
      pose: HUSK_UP,
      role: "p2",
      lookAt: "the white frame and the words beside the pod",
    },
    {
      name: "THE MOULT'S NEXT FORM",
      where: "a hollow ghost of the coming form beside a moult, and when it turns",
      seat: "P2 only — every control it answers to is player 1's",
      says:
        "What it turns into and when. The seat that can act cannot see it, so " +
        "the only winning move is the sentence: pod in two — open.",
      source: "moult-ghost.ts",
      pose: MOULT_UP,
      role: "p2",
      lookAt: "the hollow outline beside the body and its clock",
    },
    {
      name: "THE COIL'S JUMP",
      where: "a bolt crossing the field from a dome that failed to the next",
      seat: "P1 only",
      says: "Which dome the charge reaches next — the column to name before it lands.",
      source: "coil-jump.ts",
      pose: "COIL · THE CHARGE JUMPING",
      role: "p1",
      lookAt: "the bolt between the two domes",
    },
    {
      name: "THE CAIRN'S NEXT DROP",
      where: "the column the pile is about to let a rock fall into",
      seat: "P1 only — player 2 holds the only dome and is shown nothing",
      says: "Where the next rock falls by itself. A column, out loud, for the shield.",
      source: "cairn-settle.ts",
      pose: "CAIRN · THE PILE",
      role: "p1",
      lookAt: "the ring on the top stone and the lane under it, down to the hull",
    },
    {
      name: "THE BEATBOX'S COUNT",
      where: "a numeral over a beatbox, over the row of dots",
      seat: "P1 only — player 2 is shown that a count exists",
      says: "How many beats this one wants. The pilot has no thumb that reaches it; say the number.",
      source: "beatbox-marks.ts, beatbox-count.ts",
      pose: BEATBOX_UP,
      role: "p1",
      lookAt: "the number over the box",
    },
    {
      name: "THE FENCE'S DOORWAY",
      where: "two posts where the wire is open; torn ends where the cannon cut it",
      seat: "P1 only — player 2 is shown an unbroken wire",
      says:
        "The way through, and the column to say. The navigator holds the shield " +
        "and cannot see it.",
      source: "fence-gate.ts, fence.ts",
      pose: FENCE_UP,
      role: "p1",
      lookAt: "the gap in the wire and the posts either side of it",
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
