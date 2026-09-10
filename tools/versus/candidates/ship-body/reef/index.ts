import * as content from "../../../../../packages/content/src/index.js";
import * as ground from "../../../../../packages/render/src/band-ground.js";
import { barrel } from "../../../../../packages/render/src/hull-barrel.js";
import * as light from "../../../../../packages/render/src/hull-light.js";
import * as sheen from "../../../../../packages/render/src/hull-sheen.js";
import * as seat from "../../../../../packages/render/src/seat-skin.js";
import * as nerves from "../../../../../packages/render/src/ship-nerves.js";
import { patch, type Variant } from "../../../variant.js";
import { wired } from "../gullet/nerves.js";
import { crust, roots } from "./paint.js";

/**
 * `ship:body` / `reef` — the ship is a colony.
 *
 * A crust of polyps stands in the contour — thirty small tubes, each with an
 * open mouth and a lit rim, swaying — with spores rising off them and fading.
 * The chamber is the root mass the colony grew from: knotted, dense, glowing
 * where a spore has lodged. The cannon and the shield are the colony's two
 * biggest polyps, and they were there already. The knobbliest contour of the
 * four: many shallow lobes and a lot of wobble, a reef and not a skin.
 *
 * **A concept card.** The owner said on 10 September 2026 that a new look may
 * be designed as a picture first if it saves tokens, so long as the picture
 * and the code do not part company; this card is that picture, drawn by the
 * code it would ship as and shot once, rough, so what he picks from is what he
 * gets. GULLET's wiring is borrowed — every control a tendon on its organ —
 * because the connections are the same question on every ship and only the
 * one he chooses will get its own answer.
 */
export const SHIP_REEF: Variant = {
  slot: "ship:body",
  name: "reef",
  sentence:
    "the ship is a colony — a crust of polyps standing in the contour with spores rising off them, the panel the root mass they grew from and glowing where a spore has lodged, the cannon and the shield its two biggest polyps",
  dir: "tools/versus/candidates/ship-body/reef",
  patches: [
    patch({
      target: content.HULL,
      reached: () => content.HULL,
      where: {
        file: "packages/content/src/ship-silhouettes.ts",
        symbol: "HULL",
        type: "HullSilhouette",
      },
      fields: { lobes: 22, depth: 0.1, wobble: 0.14, seed: 0.58 },
    }),
    patch({
      target: seat.P1_SKIN.hull,
      reached: () => seat.seatSkin("p1").hull,
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        body: ["#C7A3E8", "#8756B0", "#3E1F62", "#160A2A"],
        rim: "#D9A6FF",
        edge: "#FBEFFF",
        muzzle: "#1E0C2E",
      },
    }),
    patch({
      target: seat.P1_SKIN,
      reached: () => seat.seatSkin("p1"),
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        tint: "#D9A6FF",
        ground: ["#160A2A", "#120826", "#0A0416", "#04020A"],
        flesh: ["#B47CE8", "#8650C0", "#64409A"],
      },
    }),
    patch({
      target: sheen.HULL_SHEEN,
      reached: () => sheen.HULL_SHEEN,
      where: { file: "packages/render/src/hull-sheen.ts", symbol: "HULL_SHEEN", type: "HullSheen" },
      fields: { passes: crust },
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
      fields: { name: "reef", paint: roots },
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
