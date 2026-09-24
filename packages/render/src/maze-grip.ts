import { type MazeState, mazeCircleMilli, mazeCurrent, type SimConfig } from "@neon-spore/sim";
import { drawGripDial, drawGripRing } from "./grip-rings.js";
import { drawHandleHint, type HandleWords, HINT_LOUD } from "./handle-word.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { mazeDrum } from "./maze-walls.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import type { ViewRole } from "./view-role.js";

/**
 * **THE MAZE's heart as a control**, for the one gesture that asks a thumb
 * for it: the tear (`grip`, `sim/maze-hand.ts`). A shot of the right colour
 * that reaches the middle is held there, and the wheel is finished by the
 * navigator pulling the heart down past `mazeHeartPullMilli` while the
 * pilot's hand is on the string. Her half is here; his is the string's own
 * handle, kept drawn under `grip` as a brace (`maze-string.ts`).
 *
 * The circle is the heart's **room** — the drum's innermost ring, the same
 * number `maze-draw.ts` sizes the muscle from — rather than the muscle, which
 * swells with every thump and moves as it is pulled: a control answered where
 * it is drawn *this frame* would be one you could only grab between beats.
 * Which seat it answers is the simulation's rule and is asked for here only
 * to refuse a press the sim would drop anyway, so nothing is drawn taking
 * hold of a heart that will not answer: the navigator's, under `grip`, and no
 * other. A press from the pilot's seat falls through, the way hers does on
 * the string.
 *
 * What is drawn is read off the world every frame: a ring in the room on the
 * navigator's screen, breathing until her thumb lands and filled while the
 * sim has it (`gripThumb`), carried down with the muscle as she pulls; and
 * the dial of `mazeGripBeats` round the room on **both** screens, because
 * the count is one count and it is *ours* — a heart held past it lets the
 * shot go. **The other seat's thumb is never drawn** as a thumb: the pilot
 * sees the heart stretch, which is what her pull *does*, and she sees his
 * handle lit, which is what his brace does. Whether the partner is on is the
 * partner's to say, and that is the split.
 */

/** Inside the room, clear of the muscle at full swell. */
const RING_MUL = 0.72;

/** Whose it is, in words: the navigator's, and the pilot is told so. */
const HEART_WORDS: HandleWords = { seat: 2, mine: "PULL", theirs: "P2'S" };

/** No wheel up, no room: a radius of nought is never hit and never drawn. */
const NO_ROOM = 0;

/** The heart's room: the drum's innermost circle, at rest. */
export function mazeHeartCircle(l: Layout, cfg: SimConfig, m: MazeState): Circle {
  const d = mazeDrum(l, cfg);
  const wheel = mazeCurrent(m);
  const inner = wheel === null ? NO_ROOM : mazeCircleMilli(wheel, 0) / 1000;
  return { x: d.cx, y: d.cy, r: d.r * inner };
}

/** How far down the muscle is being pulled, in pixels, for this frame's picture. */
export function mazeHeartPull(l: Layout, m: MazeState): number {
  return m.phase === "grip" ? (m.gripPullMilli * l.tile) / 1000 : 0;
}

/**
 * A press on the heart while it is holding the shot: a `drag` on `mazeHeart`
 * whose moves report how far down the thumb has come (`touch.ts` reads the
 * displacement off the hold's origin), and whose lift lets go.
 */
export function mazeHeartUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const m = bossOf(field, "maze");
  if (m === null || m.phase !== "grip" || field.seat !== 2) return null;
  if (!hitCircle(mazeHeartCircle(l, field.cfg, m), x, y)) return null;
  return {
    player: 2,
    command: { kind: "drag", target: "mazeHeart", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "mazeHeart", player: 2, originX: x, originY: y },
  };
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * The ring, the word and the count, drawn after the shot so they stand over
 * it. Read off the world and this screen's role, nothing else — a frame test
 * sets the world and gets the picture.
 */
export function drawMazeGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  m: MazeState,
  role: ViewRole,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (m.phase !== "grip") return;
  const c = mazeHeartCircle(l, cfg, m);
  if (c.r <= 0) return;
  const pull = mazeHeartPull(l, m);
  if (role !== "p1") {
    drawGripRing(ctx, c.x, c.y + pull, c.r * RING_MUL, m.gripThumb, time);
  }
  // The word goes as soon as her thumb lands, the way the string's does.
  if (!m.gripThumb) drawHandleHint(ctx, l, role, c.x, c.y + c.r * 1.25, HINT_LOUD, HEART_WORDS);
  const left = 1 - clamp01((beat - m.phaseBeat + beatPhase) / cfg.mazeGripBeats);
  drawGripDial(ctx, c.x, c.y, c.r * RING_MUL, left);
}
