import {
  type LampreyState,
  lampreyAsks,
  lampreyBiting,
  lampreyHeadPull,
  lampreyHolder,
  lampreyTailHeld,
  lampreyTailPull,
  lampreyWorker,
  type SimConfig,
} from "@neon-spore/sim";
import { seatIsMine } from "./handle-word.js";
import { lampreyHeadRest, lampreyTailAt, lampreyTailDir, lampreyTailRest } from "./lamprey-grip.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { PULL_UP, straightPullTrack } from "./pull-line.js";
import { drawPullTrack, pullWay } from "./pull-track.js";

/**
 * **THE LAMPREY's handles**, in the field's one look for a thumb's control
 * (`pull-knob.ts`, `pull-track.ts`): the owner, 5 October 2026, *use the
 * default visuals for on screen controls we have*.
 *
 * **The tail's knob** stands where the tail rests, every bite, for the
 * holder: a knob with no arrow while it is only held, and in an `apart` a
 * channel along the body away from the head, `lampreyTailPullMilli` long,
 * filling as the thumb drags it. **The head's knob** stands on the tile in a
 * `pull` or an `apart`, for the other seat, with a channel straight up,
 * `lampreyHeadPullMilli` long; it rides up with the head as it comes off.
 *
 * The partner's knob is drawn too, with no arrow and no channel: what says
 * their thumb has landed (`sinew-handles.ts`).
 */
export function drawLampreyHandles(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  time: number,
): void {
  if (!lampreyBiting(s)) return;
  const ask = lampreyAsks(s);
  const holder = lampreyHolder(s);
  const worker = lampreyWorker(s);
  if (holder !== null) {
    const mine = seatIsMine(l.role, holder);
    const rest = lampreyTailRest(l, cfg, s);
    const held = lampreyTailHeld(s);
    if (ask === "apart") {
      const at = lampreyTailAt(l, cfg, s);
      const pull = Math.min(1, lampreyTailPull(s) / Math.max(1, cfg.lampreyTailPullMilli));
      const len = (cfg.lampreyTailPullMilli * l.tile) / 1000;
      const dir = lampreyTailDir(l, s);
      const track = straightPullTrack({
        from: rest,
        r: rest.r,
        head: at,
        held,
        rest: dir,
        len,
        follow: false,
      });
      if (mine) drawPullTrack(ctx, track, { ...look(mine), held, origin: 0, at: pull, time });
      const way = mine ? pullWay(track, pull, 1) : null;
      drawPullKnob(ctx, at, rest.r, { ...look(mine), held, time, way, theirs: !mine });
    } else {
      drawPullKnob(ctx, rest, rest.r, { ...look(mine), held, time, way: null, theirs: !mine });
    }
  }
  if (worker !== null && (ask === "pull" || ask === "apart")) {
    const mine = seatIsMine(l.role, worker);
    const rest = lampreyHeadRest(l, cfg, s);
    const lift = lampreyHeadPull(s);
    const pull = Math.min(1, lift / Math.max(1, cfg.lampreyHeadPullMilli));
    const at = { ...rest, y: rest.y - (lift * l.tile) / 1000 };
    const len = (cfg.lampreyHeadPullMilli * l.tile) / 1000;
    const held = lift > 0;
    const track = straightPullTrack({
      from: rest,
      r: rest.r,
      head: at,
      held,
      rest: PULL_UP,
      len,
      follow: false,
    });
    if (mine) drawPullTrack(ctx, track, { ...look(mine), held, origin: 0, at: pull, time });
    const way = mine ? PULL_UP : null;
    drawPullKnob(ctx, at, rest.r, { ...look(mine), held, time, way, theirs: !mine });
  }
}

/** A knob's colours: THE MAZE's on this screen's own, dim on the partner's. */
function look(mine: boolean): { hex: string; rim: string } {
  return mine
    ? { hex: PALETTE.hullRim, rim: PALETTE.text }
    : { hex: PALETTE.dim, rim: PALETTE.rock };
}
