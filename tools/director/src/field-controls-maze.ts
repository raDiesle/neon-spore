import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE MAZE's two handles, in a file of their own — `field-controls-page.ts`
 * is at its limit, the split every boss since THE INSTAR has made. The string
 * came out of that page with the heart, so the round's two hands sit
 * together: the pilot's turn, and under `grip` her brace, are one control on
 * one target (`sim/maze-controls.ts`); the navigator's tear is the other
 * (`sim/maze-hand.ts`, `render/maze-grip.ts`, `docs/spec/bosses.md` §11.10).
 */
export const MAZE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE MAZE'S STRING",
    where:
      "on the drum's resting circle, while the wheel is being read; and again " +
      "under grip, with HOLD over it, while the right shot sits in the heart",
    seat: "player 1 — the pilot's half of the round; player 2's press falls through",
    gesture: "grab and drag",
    does:
      "Turns the wheel by how far the hand has come from where it grabbed. " +
      "Under grip it turns nothing: the press is the brace the tear needs, " +
      "and the wheel stays where it stood (sim/maze-controls.ts).",
    source: "touch.ts — mazeStringUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "mazeString",
    sends: ["drag"],
    pose: "MAZE · THE WHEEL TO READ",
  },
  {
    name: "THE MAZE'S HEART",
    where:
      "a ring on the heart in the middle of the drum, on player 2's screen " +
      "once the right shot is in it; nowhere on player 1's; on the test screen",
    seat: "player 2 only — the navigator, whose colour the shot was",
    gesture: "grab and drag",
    does:
      "Tears the heart out: with P1 braced on the string, the thumb drags it " +
      "down mazeHeartPullMilli of a tile before mazeGripBeats run out, and " +
      "the round is won. Lifted early, or with no brace, the heart springs " +
      "back and the count runs on (sim/maze-hand.ts).",
    source: "touch.ts — mazeHeartUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "mazeHeart",
    sends: ["drag"],
    pose: "THE MAZE · GRIP",
  },
];
