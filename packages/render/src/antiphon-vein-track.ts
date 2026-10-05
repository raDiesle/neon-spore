import type { AntiphonState, SimConfig } from "@neon-spore/sim";
import { antiphonOrganCircle, antiphonPerch } from "./antiphon-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullTrack, type PullTrack } from "./pull-track.js";

/**
 * **The way down each vein, drawn as every pull is** (the owner, 5 October
 * 2026: *the pull should be like regular pull across path like e.g. "the
 * instar" with arrows inside the veil path. so make vein wider that we see
 * the pull helper path and the veil visual*).
 *
 * Inside every vein on the chooser's screen runs the shared pull channel
 * (`pull-track.ts`): quiet and dark, chevrons drifting down it toward the
 * organ's place, and green behind the candidate as far as it has been
 * carried. The vein is the flesh round it (`antiphon-veins.ts`), wide enough
 * that both read — the road as a vein, the vein as a road. The big circle to
 * start is the candidate's own ring (`antiphon-rail-grip.ts`).
 *
 * Up when the rings are, and gone with them: a channel that showed before
 * the rail could be taken would be a mark up before its window.
 */

/** The channel's half-width, in tiles: wide enough to read inside the vein, narrower than it. */
const TRACK_W = 0.22;

/** Vein `i`'s channel: from the candidate's perch to the organ's place. */
export function antiphonVeinTrack(
  l: Layout,
  cfg: SimConfig,
  s: AntiphonState,
  i: number,
): PullTrack | null {
  const c = s.rail[i];
  if (c === undefined) return null;
  const from = antiphonPerch(l, cfg, c.col);
  const to = antiphonOrganCircle(l, cfg);
  return { pts: [from, { x: to.x, y: to.y }], w: l.tile * TRACK_W };
}

/** Every vein's channel, on the chooser's screen, while the rail can be taken. */
export function drawAntiphonVeinTracks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: AntiphonState,
  time: number,
  fade: number,
): void {
  if (fade < 1 || s.downBeat >= 0) return;
  for (let i = 0; i < s.rail.length; i++) {
    const t = antiphonVeinTrack(l, cfg, s, i);
    if (t === null) continue;
    const held = s.carried === i;
    drawPullTrack(ctx, t, {
      hex: PALETTE.organ,
      rim: PALETTE.organRim,
      held,
      origin: 0,
      at: held ? s.carryMilli / 1000 : 0,
      time,
    });
  }
}
