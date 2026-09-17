import { blobPoints, type Point } from "@neon-spore/content";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  type BatonState,
  batonSocketCol,
  batonSocketRow,
  type SimConfig,
} from "@neon-spore/sim";
import { drawBead } from "./baton-bead-draw.js";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE BATON, drawn: an arm of sockets hanging down the middle column, and the
 * bead being passed down it one socket at a time.
 *
 * **The silhouette is the health bar** (`docs/spec/bosses.md` §11.0). A socket
 * the bead has left is dark and stays dark, so how much of the arm still
 * glows is how far the bead has still to go — and a shed socket is a *gap*,
 * because the rock that fell out of it is on the field now and not on the arm
 * (`sim/baton-step.ts`).
 *
 * **Both screens draw the same arm.** The split in this fight is in the hands
 * and not in the picture: the seat that just acted is locked out for a beat,
 * and *that* is drawn on the band, over the locked seat's own controls
 * (`band-lock.ts`). Nothing about the arm is kept from either of them — the
 * bead's colour is the whole of what the navigator needs to know and it is
 * the one thing the pilot cannot say faster than the eye can see it.
 *
 * **The bead is the colour that takes it**, and it flips on every landing
 * (`batonFlip`), so the arm teaches the alternation without a word. The bead
 * itself, the second one and the two become one are `baton-bead-draw.ts`.
 *
 * Nothing here is held between frames. Every number comes off the boss, the
 * tick and the beat, so there is no `Effects` field to clear and a restart
 * cannot show this fight the last one's arm.
 */

/** The arm's spine is this share of a tile wide. */
const SPINE = 0.16;

/** A socket's ring, as a share of a tile. */
const SOCKET_R = 0.3;

/** How far above row 0 the arm's root hangs, in tiles. */
const ROOT = 0.6;

export function drawBaton(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  tick: number,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  // The fold at the end: the whole arm goes out over `batonDownBeats`, which
  // is exactly as long as the sim keeps the boss installed for (`stepBaton`).
  const gone = b.stage === "down" ? (beat - b.stageBeat + beatPhase) / cfg.batonDownBeats : 0;
  const alpha = Math.max(0, 1 - gone);
  if (alpha <= 0) return;
  // How much of the arm is out yet. It unfolds one socket a beat, and the
  // newest one grows in over its beat so the unfolding reads as a motion and
  // not as a count appearing.
  const shown =
    b.stage === "unfolding"
      ? Math.min(b.sockets.length, beat - b.stageBeat + beatPhase)
      : b.sockets.length;
  ctx.save();
  ctx.globalAlpha = alpha;
  drawSpine(ctx, l, cfg, b, shown, time);
  for (let i = 0; i < b.sockets.length; i++) {
    const grow = Math.max(0, Math.min(1, shown - i));
    if (grow <= 0) break;
    drawSocket(ctx, l, cfg, b, i, grow, beatPhase, time);
  }
  // The crossing is the last flight, and the bead is the whole of it.
  if (b.stage === "passing" || b.stage === "crossing")
    for (const bead of b.beads) drawBead(ctx, l, cfg, b, bead, tick, beatPhase, time);
  ctx.restore();
}

/**
 * The column a socket hangs in: the one the lead bead left from above it,
 * the one it lands in below. The arm bends at the bead furthest down it —
 * the second bead, higher up, rides the arm wherever the first has taken it.
 */
function socketX(l: Layout, b: BatonState, socket: number): number {
  return tileCX(l, batonSocketCol(b, socket));
}

/**
 * The arm itself, from its root above the field down to the lowest socket
 * that is out. One open stroke, rock grey, for THE VANE's reason: a closed
 * shape would read as a body, and this is a mechanism. When the arm has swung
 * the spine leans across the columns between the socket the bead left and
 * the one it is landing in, so the swing is a bend in the arm and not a jump.
 */
function drawSpine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  shown: number,
  time: number,
): void {
  if (shown <= 0) return;
  const pts: Point[] = [{ x: socketX(l, b, 0), y: tileCY(l, 0) - l.tile * ROOT }];
  const last = Math.min(b.sockets.length - 1, Math.ceil(shown) - 1);
  for (let i = 0; i <= last; i++) {
    // A slow sway, a hair's width, so the arm is a hanging thing and not a
    // ruled line; the same amount on both screens because it is off `time`
    // and `time` is the frame clock, not the world.
    const sway = Math.sin(time * 0.9 + i * 0.5) * l.tile * 0.03;
    pts.push({ x: socketX(l, b, i) + sway, y: tileCY(l, batonSocketRow(cfg, i)) });
  }
  const spine = splinePath(pts, false);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = l.tile * SPINE;
  ctx.stroke(spine);
  ctx.restore();
  strokeGlow(ctx, spine, PALETTE.rock, STROKE.inner, 0.3);
}

/**
 * One socket: a violet ring while the bead has yet to pass it, a dark husk
 * once it has, and a gap where the shell has already fallen off the arm. The
 * lit ones breathe on the beat, all together, which is the metronome the
 * fight is — the pair keeps time off the arm without counting.
 */
function drawSocket(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  socket: number,
  grow: number,
  beatPhase: number,
  time: number,
): void {
  const state = b.sockets[socket];
  if (state !== BATON_SOCKET_LIT && state !== BATON_SOCKET_DARK) return;
  const x = socketX(l, b, socket);
  const y = tileCY(l, batonSocketRow(cfg, socket));
  const lit = state === BATON_SOCKET_LIT;
  const breath = lit ? (1 - beatPhase) * (1 - beatPhase) : 0;
  const r = l.tile * SOCKET_R * grow * (1 + 0.08 * breath);
  const ring = splinePath(
    blobPoints(x, y, r, r * 0.92, 4, 0.06, 0.03, time * 0.5, socket + 3, 20),
    true,
  );
  ctx.save();
  ctx.fillStyle = lit ? "#1A0B2A" : PALETTE.rockDark;
  ctx.fill(ring);
  ctx.restore();
  strokeGlow(
    ctx,
    ring,
    lit ? PALETTE.hull : PALETTE.rock,
    STROKE.outline,
    lit ? 0.45 + 0.4 * breath : 0.25,
  );
}
