import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE MAZE's two handles, in a file of their own — `field-controls-page.ts`
 * is at its limit, the split every boss since THE INSTAR has made. The string
 * came out of that page with the heart, so the round's two hands sit
 * together: the pilot's turn is one control on one target
 * (`sim/maze-controls.ts`); the pair's shake is the other (`sim/maze-hand.ts`,
 * `render/maze-grip.ts`, `docs/spec/bosses.md` §11.10).
 */
export const MAZE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE MAZE'S STRING",
    where: "on the drum's resting circle, while the wheel is being read",
    seat:
      "player 1 — the pilot's half of the round; player 2's press is refused, " +
      "washing the knob red, and she sees his ring and the clock on it",
    gesture: "grab and drag",
    does:
      "Turns the wheel by how far the hand has come from where it grabbed " +
      "(sim/maze-controls.ts).",
    source: "touch.ts — mazeStringUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "mazeString",
    sends: ["drag"],
    pose: "MAZE · THE WHEEL TO READ",
  },
  {
    name: "THE MAZE'S HEART",
    where:
      "THE RUB LAB's drop on the heart in the middle of the drum, on both screens once the " +
      "right shot is in it, wagging and saying RUB until this seat's thumb lands; " +
      "on the test screen",
    seat: "both — each seat's thumb rubs the same heart, and each has half the rub to do",
    gesture: "grab and drag",
    does:
      "Rubs the heart loose: a thumb scrubbed back and forth over it, and " +
      "every time it turns back is one turn. mazeHeartTurns in all, half from " +
      "each seat, before mazeGripBeats run out, and the round is won; the " +
      "drop's zigzag lights stroke by stroke as it goes (sim/maze-hand.ts, sim/maze-rub.ts).",
    source: "touch.ts — mazeHeartUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "mazeHeart",
    sends: ["drag"],
    pose: "THE MAZE · GRIP",
  },
];
