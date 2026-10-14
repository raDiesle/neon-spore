import { drawRubZigzag } from "../../../../packages/render/src/rub-zigzag.js";
import type { Rubbed } from "./goo.js";

/**
 * **ZIGZAG** — THE RUB LAB's one way to say how many turns a mark asks before
 * it is touched, and how many are done: the gesture itself, drawn on the
 * drop, one stroke of a zigzag for every turn it asks, top to bottom, so four
 * turns is a W and sixteen a tight scribble. Each turn lights the next stroke
 * green, the newest white. The game's own since 14 October 2026, every rub on
 * the field wearing it (`rub-zigzag.ts`, `rub-drop.ts` in render); the lab
 * draws it from there.
 */
export const ZIGZAG: Rubbed = {
  key: "zigzag",
  name: "zigzag",
  sentence:
    "the gesture drawn on the drop: one stroke of a zigzag for every turn it asks, top to bottom — four is a W, sixteen a tight scribble; each turn lights the next stroke green",
  over(v, drawn, tone) {
    drawRubZigzag(v.ctx, drawn, v.ask.turns, v.done, tone, Math.exp(-v.turned * 8));
  },
};
