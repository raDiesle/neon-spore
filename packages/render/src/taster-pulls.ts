import {
  type SimConfig,
  type TasterState,
  tasterPinnable,
  tasterPryable,
  tasterWipable,
} from "@neon-spore/sim";
import { drawHandleRing } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob, PULL_SIZE } from "./pull-knob.js";
import { PULL_DOWN, type PullWay, straightPullTrack } from "./pull-line.js";
import { drawPullTrack, pullTrackPoint } from "./pull-track.js";
import { tasterBladeCircle, tasterGapCircle, tasterLockCircle } from "./taster-grip.js";

/**
 * **THE TASTER's three handles, drawn** — the hit tests and the circles are
 * `taster-grip.ts`'s; this is the picture of them.
 *
 * **Its two carries are the field's pull** (`pull-knob.ts`,
 * `pull-track.ts`), the owner, 13 October 2026: until then each was a ring,
 * which read as a press. The pin is a hold and keeps its ring
 * (`taster-grip.ts`); these are the two that travel.
 *
 * - **The wipe** is across either way and `tasterWipeMilli` long
 *   (`sim/taster-hand.ts`), so its knob starts in the middle of a level
 *   channel that long each side with an arrow of two heads, THE GAUGE's
 *   tongue's mark. The round keeps no more of the carry than whether it has
 *   cut (`wiped`), so the knob stays in the middle and the cut is said by the
 *   track's own `counted`. Six to eight gaps stand a tile apart, so the knob is
 *   drawn the ring's size rather than `PULL_SIZE` larger, and the channels
 *   run on into one another as one row.
 * - **The pry** is straight down out of the interlock, `tasterPryMilli` long,
 *   and its knob rides `pryMilli` down the channel.
 *
 * The channel and the arrow are on the owning seat's screen alone; the other
 * seat has the knob dim, to see the hand come.
 */

type Look = { hex: string; rim: string; theirs: boolean };

function lookOf(mine: boolean): Look {
  return mine
    ? { hex: PALETTE.hull, rim: PALETTE.text, theirs: false }
    : { hex: PALETTE.dim, rim: PALETTE.rock, theirs: true };
}

const LEVEL: PullWay = { dx: 1, dy: 0 };

/** Her wipe across the gap at `at`. */
function drawTasterWipe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  at: Circle,
  held: boolean,
  counted: boolean,
  mine: boolean,
  time: number,
): void {
  const reach = (Math.max(1, cfg.tasterWipeMilli) * l.tile) / 1000;
  const r = at.r / PULL_SIZE;
  const look = lookOf(mine);
  const key = `taster:wipe:${Math.round(at.x)}`;
  const o = { ...look, held, counted, time, key };
  if (mine) {
    const from = { x: at.x - reach, y: at.y };
    const track = straightPullTrack({ from, r, way: LEVEL, len: reach * 2 });
    drawPullTrack(ctx, track, { ...o, origin: 0.5, at: 0.5 });
  }
  drawPullKnob(ctx, at, r, { ...o, way: mine ? LEVEL : null, either: true });
}

/** His pry, down out of the interlock at `at`. */
function drawTasterPry(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  at: Circle,
  t: TasterState,
  mine: boolean,
  time: number,
): void {
  const reach = Math.max(1, cfg.tasterPryMilli);
  const track = straightPullTrack({
    from: at,
    r: at.r,
    way: PULL_DOWN,
    len: (reach * l.tile) / 1000,
  });
  const along = Math.max(0, Math.min(1, t.pryMilli / reach));
  const held = t.pryMilli > 0;
  const o = { ...lookOf(mine), held, time, key: "taster:pry" };
  if (mine) drawPullTrack(ctx, track, { ...o, origin: 0, at: along });
  const knob = pullTrackPoint(track, along);
  drawPullKnob(ctx, { x: knob.x, y: knob.y }, at.r, { ...o, way: mine ? PULL_DOWN : null });
}

/**
 * All three, drawn with the fan so the fan and the hands on it are one
 * drawing. Each on both screens, bright on the seat that owns it and dim on
 * the other: the pin buys the navigator her window to turn the ledger over,
 * the wipe is the one cut that costs the ledger nothing, and the pry is what
 * her beam is waiting on — so every one of the three is a thing the *other*
 * seat is watching for.
 *
 * **The dim copy fills nothing** (`theirs`, `handle-draw.ts`, 22 September
 * 2026). A ring punches its circle out of the background first, so it reads
 * over whatever it stands on, and this fight is read entirely off the lit edge
 * of a blade: the pin's ring is on the crest and the wipe's is in a gap the
 * crest has already lost. The seat that may not press one cannot see the wash
 * inside the hole, so its copy came out a *second* notch — the one mark this
 * boss uses for progress, said by a handle that meant nothing of the kind.
 * Theirs is its rim and its wash now. The count in
 * `taster-grip-frame.test.ts` is the seat's own for the same reason.
 *
 * **The pin's dial is the clock it is racing**: it fills toward
 * `tasterPinBeats`, where the blade decides anyway and comes up thick, so a
 * full ring is a bet lost rather than a hold won. The wipe and the pry are
 * carries, and wear the field's pull knob on its channel instead
 * (above); when the pry lands its knob goes out altogether: the
 * window is a beat count and he may let go, so a knob left standing would be
 * asking for a second carry the round refuses.
 */
export function drawTasterGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  t: TasterState,
  beatPhase: number,
  beat: number,
  time: number,
): void {
  if (tasterPryable(t, beat, cfg))
    drawTasterPry(ctx, l, cfg, tasterLockCircle(l, cfg, t), t, isMine(l, 1), time);
  for (let i = 0; i < t.blades.length; i++) {
    const col = t.col + i;
    if (tasterPinnable(t, cfg, i)) {
      const held = t.pin === i;
      const spent = (t.pinBeats + beatPhase) / Math.max(1, cfg.tasterPinBeats);
      ring(ctx, tasterBladeCircle(l, cfg, col), l, 1, held, held ? clamp(spent) : 0, time);
    }
    if (tasterWipable(t, cfg, i)) {
      const held = t.wipe === i;
      const at = tasterGapCircle(l, cfg, col);
      drawTasterWipe(ctx, l, cfg, at, held, held && t.wiped, isMine(l, 2), time);
    }
  }
}

function isMine(l: Layout, player: 1 | 2): boolean {
  return l.role === "test" || (l.role === "p1") === (player === 1);
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function ring(
  ctx: CanvasRenderingContext2D,
  at: Circle,
  l: Layout,
  player: 1 | 2,
  held: boolean,
  pull: number,
  time: number,
): void {
  const mine = isMine(l, player);
  drawHandleRing(ctx, {
    x: at.x,
    y: at.y,
    r: at.r,
    hex: mine ? PALETTE.hull : PALETTE.dim,
    rim: mine ? PALETTE.text : PALETTE.rock,
    held,
    pull,
    time,
    theirs: !mine,
  });
}
