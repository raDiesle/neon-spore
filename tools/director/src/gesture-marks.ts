import { INK, type Prim } from "./gesture-prims.js";
import type { HandMark, Pt } from "./gesture-types.js";

/**
 * The hand on a GESTURES card's phone: a touch, a hold, a path, an arc, a rub,
 * a body being squeezed, a strip the OS owns, a word. Coordinates arrive
 * relative to the glass and leave absolute. Split from `gesture-phone.ts`,
 * which draws the phone around them.
 */

export const PHONE = { x: 10, y: 8, w: 92, h: 154 } as const;

const at = (p: Pt): Pt => [PHONE.x + p[0], PHONE.y + p[1]];

export function arrowHead(end: Pt, dx: number, dy: number, colour: string): Prim {
  const len = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / len, dy / len];
  const [nx, ny] = [-uy, ux];
  const bx = end[0] - 7 * ux;
  const by = end[1] - 7 * uy;
  const d = `M ${end[0]} ${end[1]} L ${bx + 4 * nx} ${by + 4 * ny} L ${bx - 4 * nx} ${by - 4 * ny} Z`;
  return { t: "path", d, stroke: colour, fill: colour, sw: 1 };
}

function polyline(pts: readonly Pt[], out: Prim[]): void {
  const abs = pts.map(at);
  const d = abs.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  out.push({ t: "circle", cx: abs[0]![0], cy: abs[0]![1], r: 2.5, fill: INK.cyan });
  out.push({ t: "path", d, stroke: INK.cyan, sw: 2.5, op: 0.9 });
  const a = abs[abs.length - 2]!;
  const b = abs[abs.length - 1]!;
  out.push(arrowHead(b, b[0] - a[0], b[1] - a[1], INK.cyan));
}

/** A blob rather than a disc: five soft lobes, the game's own vocabulary. */
function blob(c: Pt, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    const rr = r * (1 + 0.09 * Math.sin(5 * a));
    pts.push(
      `${i === 0 ? "M" : "L"} ${(c[0] + rr * Math.cos(a)).toFixed(1)} ${(c[1] + rr * Math.sin(a)).toFixed(1)}`,
    );
  }
  return `${pts.join(" ")} Z`;
}

export function mark(m: HandMark, out: Prim[]): void {
  switch (m.k) {
    case "touch": {
      const [x, y] = at(m.at);
      out.push({
        t: "circle",
        cx: x,
        cy: y,
        r: 6,
        fill: INK.gold,
        stroke: INK.ink,
        sw: 1,
        op: 0.95,
      });
      if (m.n)
        out.push({ t: "text", x: x + 8, y: y - 5, text: String(m.n), fill: INK.gold, size: 8 });
      return;
    }
    case "hold": {
      const [x, y] = at(m.at);
      out.push({
        t: "circle",
        cx: x,
        cy: y,
        r: 14,
        fill: "none",
        stroke: INK.gold,
        sw: 1,
        op: 0.3,
      });
      out.push({
        t: "circle",
        cx: x,
        cy: y,
        r: 10,
        fill: "none",
        stroke: INK.gold,
        sw: 1.2,
        op: 0.6,
      });
      out.push({ t: "circle", cx: x, cy: y, r: 6, fill: INK.gold, stroke: INK.ink, sw: 1 });
      return;
    }
    case "path":
      polyline(m.pts, out);
      return;
    case "arc": {
      const [cx, cy] = at(m.c);
      const rad = (deg: number): number => (deg * Math.PI) / 180;
      const p = (deg: number): Pt => [cx + m.r * Math.sin(rad(deg)), cy - m.r * Math.cos(rad(deg))];
      const cw = m.to > m.from;
      const [s, e] = [p(m.from), p(m.to)];
      const large = Math.abs(m.to - m.from) > 180 ? 1 : 0;
      const d = `M ${s[0].toFixed(1)} ${s[1].toFixed(1)} A ${m.r} ${m.r} 0 ${large} ${cw ? 1 : 0} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
      out.push({ t: "path", d, stroke: INK.cyan, sw: 2.5, op: 0.9 });
      const sign = cw ? 1 : -1;
      out.push(arrowHead(e, sign * Math.cos(rad(m.to)), sign * Math.sin(rad(m.to)), INK.cyan));
      return;
    }
    case "zigzag": {
      const [dx, dy] = [m.to[0] - m.from[0], m.to[1] - m.from[1]];
      const len = Math.hypot(dx, dy) || 1;
      const [nx, ny] = [-dy / len, dx / len];
      const pts: Pt[] = [];
      for (let i = 0; i <= m.n; i++) {
        const base = i % 2 === 0 ? m.from : m.to;
        const off = (i - m.n / 2) * 3;
        pts.push([base[0] + nx * off, base[1] + ny * off]);
      }
      polyline(pts, out);
      return;
    }
    case "body":
      out.push({
        t: "path",
        d: blob(at(m.at), m.r),
        stroke: INK.gold,
        fill: "#1a1436",
        sw: 1.2,
        dash: true,
        op: 0.9,
      });
      return;
    case "zone": {
      const [x, y] = at(m.at);
      const colour = m.tone === "os" ? INK.red : INK.cyan;
      out.push({
        t: "rect",
        x,
        y,
        w: m.w,
        h: m.h,
        fill: colour,
        op: 0.2,
        stroke: colour,
        dash: true,
      });
      return;
    }
    case "text": {
      const [x, y] = at(m.at);
      out.push({ t: "text", x, y, text: m.text, fill: INK.ink, size: 7 });
      return;
    }
    case "cross": {
      const [x, y] = at(m.at);
      out.push({ t: "line", x1: x - 6, y1: y - 6, x2: x + 6, y2: y + 6, stroke: INK.red, sw: 2.5 });
      out.push({ t: "line", x1: x - 6, y1: y + 6, x2: x + 6, y2: y - 6, stroke: INK.red, sw: 2.5 });
      return;
    }
  }
}
