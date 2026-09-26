import { phoneHalf } from "./gesture-phone.js";
import { INK, type Prim, VIEW_H, VIEW_W } from "./gesture-prims.js";
import type { Gesture, Lane } from "./gesture-types.js";

export { INK, type Prim, VIEW_H, VIEW_W };

/**
 * The picture on a GESTURES card, as a list of primitives with absolute
 * coordinates — the phone on the left (`gesture-phone.ts`), and on the right
 * the events that hand produces, one row per event, the way a logic analyser
 * draws a bus. Pure, so a test can hold every primitive inside the viewBox;
 * `figureSvg` is the thin browser half that turns the list into SVG.
 */

/** One colour per event, so a down reads green on every card. */
export function eventColour(event: string): string {
  if (event === "pointerdown" || event === "touchstart") return INK.green;
  if (event === "pointermove" || event === "touchmove" || event === "coalesced") return INK.cyan;
  if (event === "pointerup" || event === "touchend") return INK.gold;
  if (event === "pointercancel" || event === "contextmenu" || event === "selectstart")
    return INK.red;
  if (event.startsWith("device") || event.startsWith("gesture")) return INK.blue;
  return INK.dim;
}

/** A mono character is 0.6 of its size across — the figure's CSS sets the face. */
export function textWidth(text: string, size: number): number {
  return [...text].length * size * 0.6;
}

export const LABEL_X = 116;
const AXIS_X0 = 198;
const AXIS_X1 = 312;
const ROW0 = 30;
const ROW_H = 20;

const tx = (t: number): number => AXIS_X0 + ((AXIS_X1 - AXIS_X0) * t) / 10;

function lane(out: Prim[], l: Lane, y: number): void {
  const colour = eventColour(l.event);
  const label = l.finger === 2 ? `② ${l.event}` : l.event;
  out.push({ t: "text", x: LABEL_X, y: y + 3, text: label, fill: colour, size: 7.5 });
  out.push({ t: "line", x1: AXIS_X0, y1: y, x2: AXIS_X1, y2: y, stroke: INK.line, sw: 1 });
  for (const m of l.marks) {
    if (typeof m === "number") {
      out.push({ t: "line", x1: tx(m), y1: y - 6, x2: tx(m), y2: y + 6, stroke: colour, sw: 2.5 });
    } else {
      const [a, b] = m as readonly [number, number];
      out.push({
        t: "rect",
        x: tx(a),
        y: y - 3,
        w: tx(b) - tx(a),
        h: 6,
        rx: 2,
        fill: colour,
        op: 0.55,
      });
    }
  }
}

function timelineHalf(g: Gesture): Prim[] {
  const out: Prim[] = [];
  const tl = g.timeline;
  const bottom = ROW0 + ROW_H * Math.max(1, tl.lanes.length - 1) + 10;
  out.push({ t: "text", x: LABEL_X, y: 14, text: "EVENTS", fill: INK.dim, size: 8 });
  if (tl.window) {
    const w = tl.window;
    out.push({
      t: "rect",
      x: tx(w.from),
      y: 18,
      w: tx(w.to) - tx(w.from),
      h: bottom - 18,
      fill: INK.gold,
      op: 0.1,
      stroke: INK.gold,
      dash: true,
    });
    const mid = (tx(w.from) + tx(w.to)) / 2;
    const half = textWidth(w.label, 7) / 2;
    out.push({
      t: "text",
      x: Math.min(Math.max(mid, 150 + half), VIEW_W - 2 - half),
      y: 14,
      text: w.label,
      fill: INK.gold,
      size: 7,
      anchor: "middle",
    });
  }
  for (const b of tl.beats ?? []) {
    out.push({
      t: "line",
      x1: tx(b),
      y1: 20,
      x2: tx(b),
      y2: bottom,
      stroke: INK.dim,
      sw: 1,
      dash: true,
      op: 0.6,
    });
  }
  tl.lanes.forEach((l, i) => {
    lane(out, l, ROW0 + i * ROW_H);
  });
  out.push({
    t: "line",
    x1: AXIS_X0,
    y1: bottom + 4,
    x2: AXIS_X1,
    y2: bottom + 4,
    stroke: INK.dim,
    sw: 1,
  });
  out.push({
    t: "path",
    d: `M ${AXIS_X1} ${bottom + 4} L ${AXIS_X1 - 5} ${bottom + 1} L ${AXIS_X1 - 5} ${bottom + 7} Z`,
    stroke: INK.dim,
    fill: INK.dim,
  });
  out.push({
    t: "text",
    x: AXIS_X1,
    y: bottom + 14,
    text: "time →",
    fill: INK.dim,
    size: 7,
    anchor: "end",
  });
  if (tl.beats)
    out.push({ t: "text", x: AXIS_X0, y: bottom + 14, text: "┆ beat", fill: INK.dim, size: 7 });
  if (tl.note)
    out.push({ t: "text", x: LABEL_X, y: VIEW_H - 4, text: tl.note, fill: INK.dim, size: 7 });
  return out;
}

/** Everything drawn on one card, left half then right. */
export function layoutFigure(g: Gesture): Prim[] {
  return [...phoneHalf(g), ...timelineHalf(g)];
}

const SVG_NS = "http://www.w3.org/2000/svg";

function el(p: Prim): SVGElement {
  const node = document.createElementNS(SVG_NS, p.t);
  const set = (k: string, v: string | number | undefined): void => {
    if (v !== undefined) node.setAttribute(k, String(v));
  };
  if (p.t === "text") {
    set("x", p.x);
    set("y", p.y);
    set("fill", p.fill);
    set("font-size", p.size);
    set("text-anchor", p.anchor);
    node.textContent = p.text;
  } else {
    if (p.t === "rect") {
      for (const [k, v] of [
        ["x", p.x],
        ["y", p.y],
        ["width", p.w],
        ["height", p.h],
        ["rx", p.rx],
      ] as const)
        set(k, v);
    } else if (p.t === "circle") {
      for (const [k, v] of [
        ["cx", p.cx],
        ["cy", p.cy],
        ["r", p.r],
      ] as const)
        set(k, v);
    } else if (p.t === "line") {
      for (const [k, v] of [
        ["x1", p.x1],
        ["y1", p.y1],
        ["x2", p.x2],
        ["y2", p.y2],
      ] as const)
        set(k, v);
    } else {
      set("d", p.d);
    }
    set("fill", "fill" in p ? (p.fill ?? "none") : "none");
    set("stroke", "stroke" in p ? p.stroke : undefined);
    set("stroke-width", "sw" in p ? p.sw : undefined);
    set("stroke-linecap", "round");
    set("stroke-linejoin", "round");
    if ("dash" in p && p.dash) set("stroke-dasharray", "3 3");
    set("opacity", "op" in p ? p.op : undefined);
  }
  set("transform", p.tf);
  return node;
}

/** The card's figure, drawn. Browser only. */
export function figureSvg(g: Gesture): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${VIEW_H}`);
  svg.setAttribute("class", "gesture-figure");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${g.name}: ${g.does}`);
  for (const p of layoutFigure(g)) svg.appendChild(el(p));
  return svg;
}
