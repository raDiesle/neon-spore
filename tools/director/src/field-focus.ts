import { controlSetForWave, seatedSet } from "@neon-spore/content";
import {
  computeLayout,
  computeStage,
  deskDown,
  type Field,
  handedLayout,
  type Layout,
  type Stage,
  type Touch,
  type ViewRole,
} from "@neon-spore/render";
import type { World } from "@neon-spore/sim";
import type { FieldControlDef } from "./field-control-def.js";
import { PHONE } from "./pose-frame.js";
import { stageField } from "./stage-field.js";

/**
 * **Where on the phone a control answers a finger**, found by asking the
 * game's own hit test rather than by writing a rectangle down per row.
 *
 * The owner, 9 October 2026, on CONTROLS › ON THE FIELD: the pictures showed
 * half the phone, and the control was a few tiles of it. A rectangle kept by
 * hand beside each of ninety rows would be wrong the first time a handle
 * moved; this one is read off the posed world the picture is drawn from. The
 * phone is swept in a grid and each point is pressed through `deskDown`, the
 * press the director's stage makes, for both seats; the points whose press
 * takes hold of *this row's* `Hold` — its kind, and for a drag its
 * `DragTarget` — are the control, and their box is what the card shows.
 *
 * Pure: the skin is left to the hull's own line (`skinY: null`), so the sweep
 * runs under `bun test` with no canvas (`test/field-focus.test.ts`).
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Phone CSS pixels between two presses of the sweep. A handle is a tile
 * across, about thirty of these. */
const STEP = 6;
/** Room left round the control, in tiles: enough to see what it hangs from. */
const PAD_TILES = 1;
/** Smallest a crop is, in tiles, so a pin is not blown up into a blur. */
const MIN_TILES = 3.4;
/** Longest side over shortest, past which the short one grows. */
const MAX_ASPECT = 2;

/**
 * Whether a press reached this row: took hold of its kind — a drag, of its
 * target — or, for a press that is over the moment it lands (THE UNDERTOW's
 * tap), sent a drag on its target with no hold at all.
 */
export function holdsRow(touch: Touch | null, row: FieldControlDef): boolean {
  if (!touch || row.holdKind === null) return false;
  const { hold, command } = touch;
  if (!hold) return command?.kind === "drag" && command.target === row.dragTarget;
  if (hold.kind !== row.holdKind) return false;
  if (hold.kind === "drag" && row.dragTarget) return hold.target === row.dragTarget;
  return true;
}

/** Grow `[lo, lo + len)` about its middle to `want`, kept inside `[0, max)`. */
function grow(lo: number, len: number, want: number, max: number): [number, number] {
  if (len >= want) return [lo, len];
  const side = Math.min(want, max);
  const start = Math.max(0, Math.min(max - side, lo + len / 2 - side / 2));
  return [start, side];
}

/**
 * Where a control answers, as the sweep found it: the centre of every
 * `step`-square cell a press in reaches the row, in the layout's own
 * coordinates, and the layout and stage they were found in.
 */
export interface TouchArea {
  cells: readonly { x: number; y: number }[];
  step: number;
  layout: Layout;
  stage: Stage;
}

/**
 * Every cell of the phone a press in takes hold of one of `rows`. `skinY` is
 * the renderer's own skin where there is a frame (`field-try.ts`), and the
 * hull's line where there is none.
 */
export function touchArea(
  world: World,
  role: ViewRole,
  rows: readonly FieldControlDef[],
  skinY: Field["skinY"] = null,
): TouchArea {
  const stage = computeStage(PHONE);
  const layout = handedLayout(
    computeLayout({ width: stage.width, height: stage.height, dpr: PHONE.dpr }, world.cfg, role),
    world,
  );
  const controls = seatedSet(controlSetForWave(world.wave), world);
  const field = {
    1: stageField(world, role, controls, world.cfg, 1, skinY),
    2: stageField(world, role, controls, world.cfg, 2, skinY),
  };
  const fieldFor = (seat: 1 | 2) => field[seat];
  const cells: { x: number; y: number }[] = [];
  for (let y = STEP / 2; y < layout.height; y += STEP) {
    for (let x = STEP / 2; x < layout.width; x += STEP) {
      const touch = deskDown(layout, x, y, [1, 2], fieldFor);
      if (rows.some((r) => holdsRow(touch, r))) cells.push({ x, y });
    }
  }
  return { cells, step: STEP, layout, stage };
}

/**
 * The separate patches of an area — a left and a right handle are two —
 * each as its box, in layout pixels. Cells touching side by side are one.
 */
export function patches(area: TouchArea): Rect[] {
  const { step } = area;
  const key = (x: number, y: number): string => `${Math.round(x / step)},${Math.round(y / step)}`;
  const left = new Map(area.cells.map((c) => [key(c.x, c.y), c]));
  const out: Rect[] = [];
  for (const seed of area.cells) {
    if (!left.delete(key(seed.x, seed.y))) continue;
    let [x0, y0, x1, y1] = [seed.x, seed.y, seed.x, seed.y];
    const todo = [seed];
    for (let c = todo.pop(); c; c = todo.pop()) {
      x0 = Math.min(x0, c.x);
      y0 = Math.min(y0, c.y);
      x1 = Math.max(x1, c.x);
      y1 = Math.max(y1, c.y);
      for (const [dx, dy] of [
        [step, 0],
        [-step, 0],
        [0, step],
        [0, -step],
      ] as const) {
        const k = key(c.x + dx, c.y + dy);
        const n = left.get(k);
        if (n && left.delete(k)) todo.push(n);
      }
    }
    const h = step / 2;
    out.push({ x: x0 - h, y: y0 - h, w: x1 - x0 + step, h: y1 - y0 + step });
  }
  return out;
}

/**
 * The box round every point that takes hold of one of `rows`, padded and
 * clamped to the phone, in the canvas's CSS pixels — `stage.left` added
 * back, the same frame `pose-art.ts`'s crops are in. Null when nothing
 * answers: a row whose control is not up on this tick, or one answered
 * outside `touch.ts` altogether.
 */
export function controlRect(
  world: World,
  role: ViewRole,
  rows: readonly FieldControlDef[],
): Rect | null {
  return focusOf(touchArea(world, role, rows));
}

/** `controlRect` of an area already swept. */
export function focusOf({ cells, layout, stage }: TouchArea): Rect | null {
  if (cells.length === 0) return null;
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pad = PAD_TILES * layout.tile + STEP / 2;
  const left = Math.max(0, x0 - pad);
  const top = Math.max(0, y0 - pad);
  let [x, w] = [left, Math.min(layout.width, x1 + pad) - left];
  let [y, h] = [top, Math.min(layout.height, y1 + pad) - top];
  const least = MIN_TILES * layout.tile;
  [x, w] = grow(x, w, Math.max(least, h / MAX_ASPECT), layout.width);
  [y, h] = grow(y, h, Math.max(least, w / MAX_ASPECT), layout.height);
  return { x: stage.left + x, y, w, h };
}
