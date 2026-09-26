import { view } from "@neon-spore/content";
import { drawRig, type Part } from "@neon-spore/render";
// @ts-expect-error — Zdog ships no types; this page is a one-off comparison.
import Zdog from "zdog";
import { demoRig } from "./solid-demo.js";

/**
 * The Zdog comparison, 26 September 2026: the owner found Zdog promising, so
 * the same test rig is drawn by it and by `drawRig`, one above the other, at
 * the same five turns. Zdog gets its own idiom — round strokes, flat colour,
 * a lighter offset shape for a highlight — and not the rig's shading, since
 * the question is what the library gives. `bun run solid --zdog`.
 */

const CELL = 360;
const YAWS = [0, 0.4, 0.785, 1.15, 1.571];
const LOOK = { deep: "#07060F", rim: "#C9B8FF", haze: 0.5 };

function zdogCell(parts: Part[], yaw: number, pitch: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CELL;
  canvas.height = CELL;
  const illo = new Zdog.Illustration({ element: canvas, rotate: { x: -pitch, y: -yaw } });
  for (const p of parts) {
    if (p.kind === "tube") {
      for (let i = 0; i < p.rings.length - 1; i++) {
        const a = p.rings[i];
        const b = p.rings[i + 1];
        if (!a || !b) continue;
        new Zdog.Shape({
          addTo: illo,
          path: [a.c, b.c],
          stroke: a.r + b.r,
          color: p.skin.base,
        });
      }
    } else if (p.kind === "ball") {
      const ball = new Zdog.Shape({
        addTo: illo,
        translate: p.c,
        stroke: p.r * 2,
        color: p.skin.base,
      });
      new Zdog.Shape({
        addTo: ball,
        translate: { x: -p.r * 0.3, y: -p.r * 0.3, z: p.r * 0.5 },
        stroke: p.r * 0.7,
        color: p.skin.lift,
      });
    }
  }
  illo.updateRenderGraph();
  return canvas;
}

function draw(): string {
  const canvas = document.createElement("canvas");
  canvas.width = CELL * YAWS.length;
  canvas.height = CELL * 4;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = "#07060F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const parts = demoRig(0);
  YAWS.forEach((yaw, col) => {
    [0, 0.45].forEach((pitch, k) => {
      const ry = k * 2 * CELL;
      drawRig(ctx, parts, view(yaw, pitch, 900), col * CELL + CELL / 2, ry + CELL / 2, LOOK);
      ctx.drawImage(zdogCell(parts, yaw, pitch), col * CELL, ry + CELL);
      for (const [row, name] of [
        [ry, "rig"],
        [ry + CELL, "zdog"],
      ] as const) {
        ctx.strokeStyle = "#241B4F";
        ctx.strokeRect(col * CELL + 0.5, row + 0.5, CELL - 1, CELL - 1);
        ctx.fillStyle = "#7A6FA8";
        ctx.font = "15px monospace";
        const deg = (v: number) => Math.round((v * 180) / Math.PI);
        ctx.fillText(`${name}  yaw ${deg(yaw)}°  pitch ${deg(pitch)}°`, col * CELL + 12, row + 24);
      }
    });
  });
  return canvas.toDataURL("image/png");
}

(window as unknown as { __sheet: string }).__sheet = draw();
