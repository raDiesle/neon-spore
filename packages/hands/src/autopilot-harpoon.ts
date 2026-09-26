import {
  beatPhaseTicks,
  type HarpoonKind,
  harpoonBody,
  midCol,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";

/**
 * **THE LIMPET and THE LEECH, on AUTO**: a harpooned control is kept moving.
 *
 * Both are faults that fire a body onto a control, the shield's for the limpet
 * and the cannon's for the leech. A control that stands in one column for
 * `harpoonStillBeats` loses the round (`harpoon.ts`), and the field hand
 * otherwise parks both under whatever they are answering. So once a beat, at
 * the middle of it, the harpooned control steps one column toward the middle
 * of the field. On the next tick the field hand carries it back to its target,
 * which is a second move. The middle of the beat is as far as a tick gets from
 * the beat a body lands on and from the trigger pressed just before it.
 */
export function shake(w: World, kind: HarpoonKind, col: number): number | null {
  if (harpoonBody(w, kind) === undefined) return null;
  if (beatPhaseTicks(w.cfg, w.tick) !== Math.floor(ticksPerBeat(w.cfg) / 2)) return null;
  return col < midCol(w.cfg) ? col + 1 : col - 1;
}
