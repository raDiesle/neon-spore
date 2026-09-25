import type { GuideScene } from "../scene-types.js";

/**
 * THE DARK's rehearsal: a field put out, a thumb lighting it, and the body
 * nobody lit.
 *
 * **The first page lets it happen.** A cyan body comes down the middle and on
 * the second beat the field above the ship goes black on both screens and the
 * body with it (`render/dark-field.ts`). Nothing is said about where it went.
 *
 * Then the wave's answer in two pages, one seat each: the pilot's thumb
 * dragged across the row the body is falling through, three squares lit — on
 * both screens, because the light is a command (`sim/dark.ts`) — and the
 * navigator firing its colour at what the light found. The body comes down
 * the cannon's own column, so no page is spent carrying the cannon: the dark
 * is the lesson, and aiming is not.
 *
 * **And the cost, last.** A red body comes down the other side and nobody
 * lights it, so it is never seen at all until the hull takes it.
 */
export const THE_DARK: GuideScene = {
  ticks: 1800,
  bpm: 120,
  seed: 1,
  // From the second beat to the end of the loop, as the wave's own
  // placement is from its fourth (`waves/act-10.ts`).
  faults: [{ kind: "dark", at: 2 }],
  entries: [
    { beat: 1, col: 3, color: "cyan" },
    { beat: 12, col: 5, color: "red" },
  ],
  acts: [
    // The swipe: three squares of the row the body is *drawn* in, a few ticks
    // apart, the way `lightMove` sends one per square crossed. Drawn, not
    // stored: a falling body glides in from the row above its own, and a thumb
    // lights what it sees (`render/dark-field.ts` asks the drawn row too).
    { tick: 570, tile: 1, col: 2, row: 8, light: true },
    { tick: 580, tile: 1, col: 3, row: 8, light: true },
    { tick: 590, tile: 1, col: 4, row: 8, light: true },
    { tick: 750, control: "fireCyan" },
  ],
  steps: [
    { tick: 0, seat: 1, text: "THE LIGHTS GO OUT", anchor: { at: "body" } },
    { tick: 480, seat: 1, text: "PLAYER 1 LIGHTS THE DARK", anchor: { at: "body" } },
    {
      tick: 660,
      seat: 2,
      text: "PLAYER 2 FIRES CYAN",
      anchor: { at: "control", control: "fireCyan" },
    },
    { tick: 1320, seat: 1, text: "NOBODY LIT IT · IT HIT", anchor: { at: "hit" } },
  ],
};
