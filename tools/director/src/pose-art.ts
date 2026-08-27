import {
  Canvas2DRenderer,
  computeLayout,
  computeStage,
  type Layout,
  type Stage,
  type Viewport,
} from "@neon-spore/render";
import { hullRow, type SimConfig, ticksPerBeat } from "@neon-spore/sim";
import type { CropKind, Pose } from "./pose-kit.js";

/**
 * A posed world, drawn — one frame of the shipping renderer, cut down to the
 * part of the phone the pose is about.
 *
 * The frame is real. It is `Canvas2DRenderer` against a real `World` through
 * `computeStage`, exactly as the stage in the middle of the editor is and
 * exactly as the device is; the only thing this file adds is the scissors.
 * That is the whole argument for drawing these rather than checking in
 * screenshots: a captured picture is the game as it was on the day somebody
 * remembered to take it, and it goes silently wrong the first time a lobe or a
 * colour moves. This one cannot be out of date, because it is not a picture of
 * the game — it is the game, drawn once.
 *
 * The renderer eases: the shield swells towards armed, the maw travels through
 * flat, the cannon glides to its column. A single frame would catch all three
 * at zero, so the pose is drawn a few dozen times with a long `dt` first and
 * only the last frame is kept — the easing settled, the effects fresh.
 */

/** The phone the frame is drawn into before it is cut. Bigger than a card. */
const PHONE: Viewport = { width: 380, height: 820, dpr: 2 };
/** Frames spent settling the eased pose before the one that is kept. */
const SETTLE = 40;

/** How many tiles across a `tile` crop shows, unless the pose asks for more. */
const TILE_SPAN = 3.4;

/**
 * Tallest a card may be drawn. A crop of the whole phone is more than twice
 * as tall as it is wide, and a row of flex cards is as tall as the tallest in
 * it — so without a cap two full-phone pictures leave a hand's width of empty
 * page beside every short card on their row.
 */
const MAX_HEIGHT = 380;

/**
 * The rectangle to cut, in the canvas's own CSS pixels — so `stage.left` is
 * added back, the offset `Canvas2DRenderer` translates by before it draws.
 */
function cropRect(
  crop: CropKind,
  l: Layout,
  stage: Stage,
  at: { col: number; row: number } | undefined,
  span: number,
  cfg: SimConfig,
): { x: number; y: number; w: number; h: number } {
  const left = stage.left;
  const full = { x: left, y: 0, w: l.width, h: l.height };
  if (crop === "full") return full;
  if (crop === "band") return { x: left, y: l.bandTop, w: l.width, h: l.bandHeight };
  if (crop === "field") return { x: left, y: 0, w: l.width, h: l.bandTop };
  if (crop === "radar") {
    // The strip and a little of the field under it, so a blip is seen to be
    // above the grid rather than floating in a band of its own.
    return { x: left, y: l.gridTop - l.radarHeight, w: l.width, h: l.radarHeight + l.tile * 0.7 };
  }
  if (crop === "ship") {
    // The hull, five tiles of the field over it, and the whole band.
    const top = l.gridTop + (hullRow(cfg) - 5) * l.tile;
    return { x: left, y: Math.max(0, top), w: l.width, h: l.height - Math.max(0, top) };
  }
  if (!at) return full;
  const side = span * l.tile;
  return {
    x: left + l.gridLeft + (at.col + 0.5) * l.tile - side / 2,
    y: l.gridTop + (at.row + 0.5) * l.tile - side / 2,
    w: side,
    h: side,
  };
}

/**
 * The pose on its own canvas, at the device's pixel ratio.
 *
 * `width` is what the card gives it; the height follows from the crop, so a
 * tile stays square and the ship keeps the proportions the phone draws it at.
 */
export function poseArt(pose: Pose, width: number): HTMLCanvasElement {
  const world = pose.build();
  const cfg = world.cfg;
  const role = pose.role ?? "test";

  const off = document.createElement("canvas");
  const renderer = new Canvas2DRenderer(off);
  renderer.resize(PHONE);

  const tpb = ticksPerBeat(cfg);
  const view = {
    world,
    beatPhase: (world.tick % tpb) / tpb,
    role,
    time: world.tick / cfg.tickHz,
    running: true,
    banner: null,
  };
  // Settled first, with nothing reported: a long `dt` walks the eased pose to
  // where it belongs without spending the events on frames nobody keeps.
  for (let i = 0; i < SETTLE; i++) renderer.draw({ ...view, dt: 1 / 20, events: [] });
  // Then the frame that is kept, carrying whatever the last tick reported —
  // so a deflection is drawn with its flash on rather than a second later.
  renderer.draw({ ...view, dt: 1 / 60, events: world.events });

  const stage = computeStage(PHONE, cfg, role);
  const layout = computeLayout(
    { width: stage.width, height: stage.height, dpr: PHONE.dpr },
    cfg,
    role,
  );
  const rect = cropRect(pose.crop, layout, stage, pose.at?.(world), pose.span ?? TILE_SPAN, cfg);

  const dpr = Math.min(3, window.devicePixelRatio || 1);
  // The crop decides the shape; the cap decides how much of the row it takes.
  const wide = Math.min(width, Math.round((MAX_HEIGHT * rect.w) / rect.h));
  const height = Math.round((wide * rect.h) / rect.w);
  const card = document.createElement("canvas");
  card.width = Math.round(wide * dpr);
  card.height = Math.round(height * dpr);
  card.style.width = `${wide}px`;
  card.style.height = `${height}px`;

  const ctx = card.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      off,
      rect.x * PHONE.dpr,
      rect.y * PHONE.dpr,
      rect.w * PHONE.dpr,
      rect.h * PHONE.dpr,
      0,
      0,
      card.width,
      card.height,
    );
  }
  renderer.dispose();
  return card;
}
