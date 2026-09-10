import * as content from "../../../../../packages/content/src/index.js";
import * as ground from "../../../../../packages/render/src/band-ground.js";
import * as join from "../../../../../packages/render/src/band-join.js";
import { barrel } from "../../../../../packages/render/src/hull-barrel.js";
import * as light from "../../../../../packages/render/src/hull-light.js";
import * as sheen from "../../../../../packages/render/src/hull-sheen.js";
import * as seat from "../../../../../packages/render/src/seat-skin.js";
import * as nerves from "../../../../../packages/render/src/ship-nerves.js";
import { saggingRoof } from "../../../join.js";
import { patch, type Variant } from "../../../variant.js";
import { transported } from "./nerves.js";
import { chamberLife, cytoplasm, vacuoles } from "./paint.js";

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
 * **Taken further on 10 September 2026**, chosen from four concept cards. The
 * concept was a thin flat band with blobs in it; this is the same cell with
 * body: a contour that bulges, a membrane with a thickness you can see
 * through, organelles with an inside, and its own wiring — a cell has no
 * tendons, so every control is a bundle of microtubules with vesicles walking
 * up it to the organ it moves (`nerves.ts`).
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
      fields: { lobes: 7, depth: 0.32, wobble: 0.22, seed: 0.31 },
    }),
    patch({
      target: seat.P1_SKIN.hull,
      reached: () => seat.seatSkin("p1").hull,
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        body: ["#D2C2FF", "#9A7CF0", "#5A40B8", "#2A1A60"],
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
        ground: ["#2A1A60", "#1C1248", "#0E0828", "#06030F"],
        flesh: ["#BEA6FF", "#8E6EF0", "#6A50C8"],
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
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      // The join is the ship's: the membrane sags over every control and the
      // chamber is lit and grained the way the hull is (`tools/versus/join.ts`).
      fields: { ceiling: saggingRoof(3.4, 0.3), attach: chamberLife },
    }),
    patch({
      target: nerves.SHIP_NERVES,
      reached: () => nerves.SHIP_NERVES,
      where: {
        file: "packages/render/src/ship-nerves.ts",
        symbol: "SHIP_NERVES",
        type: "ShipNerves",
      },
      fields: { draw: transported },
    }),
  ],
};
