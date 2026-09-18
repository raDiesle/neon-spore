import type { GuideScene } from "../scene-types.js";

/**
 * THE ANTIPHON's rehearsal: a wrong candidate first, then six organs
 * described across the two seats, what was turned down shot as it falls,
 * and their own ship found among ships.
 *
 * A body over the top of the field grows an organ a cycle — a contour the
 * game draws nowhere else — and the pilot alone is shown it; the navigator
 * alone is shown a rail of candidates with a colour and a column each, one
 * of which it is (`sim/antiphon.ts`). The organ's colour fired into the
 * organ's column takes it to a pit; a decoy's colour in the decoy's column
 * hardens the cycle and widens every rail after; an organ left its window
 * sinks back healed. From two pits the rail is one family and the window
 * eight beats; from three every candidate a pit rejected falls as a body
 * in its colour; from four two organs grow at once. Six pits, and the body
 * goes still and grows their own ship on a rail of ships.
 *
 * **The film is the mistake first.** The first organ stands over column 9
 * and the shot goes to a decoy at 8, in the decoy's colour: the body hardens,
 * the rail is four wide from then on, and nothing was lost but the cycle.
 * Every organ after is a cannon strip by `atBoss` (`sim/boss-answer.ts`),
 * the organ's own column, and the fire is its colour — which is what the
 * navigator says and the pilot cannot see. The strip and the fire are in
 * the beat the organ has pushed all the way out, five and twenty ticks in,
 * because a bolt into a contour still resolving is nothing
 * (`antiphonStruck`). The twins are taken one and then the other, the
 * second strip ninety-five ticks after the first so the first is a pit
 * before `atBoss` is asked again.
 *
 * **What was turned down is the field.** From the third pit every decoy on
 * the rail arrives as a body at the top of its column, and a body in the
 * next organ's column would stop the bolt: so each is taken where it falls
 * by `atBody`, two beats apart because the strip finds the lowest body and
 * the last one shot is still there a beat on. The organ's own shot waits
 * until the last body is down. Every page is on a control or on the hull:
 * the body is a fixture and no anchor names one (`docs/queue.md`, the gauge
 * item). Not shown: a sunk organ and the body it fires from four pits, and
 * a pit grown again from five — the fight is six pits long and the twins
 * take it from four to six in one cycle.
 */
export const THE_ANTIPHON: GuideScene = {
  ticks: 3720,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "antiphon" },
  acts: [
    // The wrong one: a decoy at column 8 in red, while the organ is at 9.
    { tick: 365, control: "cannon", col: 5 },
    { tick: 380, control: "fireRed" },
    // The organ, grown, in its colour: the first pit.
    { tick: 785, control: "cannon", col: 0, atBoss: true },
    { tick: 800, control: "fireCyan" },
    // The second, and the rail closes on its family.
    { tick: 1205, control: "cannon", col: 0, atBoss: true },
    { tick: 1220, control: "fireCyan" },
    // The third, and the three turned down fall, in their colours.
    { tick: 1625, control: "cannon", col: 0, atBoss: true },
    { tick: 1640, control: "fireCyan" },
    { tick: 1745, control: "cannon", col: 0, atBody: true },
    { tick: 1760, control: "fireRed" },
    { tick: 1865, control: "cannon", col: 0, atBody: true },
    { tick: 1880, control: "fireCyan" },
    { tick: 1985, control: "cannon", col: 0, atBody: true },
    { tick: 2000, control: "fireRed" },
    // The fourth, and three more fall.
    { tick: 2045, control: "cannon", col: 0, atBoss: true },
    { tick: 2060, control: "fireCyan" },
    { tick: 2165, control: "cannon", col: 0, atBody: true },
    { tick: 2180, control: "fireCyan" },
    { tick: 2285, control: "cannon", col: 0, atBody: true },
    { tick: 2300, control: "fireCyan" },
    { tick: 2405, control: "cannon", col: 0, atBody: true },
    { tick: 2420, control: "fireRed" },
    // The twins, one then the other; four fall with the second.
    { tick: 2465, control: "cannon", col: 0, atBoss: true },
    { tick: 2480, control: "fireRed" },
    { tick: 2555, control: "cannon", col: 0, atBoss: true },
    { tick: 2570, control: "fireCyan" },
    { tick: 2705, control: "cannon", col: 0, atBody: true },
    { tick: 2720, control: "fireCyan" },
    { tick: 2825, control: "cannon", col: 0, atBody: true },
    { tick: 2840, control: "fireRed" },
    { tick: 2945, control: "cannon", col: 0, atBody: true },
    { tick: 2960, control: "fireCyan" },
    { tick: 3065, control: "cannon", col: 0, atBody: true },
    { tick: 3080, control: "fireRed" },
    // Their own ship, over column 6, in red: every pit erupts.
    { tick: 3245, control: "cannon", col: 0, atBoss: true },
    { tick: 3260, control: "fireRed" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "IT GROWS ONE · SAY ITS SHAPE", anchor: { at: "hull" } },
    { tick: 240, seat: 2, text: "THREE ON THE RAIL · WHICH", anchor: { at: "hull" } },
    {
      tick: 420,
      seat: 2,
      text: "THE WRONG ONE · RAIL WIDER",
      anchor: { at: "control", control: "fireRed" },
    },
    { tick: 600, seat: 1, text: "SAY IT AGAIN · SHE NAMES IT", anchor: { at: "hull" } },
    {
      tick: 780,
      seat: 2,
      text: "SAY COLUMN AND COLOUR · FIRE",
      anchor: { at: "control", control: "fireCyan" },
    },
    {
      tick: 960,
      seat: 1,
      text: "SLIDE UNDER THE ONE SHE SAYS",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 1140,
      seat: 2,
      text: "FIRE ITS COLOUR · A PIT",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 1320, seat: 1, text: "TWO PITS · NOW EIGHT BEATS", anchor: { at: "hull" } },
    { tick: 1500, seat: 2, text: "THE RAIL IS ONE FAMILY NOW", anchor: { at: "hull" } },
    {
      tick: 1680,
      seat: 2,
      text: "WHAT YOU TURN DOWN FALLS",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 1860,
      seat: 1,
      text: "SLIDE UNDER THEM · SHE FIRES",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 2040,
      seat: 2,
      text: "FIRE · FOUR · MORE FALL",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 2220, seat: 1, text: "TWO GROW AT ONCE · SAY BOTH", anchor: { at: "hull" } },
    {
      tick: 2400,
      seat: 2,
      text: "ONE THEN THE OTHER · FIRE",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 2580,
      seat: 2,
      text: "SHOOT THE FOUR THAT FALL",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 2760, seat: 1, text: "SIX PITS · IT GOES STILL", anchor: { at: "hull" } },
    { tick: 2940, seat: 2, text: "LAST · SHIPS · WHICH IS OURS", anchor: { at: "hull" } },
    {
      tick: 3120,
      seat: 1,
      text: "OUR OWN SHIP · SAY WHICH",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 3300,
      seat: 2,
      text: "RIGHT · EVERY PIT ERUPTS",
      anchor: { at: "control", control: "fireRed" },
    },
    { tick: 3480, seat: 1, text: "OUT · IT HAD NO NAME", anchor: { at: "hull" } },
  ],
};
