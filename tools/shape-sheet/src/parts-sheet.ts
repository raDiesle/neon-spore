import type { Point } from "@neon-spore/content";
import { contourAt } from "./contour.js";
import { GROWN_BODIES } from "./grown-bodies.js";
import { JELLY_BODIES } from "./jelly-bodies.js";
import { boundsOver } from "./metrics.js";
import { CATEGORIES, grown, PARTS } from "./parts/index.js";
import type { PartDef } from "./parts/types.js";
import { sheet } from "./svg.js";

/**
 * The parts sheet: every secondary form drawn on its own, grouped, labelled.
 *
 * `main.ts` draws bodies and this draws pieces, which is why it is a second
 * sheet rather than more cells on the first. The two questions do not share a
 * page: a body sheet asks *is this creature nameable*, and this asks *what
 * does this piece do to whatever it is stuck on*, which is only answerable if
 * every piece is drawn against the same stub of rim at the same scale.
 *
 * **One scale for the whole sheet, and it is the reason this file does its own
 * layout rather than calling `frame`.** `fit` in `svg.ts` scales each cell to
 * fill it, which is right for a catalogue of bodies whose real sizes are set
 * by the tile and not by the drawing. Here it would be a lie: half the library
 * is *the same shape at a different size* — STUB against LASH, SPORE against
 * SPORE CLUSTER — and a sheet that fitted each cell would draw those pairs
 * identically and quietly delete the axis they differ on.
 *
 * Frozen at one moment, like the shape sheet, and for the same reason: motion
 * is the director's job and a still is what can be diffed. The moment is not
 * zero — several parts are authored with their sway at an extreme there, and a
 * sheet of parts caught at the ends of their travel says less than one caught
 * mid-swing.
 */

const T = 1.3;

/** The stub of body every part is drawn against, in the sheet's own units. */
const R = 34;

const CELL = 122;
const COLS = 7;
const BODY_CELL = 156;
const BODY_COLS = 5;

/**
 * A part on a plain round body, straight out to the right.
 *
 * Through the composer rather than by calling `build` and placing the result
 * here, which was this file's first draft and was wrong in the way that
 * matters: the composer clamps a part out to the rim and drops one that has
 * sunk under it, so a sheet that placed parts itself would draw the authored
 * piece while every card in the catalogue drew the fitted one. Two pictures of
 * one part, and the sheet is the one nobody would check.
 */
function hostFor(def: PartDef) {
  return grown(def.label, def.hint, {
    rx: R,
    ry: R,
    lobes: 1,
    depth: 0,
    wobble: 0,
    // A DRIFT part is defined by what it does *after* its host squeezes, so a
    // still of one on a host that never squeezes is a still of the one state
    // it is not about. The host swims for those and stands still for the rest,
    // which keeps every other cell exactly as it was.
    pulse: def.category === "drift" ? {} : undefined,
    parts: [{ part: def.id, at: 0 }],
  });
}

const HOSTS = new Map(PARTS.map((def) => [def.id, hostFor(def)] as const));

/** Just the part's own loops — the body is loop zero and is drawn, not measured. */
function loopsOf(def: PartDef, t: number): Point[][] {
  return (HOSTS.get(def.id)?.loopsAt?.(t) ?? []).slice(1);
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function boxOf(loops: Point[][], into: Box): Box {
  for (const loop of loops) {
    for (const p of loop) {
      into.x0 = Math.min(into.x0, p.x);
      into.y0 = Math.min(into.y0, p.y);
      into.x1 = Math.max(into.x1, p.x);
      into.y1 = Math.max(into.y1, p.y);
    }
  }
  return into;
}

/**
 * The arc of rim a part is drawn standing on, so a cell is never a triangle in
 * a void. A window on the body rather than the whole of it: the cell is spent
 * on the part, and a full circle of host would take two thirds of it to say
 * something every cell says identically.
 */
const STUB = 0.62;

function rimStub(): { d: string; box: Box } {
  const pts: string[] = [];
  const box: Box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  for (let i = 0; i <= 24; i++) {
    const a = -STUB + (2 * STUB * i) / 24;
    const x = Math.cos(a) * R;
    const y = Math.sin(a) * R;
    boxOf([[{ x, y }]], box);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return {
    d: `<path d="M ${pts.join(" L ")}" fill="none" stroke="#3C2F72" stroke-width="2"/>`,
    box,
  };
}

/**
 * The one scale, and the one centre, every part cell uses.
 *
 * Taken over the whole library rather than per cell — see the note above —
 * with the rim stub folded in so a part that reaches backwards over the body
 * is not clipped by a frame fitted only to what reaches forward.
 */
function common(): { scale: number; cx: number; cy: number } {
  const box = rimStub().box;
  for (const def of PARTS) boxOf(loopsOf(def, T), box);
  const w = box.x1 - box.x0;
  const h = box.y1 - box.y0;
  return {
    scale: (CELL - 26) / Math.max(w, h),
    cx: (box.x0 + box.x1) / 2,
    cy: (box.y0 + box.y1) / 2,
  };
}

const FIT = common();

/**
 * Every grown body, the swimmers included. They are drawn at one instant here
 * like everything else, which for a jelly is a picture of a moment rather than
 * of an animal — `swim-sheet.ts` is the one that shows the stroke. They are on
 * this sheet anyway because a reader browsing the parts should be able to see
 * everything the parts have been spent on without knowing there is a second
 * page.
 */
const BODIES = [...GROWN_BODIES, ...JELLY_BODIES];

function cell(
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  hint: string,
  body: string,
): string {
  return `  <g transform="translate(${x} ${y})">
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="#0E0A22" stroke="#241B4F"/>
${body}
    <text y="${h / 2 + 13}" text-anchor="middle" fill="#F2E9DC" font-family="Courier New, monospace" font-size="9">${label}</text>
    <text y="${h / 2 + 24}" text-anchor="middle" fill="#7A6FA8" font-family="Courier New, monospace" font-size="7">${hint}</text>
  </g>`;
}

/** Clipped to its own cell, because one scale for everybody means some parts overhang. */
function drawn(d: string, clip: string, w: number, h: number, transform: string): string {
  return `    <clipPath id="${clip}"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8"/></clipPath>
    <g clip-path="url(#${clip})"><g transform="${transform}">${rimStub().d}
      <path d="${d}" fill="#1A1036" fill-opacity="0.6" stroke="#2FE0F0" stroke-width="${(1.8 / FIT.scale).toFixed(2)}" stroke-linejoin="round"/></g></g>`;
}

/** Cut so a hint fits under a 122px cell without running into its neighbour — 7px
 * Courier is about 4.2px a character, so twenty-eight of them is the cell. */
const short = (hint: string): string => {
  const clause = (hint.split(";")[0] ?? hint).trim();
  return clause.length > 28 ? `${clause.slice(0, 27)}…` : clause;
};

let y = 78;
const rows: string[] = [];

for (const category of CATEGORIES) {
  const members = PARTS.filter((p) => p.category === category.id);
  rows.push(
    `  <text x="40" y="${y}" fill="#FFC24B" font-family="Courier New, monospace" font-size="12" letter-spacing="2">${category.label}</text>`,
    `  <text x="${44 + category.label.length * 8}" y="${y}" fill="#7A6FA8" font-family="Courier New, monospace" font-size="9">· ${category.blurb} · ${members.length}</text>`,
  );
  y += 20;
  members.forEach((def, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const cx = 40 + col * (CELL + 14) + CELL / 2;
    const cy = y + row * (CELL + 34) + CELL / 2;
    const host = HOSTS.get(def.id);
    const d = host ? contourAt(host, T) : "";
    const transform = `scale(${FIT.scale.toFixed(4)}) translate(${(-FIT.cx).toFixed(2)} ${(-FIT.cy).toFixed(2)})`;
    rows.push(
      cell(
        cx,
        cy,
        CELL,
        CELL,
        def.label,
        short(def.hint),
        drawn(d, `c-${def.id}`, CELL, CELL, transform),
      ),
    );
  });
  y += Math.ceil(members.length / COLS) * (CELL + 34) + 26;
}

rows.push(
  `  <text x="40" y="${y}" fill="#FFC24B" font-family="Courier New, monospace" font-size="12" letter-spacing="2">COMBINATIONS</text>`,
  `  <text x="${40 + 13 * 8}" y="${y}" fill="#7A6FA8" font-family="Courier New, monospace" font-size="9">· one base blob, two or three parts · ${BODIES.length} · the eight that swim are frozen here, and move on the swim sheet</text>`,
);
y += 22;

BODIES.forEach((entry, i) => {
  const col = i % BODY_COLS;
  const row = Math.floor(i / BODY_COLS);
  const cx = 40 + col * (BODY_CELL + 16) + BODY_CELL / 2;
  const cy = y + row * (BODY_CELL + 34) + BODY_CELL / 2;
  const b = boundsOver(entry.subject, [T]);
  const scale = (BODY_CELL - 22) / Math.max(b.x1 - b.x0, b.y1 - b.y0);
  const transform = `scale(${scale.toFixed(4)}) translate(${(-(b.x0 + b.x1) / 2).toFixed(2)} ${(-(b.y0 + b.y1) / 2).toFixed(2)})`;
  const body = `    <g transform="${transform}"><path d="${contourAt(entry.subject, T)}" fill="#1A1036" fill-opacity="0.6" stroke="#2FE0F0" stroke-width="${(1.8 / scale).toFixed(2)}" stroke-linejoin="round"/></g>`;
  rows.push(cell(cx, cy, BODY_CELL, BODY_CELL, entry.subject.name, entry.subject.note, body));
});
y += Math.ceil(BODIES.length / BODY_COLS) * (BODY_CELL + 34) + 20;

await sheet({
  out: "../parts-sheet.svg",
  title: "NEON SPORE · PARTS SHEET",
  width: 40 + COLS * (CELL + 14) + 26,
  height: y,
  body: rows.join("\n"),
  count: PARTS.length + BODIES.length,
});
