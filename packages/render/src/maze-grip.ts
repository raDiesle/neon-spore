import {
  type MazeState,
  mazeCircleMilli,
  mazeCurrent,
  mazeHeartAsks,
  mazeRubSeatDone,
  mazeStringAsks,
  type SimConfig,
} from "@neon-spore/sim";
import { drawHandleHint, type HandleWords, HINT_LOUD } from "./handle-word.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { drawMarkWait } from "./mark-feedback.js";
import { mazeStringGrab } from "./maze-string.js";
import { mazeDrum } from "./maze-walls.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { seatOf, type ViewRole } from "./view-role.js";

/**
 * **THE MAZE's heart as a control**, for the one gesture that asks thumbs of
 * it: the rub (`grip`, `sim/maze-hand.ts`, `sim/maze-rub.ts`). A shot of the
 * right colour that reaches the middle is held there, and the wheel is
 * finished by **both seats** rubbing the heart until each has made its half
 * of `mazeHeartTurns`.
 *
 * The circle pressed is the heart's **room** — the drum's innermost ring, the
 * same number `maze-draw.ts` sizes the muscle from — rather than the muscle,
 * which swells with every thump: a control answered where it is drawn *this
 * frame* would be one you could only grab between beats. Every seat's press
 * takes a rubbing hold, because the heart asks both.
 *
 * The rub itself is drawn by the cue every boss's rub wears — THE RUB LAB's
 * drop with ZIGZAG on it, its strokes the pair's turns (`boss-cue-read-e.ts`,
 * `rub-drop.ts`; the owner, 14 October 2026: *to have less variants and
 * consistency*). It took the place of a ring, four arrows rocking outward, a
 * green count round the room and the word SHAKE. What is left here is the
 * partner (the owner, 5 October 2026: *make clear that the other player is
 * not finished yet and also needs to act on the same control*): the
 * partner's seat named — P2 TOO — while this seat's thumb is off and the
 * partner's half is not done, and under it **the waiting clock** every
 * partner's mark wears (`drawMarkWait`), while this seat has rubbed its half
 * or is holding alone.
 */

/** Where the word stands under the room's wall, in its radius. */
const BELOW_MUL = 1.14;

/** No wheel up, no room: a radius of nought is never hit and never drawn. */
const NO_ROOM = 0;

/** The heart's room: the drum's innermost circle, at rest. */
export function mazeHeartCircle(l: Layout, cfg: SimConfig, m: MazeState): Circle {
  const d = mazeDrum(l, cfg);
  const wheel = mazeCurrent(m);
  const inner = wheel === null ? NO_ROOM : mazeCircleMilli(wheel, 0) / 1000;
  return { x: d.cx, y: d.cy, r: d.r * inner };
}

/** The ring the asking and the hand are drawn round (`maze-marks.ts`): inside the room, clear of the muscle at full swell. */
export function mazeHeartRing(l: Layout, cfg: SimConfig, m: MazeState): Circle {
  const c = mazeHeartCircle(l, cfg, m);
  return { x: c.x, y: c.y, r: c.r * RING_MUL };
}

const RING_MUL = 0.72;

/**
 * A press on the heart while it is holding the shot: a rub on `mazeHeart`,
 * whose turns are counted by the host that owns the pointers
 * (`rub-turns.ts`), and whose lift lets go. Either seat's.
 */
export function mazeHeartUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const m = bossOf(field, "maze");
  if (m === null || !mazeHeartAsks(m)) return null;
  if (!hitCircle(mazeHeartCircle(l, field.cfg, m), x, y)) return null;
  const player = field.seat;
  return {
    player,
    command: null,
    hold: { kind: "drag", target: "mazeHeart", player, originX: x, originY: y, rub: true },
  };
}

/**
 * The seat a press on an asked part belongs to, for one mouse at a desk
 * (`desk-grab.ts` `markSeat`): the string is always the pilot's, and the heart
 * the seat with less of its half rubbed, so one hand lifting and pressing
 * again can do both halves.
 */
export function mazeGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const m = bossOf(field, "maze");
  if (m === null) return undefined;
  if (mazeStringAsks(m) && hitCircle(mazeStringGrab(l, field.cfg, m), x, y)) return 1;
  if (mazeHeartAsks(m) && hitCircle(mazeHeartCircle(l, field.cfg, m), x, y)) {
    const [p1 = 0, p2 = 0] = m.gripTurns;
    return p1 < p2 ? 1 : 2;
  }
  return undefined;
}

/**
 * Whether this screen is waiting on the partner: their half not shaken, and
 * this seat either done with its own or holding the heart without them.
 */
function waitsOnPartner(cfg: SimConfig, m: MazeState, role: ViewRole): boolean {
  if (role === "test") return false;
  const seat = seatOf(role);
  const other = seat === 1 ? 2 : 1;
  if (mazeRubSeatDone(cfg, m, other)) return false;
  if (mazeRubSeatDone(cfg, m, seat)) return true;
  return (m.gripSeats & seat) !== 0 && (m.gripSeats & other) === 0;
}

/** The word under the room, as this screen reads it: the partner's seat, or nothing. */
function rubWords(role: ViewRole, m: MazeState, waiting: boolean): HandleWords | null {
  const seat = seatOf(role);
  if (role === "test" || !waiting || m.gripSeats === 3) return null;
  return { seat, mine: seat === 1 ? "P2 TOO" : "P1 TOO", theirs: "" };
}

/**
 * The partner's word and the waiting clock, drawn after the shot so they
 * stand over it. Read off the world and this screen's role, nothing else — a
 * frame test sets the world and gets the picture.
 */
export function drawMazeGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  role: ViewRole,
  time: number,
): void {
  if (m.phase !== "grip") return;
  const c = mazeHeartCircle(l, cfg, m);
  if (c.r <= 0) return;
  const waiting = waitsOnPartner(cfg, m, role);
  const words = rubWords(role, m, waiting);
  const wordY = c.y + c.r * BELOW_MUL + l.tile * 0.95;
  if (words !== null) drawHandleHint(ctx, l, role, c.x, wordY, HINT_LOUD, words);
  if (waiting) drawMarkWait(ctx, c.x, wordY + l.tile * WAIT_BELOW, l.tile * WAIT_R, time);
}

/** The waiting clock: how far under the word it stands, and its size, in tiles. */
const WAIT_BELOW = 1.05;
const WAIT_R = 1.1;
