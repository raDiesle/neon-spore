import * as content from "../../../../../packages/content/src/index.js";
import * as ground from "../../../../../packages/render/src/band-ground.js";
import * as join from "../../../../../packages/render/src/band-join.js";
import { barrel } from "../../../../../packages/render/src/hull-barrel.js";
import * as light from "../../../../../packages/render/src/hull-light.js";
import * as sheen from "../../../../../packages/render/src/hull-sheen.js";
import * as lobe from "../../../../../packages/render/src/lobe-look.js";
import * as plan from "../../../../../packages/render/src/panel-plan.js";
import * as seat from "../../../../../packages/render/src/seat-skin.js";
import * as nerves from "../../../../../packages/render/src/ship-nerves.js";
import * as strip from "../../../../../packages/render/src/strip-look.js";
import { saggingRoof } from "../../../join.js";
import { patch, type Variant } from "../../../variant.js";
import { bed, chamber, floor, gloss, LOW, LOW_TEST, life, ROWS, skin } from "./paint.js";

/**
 * `ship:body` / `lymph` — the same brief taken toward the fluid.
 *
 * GLAND and HEART keep the shipped colours and make the surface wet; this one
 * asks how far *plasma-like* goes. The ship is a shade paler and more
 * translucent — the pale under the skin reaches deeper, the light hits it
 * more softly — with five ribs leaving the very top of the hull and hanging
 * on as wide ribbons; the panel is more fluid than flesh, a dozen big bubbles
 * rising from its floor, the buttons small sacs low at the thumbs with a few
 * fine vessels and a slow breath, and PLASM's strings run up from them thick
 * with bodies walking (`organ.ts`). The rail stays in its trough.
 *
 * If it loses it loses on the colour: a paler ship is a step away from the
 * panel the owner asked to keep, and the two cards beside it do not take it.
 */
export const SHIP_LYMPH: Variant = {
  slot: "ship:body",
  name: "lymph",
  sentence:
    "the same brief taken toward the fluid — a paler, more translucent ship with a softer light on it, five ribs from the very top of the hull hanging on as wide ribbons, a dozen big bubbles rising from the floor, the buttons small sacs low at the thumbs with strings thick with bodies running up from them",
  dir: "tools/versus/candidates/ship-body/lymph",
  patches: [
    patch({
      target: content.HULL,
      reached: () => content.HULL,
      where: {
        file: "packages/content/src/ship-silhouettes.ts",
        symbol: "HULL",
        type: "HullSilhouette",
      },
      fields: { lobes: 9, depth: 0.2, wobble: 0.1, seed: 0.27 },
    }),
    patch({
      target: seat.P1_SKIN.hull,
      reached: () => seat.seatSkin("p1").hull,
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        body: ["#C89CF8", "#8A4CD6", "#4A1E86", "#1E0A40"],
        rim: "#C878FF",
        edge: "#F8F0FF",
        muzzle: "#1E1236",
      },
    }),
    patch({
      target: seat.P1_SKIN,
      reached: () => seat.seatSkin("p1"),
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        tint: "#C878FF",
        ground: ["#1E0A40", "#150733", "#0B0420", "#05020C"],
        flesh: ["#B98AFA", "#8E5CE8", "#6A48C8"],
      },
    }),
    patch({
      target: sheen.HULL_SHEEN,
      reached: () => sheen.HULL_SHEEN,
      where: { file: "packages/render/src/hull-sheen.ts", symbol: "HULL_SHEEN", type: "HullSheen" },
      fields: { passes: skin },
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
      fields: { name: "lymph", paint: floor },
    }),
    patch({
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: saggingRoof(2.2, 0.15), attach: chamber },
    }),
    patch({
      target: plan.PANEL_PLAN,
      reached: () => plan.PANEL_PLAN,
      where: { file: "packages/render/src/panel-plan.ts", symbol: "PANEL_PLAN", type: "PanelPlan" },
      fields: {
        cannonRow: ROWS.cannonRow,
        shieldRow: ROWS.shieldRow,
        lobeRow: ROWS.lobeRow,
        solo: LOW,
        test: LOW_TEST,
      },
    }),
    patch({
      target: strip.STRIP_LOOK,
      reached: () => strip.STRIP_LOOK,
      where: { file: "packages/render/src/strip-look.ts", symbol: "STRIP_LOOK", type: "StripLook" },
      fields: { draw: strip.trough },
    }),
    patch({
      target: lobe.LOBE_LOOK,
      reached: () => lobe.LOBE_LOOK,
      where: { file: "packages/render/src/lobe-look.ts", symbol: "LOBE_LOOK", type: "LobeLook" },
      fields: { socket: bed, gloss },
    }),
    patch({
      target: nerves.SHIP_NERVES,
      reached: () => nerves.SHIP_NERVES,
      where: {
        file: "packages/render/src/ship-nerves.ts",
        symbol: "SHIP_NERVES",
        type: "ShipNerves",
      },
      fields: { draw: life },
    }),
  ],
};
