import { GOO, type GooStyle } from "../../../packages/render/src/goo-style.js";
import { patch, type Variant } from "../../versus/variant.js";

/**
 * **The neon FIZZ's drop may glow in**, on the PULL LAB's bar. The owner, 12
 * October 2026, after seeing FIZZ in a real wave: *it has not enough
 * attraction … the slow effect has same colour* — THE SLOW tears the room red
 * and blue about the boss and throws pink sparks at it (`slow-prism.ts`,
 * `slow-crawl.ts`), which reads as the drop's own magenta — *give me different
 * base colours to choose … some other neon colour with more contrast, very
 * visible*.
 *
 * Each keeps TAR's make (`goo-style.ts`): a body dark in the neon's own hue, a
 * deeper edge, a lit core, and the neon its rim glows. Only the colours move;
 * the lumps, the creep and the jiggle are GOO's. A colour is held in `GOO` for
 * a frame the way a VERSUS candidate is held in its record, so the game's own
 * drop is the one drawn in it.
 */
export interface GooColour {
  key: string;
  label: string;
  /** `GOO`'s four colours in this one, or `null` for GOO's own. */
  look: Variant | null;
}

type Tint = Pick<GooStyle, "body" | "deep" | "core" | "neon">;

function tinted(key: string, label: string, fields: Tint): GooColour {
  const look: Variant = {
    slot: "pull:handle",
    name: `colour ${key}`,
    sentence: `FIZZ in ${label}.`,
    dir: "tools/director/src",
    patches: [
      patch({
        target: GOO,
        reached: () => GOO,
        where: { file: "packages/render/src/goo-style.ts", symbol: "GOO" },
        fields,
      }),
    ],
  };
  return { key, label, look };
}

export const GOO_COLOURS: readonly GooColour[] = [
  { key: "magenta", label: "MAGENTA", look: null },
  tinted("yellow", "ACID YELLOW", {
    body: "#2B2606",
    deep: "#0A0902",
    core: "#A39A3C",
    neon: "#FFF01F",
  }),
  tinted("orange", "HOT ORANGE", {
    body: "#2E1606",
    deep: "#0A0502",
    core: "#A3663A",
    neon: "#FF7A1A",
  }),
  tinted("lime", "LIME", { body: "#1A2A06", deep: "#060A02", core: "#7FA33C", neon: "#C6FF1F" }),
  tinted("ice", "ICE", { body: "#082A30", deep: "#02090B", core: "#4A9AA6", neon: "#3DF5FF" }),
  tinted("white", "WHITE HOT", {
    body: "#262A36",
    deep: "#07080C",
    core: "#9AA3B8",
    neon: "#FFFFFF",
  }),
];
