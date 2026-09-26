import { arrowHead, mark, PHONE } from "./gesture-marks.js";
import { INK, type Prim } from "./gesture-prims.js";
import type { Gesture } from "./gesture-types.js";

export { PHONE };

/**
 * The left half of a GESTURES card: a phone in portrait, the field above a
 * faint line and the panel strip below it, and the hand drawn on the glass —
 * or, for the inputs that are not a finger, the phone itself tilted, shaken
 * or turned over. An explanatory diagram, not a frame of the game: nothing
 * here is the game's own art, on purpose, so the picture says *what the
 * hand does* and not what any one wave looks like.
 */

const BAND_Y = 112;

function glass(out: Prim[], faceDown: boolean): void {
  const { x, y, w, h } = PHONE;
  out.push({
    t: "rect",
    x,
    y,
    w,
    h,
    rx: 12,
    fill: faceDown ? INK.panel : INK.bg,
    stroke: INK.dim,
    sw: 1.5,
  } as Prim);
  if (faceDown) {
    out.push({
      t: "rect",
      x: x + 8,
      y: y + 8,
      w: 28,
      h: 28,
      rx: 7,
      fill: INK.line,
      stroke: INK.dim,
    });
    out.push({ t: "circle", cx: x + 16, cy: y + 16, r: 5, fill: INK.bg, stroke: INK.dim });
    out.push({ t: "circle", cx: x + 28, cy: y + 28, r: 5, fill: INK.bg, stroke: INK.dim });
    out.push({
      t: "text",
      x: x + w / 2,
      y: y + 84,
      text: "the back",
      fill: INK.dim,
      size: 8,
      anchor: "middle",
    });
    out.push({
      t: "text",
      x: x + w / 2,
      y: y + 96,
      text: "screen on the table",
      fill: INK.dim,
      size: 7,
      anchor: "middle",
    });
    return;
  }
  out.push({ t: "rect", x: x + w / 2 - 12, y: y + 4, w: 24, h: 5, rx: 2.5, fill: INK.line });
  out.push({
    t: "line",
    x1: x + 4,
    y1: y + BAND_Y,
    x2: x + w - 4,
    y2: y + BAND_Y,
    stroke: INK.line,
    sw: 1,
  });
  out.push({ t: "text", x: x + 6, y: y + 20, text: "field", fill: INK.line, size: 7 });
  out.push({ t: "text", x: x + 6, y: y + BAND_Y + 10, text: "panel", fill: INK.line, size: 7 });
}

function shakeLines(out: Prim[]): void {
  const { x, y, w, h } = PHONE;
  for (const dx of [-6, 6]) {
    out.push({ t: "rect", x: x + dx, y, w, h, rx: 12, fill: "none", stroke: INK.blue, op: 0.35 });
  }
  const cy = y + h / 2;
  for (const [sx, dir] of [
    [x - 2, -1],
    [x + w + 2, 1],
  ] as const) {
    for (const k of [0, 3]) {
      const px = sx + dir * k;
      out.push({
        t: "path",
        d: `M ${px} ${cy - 16} Q ${px + dir * 3} ${cy} ${px} ${cy + 16}`,
        stroke: INK.blue,
        sw: 1.5,
      });
    }
  }
  out.push({
    t: "text",
    x: x + w / 2,
    y: y + 60,
    text: "shake",
    fill: INK.blue,
    size: 9,
    anchor: "middle",
  });
}

/** The left half, phone and hand. */
export function phoneHalf(g: Gesture): Prim[] {
  const out: Prim[] = [];
  const pose = g.phone ?? {};
  if (pose.shake) shakeLines(out);
  glass(out, pose.faceDown === true);
  for (const m of g.hand) mark(m, out);
  if (pose.tilt) {
    const cx = PHONE.x + PHONE.w / 2;
    const cy = PHONE.y + PHONE.h / 2;
    const tf = `translate(${cx} ${cy}) rotate(${pose.tilt}) scale(0.78) translate(${-cx} ${-cy})`;
    const tilted = out.map((p) => ({ ...p, tf }) as Prim);
    const ghost: Prim = {
      t: "rect",
      ...PHONE,
      rx: 12,
      fill: "none",
      stroke: INK.dim,
      dash: true,
      op: 0.5,
    };
    const arc: Prim = {
      t: "path",
      d: `M ${cx - 30} ${cy + 70} Q ${cx} ${cy + 80} ${cx + 30} ${cy + 64}`,
      stroke: INK.blue,
      sw: 1.5,
    };
    return [
      ghost,
      ...tilted,
      arc,
      arrowHead([cx + 30, cy + 64], 1, -0.5, INK.blue),
      { t: "text", x: cx, y: cy, text: "tilt", fill: INK.blue, size: 9, anchor: "middle", tf },
    ];
  }
  return out;
}
