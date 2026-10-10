import { control, controlSet, deskKeys, keyLabel } from "@neon-spore/content";
import { INK, type Prim } from "./gesture-prims.js";
import type { DeskWay } from "./gesture-types.js";

/**
 * The PC half of a gesture card: a keyboard and a mouse, with the keys the
 * gesture is played on drawn held — the owner, 10 October 2026, on TWO
 * THUMBS ON ONE PHONE: *it should say how it's usable on PC and show it.*
 *
 * Which key is whose is `deskKeys` on the panel almost every wave is played
 * on, called rather than restated, so a key that moves seat moves here too.
 * The number row's 1, 2 and 3 are the mouse's seat keys
 * (`render/desk-seat.ts`). Pure, like `layoutFigure`; the SVG is
 * `figureSvg`'s.
 */

export const DESK_W = 320;
export const DESK_H = 112;

const KEY = 15;
const PITCH = 17;
const ROWS: readonly { keys: string; x: number; y: number; prefix: string }[] = [
  { keys: "1234567890", x: 8, y: 20, prefix: "Digit" },
  { keys: "QWERTYUIOP", x: 13, y: 37, prefix: "Key" },
  { keys: "ASDFGHJKL", x: 17, y: 54, prefix: "Key" },
];

const SEAT_INK = { 1: INK.gold, 2: INK.cyan } as const;
/** The mouse's three seat keys: player 1, player 2, both. */
const MOUSE_KEYS: Readonly<Record<string, string>> = {
  Digit1: INK.gold,
  Digit2: INK.cyan,
  Digit3: INK.green,
};

/** A control's name as the panel says it, without the seat it already sits under. */
function short(id: Parameters<typeof control>[0]): string {
  return control(id)
    .label.replace(/^PLAYER \d · /, "")
    .toLowerCase();
}

/** One line per seat: its keys and what each does, in panel order. */
function seatLines(): { text: string; fill: string }[] {
  const keys = deskKeys(controlSet(undefined));
  return ([1, 2] as const).map((player) => {
    const mine = keys.filter((k) => k.player === player);
    const ids = [...new Set(mine.map((k) => k.control))];
    const parts = ids.map((id) => {
      const caps = mine.filter((k) => k.control === id).map((k) => keyLabel(k.code));
      return `${caps.join(" ")} ${short(id)}`;
    });
    return { text: `player ${player}  ${parts.join(" · ")}`, fill: SEAT_INK[player] };
  });
}

/** One key: `face` is what is printed on it, the row's own character. */
function keycap(
  out: Prim[],
  code: string,
  face: string,
  x: number,
  y: number,
  held: boolean,
): void {
  const seat = deskKeys(controlSet(undefined)).find((k) => k.code === code)?.player;
  const ink = seat ? SEAT_INK[seat] : MOUSE_KEYS[code];
  out.push({
    t: "rect",
    x,
    y,
    w: KEY,
    h: KEY - 1,
    rx: 2,
    fill: held && ink ? ink : INK.panel,
    stroke: ink ?? INK.line,
    op: held ? 0.9 : ink ? 1 : 0.6,
  });
  out.push({
    t: "text",
    x: x + KEY / 2,
    y: y + 10,
    text: face,
    fill: held ? INK.bg : (ink ?? INK.dim),
    size: 8,
    anchor: "middle",
  });
}

function mouse(out: Prim[]): void {
  const x = 214;
  const y = 20;
  out.push({ t: "rect", x, y, w: 32, h: 46, rx: 15, fill: INK.panel, stroke: INK.ink });
  out.push({ t: "path", d: `M ${x + 2} ${y + 18} L ${x + 30} ${y + 18}`, stroke: INK.ink, sw: 1 });
  out.push({ t: "path", d: `M ${x + 16} ${y + 1} L ${x + 16} ${y + 18}`, stroke: INK.ink, sw: 1 });
  // The left button, pressed: the mouse is a hand too.
  out.push({
    t: "path",
    d: `M ${x + 15} ${y + 2} Q ${x + 3} ${y + 3} ${x + 2} ${y + 17} L ${x + 15} ${y + 17} Z`,
    stroke: INK.green,
    fill: INK.green,
    op: 0.7,
  });
  out.push({
    t: "text",
    x: x + 16,
    y: y + 58,
    text: "click",
    fill: INK.dim,
    size: 7,
    anchor: "middle",
  });
  out.push({ t: "text", x: 256, y: 34, text: "1  = P1's", fill: INK.gold, size: 7 });
  out.push({ t: "text", x: 256, y: 44, text: "2  = P2's", fill: INK.cyan, size: 7 });
  out.push({ t: "text", x: 256, y: 54, text: "3  = both", fill: INK.green, size: 7 });
}

/** Everything on the PC half of a card. */
export function layoutDesk(desk: DeskWay): Prim[] {
  const out: Prim[] = [];
  out.push({ t: "text", x: 8, y: 12, text: "AT A PC", fill: INK.dim, size: 8 });
  out.push({
    t: "text",
    x: 312,
    y: 12,
    text: "filled = held",
    fill: INK.dim,
    size: 7,
    anchor: "end",
  });
  const held = new Set(desk.held);
  for (const row of ROWS) {
    [...row.keys].forEach((c, i) => {
      const code = row.prefix + c;
      keycap(out, code, c, row.x + i * PITCH, row.y, held.has(code));
    });
  }
  mouse(out);
  seatLines().forEach((line, i) => {
    out.push({ t: "text", x: 8, y: 84 + i * 11, text: line.text, fill: line.fill, size: 7.5 });
  });
  out.push({
    t: "text",
    x: 8,
    y: 106,
    text: "mouse  hold 1, 2 or 3 to say whose hand it is",
    fill: INK.green,
    size: 7.5,
  });
  return out;
}

/** Every key the picture draws, so a test can hold `held` to keys it shows. */
export function drawnKeys(): string[] {
  return ROWS.flatMap((r) => [...r.keys].map((c) => r.prefix + c));
}
