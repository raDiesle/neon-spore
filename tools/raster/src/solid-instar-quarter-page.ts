import { drawQuarterHead, drawSideHead, INSTAR_ENTER } from "@neon-spore/render";

/**
 * The INSTAR side-on head sheet (`bun run solid --instar-quarter`): the
 * profile head that shipped until 7 October 2026 beside the head turned three
 * quarters to the ship (`packages/render/src/instar-quarter-head.ts`), jaw
 * shut, half open and wide on fire, and the eye wincing.
 */

const CELL = 360;
const R = 95;
const ROWS = [
  { jaw: 0.1, fire: 0, wince: 0 },
  { jaw: 0.5, fire: 0.3, wince: 0 },
  { jaw: 1, fire: 1, wince: 0.6 },
];

function draw(): string {
  const canvas = document.createElement("canvas");
  canvas.width = CELL * 2;
  canvas.height = CELL * ROWS.length;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");
  ctx.fillStyle = "#140F2E";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ROWS.forEach(({ jaw, fire, wince }, row) => {
    const f = { ...INSTAR_ENTER, jawUp: jaw, jawDown: jaw, eye: 1, wince, side: 1 };
    const look = (col: number) => ({
      f,
      head: { x: col * CELL + CELL * 0.48, y: row * CELL + CELL * 0.55 },
      r: R,
      time: 1.3,
      fade: 1,
      hurt: 0,
      threat: 0,
      fire,
      harden: 0,
      shoveUp: 0,
      shoveDown: 0,
    });
    drawSideHead(ctx, look(0));
    drawQuarterHead(ctx, look(1));
    for (const [col, text] of [
      [0, "profile (shipped)"],
      [1, "three quarters"],
    ] as const) {
      ctx.strokeStyle = "#241B4F";
      ctx.strokeRect(col * CELL + 0.5, row * CELL + 0.5, CELL - 1, CELL - 1);
      ctx.fillStyle = "#7A6FA8";
      ctx.font = "14px monospace";
      ctx.fillText(`${text}  jaw ${jaw}`, col * CELL + 10, row * CELL + 20);
    }
  });
  return canvas.toDataURL("image/png");
}

(window as unknown as { __sheet: string }).__sheet = draw();
