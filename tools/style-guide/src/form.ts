import type { CreatureSilhouette } from "@neon-spore/content";
import {
  BULB,
  CHOIR,
  livingPath,
  livingPoints,
  rimCount,
  SHELL,
  SLICK,
  THROB,
} from "@neon-spore/content";
import { PALETTE, STROKE } from "@neon-spore/render";
import { label, panel, r } from "./page.js";

/** Frozen, like every other sheet here: a specimen that moves cannot be compared. */
const T = 0;

/** The widest the body gets, in shape units, so a cell can ask for a size in pixels. */
function span(shape: CreatureSilhouette): number {
  const pts = livingPoints(shape, T);
  let w = 0;
  let h = 0;
  for (const p of pts) {
    w = Math.max(w, Math.abs(p.x) * 2);
    h = Math.max(h, Math.abs(p.y) * 2);
  }
  return Math.max(w, h);
}

interface Draw {
  aura?: boolean;
  fill?: boolean;
  inner?: boolean;
  /** The wrong-colour hit: a grey outline and nothing else. */
  blocked?: boolean;
}

/**
 * One body, drawn at `px` across, in the order `living-draw.ts` draws it.
 *
 * The stroke is divided by the scale rather than scaled with it, because the
 * line weight in `STROKE` is CSS pixels at 26 px object size and does not grow
 * with the body — that is the whole of "glow through an aura, not through a
 * thicker line", and a sheet that scaled the stroke would be drawing the
 * opposite claim.
 */
let uid = 0;

export function body(
  shape: CreatureSilhouette,
  px: number,
  hue: string,
  rim: string,
  dark: string,
  d: Draw,
): string {
  const k = px / span(shape);
  const id = `c${uid++}`;
  const w = (n: number) => r(n / k);
  const line = d.blocked ? PALETTE.rock : hue;
  const parts: string[] = [`<defs><path id="${id}" d="${livingPath(shape, T)}"/></defs>`];
  if (d.fill && !d.blocked) {
    parts.push(`<use href="#${id}" fill="${dark}" fill-opacity="0.85"/>`);
  }
  if (d.aura && !d.blocked) {
    const passes: string[] = [];
    for (let i = STROKE.glowPasses; i >= 1; i--) {
      const width = STROKE.outline + (i * STROKE.glowSpread) / STROKE.glowPasses;
      passes.push(
        `<use href="#${id}" fill="none" stroke="${hue}" stroke-width="${w(width)}" stroke-opacity="${r(0.1 / i)}" stroke-linejoin="round"/>`,
      );
    }
    parts.push(`<g style="mix-blend-mode:screen">${passes.join("")}</g>`);
  }
  parts.push(
    `<use href="#${id}" fill="none" stroke="${line}" stroke-width="${w(STROKE.outline)}" stroke-linejoin="round" stroke-linecap="round"/>`,
  );
  if (d.inner && !d.blocked) {
    parts.push(
      `<use href="#${id}" fill="none" stroke="${rim}" stroke-width="${w(STROKE.inner)}" stroke-opacity="0.55" stroke-linejoin="round" transform="scale(0.72)"/>`,
    );
  }
  return `<g transform="scale(${r(k)})">${parts.join("")}</g>`;
}

const CYAN = [PALETTE.cyan, PALETTE.cyanRim, PALETTE.cyanDark] as const;

export const LINE_HEIGHT = 260;
/** The shipped size, and how much the whole cell is blown up to be read at. */
const SHIPPED = 26;
const MAGNIFY = 3.6;

/** The shipped draw order, one pass at a time, and then the light going out. */
export function linePanel(y: number): string {
  const steps: Array<[string, Draw]> = [
    ["outline only", {}],
    [`+ aura x${STROKE.glowPasses}`, { aura: true }],
    ["+ dark fill", { aura: true, fill: true }],
    ["+ inner line", { aura: true, fill: true, inner: true }],
    ["blocked", { blocked: true }],
  ];
  const cells = steps.map(([name, d], i) => {
    const x = 110 + i * 172;
    return `    <g transform="translate(${x} ${y + 155}) scale(${MAGNIFY})">${body(BULB, SHIPPED, CYAN[0], CYAN[1], CYAN[2], d)}</g>
    ${label(x, y + 236, name, 9, d.blocked ? PALETTE.rock : PALETTE.text, "middle")}`;
  });
  return panel(
    y,
    `LINE · outline ${STROKE.outline}px, inner ${STROKE.inner}px, aura spread ${STROKE.glowSpread}`,
    `a bulb at its shipped ${SHIPPED} px, magnified x${MAGNIFY}. Last cell: the same creature shot in the wrong colour.`,
    cells.join("\n"),
  );
}

export const SIZE_HEIGHT = 250;
const LADDER = [11, 20, 26, 40, 96];

/** The readability floor, made visible instead of quoted. */
export function sizePanel(y: number): string {
  let x = 90;
  const cells = LADDER.map((px) => {
    const cx = x + px / 2;
    x = cx + px / 2 + 110;
    return `    <g transform="translate(${r(cx)} ${y + 150})">${body(BULB, px, CYAN[0], CYAN[1], CYAN[2], { aura: true, fill: true })}</g>
    ${label(cx, y + 226, `${px} px`, 9, px <= 11 ? PALETTE.rock : PALETTE.text, "middle")}`;
  });
  return panel(
    y,
    "SIZE · a creature ships at 20-26 px",
    "the same bulb down the ladder. At 11 px nothing of a figure survives, which is why liveliness comes from motion and not from detail.",
    cells.join("\n"),
  );
}

/**
 * All five in one colour on purpose. A living kind has no hue of its own — it
 * arrives carrying the ammunition that kills it, and the same body is red one
 * wave and cyan the next. Five colours here would draw a per-kind palette the
 * game does not have, and the panel is about the one thing that never changes.
 */
export const KINDS: Array<[string, CreatureSilhouette]> = [
  ["SLICK", SLICK],
  ["BULB", BULB],
  ["THROB", THROB],
  ["SHELL", SHELL],
  ["CHOIR", CHOIR],
];

export const KIND_HEIGHT = 320;

/** The nameability axes, side by side: rim count, aspect, and the drawn size. */
export function kindPanel(y: number): string {
  const cells = KINDS.map(([name, shape], i) => {
    const cx = 130 + i * 165;
    const pts = livingPoints(shape, T);
    let w = 0;
    let h = 0;
    for (const p of pts) {
      w = Math.max(w, Math.abs(p.x) * 2);
      h = Math.max(h, Math.abs(p.y) * 2);
    }
    return `    <g transform="translate(${cx} ${y + 160})">${body(shape, 120, CYAN[0], CYAN[1], CYAN[2], { aura: true, fill: true })}</g>
    <g transform="translate(${cx} ${y + 258})">${body(shape, 26, CYAN[0], CYAN[1], CYAN[2], { aura: true, fill: true })}</g>
    ${label(cx, y + 292, name, 10, PALETTE.text, "middle")}
    ${label(cx, y + 304, `rim ${rimCount(shape)} · aspect ${r(w / h)}`, 8, PALETTE.dim, "middle")}`;
  });
  return panel(
    y,
    "SILHOUETTE · one word, every time",
    "one colour, because a kind has none of its own — it wears the ammunition that kills it. The small row is what the pair sees.",
    cells.join("\n"),
  );
}
