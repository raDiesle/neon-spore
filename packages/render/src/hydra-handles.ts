import type { Point } from "@neon-spore/content";
import {
  type HydraState,
  hydraLapsOf,
  hydraUnwindWay,
  rimLapMilli,
  type SimConfig,
} from "@neon-spore/sim";
import { seatIsMine } from "./handle-word.js";
import {
  hydraCoilKnob,
  hydraCoilRim,
  hydraMarkPlayer,
  hydraMarkTakes,
  hydraNeckKnob,
  hydraNeckRest,
  hydraNeckTrack,
} from "./hydra-grip.js";
import { COIL_CORE_TILES } from "./hydra-shape.js";
import type { Layout } from "./layout.js";
import { drawMazeLever } from "./maze-lever.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { drawPullTrack, PULL_TRACK_W, pullWay } from "./pull-track.js";

/**
 * **THE HYDRA's knobs**, in the field's one look for a thumb's control
 * (`pull-knob.ts`, `pull-track.ts`): the owner, 5 October 2026, *use the
 * default visuals for on screen controls we have*.
 *
 * - **A knob on each side's next neck** while the biting heads are lit,
 *   coming down with its head, wearing the arrow the way the neck is cut and,
 *   on its own seat's screen, the channel straight across it, filling as the
 *   thumb carries it.
 * - **THE MAZE's lever on each coil** while the coils are lit
 *   (`maze-lever.ts`), its arm bolted to the coil's middle, on a ring channel
 *   with the arrow round the way the coil unwinds, the channel filling with
 *   how far round the lap is.
 *
 * The partner's knob is drawn too, dim, with no arrow and no channel: what
 * says their thumb has landed. The eyes wear no knob — the open eye is the
 * mark, its halo and its `TAP` (`hydra-verdicts.ts`, `boss-cue-read-zx.ts`).
 */

/** Points round a coil's channel. */
const RIM_STEPS = 48;

export function drawHydraHandles(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HydraState,
  time: number,
): void {
  for (const side of [0, 1] as const) {
    if (hydraMarkTakes(s, side)) drawNeckKnob(ctx, l, cfg, s, side, time);
    if (hydraMarkTakes(s, side === 0 ? 2 : 3)) drawCoilLever(ctx, l, cfg, s, side, time);
  }
}

function drawNeckKnob(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HydraState,
  side: 0 | 1,
  time: number,
): void {
  const mine = seatIsMine(l.role, hydraMarkPlayer(side));
  const rest = hydraNeckRest(l, cfg, s, side);
  const at = hydraNeckKnob(l, cfg, s, side);
  const track = hydraNeckTrack(l, cfg, s, side);
  const along = s.down[side] ? Math.min(1, s.cutMilli[side] / cfg.hydraCutMilli) : 0;
  const held = s.down[side] && !s.spent[side];
  const key = `hydra:neck:${side}`;
  if (mine) drawPullTrack(ctx, track, { ...look(mine), held, origin: 0, at: along, time, key });
  drawPullKnob(ctx, at, rest.r, {
    ...look(mine),
    held,
    time,
    way: mine ? pullWay(track, along, 1) : null,
    theirs: !mine,
    key,
  });
}

function drawCoilLever(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HydraState,
  side: 0 | 1,
  time: number,
): void {
  const mine = seatIsMine(l.role, hydraMarkPlayer(side === 0 ? 2 : 3));
  const rim = hydraCoilRim(l, cfg, side);
  const knob = hydraCoilKnob(l, cfg, s, side);
  const way = hydraUnwindWay(side);
  const held = s.turning[side];
  const key = `hydra:coil:${side}`;
  if (mine) {
    // From the top round the way it unwinds, filling with the lap turned so far.
    const pts: Point[] = [];
    for (let k = 0; k <= RIM_STEPS; k++) {
      const a = -Math.PI / 2 + way * (k / RIM_STEPS) * Math.PI * 2;
      pts.push({ x: rim.x + Math.cos(a) * rim.r, y: rim.y + Math.sin(a) * rim.r });
    }
    const laps = s.unwoundMilli[side] / rimLapMilli(cfg.hydraCoilRimMilli);
    const at = Math.min(hydraLapsOf(s), laps) % 1;
    drawPullTrack(
      ctx,
      { pts, w: knob.r * PULL_TRACK_W, closed: true },
      { ...look(mine), held, origin: 0, at, time, key },
    );
  }
  const hub = { cx: rim.x, cy: rim.y, r: COIL_CORE_TILES * l.tile };
  drawMazeLever(ctx, hub, knob, knob.r, held);
  const a = Math.atan2(knob.y - rim.y, knob.x - rim.x);
  drawPullKnob(ctx, knob, knob.r, {
    ...look(mine),
    held,
    time,
    way: mine ? { dx: -Math.sin(a) * way, dy: Math.cos(a) * way } : null,
    theirs: !mine,
    key,
  });
}

/** A knob's colours: THE MAZE's on this screen's own, dim on the partner's. */
function look(mine: boolean): { hex: string; rim: string } {
  return mine
    ? { hex: PALETTE.hullRim, rim: PALETTE.text }
    : { hex: PALETTE.dim, rim: PALETTE.rock };
}
