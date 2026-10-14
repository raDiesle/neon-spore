import {
  bastionTrackPoints,
  type ChrysalisState,
  chrysalisGone,
  chrysalisLitStep,
  chrysalisQuillOf,
  chrysalisTrackOf,
  type DragTarget,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import {
  CHRYSALIS_SKIN_TILES,
  CHRYSALIS_TALL,
  chrysalisCentre,
  chrysalisPulledOut,
  QUILL_KNOB,
  quillAt,
} from "./chrysalis-shape.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PULL_GRAB } from "./pull-knob.js";
import { PULL_TRACK_W, type PullTrack } from "./pull-track.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The thumbs on THE CHRYSALIS** (§11.63): a knob on each side's next quill,
 * pulled along its track — straight out, or round a curve
 * (`sim/bastion-track.ts`) — while the quills are lit, THE BASTION's slab
 * knob on a spine (`bastion-grip.ts`); and **a rub on each half of the
 * slime** while the slime is lit, anywhere on that half.
 *
 * **A quill's press is a message**: `on` at nothing pulled, and every move
 * after it how far the thumb has come, in thousandths of a tile across and
 * down (`touch-move.ts`) — the simulation keeps only how far along the
 * quill's track that is. **A rub's press only takes hold**, flagged `rub`:
 * its turns are counted by the host that owns the pointers (`rub-turns.ts`),
 * which sends the first message itself.
 *
 * **The partner's mark is pressed through**, THE LATCH's rule: a thumb on it
 * sends the partner's target from this seat and the simulation refuses it
 * aloud (`chrysalisWrong`), so a press never does nothing.
 */

/** Which of the four marks: the pilot's quill, the navigator's, the pilot's half of slime, the navigator's. */
export type ChrysalisMark = 0 | 1 | 2 | 3;

export const CHRYSALIS_MARKS = [0, 1, 2, 3] as const;

/** A mark's side: nought the pilot's, on the left. */
export function chrysalisMarkSide(mark: ChrysalisMark): 0 | 1 {
  return mark === 0 || mark === 2 ? 0 : 1;
}

/** Whether a mark is a half of slime, rubbed, rather than a quill, pulled. */
export function chrysalisMarkRubs(mark: ChrysalisMark): boolean {
  return mark >= 2;
}

/** A mark's target on the wire. */
export function chrysalisMarkTarget(mark: ChrysalisMark): DragTarget {
  const side = chrysalisMarkSide(mark);
  if (chrysalisMarkRubs(mark)) return side === 0 ? "chrysalisRubLeft" : "chrysalisRubRight";
  return side === 0 ? "chrysalisQuillLeft" : "chrysalisQuillRight";
}

/** The player whose thumb a mark takes: by its side. */
export function chrysalisMarkPlayer(mark: ChrysalisMark): 1 | 2 {
  return chrysalisMarkSide(mark) === 0 ? 1 : 2;
}

/** Whether a mark is there to take hold of: its skin lit, and its half or a quill of its side still on. */
export function chrysalisMarkTakes(s: ChrysalisState, mark: ChrysalisMark): boolean {
  const skin = chrysalisLitStep(s)?.skin;
  const side = chrysalisMarkSide(mark);
  if (chrysalisMarkRubs(mark)) return skin === "slime" && !chrysalisGone(s, side);
  return skin === "quills" && chrysalisQuillOf(s, side) >= 0;
}

/** Where `side`'s quill knob rests: on the spine, where THE BASTION's slab knob rests on its slab. */
export function chrysalisKnobRest(
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  side: 0 | 1,
): Circle {
  const i = Math.max(0, chrysalisQuillOf(s, side));
  const at = quillAt(l, chrysalisCentre(l, cfg), i, QUILL_KNOB);
  return { ...at, r: handleRadius(l, cfg) };
}

/** Where `side`'s quill knob stands now: as far along its track as the thumb has it. */
export function chrysalisKnobAt(l: Layout, cfg: SimConfig, s: ChrysalisState, side: 0 | 1): Circle {
  const rest = chrysalisKnobRest(l, cfg, s, side);
  const i = Math.max(0, chrysalisQuillOf(s, side));
  const off = chrysalisPulledOut(cfg, s, i, s.pullMilli[side]);
  return { ...rest, x: rest.x + (off.x / 1000) * l.tile, y: rest.y + (off.y / 1000) * l.tile };
}

/** The middle of `side`'s half of the slime, where its rub's mark stands. */
export function chrysalisRubAt(l: Layout, cfg: SimConfig, side: 0 | 1): Circle {
  const c = chrysalisCentre(l, cfg);
  const r = CHRYSALIS_SKIN_TILES.slime * l.tile;
  return { x: c.x + (side === 0 ? -1 : 1) * r * 0.5, y: c.y + r * 0.1, r: handleRadius(l, cfg) };
}

/** Whether a point is on `side`'s half of the slime: inside the coat, on its own side of the middle. */
function onHalf(l: Layout, cfg: SimConfig, side: 0 | 1, x: number, y: number): boolean {
  const c = chrysalisCentre(l, cfg);
  const r = CHRYSALIS_SKIN_TILES.slime * l.tile;
  const dx = (x - c.x) / r;
  const dy = (y - c.y) / (r * CHRYSALIS_TALL);
  if (dx * dx + dy * dy > 1) return false;
  return side === 0 ? x < c.x : x >= c.x;
}

/** Where `mark` stands now. */
export function chrysalisMarkAt(
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  mark: ChrysalisMark,
): Circle {
  const side = chrysalisMarkSide(mark);
  return chrysalisMarkRubs(mark) ? chrysalisRubAt(l, cfg, side) : chrysalisKnobAt(l, cfg, s, side);
}

/** `side`'s next quill's whole track, from where its knob rests, on this screen. */
export function chrysalisTrack(
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  side: 0 | 1,
): PullTrack {
  const rest = chrysalisKnobRest(l, cfg, s, side);
  const i = Math.max(0, chrysalisQuillOf(s, side));
  const pts = bastionTrackPoints(cfg, chrysalisTrackOf(s, i), i).map((p) => ({
    x: rest.x + (p.x / 1000) * l.tile,
    y: rest.y + (p.y / 1000) * l.tile,
  }));
  return { pts, w: rest.r * PULL_TRACK_W };
}

/** The mark under a point, of the four that take a thumb now, or null. */
function markUnder(l: Layout, cfg: SimConfig, s: ChrysalisState, x: number, y: number) {
  for (const mark of CHRYSALIS_MARKS) {
    if (!chrysalisMarkTakes(s, mark)) continue;
    if (chrysalisMarkRubs(mark)) {
      if (onHalf(l, cfg, chrysalisMarkSide(mark), x, y)) return mark;
      continue;
    }
    const at = chrysalisKnobAt(l, cfg, s, chrysalisMarkSide(mark));
    if (hitCircle({ ...at, r: at.r * PULL_GRAB }, x, y)) return mark;
  }
  return null;
}

/** The handle where it stands, for `handleCircle`: null while its skin is not lit. */
export function chrysalisHandleStanding(
  l: Layout,
  world: World,
  s: ChrysalisState,
  target: DragTarget,
): Circle | null {
  const mark = CHRYSALIS_MARKS.find((m) => chrysalisMarkTarget(m) === target);
  if (mark === undefined || !chrysalisMarkTakes(s, mark)) return null;
  return chrysalisMarkAt(l, world.cfg, s, mark);
}

/** A press on a quill's knob or a half of slime: this seat's takes hold, the partner's is refused by the simulation. */
export function chrysalisGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "chrysalis");
  if (s === null) return null;
  const mark = markUnder(l, field.cfg, s, x, y);
  if (mark === null) return null;
  const target = chrysalisMarkTarget(mark);
  const player = field.seat;
  const command = { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 } as const;
  if (!chrysalisMarkRubs(mark)) {
    return { player, command, hold: { kind: "drag", target, player, originX: x, originY: y } };
  }
  if (chrysalisMarkPlayer(mark) !== player) return { player, command, hold: null };
  return {
    player,
    command: null,
    hold: { kind: "drag", target, player, originX: x, originY: y, rub: true },
  };
}

/** Whose thumb the mark under this point takes, for the test screen's one mouse (`desk-grab.ts`). */
export function chrysalisGripSeatAt(
  l: Layout,
  x: number,
  y: number,
  field: Field,
): 1 | 2 | undefined {
  const s = bossOf(field, "chrysalis");
  if (s === null) return undefined;
  const mark = markUnder(l, field.cfg, s, x, y);
  return mark === null ? undefined : chrysalisMarkPlayer(mark);
}
