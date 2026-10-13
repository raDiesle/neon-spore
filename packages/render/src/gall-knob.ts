import {
  type GallState,
  gallCharged,
  gallLeaping,
  gallPresser,
  type SimConfig,
} from "@neon-spore/sim";
import { gallPointCircle } from "./gall-grip.js";
import { handleRadius } from "./handle-draw.js";
import { seatIsMine } from "./handle-word.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { PULL_UP } from "./pull-line.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack } from "./pull-track.js";

/**
 * **THE GALL's taps and pull, drawn as every pull is**: the PULL LAB's knob on
 * the alien where it sits, on a channel `gallPullMilli` long straight up the
 * field, filling green as the finger carries it (`pull-knob.ts`,
 * `pull-track.ts`). The owner, 13 October 2026, of the five pulls whose box
 * was the only thing that said *pull*: each one's rings become `drawPullKnob`
 * on a `drawPullTrack` the length of its pull, the arrow its sim's direction —
 * and on THE GALL'S TAPS AND PULL itself, that it *still shows "tap" text*.
 *
 * **The knob is the tap and the pull both.** The taps are presses on it; the
 * arrow comes up in it only once they are all in (`gallCharged`), because a
 * pull before that is refused as early (`sim/gall-hand.ts`) and an arrow
 * would ask for it. It rides the furthest the finger has carried it up
 * (`upMilli`), and the seat whose half it sits on is the one it lights for:
 * on the other screen it is the partner's knob, with no arrow.
 *
 * Up only while a leap is lit and the alien sits; never in the air, and never
 * through a fire step, when the hand it wants is the cannon's.
 */
export function drawGallKnob(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: GallState,
  time: number,
  fade: number,
): void {
  if (s.phase === "leap" || !gallLeaping(s) || fade <= 0) return;
  const seat = gallPresser(s);
  const side = seat - 1;
  const held = s.down[side] === s.point;
  const share = held ? Math.min(1, (s.upMilli[side] ?? 0) / Math.max(1, cfg.gallPullMilli)) : 0;
  const c = gallPointCircle(l, cfg, s.point);
  const r = handleRadius(l, cfg);
  const len = (cfg.gallPullMilli * l.tile) / 1000;
  const track: PullTrack = {
    pts: [
      { x: c.x, y: c.y },
      { x: c.x, y: c.y - len },
    ],
    w: r * PULL_TRACK_W,
  };
  const mine = seatIsMine(l.role, seat);
  const way = mine && gallCharged(s) ? PULL_UP : null;
  const before = ctx.globalAlpha;
  ctx.globalAlpha = before * fade;
  drawPullTrack(ctx, track, { ...LOOK, held, origin: 0, at: share, time, key: KEY });
  const knob = { x: c.x, y: c.y - len * share };
  drawPullKnob(ctx, knob, r, { ...LOOK, held, time, way, theirs: !mine, key: KEY });
  ctx.globalAlpha = before;
}

/** The one name the knob and its channel share (`PullMemory`). */
const KEY = "gall";

/** The alien's own violet, and its lit rim: the hand takes the colour of what it holds. */
const LOOK = { hex: PALETTE.hull, rim: PALETTE.hullRim } as const;
