import type { Point } from "@neon-spore/content";
import {
  type BastionState,
  bastionPlateOf,
  bastionPlateWay,
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
import { type PullWay, straightPullTrack } from "./pull-line.js";
import { drawPullTrack, PULL_TRACK_W } from "./pull-track.js";

/**
 * **THE BASTION's knobs**, in the field's one look for a thumb's control
 * (`pull-knob.ts`, `pull-track.ts`): the owner, 5 October 2026, *use the
 * default visuals for on screen controls we have*.
 *
 * **A knob on each side's next slab** while the armour is lit, wearing the
 * arrow out along the slab's way and, on its own seat's screen, the channel
 * as long as the pull that tears it, filling as the thumb carries it. **A
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
    const [wx, wy] = bastionPlateWay(bastionPlateOf(s, side));
    const way: PullWay = { dx: wx / 1000, dy: wy / 1000 };
    const held = s.down[side];
    if (mine) {
      const track = straightPullTrack({
        from: rest,
        r: rest.r,
        head: at,
        held,
        rest: way,
        len: (cfg.bastionPullMilli / 1000) * l.tile,
        follow: false,
      });
      const along = Math.min(1, s.pullMilli[side] / Math.max(1, cfg.bastionPullMilli));
      drawPullTrack(ctx, track, { ...look(mine), held, origin: 0, at: along, time });
    }
    drawPullKnob(ctx, at, rest.r, {
      ...look(mine),
      held,
      time,
      way: mine ? way : null,
      theirs: !mine,
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
      { ...look(mine), held: s.spinning, origin: 0, at: turned, time },
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
  });
}

/** A knob's colours: THE MAZE's on this screen's own, dim on the partner's. */
function look(mine: boolean): { hex: string; rim: string } {
  return mine
    ? { hex: PALETTE.hullRim, rim: PALETTE.text }
    : { hex: PALETTE.dim, rim: PALETTE.rock };
}
