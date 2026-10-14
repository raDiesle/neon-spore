import { hitCircle, type Layout } from "./layout.js";
import { sinewHandleCircle, sinewHandleSeat } from "./sinew-handles.js";
import { sinewLanded } from "./sinew-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE SINEW's handles answering a thumb**, cut off `sinew-handles.ts`,
 * which draws them, when their way down bowed (`sim/sinew-bow.ts`).
 *
 * The press. `bossOf(field, "sinew")` is `null` on every wave without the
 * boss, and a press then falls through to whatever is behind it exactly as if
 * no ring were there. This seat's own handle is taken hold of; the partner's
 * is handed through holding nothing, for the simulation to refuse in red
 * (`sim/sinew-hand.ts`, `sinew-marks.ts`) — a press and no more, so no move of
 * the thumb is refused a second time. Once the mass has landed no handle is
 * drawn, and neither answers.
 */
export function sinewHandleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "sinew");
  if (s === null || sinewLanded(s)) return null;
  for (const side of [-1, 1] as const) {
    const rest = sinewHandleCircle(l, field.cfg, s, field.beat, field.beatPhase, side);
    if (!hitCircle(rest, x, y)) continue;
    const target = side === -1 ? "sinewLeft" : "sinewRight";
    const command = { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 } as const;
    if (sinewHandleSeat(side) !== field.seat) return { player: field.seat, command, hold: null };
    return {
      player: field.seat,
      command,
      hold: { kind: "drag", target, player: field.seat, originX: x, originY: y },
    };
  }
  return null;
}

/**
 * **Whose thumb the handle under this point is for** — the desk's question
 * before a press (`desk-grab.ts`, as `spoolGripSeat`), because both handles
 * are there for either seat and each refuses the one it is not.
 */
export function sinewGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "sinew");
  if (s === null || sinewLanded(s)) return undefined;
  for (const side of [-1, 1] as const) {
    const rest = sinewHandleCircle(l, field.cfg, s, field.beat, field.beatPhase, side);
    if (hitCircle(rest, x, y)) return sinewHandleSeat(side);
  }
  return undefined;
}
