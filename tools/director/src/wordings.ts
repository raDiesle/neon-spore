import { controlSetForWave, showsRadar } from "@neon-spore/content";
import {
  bandLobes,
  hullBarBox,
  type Layout,
  sirenCentre,
  tileCX,
  tileCY,
  type ViewRole,
} from "@neon-spore/render";
import type { World } from "@neon-spore/sim";
import { SCAR_COL } from "./wordings-world.js";

/**
 * DOCUMENTATION → WORDINGS: what each thing on an ordinary screen is called.
 *
 * The owner writes prompts, and a prompt that says *the round buttons at the
 * bottom* costs a question and a guess where *the lobes on the band* costs
 * neither. The design vocabulary is fixed (CLAUDE.md) and spread across a
 * hundred file headers; this is the one place it is laid over a picture, so
 * a word can be found by looking at the thing rather than by knowing which
 * file to open.
 *
 * Every point is worked out from the same layout the renderer drew with —
 * `hullBarBox`, `sirenCentre`, `bandLobes`, the tile grid — never measured off
 * a screenshot, so a label stays on its thing when the thing moves. A point
 * that is not on this screen (the shot after it lands, a lobe the other seat
 * owns) returns `null` and the label is left off rather than pointed at
 * nothing.
 */

export interface Callout {
  /** The word to use in a prompt. */
  name: string;
  /** Plain words: what it is and where on the picture to look. */
  says: string;
  /** Which margin the label stands in. */
  side: "left" | "right";
  /** Where the leader ends, in the layout's own pixels; null when it is not on this screen. */
  at: (l: Layout, world: World) => { x: number; y: number } | null;
}

export interface WordingScreen {
  role: ViewRole;
  title: string;
  says: string;
  callouts: Callout[];
}

const body =
  (kind: string) =>
  (l: Layout, w: World): { x: number; y: number } | null => {
    const c = w.creatures.find((x) => x.kind === kind);
    return c ? { x: tileCX(l, c.col), y: tileCY(l, c.row) } : null;
  };

/** Everything both phones draw the same way. */
const SHARED: Callout[] = [
  {
    name: "score",
    says: "Top left corner, the number with a P after it: the points so far.",
    side: "left",
    at: () => ({ x: 22, y: 17 }),
  },
  {
    name: "the beat",
    says: "The four dots under the score. The lit one walks along — the pulse both phones share; one step of it is a beat.",
    side: "left",
    at: () => ({ x: 30, y: 34 }),
  },
  {
    name: "hull bar",
    says: "Top right, the thin bar with the heart beside it: how much hull is left. It changes colour as it empties.",
    side: "right",
    at: (l) => {
      const b = hullBarBox(l);
      return { x: b.x + b.w * 0.5, y: b.y + b.h * 0.5 };
    },
  },
  {
    name: "the siren",
    says: "The round dial under the hull bar with a chip either side. It lights when a creature needs the two of you to talk; the chips say whose turn it is to speak.",
    side: "right",
    at: (l) => sirenCentre(l),
  },
  {
    name: "the radar strip",
    says: "The dark band across the top of the field, above the first row. It warns about what is coming before it is on the field.",
    side: "left",
    at: (l) => ({ x: tileCX(l, 0.5), y: l.gridTop - l.radarHeight * 0.5 }),
  },
  {
    name: "blip",
    says: "A mark on the radar strip, in the column its arrival will fall down. Each seat is warned about what it answers: rocks on the pilot's strip, bodies on the navigator's.",
    side: "right",
    at: (l, w) => {
      // The pilot's strip in this picture is under the torch's alarm, which
      // covers the blip it would otherwise point at; the alarm is labelled
      // there instead.
      if (l.role === "p1") return null;
      const next = w.queue.slice(w.spawned).find((e) => showsRadar(l.role, e.kind));
      return next ? { x: tileCX(l, next.col), y: l.gridTop - l.radarHeight * 0.5 } : null;
    },
  },
  {
    name: "alarm on the strip",
    says: "The grey band with words across the radar strip when something needs a call — here a torch. The siren lights with it.",
    side: "right",
    at: (l) => (l.role === "p1" ? { x: l.width * 0.55, y: l.gridTop - l.radarHeight * 0.5 } : null),
  },
  {
    name: "the field",
    says: "The grid the bodies fall through: columns across, rows down. The last row is the hull. Say a column to say where something is.",
    side: "left",
    at: (l) => ({ x: tileCX(l, 0.5), y: tileCY(l, 3) }),
  },
  {
    name: "slick",
    says: "The flat, wide, red body. Always red; only a red shot answers it.",
    side: "left",
    at: body("slick"),
  },
  {
    name: "bulb",
    says: "The round, swollen, cyan body. Always cyan; only a cyan shot answers it.",
    side: "right",
    at: body("bulb"),
  },
  {
    name: "shot",
    says: "The bright streak going up the cannon's column — one press of a colour. Red or cyan, never anything else.",
    side: "right",
    at: (l, w) => {
      const b = w.bullets[0];
      return b ? { x: tileCX(l, b.col), y: tileCY(l, b.row + b.subMilli / 1000) } : null;
    },
  },
  {
    name: "cannon",
    says: "The narrow swelling on the hull with the mouth on top. It slides along the hull; a shot leaves from it.",
    side: "right",
    at: (l, w) => ({ x: tileCX(l, w.cannonCol), y: l.hullY - l.tile * 0.55 }),
  },
  {
    name: "shield",
    says: "The wide, low dome on the hull. The navigator parks it in a column; it only works while the pilot holds the guard lobe.",
    side: "left",
    at: (l, w) => ({ x: tileCX(l, w.shieldCol), y: l.hullY - l.tile * 0.2 }),
  },
  {
    name: "hull",
    says: "The top skin of the ship — the long curve across the whole width that the cannon and the shield stand on. Every bump on it is a lobe.",
    side: "right",
    at: (l) => ({ x: tileCX(l, l.cols - 1.5), y: l.hullY + l.tile * 0.4 }),
  },
  {
    name: "scar",
    says: "A crack in the hull, left where a body reached it. It stays for the wave.",
    side: "left",
    at: (l) => ({ x: tileCX(l, SCAR_COL), y: l.hullY + l.tile * 0.3 }),
  },
  {
    name: "the seam",
    says: "Where the ship turns into the band. No line there on purpose; only the slime hanging down marks it.",
    side: "left",
    at: (l) => ({ x: tileCX(l, 1), y: l.bandTop + l.bandHeight * 0.06 }),
  },
  {
    name: "the band",
    says: "Everything under the ship: the strips and the lobes in their wet tissue. Also called the control panel. It is the inside of the ship, not a box under it.",
    side: "right",
    at: (l) => ({ x: l.width * 0.94, y: l.bandTop + l.bandHeight * 0.92 }),
  },
];

/** The moving block on a strip, and the strip itself, for one seat. */
function strip(which: "cannon" | "shield"): Callout[] {
  const row = (l: Layout): number => (which === "cannon" ? l.cannonStrip : l.shieldStrip).y;
  const col = (w: World): number => (which === "cannon" ? w.cannonCol : w.shieldCol);
  return [
    {
      name: `${which} strip`,
      says: `The long groove across the band. Slide along it and the ${which} on the hull follows.`,
      side: "left",
      at: (l) => ({ x: tileCX(l, 0.5), y: row(l) }),
    },
    {
      name: "the block",
      says: "The lit piece riding in the strip, standing in the column the control is in.",
      side: "right",
      at: (l, w) => ({ x: tileCX(l, col(w)), y: row(l) }),
    },
  ];
}

/** What a round button on the band is called, by the control it is — and which margin its label stands in, which is the side of the band it is on. */
const LOBE_WORDS: Record<string, { name: string; says: string; side: "left" | "right" }> = {
  guard: {
    side: "left",
    name: "guard lobe",
    says: "The button that says SHIELD. Hold it and the shield goes live where the navigator left it — a ward.",
  },
  intake: {
    side: "right",
    name: "SUCK lobe · the maw",
    says: "Press it and the cannon's mouth opens into a throat that takes in a pod. The open mouth is the maw.",
  },
  fireRed: {
    side: "left",
    name: "RED lobe",
    says: "Tap it and a red shot goes up the cannon's column. Hold it and the cannon fills for a lance instead.",
  },
  fireCyan: {
    side: "right",
    name: "CYAN lobe",
    says: "Tap it and a cyan shot goes up the cannon's column. Hold it and the cannon fills for a lance instead.",
  },
};

/** One callout per round button this seat has, placed off the same list the band draws from. */
function lobes(player: 1 | 2): Callout[] {
  return Object.entries(LOBE_WORDS).map(([id, word]) => ({
    ...word,
    at: (l, w) => {
      const lobe = bandLobes(l, controlSetForWave(w.wave), player).find((x) => x.control.id === id);
      return lobe ? { x: lobe.circle.x, y: lobe.circle.y } : null;
    },
  }));
}

export const WORDING_SCREENS: WordingScreen[] = [
  {
    role: "p1",
    title: "THE PILOT'S SCREEN",
    says: "Player 1. The cannon is theirs: the cannon strip, the SHIELD trigger and SUCK. Read the labels from the top of the phone down.",
    callouts: [...SHARED, ...strip("cannon"), ...lobes(1)],
  },
  {
    role: "p2",
    title: "THE NAVIGATOR'S SCREEN",
    says: "Player 2. The shield and the colours are theirs: the shield strip, RED and CYAN. The field, the hull and the readouts are the same as the pilot's.",
    callouts: [...SHARED, ...strip("shield"), ...lobes(2)],
  },
];
