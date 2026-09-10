import * as content from "../../../../../packages/content/src/index.js";
import * as ground from "../../../../../packages/render/src/band-ground.js";
import { barrel } from "../../../../../packages/render/src/hull-barrel.js";
import * as light from "../../../../../packages/render/src/hull-light.js";
import * as sheen from "../../../../../packages/render/src/hull-sheen.js";
import * as seat from "../../../../../packages/render/src/seat-skin.js";
import * as nerves from "../../../../../packages/render/src/ship-nerves.js";
import { patch, type Variant } from "../../../variant.js";
import { wired } from "../gullet/nerves.js";
import { cytoplasm, vacuoles } from "./paint.js";

/**
 * `ship:body` / `plasm` — the ship is a single cell.
 *
 * A translucent blob with everything visible inside it: a nucleus drifting
 * across the width over a minute, organelles on their own slow courses under a
 * membrane drawn as a double line, and a chamber that is the same cytoplasm
 * deeper in — vacuoles like lenses of fluid, each button hanging in one. The
 * cannon is where the cell pushes out; the shield is the membrane thickening.
 * The wobbliest contour of the four, because a cell has no shape of its own.
 *
 * **A concept card.** The owner said on 10 September 2026 that a new look may
 * be designed as a picture first if it saves tokens, so long as the picture
 * and the code do not part company; this card is that picture, drawn by the
 * code it would ship as and shot once, rough, so what he picks from is what he
 * gets. GULLET's wiring is borrowed — every control a tendon on its organ —
 * because the connections are the same question on every ship and only the
 * one he chooses will get its own answer.
 */
export const SHIP_PLASM: Variant = {
  slot: "ship:body",
  name: "plasm",
  sentence:
    "the ship is a single cell — a nucleus and organelles drifting behind a double-lined membrane, the panel the same cytoplasm deeper in with a vacuole round every button, the wobbliest contour of the four because a cell has no shape of its own",
  dir: "tools/versus/candidates/ship-body/plasm",
  patches: [
    patch({
      target: content.HULL,
      reached: () => content.HULL,
      where: {
        file: "packages/content/src/ship-silhouettes.ts",
        symbol: "HULL",
        type: "HullSilhouette",
      },
      fields: { lobes: 4, depth: 0.2, wobble: 0.12, seed: 0.31 },
    }),
    patch({
      target: seat.P1_SKIN.hull,
      reached: () => seat.seatSkin("p1").hull,
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        body: ["#C4B0FF", "#6E4CD8", "#2C1A6E", "#120A30"],
        rim: "#B79CFF",
        edge: "#F2ECFF",
        muzzle: "#1A1038",
      },
    }),
    patch({
      target: seat.P1_SKIN,
      reached: () => seat.seatSkin("p1"),
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        tint: "#B79CFF",
        ground: ["#120A30", "#0F0A2A", "#080516", "#04020A"],
        flesh: ["#A88CF8", "#7A5AE0", "#5A44B8"],
      },
    }),
    patch({
      target: sheen.HULL_SHEEN,
      reached: () => sheen.HULL_SHEEN,
      where: { file: "packages/render/src/hull-sheen.ts", symbol: "HULL_SHEEN", type: "HullSheen" },
      fields: { passes: cytoplasm },
    }),
    patch({
      target: light.HULL_LIGHT,
      reached: () => light.HULL_LIGHT,
      where: { file: "packages/render/src/hull-light.ts", symbol: "HULL_LIGHT", type: "HullLight" },
      fields: { lit: barrel },
    }),
    patch({
      target: ground.BAND_GROUND,
      reached: () => ground.BAND_GROUND,
      where: {
        file: "packages/render/src/band-ground.ts",
        symbol: "BAND_GROUND",
        type: "BandGround",
      },
      fields: { name: "plasm", paint: vacuoles },
    }),
    patch({
      target: nerves.SHIP_NERVES,
      reached: () => nerves.SHIP_NERVES,
      where: {
        file: "packages/render/src/ship-nerves.ts",
        symbol: "SHIP_NERVES",
        type: "ShipNerves",
      },
      fields: { draw: wired },
    }),
  ],
};
