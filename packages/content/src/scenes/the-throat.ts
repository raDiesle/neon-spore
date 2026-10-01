import type { GuideScene } from "../scene-types.js";

/**
 * THE THROAT's rehearsal: the mouth is carried, the pump opens it, and its
 * colour says what it eats.
 *
 * Rewritten 1 October 2026 with the boss, when the owner found the old fight
 * not logical and asked for it again from nothing (`sim/throat.ts`). The old
 * film taught gums, inhales and a sliding mouth, and none of the three is in
 * the fight any more.
 *
 * In order: a red slick falls down the mouth's own column (authored column 3
 * is field column 5 of eleven, `throatHomeCol`); player 2 carries the mouth up
 * toward it from tick 150; player 1 pumps from 300, the circle opens and takes
 * it on beat 7 — the mouth is red from the start. Then a cyan bulb falls down
 * the same column into the red mouth and is refused from tick 900: it shakes
 * and keeps falling. Player 2 sets cyan at 1020, and the same pump takes it on
 * that tick. Two rings slack of five, and the last page says what is left to
 * the win.
 *
 * The pump is one long hold over both bodies (`scene-pump.ts`), because a
 * pilot who stops sees the circle close in under three seconds and the film
 * would teach that the pump is a thing you do once.
 */
export const THE_THROAT: GuideScene = {
  ticks: 1380,
  bpm: 120,
  seed: 1,
  entries: [
    { beat: 1, col: 3, color: "red" },
    { beat: 9, col: 3, color: "cyan" },
  ],
  boss: { kind: "throat" },
  acts: [
    { tick: 150, drag: "throatAim", until: 270 },
    { tick: 300, drag: "throatPump", until: 1260 },
    { tick: 1020, control: "throatCyan" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "PLAYER 2 DRAGS THE MOUTH", anchor: { at: "boss" } },
    { tick: 270, seat: 1, text: "PLAYER 1 PUMPS UP AND DOWN", anchor: { at: "boss" } },
    { tick: 450, seat: 1, text: "FAST PUMP · WIDE PULL", anchor: { at: "boss" } },
    { tick: 780, seat: 2, text: "WRONG COLOUR · IT STAYS", anchor: { at: "boss" } },
    {
      tick: 960,
      seat: 2,
      text: "SET ITS COLOUR",
      anchor: { at: "control", control: "throatCyan" },
    },
    { tick: 1140, seat: 1, text: "EAT 5 · IT TURNS INSIDE OUT", anchor: { at: "boss" } },
  ],
};
