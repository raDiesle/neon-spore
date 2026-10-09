import type { FieldControlDef } from "./field-control-def.js";
import { focusOf, type TouchArea, touchArea } from "./field-focus.js";
import { paintTouchArea } from "./field-touch-paint.js";
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

/** What a picture shows: the control, the control with where it answers a
 * finger drawn over it (`field-touch-paint.ts`), or the whole phone. */
export type FocusView = "control" | "touch" | "whole";

const areas = new Map<string, TouchArea>();

/** The sweep of a card's rows on its pose, once per card. */
export function cardArea(pose: Pose, rows: readonly FieldControlDef[]): TouchArea {
  const key = `${pose.name}|${rows.map((r) => r.name).join("|")}`;
  const known = areas.get(key);
  if (known) return known;
  const area = touchArea(builtWorld(pose), pose.role ?? "test", rows);
  areas.set(key, area);
  return area;
}

/** The picture, `width` CSS pixels across unless `cap` is reached first. */
export function focusArt(
  pose: Pose,
  rows: readonly FieldControlDef[],
  width: number,
  cap: number,
  view: FocusView = "control",
): HTMLCanvasElement {
  const world = builtWorld(pose);
  const role = pose.role ?? "test";
  const area = cardArea(pose, rows);
  const rect =
    view === "whole"
      ? poseCropRect({ ...pose, crop: "full" }, world, role, PHONE)
      : (focusOf(area) ?? poseCropRect(pose, world, role, PHONE));
  const wide = Math.min(width, (cap * rect.w) / rect.h);
  const want = Math.ceil((wide * (window.devicePixelRatio || 1)) / rect.w);
  const dpr = Math.max(PHONE.dpr, Math.min(MAX_DPR, want));
  const { canvas, scale } = cutCard(drawPhone(world, role, false, dpr), rect, width, cap);
  const ctx = canvas.getContext("2d");
  if (view === "touch" && ctx) {
    const ui = canvas.width / Number.parseFloat(canvas.style.width);
    const { stage } = area;
    paintTouchArea(ctx, area, {
      k: scale * ui,
      ox: rect.x - stage.left,
      oy: rect.y - stage.top,
      ui,
    });
  }
  return canvas;
}
