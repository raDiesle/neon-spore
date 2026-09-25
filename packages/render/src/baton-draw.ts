import type { Point } from "@neon-spore/content";
import { type BatonState, batonSocketRow, type SimConfig } from "@neon-spore/sim";
import { drawBead } from "./baton-bead-draw.js";
import { strokeTendon } from "./baton-flesh.js";
import { drawSocket, socketX } from "./baton-socket-draw.js";
import { type Layout, tileCY } from "./layout.js";
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
 * **One segment long, it hangs by a thread** — the design's step 12
 * (`docs/spec/bosses-choreographed.md` §10). From the beat the sim says the
 * arm came down to one lit socket (`threadBeat`, `batonOneSegment`) the
 * spine above that socket thins to a hair and swings wider and faster, and
 * the dead sockets on it shrivel to husks; the last socket and the piece of
 * arm that hangs it keep their width, because that is the segment. The
 * thread is on both screens, and it stays through the crossing under it: the
 * bead's last flight is out of a thing that is nearly gone. A miss grows the
 * arm back, and the sim clears the beat with it.
 *
 * Nothing here is held between frames. Every number comes off the boss, the
 * tick and the beat, so a restart cannot show this fight the last one's arm.
 * The one thing handed in is the blow of a landed bead — how red the sockets
 * still show (`boss-blows.ts`); its shake is the caller's.
 */

/** The arm's spine is this share of a tile wide. */
const SPINE = 0.16;

/** How far above row 0 the arm's root hangs, in tiles. */
const ROOT = 0.6;

/** How much of the spine's width the thread keeps, at the end of its thinning. */
const THREAD_WIDTH = 0.18;

/**
 * How far along its thinning the thread is, 0 to 1 — and 0 for as long as
 * the arm is longer than one segment. Off the sim's beat and the config's
 * count, so both screens thin it together.
 */
function threadOf(cfg: SimConfig, b: BatonState, beat: number, beatPhase: number): number {
  if (b.threadBeat < 0) return 0;
  return Math.max(0, Math.min(1, (beat - b.threadBeat + beatPhase) / cfg.batonThreadBeats));
}

export function drawBaton(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  tick: number,
  beat: number,
  beatPhase: number,
  time: number,
  hurt = 0,
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
  const thread = threadOf(cfg, b, beat, beatPhase);
  ctx.save();
  ctx.globalAlpha = alpha;
  drawSpine(ctx, l, cfg, b, shown, thread, time);
  for (let i = 0; i < b.sockets.length; i++) {
    const grow = Math.max(0, Math.min(1, shown - i));
    if (grow <= 0) break;
    drawSocket(ctx, l, cfg, b, i, grow, thread, beat, beatPhase, time, hurt);
  }
  // The crossing is the last flight, and the bead is the whole of it.
  if (b.stage === "passing" || b.stage === "crossing")
    for (const bead of b.beads) drawBead(ctx, l, cfg, b, bead, tick, beatPhase, time);
  ctx.restore();
}

/**
 * The arm itself, from its root above the field down to the lowest socket
 * that is out. One open stroke, for THE VANE's reason: a closed shape would
 * read as a body, and this is a mechanism — stroked as a tendon, a sheath, a
 * body and a lit core (`baton-flesh.ts`). When the arm has swung
 * the spine leans across the columns between the socket the bead left and
 * the one it is landing in, so the swing is a bend in the arm and not a jump.
 *
 * On the thread (`thread` > 0) the spine is drawn in two: everything above
 * the last socket as a hair that swings wide and quick, and the last piece —
 * the segment — at its full width.
 */
function drawSpine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  shown: number,
  thread: number,
  time: number,
): void {
  if (shown <= 0) return;
  const pts: Point[] = [{ x: socketX(l, b, 0), y: tileCY(l, 0) - l.tile * ROOT }];
  const last = Math.min(b.sockets.length - 1, Math.ceil(shown) - 1);
  for (let i = 0; i <= last; i++) {
    // A slow sway, a hair's width, so the arm is a hanging thing and not a
    // ruled line; the same amount on both screens because it is off `time`
    // and `time` is the frame clock, not the world. A thread swings six
    // times as wide and twice as fast — except at the last socket, which
    // stays where the bead in it is drawn (`baton-bead-draw.ts`).
    const loose = i < last ? thread : 0;
    const sway = Math.sin(time * (0.9 + 1.2 * loose) + i * 0.5) * l.tile * 0.03 * (1 + 5 * loose);
    pts.push({ x: socketX(l, b, i) + sway, y: tileCY(l, batonSocketRow(cfg, i)) });
  }
  const split = thread > 0 && pts.length > 2 ? pts.length - 2 : -1;
  const upper = splinePath(split < 0 ? pts : pts.slice(0, split + 1), false);
  const width = l.tile * SPINE;
  // On the thread the sheath and the lit core go out with the width, so the
  // hair at the end of the thinning is the tendon's body alone.
  strokeTendon(ctx, upper, width * (1 - (1 - THREAD_WIDTH) * thread), 1 - thread);
  if (split >= 0) strokeTendon(ctx, splinePath(pts.slice(split), false), width, 1);
}
