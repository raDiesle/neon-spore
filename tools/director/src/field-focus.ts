import { controlSetForWave, seatedSet } from "@neon-spore/content";
import {
  computeLayout,
  computeStage,
  deskDown,
  handedLayout,
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
  const stage = computeStage(PHONE);
  const layout = handedLayout(
    computeLayout({ width: stage.width, height: stage.height, dpr: PHONE.dpr }, world.cfg, role),
    world,
  );
  const controls = seatedSet(controlSetForWave(world.wave), world);
  const field = {
    1: stageField(world, role, controls, world.cfg, 1, null),
    2: stageField(world, role, controls, world.cfg, 2, null),
  };
  const fieldFor = (seat: 1 | 2) => field[seat];
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let y = STEP / 2; y < layout.height; y += STEP) {
    for (let x = STEP / 2; x < layout.width; x += STEP) {
      const touch = deskDown(layout, x, y, [1, 2], fieldFor);
      if (!rows.some((r) => holdsRow(touch, r))) continue;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  }
  if (x0 > x1) return null;
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
