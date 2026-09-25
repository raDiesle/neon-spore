import { blobPoints } from "@neon-spore/content";
import {
  BATON_SOCKET_LIT,
  BATON_SOCKET_SHED,
  BATON_SOCKET_SWELL,
  type BatonState,
  batonSocketCol,
  batonSocketRow,
  type SimConfig,
} from "@neon-spore/sim";
import { paintKnuckle } from "./baton-flesh.js";
import { drawHurt } from "./boss-hurt.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **One socket of THE BATON's arm**, drawn. Split off `baton-draw.ts` when the
 * swelling socket took that file over its limit, at the seam
 * `baton-bead-draw.ts` was cut on: the spine and the fold are the arm, and
 * this is a joint of it.
 */

/** A socket's ring, as a share of a tile. */
const SOCKET_R = 0.3;

/** The most a lit socket's ring adds to that: its beat breath and its wobble. */
const SOCKET_SWAY = 1.08 * 1.06;

/**
 * How far a lit socket's ring reaches from its centre at its widest — the ring,
 * the breath it takes on the beat and the blob's own wobble. Exported because
 * the cue's word has to clear it: two sockets are one tile apart and the
 * frame the word hangs off is more than half a tile tall, so the reading caps
 * how far under a mark the verb may go (`boss-cue-read-i.ts`), and a second
 * guess at this number would be a word standing where the ring is not.
 */
export function socketReach(l: Layout): number {
  return l.tile * SOCKET_R * SOCKET_SWAY;
}

/** How much of a dead socket's ring a husk on the thread keeps. */
const HUSK = 0.5;

/** How much wider a socket gets by the beat its shell lets go. */
const SWOLLEN = 0.55;

/**
 * The column a socket hangs in: the one the lead bead left from above it,
 * the one it lands in below. The arm bends at the bead furthest down it —
 * the second bead, higher up, rides the arm wherever the first has taken it.
 */
export function socketX(l: Layout, b: BatonState, socket: number): number {
  return tileCX(l, batonSocketCol(b, socket));
}

/**
 * The middle of a socket, in canvas pixels. Exported because the handles hang
 * off it: the ring on a swelling socket and the two on the beads being drawn
 * together are answered at the circle they are drawn from (`baton-grip.ts`),
 * and a second reading of the arm's geometry would put one beside the other.
 */
export function socketPoint(
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  socket: number,
): { x: number; y: number } {
  return { x: socketX(l, b, socket), y: tileCY(l, batonSocketRow(cfg, socket)) };
}

/** The least white this arm leaves between a word and the ring under it. */
const SOCKET_GAP = 5;

/**
 * How far under a mark on this socket the verb may hang.
 *
 * The arm is the one boss whose marks stand a **tile** apart: a socket sits
 * exactly one tile under the one before it, THE CHOIR's frame is two thirds of
 * a tile tall, and the word hangs `WORD_GAP` under that — so a mark with a
 * socket still standing under it puts its verb on the next bead's fill, where
 * it is legible only because the text is drawn last. `undefined` is the answer
 * for a mark with a shed socket or the end of the arm below it, which is the
 * navigator's own merge bead and every cue the other four stages give.
 *
 * It is here and not in the reading because this is the file that knows where
 * a socket is drawn and how wide: a second reading of the arm's geometry next
 * door would be a word standing where the ring is not.
 */
export function socketRoomBelow(
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  socket: number,
): number | undefined {
  const next = socket + 1;
  if (next >= cfg.batonSockets || b.sockets[next] === BATON_SOCKET_SHED) return undefined;
  return l.tile - socketReach(l) - SOCKET_GAP;
}

/**
 * How far along its swelling a socket is, 0 to 1. Off the sim's beat and the
 * config's count, so both screens swell it together.
 */
function swellOf(cfg: SimConfig, b: BatonState, beat: number, beatPhase: number): number {
  if (b.swellBeat < 0) return 0;
  return Math.max(0, Math.min(1, (beat - b.swellBeat + beatPhase) / cfg.batonSwellBeats));
}

/**
 * One socket: a violet ring while the bead has yet to pass it, a dark husk
 * once it has, a **swollen** one whose shell is coming away, and a gap where
 * the shell has already gone. The lit ones breathe on the beat, all together,
 * which is the metronome the fight is — the pair keeps time off the arm
 * without counting. On the thread a dark one shrivels to a husk, half its ring
 * and fainter.
 *
 * The swollen one is the dark one swelling: the same husk grown half again
 * over `batonSwellBeats` and shaking harder the nearer it is to letting go, so
 * the thing about to fall is seen to be about to fall (`sim/baton-shed.ts`).
 * It is a state nothing else in the picture drew, which is why it is drawn
 * here rather than offered — there is no shipped alternative to compare it to.
 *
 * What a joint is made of — a knuckle with a wet cup, the violet pooled in a
 * lit one — is `baton-flesh.ts`; this decides only which and how big.
 */
export function drawSocket(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: BatonState,
  socket: number,
  grow: number,
  thread: number,
  beat: number,
  beatPhase: number,
  time: number,
  /** How red the blow of a landed bead still shows (`boss-blows.ts`). */
  hurt = 0,
): void {
  const state = b.sockets[socket];
  if (state === BATON_SOCKET_SHED) return;
  const x = socketX(l, b, socket);
  const y = tileCY(l, batonSocketRow(cfg, socket));
  const lit = state === BATON_SOCKET_LIT;
  const swell = state === BATON_SOCKET_SWELL ? swellOf(cfg, b, beat, beatPhase) : 0;
  const breath = lit ? (1 - beatPhase) * (1 - beatPhase) : 0;
  const husk = lit ? 0 : thread;
  const r =
    l.tile *
    SOCKET_R *
    grow *
    (1 + 0.08 * breath + SWOLLEN * swell) *
    (1 - (1 - HUSK) * husk * (1 - swell));
  const ring = splinePath(
    blobPoints(
      x,
      y,
      r,
      r * 0.92,
      4,
      0.06 + 0.1 * swell,
      0.03,
      time * (0.5 + 4 * swell),
      socket + 3,
      20,
    ),
    true,
  );
  const alpha = ctx.globalAlpha;
  paintKnuckle(ctx, ring, { x, y, r, tile: l.tile, lit, breath, swell });
  drawHurt(ctx, ring, hurt * alpha);
  ctx.globalAlpha = alpha;
}
