import type { Point } from "@neon-spore/content";
import { choice } from "../field-try-bar.js";
import { paintBall } from "./ball.js";
import { type GooBody, paintBody } from "./body.js";
import { grabChoice } from "./grab.js";
import type { GooStyle } from "./style.js";

/**
 * **How every GOO drop is drawn**: as the flat slime SINK was picked in, or
 * as a lit ball whose surface rolls (`ball.ts`). The PULL LAB's bar picks
 * it (`DROP · FLAT` / `DROP · 3D BALL`) for every GOO look at once, so an
 * ending is judged with either drop rather than doubling the picker. A
 * director setting, not the game's: nothing here is stored.
 */
export const GOO_DROP: { ball: boolean } = { ball: true };

/** The drop, as the bar has it; `way` is the way a ball rolls, down when not given. */
export function paintGoo(
  ctx: CanvasRenderingContext2D,
  b: GooBody,
  style: GooStyle,
  time: number,
  tint: { red: number; green?: number; alpha?: number },
  way: Point = { x: 0, y: 1 },
): void {
  if (GOO_DROP.ball) paintBall(ctx, b, style, time, tint, way);
  else paintBody(ctx, b, style, time, tint);
}

/** The bar's choices for every GOO drop: flat or a ball, and how it is taken (`grab.ts`);
 * `changed` redraws whatever is not redrawn every frame. */
export function dropChoices(changed: () => void): HTMLElement[] {
  const look = choice(
    [
      ["DROP · FLAT", false],
      ["DROP · 3D BALL", true],
    ],
    GOO_DROP.ball,
    (ball) => {
      GOO_DROP.ball = ball;
      changed();
    },
  );
  return [look, grabChoice()];
}
