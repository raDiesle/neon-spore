import type { ViewRole } from "@neon-spore/render";
import type { World } from "@neon-spore/sim";
import type { FieldControlDef } from "./field-control-def.js";
import { controlRect, type Rect } from "./field-focus.js";
import { builtWorld, poseCropRect } from "./pose-art.js";
import { cutCard, drawPhone, PHONE } from "./pose-frame.js";
import type { Pose } from "./pose-kit.js";

/**
 * A use card's picture on CONTROLS › ON THE FIELD: the posed frame cut to the
 * box round the control (`field-focus.ts`) rather than to the pose's own
 * crop, which for most boss rows was the whole field — the owner, 9 October
 * 2026, *"reduced width and height around the control and not half of
 * screen."* A row the sweep cannot find keeps the pose's crop.
 *
 * Drawn at as many device pixels as the cut needs, so a box of three tiles
 * blown up to a card — or to the whole window (`picture-zoom.ts`) — is the
 * renderer's own detail and not a stretched thumbnail.
 */

/** Most device pixels a phone is drawn at for one picture: a 380 × 820 phone
 * at six is fourteen megapixels, the most a desk browser draws without
 * complaint. */
const MAX_DPR = 6;

const rects = new Map<string, Rect | null>();

function focusRect(
  pose: Pose,
  world: World,
  role: ViewRole,
  rows: readonly FieldControlDef[],
): Rect {
  const key = `${pose.name}|${rows.map((r) => r.name).join("|")}`;
  if (!rects.has(key)) rects.set(key, controlRect(world, role, rows));
  return rects.get(key) ?? poseCropRect(pose, world, role, PHONE);
}

/**
 * The picture, `width` CSS pixels across unless `cap` is reached first;
 * `whole` cuts the whole phone instead, for the zoom's second view.
 */
export function focusArt(
  pose: Pose,
  rows: readonly FieldControlDef[],
  width: number,
  cap: number,
  whole = false,
): HTMLCanvasElement {
  const world = builtWorld(pose);
  const role = pose.role ?? "test";
  const rect = whole
    ? poseCropRect({ ...pose, crop: "full" }, world, role, PHONE)
    : focusRect(pose, world, role, rows);
  const wide = Math.min(width, (cap * rect.w) / rect.h);
  const want = Math.ceil((wide * (window.devicePixelRatio || 1)) / rect.w);
  const dpr = Math.max(PHONE.dpr, Math.min(MAX_DPR, want));
  return cutCard(drawPhone(world, role, false, dpr), rect, width, cap).canvas;
}
