import { PALETTE } from "@neon-spore/render";
import { DIAL, FAMILIES, hsl } from "./families.js";
import { label, panel, r, WIDTH } from "./page.js";

const SWATCH = 66;
const SWATCH_H = 46;
const GAP = 10;
const PER_ROW = 11;

type Swatches = Record<string, string>;

function swatch(x: number, y: number, key: string, hex: string): string {
  const { h } = hsl(hex);
  return `    <g transform="translate(${r(x)} ${r(y)})">
      <rect width="${SWATCH}" height="${SWATCH_H}" rx="4" fill="${hex}" stroke="${PALETTE.grid}"/>
      ${label(0, SWATCH_H + 12, key, 8, PALETTE.text)}
      ${label(0, SWATCH_H + 22, `${hex} ${Math.round(h)}°`, 7, PALETTE.dim)}
    </g>`;
}

/** Height a family occupies, so the caller can lay panels out without drawing them. */
function familyHeight(count: number): number {
  const rows = Math.ceil(count / PER_ROW);
  return 30 + rows * (SWATCH_H + 40);
}

export function colourHeight(): number {
  return 96 + FAMILIES.reduce((h, f) => h + familyHeight(f.keys.length), 0);
}

export function colourPanel(y: number): string {
  const all = PALETTE as unknown as Swatches;
  let cursor = y + 66;
  const parts: string[] = [];
  for (const f of FAMILIES) {
    parts.push(label(40, cursor, f.name, 10, PALETTE.cyan));
    parts.push(label(150, cursor, f.rule, 9, PALETTE.dim));
    cursor += 16;
    f.keys.forEach((key, i) => {
      const col = i % PER_ROW;
      const row = Math.floor(i / PER_ROW);
      const hex = all[key];
      if (hex)
        parts.push(swatch(40 + col * (SWATCH + GAP), cursor + row * (SWATCH_H + 40), key, hex));
    });
    cursor += familyHeight(f.keys.length) - 30 + 20;
  }
  return panel(
    y,
    "COLOUR · a hue ships as a triad",
    "body S 81-100 L 51-68 · rim L 77-93 · deep L 10-26, and the deep never reaches the background",
    parts.join("\n"),
  );
}

export const DIAL_HEIGHT = 450;
const RADIUS = 126;

/**
 * The placement rule as a picture: every body hue on one dial, so the gap a
 * new colour has to land in is a thing you can see rather than a number you
 * have to trust. This is the panel that answers "where does the next hue go".
 */
export function dialPanel(y: number): string {
  const all = PALETTE as unknown as Swatches;
  const cx = WIDTH / 2;
  const cy = y + 120 + RADIUS;
  const dots: string[] = [
    `    <circle cx="${r(cx)}" cy="${r(cy)}" r="${RADIUS}" fill="none" stroke="${PALETTE.grid}"/>`,
  ];
  const placed: number[] = [];
  const sorted = [...DIAL].sort((a, b) => hsl(all[a] ?? "#000000").h - hsl(all[b] ?? "#000000").h);
  for (const key of sorted) {
    const hex = all[key];
    if (!hex) continue;
    const { h } = hsl(hex);
    const crowded = placed.some((p) => Math.abs(p - h) < 26 || Math.abs(p - h) > 334);
    placed.push(h);
    // 0° to the right, running clockwise, which is how a hue wheel is read.
    const a = (h * Math.PI) / 180;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    const out = RADIUS + (crowded ? 72 : 16);
    const anchor = dx > 0.25 ? "start" : dx < -0.25 ? "end" : "middle";
    dots.push(`    <line x1="${r(cx + dx * (RADIUS - 14))}" y1="${r(cy + dy * (RADIUS - 14))}"
          x2="${r(cx + dx * RADIUS)}" y2="${r(cy + dy * RADIUS)}" stroke="${hex}" stroke-width="2"/>
    <circle cx="${r(cx + dx * RADIUS)}" cy="${r(cy + dy * RADIUS)}" r="7" fill="${hex}"/>
    ${label(cx + dx * out, cy + dy * out + 3, `${key} ${Math.round(h)}°`, 8, PALETTE.text, anchor)}
    ${crowded ? `<line x1="${r(cx + dx * (RADIUS + 10))}" y1="${r(cy + dy * (RADIUS + 10))}" x2="${r(cx + dx * (out - 4))}" y2="${r(cy + dy * (out - 4))}" stroke="${PALETTE.grid}"/>` : ""}`);
  }
  return panel(
    y,
    "HUE PLACEMENT · a new colour goes in a gap",
    "the twelve body hues at their measured angles. A hue touching a neighbour is one the pair says the wrong word for.",
    dots.join("\n"),
  );
}
