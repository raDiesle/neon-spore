import { view } from "@neon-spore/content";
import { drawRig } from "@neon-spore/render";
import { demoRig } from "./solid-demo.js";

/**
 * The solid sheet's page: bundled for the browser by `solid.ts` and run
 * there, so the sheet is drawn by the same canvas the game draws on.
 *
 * Rows are the turn from the side to the front at eye level, then the same
 * turn looked down on; the last row is one angle across time, so the life
 * shows as well as the solid.
 */

const CELL = 360;
const YAWS = [0, 0.4, 0.785, 1.15, 1.571];
const LOOK = { deep: "#07060F", rim: "#C9B8FF", haze: 0.5 };

function draw(): string {
  const cols = YAWS.length;
  const rows = 3;
  const canvas = document.createElement("canvas");
  canvas.width = CELL * cols;
  canvas.height = CELL * rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = "#07060F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cell = (col: number, row: number, yaw: number, pitch: number, t: number): void => {
    const x = col * CELL + CELL / 2;
    const y = row * CELL + CELL / 2;
    ctx.strokeStyle = "#241B4F";
    ctx.strokeRect(col * CELL + 0.5, row * CELL + 0.5, CELL - 1, CELL - 1);
    drawRig(ctx, demoRig(t), view(yaw, pitch, 900), x, y, LOOK);
    ctx.fillStyle = "#7A6FA8";
    ctx.font = "15px monospace";
    const label = `yaw ${Math.round((yaw * 180) / Math.PI)}°  pitch ${Math.round((pitch * 180) / Math.PI)}°  t ${t.toFixed(1)}s`;
    ctx.fillText(label, col * CELL + 12, row * CELL + 24);
  };
  YAWS.forEach((yaw, i) => {
    cell(i, 0, yaw, 0, 0);
  });
  YAWS.forEach((yaw, i) => {
    cell(i, 1, yaw, 0.45, 0);
  });
  YAWS.forEach((_, i) => {
    cell(i, 2, 0.785, 0.2, i * 0.7);
  });
  return canvas.toDataURL("image/png");
}

(window as unknown as { __sheet: string }).__sheet = draw();
