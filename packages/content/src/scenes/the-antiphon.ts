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
 * sixteen beats; from three every candidate a pit rejected falls as a body
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
 * **And the pages the field took over.** The body goes still for the four
 * beats before the ship on both screens, and the field says no word over it
 * (`render/boss-cue-read-p.ts`; its `STILL` went on 25 September 2026), so the
 * page that announced the still says the length instead — a number the picture
 * cannot carry. The organ has said `TURN` since
 * the handle shipped (`render/antiphon-grip.ts`); the film turns it once now,
 * a thumb held on it through the gap between the wrong shot and the first
 * pit, and the page that used to repeat what the navigator's own pages
 * already ask says what the turn buys instead — a second look at the shape
 * (`docs/queue.md`). What stays written is every number and every column, and
 * there is a great deal of it, because this boss's split is the whole
 * encounter: the field says no shape, no colour and no column in either
 * direction.
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
 *
 * **The seam, when this reaches its ceiling**: the pages go to a file of
 * their own named for them, and the acts stay here beside the paragraphs that
 * say why each tick is where it is.
 */
export const THE_ANTIPHON: GuideScene = {
  ticks: 3720,
  bpm: 120,
  // The game's own half-beat grid: every press sits fifteen ticks before the
  // point its bolt leaves on, as THE HIVE's do (`scene-types.ts` `chargeBeats`).
  chargeBeats: 0.5,
  seed: 1,
  entries: [],
  boss: { kind: "antiphon" },
  acts: [
    // The wrong one: a decoy at column 8 in red, while the organ is at 9.
    { tick: 365, control: "cannon", col: 5 },
    { tick: 365, control: "fireRed" },
    // The pilot's thumb has nothing else to do until the first strip at 785,
    // and this is the turn: a hold on the organ itself, long enough to see it
    // come round (`antiphonTurnBeats`, `render/antiphon-grip.ts`).
    { tick: 600, drag: "antiphonOrgan", hand: 1, until: 780 },
    // The organ, grown, in its colour: the first pit.
    { tick: 785, control: "cannon", col: 0, atBoss: true },
    { tick: 785, control: "fireCyan" },
    // The second, and the rail closes on its family.
    { tick: 1205, control: "cannon", col: 0, atBoss: true },
    { tick: 1205, control: "fireCyan" },
    // The third, and the three turned down fall, in their colours.
    { tick: 1625, control: "cannon", col: 0, atBoss: true },
    { tick: 1625, control: "fireCyan" },
    { tick: 1745, control: "cannon", col: 0, atBody: true },
    { tick: 1745, control: "fireRed" },
    { tick: 1865, control: "cannon", col: 0, atBody: true },
    { tick: 1865, control: "fireCyan" },
    { tick: 1985, control: "cannon", col: 0, atBody: true },
    { tick: 1985, control: "fireRed" },
    // The fourth, and three more fall.
    { tick: 2045, control: "cannon", col: 0, atBoss: true },
    { tick: 2045, control: "fireCyan" },
    { tick: 2165, control: "cannon", col: 0, atBody: true },
    { tick: 2165, control: "fireCyan" },
    { tick: 2285, control: "cannon", col: 0, atBody: true },
    { tick: 2285, control: "fireCyan" },
    { tick: 2405, control: "cannon", col: 0, atBody: true },
    { tick: 2405, control: "fireRed" },
    // The twins, one then the other; four fall with the second.
    { tick: 2465, control: "cannon", col: 0, atBoss: true },
    { tick: 2465, control: "fireRed" },
    // The second slides only once the first has pitted, or it aims at the
    // first twin again, so its bolt leaves on the point after that, at 2580.
    { tick: 2560, control: "cannon", col: 0, atBoss: true },
    { tick: 2565, control: "fireCyan" },
    { tick: 2705, control: "cannon", col: 0, atBody: true },
    { tick: 2705, control: "fireCyan" },
    { tick: 2825, control: "cannon", col: 0, atBody: true },
    { tick: 2825, control: "fireRed" },
    { tick: 2945, control: "cannon", col: 0, atBody: true },
    { tick: 2945, control: "fireCyan" },
    { tick: 3065, control: "cannon", col: 0, atBody: true },
    { tick: 3065, control: "fireRed" },
    // Their own ship, over column 6, in red: every pit erupts.
    { tick: 3245, control: "cannon", col: 0, atBoss: true },
    { tick: 3245, control: "fireRed" },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "IT GROWS ONE · SAY ITS SHAPE",
      anchor: { at: "boss", part: "organ" },
    },
    {
      tick: 240,
      seat: 2,
      text: "THREE ON THE RAIL · WHICH",
      anchor: { at: "boss", part: "rail" },
      counts: [{ of: "antiphonRail", is: 3 }],
    },
    {
      tick: 420,
      seat: 2,
      text: "THE WRONG ONE · RAIL WIDER",
      anchor: { at: "control", control: "fireRed" },
    },
    {
      tick: 600,
      seat: 1,
      text: "TURN IT · A SECOND ANGLE",
      anchor: { at: "boss", part: "organ" },
    },
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
    // The window is drawn beside the rail and nowhere else (`drawWindow` inside
    // `showsAntiphonRail`), so this page was on the screen that cannot see the
    // number it names, and the seat racing it was not told.
    { tick: 1320, seat: 2, text: "TWO PITS · SIXTEEN BEATS NOW", anchor: { at: "boss" } },
    {
      tick: 1500,
      seat: 2,
      text: "THE RAIL IS ONE FAMILY NOW",
      anchor: { at: "boss", part: "rail" },
    },
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
    {
      tick: 2220,
      seat: 1,
      text: "TWO GROW AT ONCE · SAY BOTH",
      anchor: { at: "boss", part: "organ" },
    },
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
    // The stilling is drawn to both screens, so what is left to write is the
    // number the picture cannot say.
    { tick: 2760, seat: 1, text: "FOUR BEATS · NOTHING LANDS", anchor: { at: "boss" } },
    {
      tick: 2940,
      seat: 2,
      text: "LAST · SHIPS · WHICH IS OURS",
      anchor: { at: "boss", part: "rail" },
    },
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
    { tick: 3480, seat: 1, text: "OUT · IT HAD NO NAME", anchor: { at: "boss" } },
  ],
};
