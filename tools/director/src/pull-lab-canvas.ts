import type { Point } from "@neon-spore/content";
import { paintLab } from "./pull-lab-paint.js";
import { type LampreyScene, SCENE_H, SCENE_W, type SceneFrame } from "./pull-lab-scene.js";
import { LAB_H, LAB_W } from "./pull-lab-shapes.js";

/**
 * **The PULL LAB's canvas** (`pull-lab.ts`): cut to its room, a pointer read
 * into the pixels the pull runs in, and one frame drawn — on the empty field
 * in the lab's own pixels, or on a wave in the phone's (`pull-lab-scene.ts`).
 */

/** Device pixels per lab pixel, at most: the knob's rim is a line of 1.6. */
const MAX_DPR = 4;
/** Device pixels per CSS pixel, at most: a phone's three filled a canvas of
 * 1.4 million pixels sixty times a second, and two is as sharp to the eye. */
const MAX_SCREEN_DPR = 2;

/** The canvas as big as its room allows, in the shape of the field it shows. */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  room: HTMLElement,
  scene: LampreyScene | null,
): void {
  const box = room.getBoundingClientRect();
  const [w, h] = scene ? [SCENE_W, SCENE_H] : [LAB_W, LAB_H];
  const s = Math.min((box.width - 28) / w, (box.height - 14) / h);
  canvas.style.width = `${w * s}px`;
  canvas.style.height = `${h * s}px`;
  const dpr = Math.min(MAX_DPR, s * Math.min(MAX_SCREEN_DPR, window.devicePixelRatio || 1));
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
}

/** Where a pointer is, in the pixels the pull runs in — far off the field
 * on a wave that has not laid its track yet, so nothing is taken. */
export function pointOn(
  canvas: HTMLCanvasElement,
  e: PointerEvent,
  scene: LampreyScene | null,
): Point {
  const box = canvas.getBoundingClientRect();
  const fx = (e.clientX - box.left) / box.width;
  const fy = (e.clientY - box.top) / box.height;
  if (!scene) return { x: fx * LAB_W, y: fy * LAB_H };
  return scene.toTrack(fx, fy) ?? { x: -1e4, y: -1e4 };
}

/** One frame: the scene's wave with the pull in it, or the empty field. */
export function drawLab(
  canvas: HTMLCanvasElement,
  scene: LampreyScene | null,
  f: SceneFrame,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (scene) {
    scene.paint(ctx, f);
    return;
  }
  ctx.setTransform(canvas.width / LAB_W, 0, 0, canvas.height / LAB_H, 0, 0);
  paintLab(ctx, f.lab);
}
