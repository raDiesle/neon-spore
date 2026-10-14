import {
  bastionTrackLen,
  type ChrysalisState,
  chrysalisQuillOf,
  chrysalisTrackOf,
  type SimConfig,
} from "@neon-spore/sim";
import {
  chrysalisKnobAt,
  chrysalisKnobRest,
  chrysalisMarkPlayer,
  chrysalisMarkTakes,
  chrysalisTrack,
} from "./chrysalis-grip.js";
import { seatIsMine } from "./handle-word.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { drawPullTrack, pullWay } from "./pull-track.js";

/**
 * **THE CHRYSALIS's quill knobs**, in the field's one look for a thumb's
 * control (`pull-knob.ts`, `pull-track.ts`) — THE BASTION's slab knob on a
 * spine (`bastion-handles.ts`): the owner, 5 October 2026, *use the default
 * visuals for on screen controls we have*.
 *
 * **A knob on each side's next quill** while the quills are lit, wearing the
 * arrow along the quill's track and, on its own seat's screen, the channel of
 * the whole track — straight out, or bending round the cocoon — filling as
 * the thumb carries it. The partner's knob is drawn too, dim, with no arrow
 * and no channel: what says their thumb has landed.
 *
 * The halves of slime wear no knob: a rub is THE RUB LAB's drop, and the
 * drop is drawn by its cue (`boss-cue-read-zw.ts`, `rub-drop.ts`).
 */
export function drawChrysalisHandles(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  time: number,
): void {
  for (const side of [0, 1] as const) {
    if (!chrysalisMarkTakes(s, side)) continue;
    const mine = seatIsMine(l.role, chrysalisMarkPlayer(side));
    const rest = chrysalisKnobRest(l, cfg, s, side);
    const at = chrysalisKnobAt(l, cfg, s, side);
    const i = chrysalisQuillOf(s, side);
    const len = bastionTrackLen(cfg, chrysalisTrackOf(s, i));
    const track = chrysalisTrack(l, cfg, s, side);
    const along = Math.min(1, s.pullMilli[side] / Math.max(1, len));
    const held = s.down[side];
    const key = `chrysalis:${side}`;
    if (mine) {
      drawPullTrack(ctx, track, { ...look(mine), held, origin: 0, at: along, time, key });
    }
    drawPullKnob(ctx, at, rest.r, {
      ...look(mine),
      held,
      time,
      way: mine ? pullWay(track, along, 1) : null,
      theirs: !mine,
      key,
    });
  }
}

/** A knob's colours: THE MAZE's on this screen's own, dim on the partner's. */
function look(mine: boolean): { hex: string; rim: string } {
  return mine
    ? { hex: PALETTE.hullRim, rim: PALETTE.text }
    : { hex: PALETTE.dim, rim: PALETTE.rock };
}
