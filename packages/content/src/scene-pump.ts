import type { SceneCommand } from "@neon-spore/sim";
import type { SceneAct } from "./scene-act-types.js";

/**
 * **A hand working a pump**: THE THROAT's handle, stroked down and up and down
 * again for as long as the act holds it (`sim/throat-hand.ts`).
 *
 * Its own file for the reason `scene-turn.ts` is one: next door a hand is
 * carried one way to a distance and stops, and a pump is the one handle whose
 * whole gesture is going *back*. A film of single carries would let go between
 * strokes, and a lifted thumb's first stroke is free of the gain — so a film
 * of carries would never pump at all.
 *
 * **The pump is a rub** (`render/rub-turns.ts`): what the simulation reads is
 * `id`, the turns since the thumb went down, and the height is only the hand
 * the film draws going down and up with them.
 */

/** Ticks between two samples of the hand: a half stroke each, so the hand
 * turns every other sample — five turns a second, a quick thumb, and the
 * circle seen growing for about two seconds rather than open at once. */
const SAMPLE_TICKS = 6;

/** How far down the handle the film's hand goes, in thousandths of a tile:
 * three tiles, a deliberate stroke. */
const REACH_MILLI = 3000;

export function pumpCommands(act: SceneAct, player: 1 | 2): SceneCommand[] {
  const reach = act.toMilli ?? REACH_MILLI;
  const until = act.until ?? act.tick;
  const out: SceneCommand[] = [];
  // 0, half, all, half, 0, half, all … — the hand's height down the handle.
  const heights = [0, reach / 2, reach, reach / 2];
  let i = 0;
  for (let at = act.tick; at < until; at += SAMPLE_TICKS) {
    const fromYMilli = Math.round(heights[i % heights.length] ?? 0);
    // A turn at the foot of the stroke and at its top: every other sample.
    out.push({ tick: at, player, command: drag(true, fromYMilli, Math.floor(i / 2)) });
    i++;
  }
  out.push({ tick: until, player, command: drag(false, 0, Math.floor(i / 2)) });
  return out;
}

function drag(on: boolean, fromYMilli: number, id: number) {
  return { kind: "drag", target: "throatPump", on, fromMilli: 0, fromYMilli, id } as const;
}
