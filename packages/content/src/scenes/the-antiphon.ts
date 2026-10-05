import type { GuideScene } from "../scene-types.js";

/**
 * THE ANTIPHON's rehearsal: six organs described across the two seats, the
 * seats swapping every level, each answer carried down its vein, and their
 * own ship found among ships.
 *
 * A body over the top of the field grows an organ a level — a contour the
 * game draws nowhere else — and the explainer alone is shown it, two rows
 * under the rail; the chooser alone is shown the rail of candidates a third
 * of the way down, each joined to the organ's place by a vein, one of which
 * it is (`sim/antiphon.ts`). The chooser drags the one they were told down
 * its vein to the organ's place, and there it is judged: the organ takes it
 * to a pit, a decoy loses the wave. From two pits the rail is one family and
 * the window sixteen beats; six pits, and the body goes still and grows
 * their own ship on a rail of ships.
 *
 * **Every carry is the organ's candidate**, found by the runner rather than
 * written: the rail is shuffled by the seeded rng and its veins run from
 * where each candidate hangs, so the film writes how far along and the world
 * says which and which way (`sim/scene-aim.ts`). Each starts twenty ticks
 * after the organ stands, because a carry against a contour still resolving
 * is nothing (`antiphonCarried`), and the hand alternates with the level —
 * the navigator chooses first (`antiphonChooser`).
 *
 * **The film shows no mistake.** A decoy carried home is the wave lost
 * since the redesign of 5 October 2026, and a rehearsal that ended on its
 * second page would teach nothing after it. Not shown: the window running
 * out, and a pit grown again from five.
 *
 * **What stays written is every number**: the field says no shape in either
 * direction, and the siren says only whose job is which.
 */
export const THE_ANTIPHON: GuideScene = {
  ticks: 3060,
  bpm: 120,
  chargeBeats: 0.5,
  seed: 1,
  entries: [],
  boss: { kind: "antiphon" },
  acts: [
    // The explainer's thumb on the organ while it stands: the turn, a second
    // look at the shape (`antiphonTurnBeats`, `render/antiphon-grip.ts`).
    { tick: 240, drag: "antiphonOrgan", hand: 1, until: 370 },
    // Each organ's candidate, carried down its vein, the chooser alternating.
    { tick: 380, drag: "antiphonRail", hand: 2, by: 410, until: 420 },
    { tick: 740, drag: "antiphonRail", hand: 1, by: 770, until: 780 },
    { tick: 1100, drag: "antiphonRail", hand: 2, by: 1130, until: 1140 },
    { tick: 1460, drag: "antiphonRail", hand: 1, by: 1490, until: 1500 },
    { tick: 1820, drag: "antiphonRail", hand: 2, by: 1850, until: 1860 },
    { tick: 2180, drag: "antiphonRail", hand: 1, by: 2210, until: 2220 },
    // Their own ship, after the still: the seventh level, the navigator's.
    { tick: 2780, drag: "antiphonRail", hand: 2, by: 2810, until: 2820 },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "IT GROWS ONE · SAY ITS SHAPE",
      anchor: { at: "boss", part: "organ" },
    },
    {
      tick: 180,
      seat: 2,
      text: "THREE ON THE RAIL · WHICH",
      anchor: { at: "boss", part: "rail" },
      counts: [{ of: "antiphonRail", is: 3 }],
    },
    {
      tick: 360,
      seat: 2,
      text: "DRAG IT DOWN ITS VEIN",
      anchor: { at: "boss", part: "rail" },
    },
    { tick: 540, seat: 1, text: "A PIT · NOW YOU CHOOSE", anchor: { at: "boss" } },
    {
      tick: 720,
      seat: 2,
      text: "NOW YOU SAY ITS SHAPE",
      anchor: { at: "boss", part: "organ" },
    },
    { tick: 900, seat: 1, text: "THE WRONG ONE · WAVE LOST", anchor: { at: "boss" } },
    { tick: 1140, seat: 2, text: "TWO PITS · SIXTEEN BEATS NOW", anchor: { at: "boss" } },
    {
      tick: 1320,
      seat: 2,
      text: "THE RAIL IS ONE FAMILY NOW",
      anchor: { at: "boss", part: "rail" },
    },
    { tick: 2280, seat: 1, text: "FOUR BEATS · NOTHING LANDS", anchor: { at: "boss" } },
    {
      tick: 2580,
      seat: 2,
      text: "LAST · SHIPS · WHICH IS OURS",
      anchor: { at: "boss", part: "rail" },
    },
    { tick: 2850, seat: 1, text: "OUT · IT HAD NO NAME", anchor: { at: "boss" } },
  ],
};
