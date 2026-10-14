import type { GuideScene } from "../scene-types.js";

/**
 * THE LID's rehearsal: doing your half first is the same as not doing it.
 *
 * An armoured eye with a cord hanging off it. The plates over the lens part
 * while the cord is pulled aside and shut the instant it is let go, and only
 * while they stand fully apart does the lens's own colour land. So the two
 * halves are not merely split, they are **ordered**: both of player 1's thumbs
 * are spoken for once he has hold of the cord, so the cannon has to be in the
 * column before he takes it.
 *
 * That is why the film spends a page on the cannon before anything is pulled.
 * It is not a page about the cannon — the pair has slid it since wave one — it
 * is a page about the order, which is the whole wave.
 *
 * **The pull is straight down, because that is the way the cord runs here.**
 * The cord runs one fixed path, the first way the field holds the whole of
 * `lidTautMilli` of (`sim/lid-way.ts`), and a lid this high has room below it;
 * a hand carried across as well counts only its travel down.
 */
export const THE_LID: GuideScene = {
  ticks: 900,
  bpm: 120,
  seed: 1,
  entries: [{ beat: 0, col: 5, kind: "lid", color: "cyan" }],
  acts: [
    { tick: 90, control: "cannon", col: 4 },
    { tick: 130, control: "cannon", col: 5 },
    // Taken while the eye is still high: the cord is carried straight down and
    // a pull is clamped to stay on the field (`sim/handle-pull.ts`), so a body
    // that has fallen most of the way has no room left under it to pull into.
    { tick: 330, drag: "lidString", col: 5, by: 480, until: 940 },
    { tick: 610, control: "fireCyan" },
  ],
  steps: [
    {
      tick: 0,
      seat: 1,
      text: "CANNON FIRST, THEN THE CORD",
      anchor: { at: "control", control: "cannon" },
    },
    {
      tick: 240,
      seat: 1,
      text: "PULL IT AND KEEP PULLING",
      anchor: { at: "handle", target: "lidString" },
    },
    {
      tick: 520,
      seat: 2,
      text: "FIRE WHILE THEY ARE OPEN",
      anchor: { at: "control", control: "fireCyan" },
    },
  ],
};
