import { FRONT, SIDE } from "@neon-spore/content";
import { drawFrontHead, drawRigHead, INSTAR_ENTER } from "@neon-spore/render";
import { RIG_HEAD, type RigHeadShape } from "../../../packages/render/src/instar-rig-head-draw.js";
import {
  DRAKE_HEAD,
  HOUND_HEAD,
  VIPER_HEAD,
} from "../../../packages/render/src/instar-rig-head-shapes.js";

/**
 * The INSTAR heads sheet (`bun run solid --instar-heads`): the shipped rig
 * head and VERSUS's three living heads (`instar-rig-head-shapes.ts`) turned
 * from face-on to the side in five steps, a row each, jaw shut and then open
 * on fire, beside the shipped face-on head every one of them keeps.
 */

const CELL = 260;
const R = 52;
const YAWS = [FRONT, 1.18, 0.785, 0.39, SIDE];
const HEADS: readonly (readonly [string, RigHeadShape])[] = [
  ["rig", RIG_HEAD],
  ["drake", DRAKE_HEAD],
  ["hound", HOUND_HEAD],
  ["viper", VIPER_HEAD],
];

function draw(): string {
  const canvas = document.createElement("canvas");
  canvas.width = CELL * (YAWS.length + 1);
  canvas.height = CELL * HEADS.length * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = "#07060F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  HEADS.forEach(([name, shape], h) => {
    [0, 1].forEach((open) => {
      const row = h * 2 + open;
      const f = { ...INSTAR_ENTER, jawUp: open, jawDown: open, eye: 1 };
      const frame = (col: number) => ({
        f,
        head: { x: col * CELL + CELL * 0.55, y: row * CELL + CELL * 0.6 },
        r: R,
        time: 1.3,
        fade: 1,
        hurt: 0,
        threat: 0,
        fire: open,
        harden: 0,
        shoveUp: 0,
        shoveDown: 0,
      });
      const label = (col: number, text: string) => {
        ctx.strokeStyle = "#241B4F";
        ctx.strokeRect(col * CELL + 0.5, row * CELL + 0.5, CELL - 1, CELL - 1);
        ctx.fillStyle = "#7A6FA8";
        ctx.font = "14px monospace";
        ctx.fillText(text, col * CELL + 10, row * CELL + 20);
      };
      drawFrontHead(ctx, frame(0));
      label(0, `shipped  jaw ${open}`);
      YAWS.forEach((yaw, i) => {
        drawRigHead(ctx, frame(i + 1), yaw, shape);
        label(i + 1, `${name}  ${Math.round((yaw * 180) / Math.PI)}°`);
      });
    });
  });
  return canvas.toDataURL("image/png");
}

(window as unknown as { __sheet: string }).__sheet = draw();
