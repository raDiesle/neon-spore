import type { Point } from "@neon-spore/content";
import {
  type BastionState,
  bastionPlateOf,
  bastionTrackLen,
  bastionTrackOf,
  bastionTrackPoints,
  type SimConfig,
} from "@neon-spore/sim";
import {
  bastionKnobAt,
  bastionKnobRest,
  bastionMarkPlayer,
  bastionMarkTakes,
  bastionRim,
  bastionRimKnob,
} from "./bastion-grip.js";
import { BASTION_SHELL_TILES } from "./bastion-shape.js";
import { seatIsMine } from "./handle-word.js";
import type { Layout } from "./layout.js";
import { drawMazeLever } from "./maze-lever.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack, pullWay } from "./pull-track.js";

/**
 * **THE BASTION's knobs**, in the field's one look for a thumb's control
 * (`pull-knob.ts`, `pull-track.ts`): the owner, 5 October 2026, *use the
 * default visuals for on screen controls we have*.
 *
 * **A knob on each side's next slab** while the armour is lit, wearing the
 * arrow along the slab's track and, on its own seat's screen, the channel of
 * the whole track — straight out, or bending round the moon — filling as the
 * thumb carries it (the owner, 14 October 2026: *it can also be curves*). **A
 * knob on the rim** while the gun ring is lit, the pilot's — THE MAZE's
 * lever (`maze-lever.ts`), its arm bolted to the cage under the ring — on a
 * ring channel round the moon with a two-headed arrow, since it turns either
 * way, filling with how far the moon has been turned. The partner's knob is drawn too,
 * dim, with no arrow and no channel: what says their thumb has landed.
 */

/** Points round the rim's channel. */
const RIM_STEPS = 48;

export function drawBastionHandles(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: BastionState,
  time: number,
): void {
  for (const side of [0, 1] as const) {
    if (!bastionMarkTakes(s, side)) continue;
    const mine = seatIsMine(l.role, bastionMarkPlayer(side));
    const rest = bastionKnobRest(l, cfg, s, side);
    const at = bastionKnobAt(l, cfg, s, side);
    const i = bastionPlateOf(s, side);
    const kind = bastionTrackOf(s, i);
    const track = trackOf(l, cfg, s, side);
    const along = Math.min(1, s.pullMilli[side] / Math.max(1, bastionTrackLen(cfg, kind)));
    const way = pullWay(track, along, 1);
    const held = s.down[side];
    if (mine) {
      drawPullTrack(ctx, track, {
        ...look(mine),
        held,
        origin: 0,
        at: along,
        time,
        key: `bastion:${side}`,
      });
    }
    drawPullKnob(ctx, at, rest.r, {
      ...look(mine),
      held,
      time,
      way: mine ? way : null,
      theirs: !mine,
      key: `bastion:${side}`,
    });
  }
  if (!bastionMarkTakes(s, 2)) return;
  const mine = seatIsMine(l.role, bastionMarkPlayer(2));
  const knob = bastionRimKnob(l, cfg, s);
  const rim = bastionRim(l, cfg);
  if (mine) {
    const pts: Point[] = [];
    for (let k = 0; k <= RIM_STEPS; k++) {
      const a = Math.PI / 2 - (k / RIM_STEPS) * Math.PI * 2;
      pts.push({ x: rim.x + Math.cos(a) * rim.r, y: rim.y + Math.sin(a) * rim.r });
    }
    const turned = ((s.yawMilli + 180_000) % 360_000) / 360_000 - 0.5;
    drawPullTrack(
      ctx,
      { pts, w: knob.r * PULL_TRACK_W, closed: true },
      { ...look(mine), held: s.spinning, origin: 0, at: turned, time, key: "bastion:rim" },
    );
  }
  const hub = { cx: rim.x, cy: rim.y, r: BASTION_SHELL_TILES.lattice * l.tile };
  drawMazeLever(ctx, hub, knob, knob.r, s.spinning);
  const a = Math.atan2(knob.y - rim.y, knob.x - rim.x);
  drawPullKnob(ctx, knob, knob.r, {
    ...look(mine),
    held: s.spinning,
    time,
    way: mine ? { dx: -Math.sin(a), dy: Math.cos(a) } : null,
    either: true,
    theirs: !mine,
    key: "bastion:rim",
  });
}

/** `side`'s next slab's whole track, from where its knob rests, on this screen. */
export function trackOf(l: Layout, cfg: SimConfig, s: BastionState, side: 0 | 1): PullTrack {
  const rest = bastionKnobRest(l, cfg, s, side);
  const i = Math.max(0, bastionPlateOf(s, side));
  const pts = bastionTrackPoints(cfg, bastionTrackOf(s, i), i).map((p) => ({
    x: rest.x + (p.x / 1000) * l.tile,
    y: rest.y + (p.y / 1000) * l.tile,
  }));
  return { pts, w: rest.r * PULL_TRACK_W };
}

/** A knob's colours: THE MAZE's on this screen's own, dim on the partner's. */
function look(mine: boolean): { hex: string; rim: string } {
  return mine
    ? { hex: PALETTE.hullRim, rim: PALETTE.text }
    : { hex: PALETTE.dim, rim: PALETTE.rock };
}
