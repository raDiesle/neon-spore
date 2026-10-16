import { bakedCache } from "./baked.js";
import type { GlanceFrame } from "./glance.js";
import { inverse, type Reach, times } from "./glance-layer-box.js";
import { enterHalf, farDark, wholeRect } from "./glance-layer-halves.js";

/**
 * **The atlases a pass's turned parts are laid down in** (`glance-batch.ts`
 * runs the pass): every part in its own cell of one, every cell's halves put
 * together on a second, the whole doubled on a third and the far sides
 * darkened there — `glance-layer.ts`'s three layers, one cell a body.
 */

export interface Job {
  f: GlanceFrame;
  m: DOMMatrix;
  box: { ox: number; oy: number; w: number; h: number };
  reach: Reach;
  far: -1 | 1;
  ramp: { dark: number; span: number };
  angle: number;
  dark: number;
  atop: boolean;
}

export interface Cell extends Job {
  cx: number;
  cy: number;
  paths: readonly Path2D[];
  alpha: number;
}

export type Atlas = "part" | "halves" | "out" | "spare";
export const CANVASES = bakedCache<Atlas, HTMLCanvasElement>();

export function canvasOf(which: Atlas, w: number, h: number): HTMLCanvasElement {
  let c = CANVASES.get(which);
  if (c === undefined) {
    c = document.createElement("canvas");
    // Drawn into every frame, so a frame's cost is in it (`test/canvas-stub-layer.ts`).
    if (which !== "spare") c.id = `layer:glance-${which}`;
    CANVASES.set(which, c);
  }
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  return c;
}

export const ctxOf = (which: Atlas): CanvasRenderingContext2D =>
  CANVASES.get(which)?.getContext("2d") as CanvasRenderingContext2D;

/** Every cell's halves put together, the whole doubled, and the far sides darkened. */
export function lay(cells: readonly (Cell | null)[], width: number, used: number): void {
  const h = ctxOf("halves");
  const g = ctxOf("out");
  h.setTransform(1, 0, 0, 1, 0, 0);
  h.clearRect(0, 0, width, used);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, width, used);
  if (cells.every((c) => c === null)) return;
  const part = CANVASES.get("part") as HTMLCanvasElement;
  h.globalAlpha = 0.5;
  h.globalCompositeOperation = "lighter";
  for (const c of cells) {
    if (c === null) continue;
    const { m, box, f, reach } = c;
    const back = times(inverse(m), { a: 1, b: 0, c: 0, d: 1, e: box.ox, f: box.oy });
    inCell(h, c);
    for (const s of [-1, 1] as const) {
      h.setTransform(m.a, m.b, m.c, m.d, m.e - box.ox + c.cx, m.f - box.oy + c.cy);
      enterHalf(h, f, s, reach);
      const n = times(h.getTransform(), back);
      h.setTransform(n.a, n.b, n.c, n.d, n.e, n.f);
      h.drawImage(part, c.cx, c.cy, box.w, box.h, 0, 0, box.w, box.h);
      h.restore();
    }
    h.restore();
  }
  h.globalAlpha = 1;
  h.globalCompositeOperation = "source-over";
  const halves = CANVASES.get("halves") as HTMLCanvasElement;
  g.globalCompositeOperation = "lighter";
  g.drawImage(halves, 0, 0, width, used, 0, 0, width, used);
  g.drawImage(halves, 0, 0, width, used, 0, 0, width, used);
  g.globalCompositeOperation = "source-over";
  const atop = (x: CanvasRenderingContext2D) => {
    x.globalCompositeOperation = "source-atop";
  };
  for (const c of cells) {
    if (c === null || !c.atop || c.dark <= 0) continue;
    const { m, box, f, reach } = c;
    inCell(g, c);
    g.setTransform(m.a, m.b, m.c, m.d, m.e - box.ox + c.cx, m.f - box.oy + c.cy);
    farDark(g, f, c.far, reach, c.ramp, atop, (x) => x.fillRect(...wholeRect(f, reach, c.angle)));
    g.restore();
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}

/** `x` saved and clipped to cell `c`, in the atlas's own pixels. */
export function inCell(x: CanvasRenderingContext2D, c: Cell): void {
  x.save();
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.beginPath();
  x.rect(c.cx, c.cy, c.box.w, c.box.h);
  x.clip();
}
