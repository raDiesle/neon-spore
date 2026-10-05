import { circleSubpath } from "@neon-spore/content";
import {
  type MazeState,
  mazeCircleMilli,
  mazeCurrent,
  mazeHeartAsks,
  mazeShakeThrough,
  mazeStringAsks,
  type SimConfig,
} from "@neon-spore/sim";
import { arcFromTop } from "./arc-from-top.js";
import { strokeGlow } from "./glow.js";
import { drawGripRing } from "./grip-rings.js";
import { drawHandleHint, type HandleWords, HINT_LOUD } from "./handle-word.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { drawShakeArrows } from "./maze-shake-arrows.js";
import { mazeStringGrab } from "./maze-string.js";
import { mazeDrum } from "./maze-walls.js";
import { PALETTE, STROKE } from "./palette.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { seatOf, type ViewRole } from "./view-role.js";

/**
 * **THE MAZE's heart as a control**, for the one gesture that asks thumbs of
 * it: the shake (`grip`, `sim/maze-hand.ts`, `sim/maze-shake.ts`). A shot of
 * the right colour that reaches the middle is held there, and the wheel is
 * finished by **both seats** carrying the heart back and forth inside its
 * room — any direction, stopped at the wall — until each has shaken it half
 * of `mazeShakeWidths` room widths.
 *
 * The circle pressed is the heart's **room** — the drum's innermost ring, the
 * same number `maze-draw.ts` sizes the muscle from — rather than the muscle,
 * which swells with every thump and moves as it is shaken: a control answered
 * where it is drawn *this frame* would be one you could only grab between
 * beats. Every seat's press takes a hold, because the heart asks both.
 *
 * What is drawn is read off the world every frame, the same on both screens
 * but for whose thumb is whose (the owner, 29 September 2026: *clearly
 * indicate that pulling in any direction is the proper action and gives the
 * user the green feedback*):
 *  - **four arrows** round the room, rocking outward, for as long as the
 *    heart holds — every way is a way (`maze-shake-arrows.ts`);
 *  - **SHAKE** under it until this seat's thumb lands, and then the partner's
 *    seat named until theirs does, because half the shake is theirs;
 *  - the ring under this seat's thumb, carried with the heart and **green**
 *    once the sim has it;
 *  - and round the room a **green count** filling as the pair shakes
 *    (`mazeShakeThrough`). The time left is the fuse under the drum
 *    (`maze-fuse.ts`), the clock every boss wears, so it is not said twice.
 */

/** Inside the room, clear of the muscle at full swell. */
const RING_MUL = 0.72;

/** The count's ring, just outside the room's wall. */
const COUNT_MUL = 1.14;

/** No wheel up, no room: a radius of nought is never hit and never drawn. */
const NO_ROOM = 0;

/** The heart's room: the drum's innermost circle, at rest. */
export function mazeHeartCircle(l: Layout, cfg: SimConfig, m: MazeState): Circle {
  const d = mazeDrum(l, cfg);
  const wheel = mazeCurrent(m);
  const inner = wheel === null ? NO_ROOM : mazeCircleMilli(wheel, 0) / 1000;
  return { x: d.cx, y: d.cy, r: d.r * inner };
}

/** Where the heart stands from the room's middle this frame, in pixels. */
export function mazeHeartAt(l: Layout, m: MazeState): { x: number; y: number } {
  if (m.phase !== "grip") return { x: 0, y: 0 };
  return { x: (m.gripXMilli * l.tile) / 1000, y: (m.gripYMilli * l.tile) / 1000 };
}

/** The ring a thumb holds: inside the room, carried with the muscle. */
export function mazeHeartRing(l: Layout, cfg: SimConfig, m: MazeState): Circle {
  const c = mazeHeartCircle(l, cfg, m);
  const at = mazeHeartAt(l, m);
  return { x: c.x + at.x, y: c.y + at.y, r: c.r * RING_MUL };
}

/**
 * A press on the heart while it is holding the shot: a `drag` on `mazeHeart`
 * whose moves report the displacement off the hold's origin on both axes
 * (`touch-move.ts`), and whose lift lets go. Either seat's.
 */
export function mazeHeartUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const m = bossOf(field, "maze");
  if (m === null || !mazeHeartAsks(m)) return null;
  if (!hitCircle(mazeHeartCircle(l, field.cfg, m), x, y)) return null;
  const player = field.seat;
  return {
    player,
    command: { kind: "drag", target: "mazeHeart", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "mazeHeart", player, originX: x, originY: y },
  };
}

/**
 * The seat a press on an asked part belongs to, for one mouse at a desk
 * (`desk-grab.ts` `markSeat`): the string is always the pilot's, and the heart
 * the seat with less of its half shaken, so one hand lifting and pressing
 * again can do both halves.
 */
export function mazeGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const m = bossOf(field, "maze");
  if (m === null) return undefined;
  if (mazeStringAsks(m) && hitCircle(mazeStringGrab(l, field.cfg, m), x, y)) return 1;
  if (mazeHeartAsks(m) && hitCircle(mazeHeartCircle(l, field.cfg, m), x, y)) {
    const [p1 = 0, p2 = 0] = m.gripShookMilli;
    return p1 < p2 ? 1 : 2;
  }
  return undefined;
}

/** The word under the room, as this screen reads it. */
function shakeWords(role: ViewRole, m: MazeState): HandleWords | null {
  const seat = seatOf(role);
  const mine = role === "test" ? m.gripSeats !== 0 : (m.gripSeats & seat) !== 0;
  if (!mine) return { seat, mine: "SHAKE", theirs: "SHAKE" };
  if (role === "test" || m.gripSeats === 3) return null;
  return { seat, mine: seat === 1 ? "P2 TOO" : "P1 TOO", theirs: "" };
}

/**
 * The ring, the arrows, the word and the count, drawn after the shot so they
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
  const ring = mazeHeartRing(l, cfg, m);
  const held = role === "test" ? m.gripSeats !== 0 : (m.gripSeats & seatOf(role)) !== 0;
  if (held) drawHeldRing(ctx, ring);
  else drawGripRing(ctx, ring.x, ring.y, ring.r, false, time);
  drawShakeArrows(ctx, l, c, held, time);
  drawShakeCount(ctx, c, mazeShakeThrough(cfg, m) / 1000);
  const words = shakeWords(role, m);
  if (words !== null) {
    drawHandleHint(ctx, l, role, c.x, c.y + c.r * COUNT_MUL + l.tile * 0.95, HINT_LOUD, words);
  }
}

/** The ring under this seat's thumb once the sim has it: green, and steady. */
function drawHeldRing(ctx: CanvasRenderingContext2D, ring: Circle): void {
  const p = new Path2D(circleSubpath(ring.x, ring.y, ring.r));
  ctx.save();
  ctx.fillStyle = PALETTE.good;
  ctx.globalAlpha = 0.2;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, PALETTE.good, STROKE.inner, 1.3);
}

/** How far through the shake the pair is: a green arc from the top, clockwise,
 * over a faint whole ring so what is left to shake reads as well. */
function drawShakeCount(ctx: CanvasRenderingContext2D, c: Circle, through: number): void {
  const r = c.r * COUNT_MUL;
  ctx.save();
  ctx.lineCap = "butt";
  ctx.strokeStyle = PALETTE.good;
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.beginPath();
  ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
  ctx.stroke();
  if (through > 0) {
    ctx.globalAlpha = 1;
    ctx.lineWidth = STROKE.outline * 2.4;
    ctx.beginPath();
    arcFromTop(ctx, c.x, c.y, r, Math.min(1, through));
    ctx.stroke();
  }
  ctx.restore();
}
