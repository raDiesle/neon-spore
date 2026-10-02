import { FRONT, SIDE, see, view } from "@neon-spore/content";
import { mixHex } from "../../../packages/render/src/hex.js";
import { instarHeadAt, type Point } from "../../../packages/render/src/instar-place.js";
import type { Look } from "../../../packages/render/src/instar-plate.js";
import { POSES } from "../../../packages/render/src/instar-poses.js";
import { profileLines } from "../../../packages/render/src/instar-profile.js";
import {
  bodyOf,
  drawBelly,
  drawRidge,
  drawScales,
} from "../../../packages/render/src/instar-profile-surface.js";
import { drawRigHead } from "../../../packages/render/src/instar-rig-head-draw.js";
import { computeLayout } from "../../../packages/render/src/layout.js";
import { PALETTE } from "../../../packages/render/src/palette.js";
import { drawTube, rimTube } from "../../../packages/render/src/solid-tube-draw.js";
import { DEFAULT_CONFIG } from "../../../packages/sim/src/index.js";

/**
 * The INSTAR body sheet (`bun run solid --instar-body`): THE INSTAR's perched
 * body turned on the rig from face-on to the side in five steps. The girth is a radius round
 * the spine, so a body that is only wide side-on shows here as a ribbon.
 */

const W = 360;
const H = 300;
const YAWS = [FRONT, 1.18, 0.785, 0.39, SIDE];
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "test");
/** The profile's own skin (`instar-profile.ts`). */
const SKIN = {
  base: mixHex(PALETTE.sheenDeep, PALETTE.hull, 0.2),
  lift: PALETTE.hull,
  sheen: PALETTE.sheenRim,
};

function cell(ctx: CanvasRenderingContext2D, col: number, row: number, yaw: number): void {
  const f = POSES.perch;
  const at = instarHeadAt(L, f);
  const look: Look = {
    f,
    ...at,
    time: 0,
    fade: 1,
    hurt: 0,
    threat: 0,
    fire: 0,
    harden: 0,
    shoveUp: 0,
    shoveDown: 0,
  };
  const { top, bottom } = profileLines(L, look);
  // Centred on the body's middle and scaled to the cell, so every yaw is the same size.
  const all = [...top, ...bottom, at.head];
  const xs = all.map((p) => p.x);
  const ys = all.map((p) => p.y);
  const c = {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
  const k = Math.min(
    (W * 0.8) / (Math.max(...xs) - Math.min(...xs)),
    (H * 0.7) / (Math.max(...ys) - Math.min(...ys)),
  );
  const to = (p: Point): Point => ({ x: (p.x - c.x) * k, y: (p.y - c.y) * k });
  const w = view(yaw);
  const r = at.r * k;
  const body = bodyOf(top.map(to), bottom.map(to), w);
  ctx.save();
  ctx.translate(col * W + W / 2, row * H + H * 0.55);
  drawRidge(ctx, body, r, 0, 1, true, 2);
  const hide = drawTube(ctx, body.seen, SKIN, 1);
  drawBelly(ctx, body, hide, 0, 1);
  drawScales(ctx, body, hide, r * 0.13, 0, 1);
  drawRidge(ctx, body, r, 0, 1, false, 2);
  rimTube(ctx, hide, PALETTE.sheenRim, r * 0.06, 1);
  const head = see({ ...to(at.head), z: 0 }, w);
  drawRigHead(ctx, { ...look, head, r }, yaw);
  ctx.restore();
}

function draw(): string {
  const canvas = document.createElement("canvas");
  canvas.width = W * YAWS.length;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = "#07060F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  YAWS.forEach((yaw, col) => {
    cell(ctx, col, 0, yaw);
    ctx.strokeStyle = "#241B4F";
    ctx.strokeRect(col * W + 0.5, 0.5, W - 1, H - 1);
    ctx.fillStyle = "#7A6FA8";
    ctx.font = "14px monospace";
    ctx.fillText(`yaw ${Math.round((yaw * 180) / Math.PI)}°`, col * W + 10, 20);
  });
  return canvas.toDataURL("image/png");
}

(window as unknown as { __sheet: string }).__sheet = draw();
