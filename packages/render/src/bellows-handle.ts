import {
  type BellowsState,
  bellowsDepthMilli,
  bellowsLast,
  bellowsTurn,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import {
  bellowsBarPath,
  bellowsCapX,
  bellowsCentre,
  bellowsHalfH,
  bellowsHandleAt,
  type Point,
} from "./bellows-shape.js";
import { bellowsWord } from "./bellows-word.js";
import type { BossCue } from "./boss-cue.js";
import { cueSeen } from "./boss-cue.js";
import { drawCueText } from "./boss-cue-text.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The end of one housing and the handle hanging off it** — the half of THE
 * BELLOWS a seat is shown of its own chamber and the only half a thumb ever
 * reaches (`bellows-draw.ts` draws the bodies and the waist, which both seats
 * are shown and neither may touch).
 *
 * Its own page off the drawer, which went over 250 lines with it, and the cut
 * is `bellows-shape.ts`'s own: the geometry of the rail is over there, this is
 * what is painted on it, and lane two's hit test will be answered against the
 * same `bellowsHandleAt` both of them read — so a handle cannot come to be
 * drawn off its own hit region.
 *
 * **The glow is whose beat it is.** A cap and a bar light while the lung is
 * waiting on that seat (`bellowsTurn`), and both light at once on the last
 * seam, which is the one beat of the fight the pair acts together — eleven of
 * being told not to, and then the picture says *now, both of you* without a
 * word (§11.35).
 */

/** The end plate the housing is drawn out by — lit while this chamber's own
 * beat is up, so the lung says whose turn it is with its body. */
export function drawBellowsCap(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BellowsState,
  player: 1 | 2,
  open: number,
  apart: number,
): void {
  const cfg = world.cfg;
  const x = bellowsCapX(l, cfg, player, open, apart);
  const at = bellowsCentre(l, cfg);
  const h = bellowsHalfH(l);
  const cap = new Path2D();
  cap.moveTo(x, at.y - h);
  cap.lineTo(x, at.y + h);
  const wanted = bellowsTurn(s) === player || bellowsLast(s);
  if (wanted) strokeGlow(ctx, cap, PALETTE.wispRim, STROKE.outline, 1);
  else {
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.6);
    ctx.stroke(cap);
  }
}

/**
 * The rail and the bar on it, at the depth this seat's thumb has carried it
 * (`bellowsDepthMilli`) — the fourth of the five standards, on the part of
 * this boss a hand actually reaches. It glows while this seat's beat is up
 * and while the last seam holds both of them at once, and it carries the
 * verb that seat is being asked for (`bellows-word.ts`).
 */
export function drawBellowsHandle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BellowsState,
  player: 1 | 2,
  open: number,
  time: number,
  apart: number,
): void {
  const cfg = world.cfg;
  const depth = bellowsDepthMilli(s, player);
  const { top, at, halfW } = bellowsHandleAt(l, cfg, player, open, depth, apart);
  const rail = new Path2D();
  rail.moveTo(top.x, top.y);
  rail.lineTo(at.x, at.y);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.5);
  ctx.stroke(rail);
  const bar = bellowsBarPath(at, halfW, l);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.9);
  ctx.fill(bar);
  const wanted = bellowsTurn(s) === player || bellowsLast(s);
  if (wanted) {
    strokeGlow(ctx, bar, PALETTE.wispRim, STROKE.outline, 0.8 + 0.4 * Math.sin(time * 6));
  } else {
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.7);
    ctx.stroke(bar);
  }
  drawWord(ctx, l, cfg, s, player, at, halfW, time);
}

/**
 * The verb, on the bar itself and under the same gate the glow is: a word is
 * only ever written where this frame has just drawn a lit bar, because both
 * are read off `bellows-word.ts` and `bellowsTurn` in the same tick.
 *
 * **No frame.** The pulsing rim around the bar is already the breathing mark
 * the standard asks for, and a scan frame round it would be the second
 * picture for the one idea (`target-lock.ts`). `cueSeen` is asked even so: a
 * seat is only shown its own handle, and the reading is not allowed to be the
 * one place that forgets it.
 */
function drawWord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: BellowsState,
  player: 1 | 2,
  at: Point,
  halfW: number,
  time: number,
): void {
  const say = bellowsWord(cfg, s, player);
  if (say === null) return;
  const cue: BossCue = {
    seat: player,
    kind: say.kind,
    word: say.word,
    x: at.x,
    y: at.y,
    halfW,
    halfH: l.tile * 0.2,
    seed: 71 + player,
    framed: false,
  };
  if (cueSeen(cue, l.role)) drawCueText(ctx, cue, time);
}
