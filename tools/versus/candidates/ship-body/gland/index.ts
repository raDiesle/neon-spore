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
import { spine } from "../../../fluid.js";
import { saggingRoof } from "../../../join.js";
import { patch, type Variant } from "../../../variant.js";
import { bed, CORNERS, CORNERS_TEST, chamber, floor, gloss, life, ROWS, skin } from "./paint.js";

/**
 * `ship:body` / `gland` — EMBEDDED, with the owner's four corrections.
 *
 * On 11 September 2026 he liked EMBEDDED most and named what was wrong with
 * it and with the two cards beside it: the sand-like light and gradient, the
 * thin lines converging in the middle of MEDUSA's bell, PLASM's bubbles in
 * the hull rather than the floor, and buttons that looked set into the flesh
 * rather than grown out of it. This is EMBEDDED's arrangement — buttons out
 * at the thumbs, a spine for a rail — with each of those answered: the skin
 * is a clear wet surface with no grain (`wet.ts`), seven ribs leave the very
 * top of the hull and hang on through the chamber as ribbons, PLASM's big
 * bubbles lie along the floor, and every button is an organ — a swelling of
 * flesh with veins out of it, breathing, leaking a little plasma, with a
 * beaded cord running up to the rail (`organ.ts`).
 *
 * The colours are the shipped panel's, untouched: *keep the clear colours of
 * the current control panel, and have them for the top skin of the hull too.*
 */
export const SHIP_GLAND: Variant = {
  slot: "ship:body",
  name: "gland",
  sentence:
    "EMBEDDED corrected — the same buttons at the thumbs and spine through the body, but the skin is a clear wet surface with no grain, seven ribs run from the very top of the hull down into hanging ribbons, big bubbles lie along the floor, and every button is an organ grown out of the flesh with veins and a slow breath",
  dir: "tools/versus/candidates/ship-body/gland",
  patches: [
    patch({
      target: content.HULL,
      reached: () => content.HULL,
      where: {
        file: "packages/content/src/ship-silhouettes.ts",
        symbol: "HULL",
        type: "HullSilhouette",
      },
      fields: { lobes: 12, depth: 0.13, wobble: 0.06, seed: 0.45 },
    }),
    patch({
      target: seat.P1_SKIN.hull,
      reached: () => seat.seatSkin("p1").hull,
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        body: ["#B268F0", "#6C2AAE", "#33105E", "#150632"],
        rim: "#C05CFF",
        edge: "#F4E7FF",
        muzzle: "#190F2C",
      },
    }),
    patch({
      target: seat.P1_SKIN,
      reached: () => seat.seatSkin("p1"),
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        tint: "#C05CFF",
        ground: ["#150632", "#0E0921", "#080513", "#04020A"],
        flesh: ["#A666F8", "#7E4ADE", "#6042C0"],
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
      fields: { name: "gland", paint: floor },
    }),
    patch({
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: saggingRoof(2.6, 0.25), attach: chamber },
    }),
    patch({
      target: plan.PANEL_PLAN,
      reached: () => plan.PANEL_PLAN,
      where: { file: "packages/render/src/panel-plan.ts", symbol: "PANEL_PLAN", type: "PanelPlan" },
      fields: {
        cannonRow: ROWS.cannonRow,
        shieldRow: ROWS.shieldRow,
        lobeRow: ROWS.lobeRow,
        solo: CORNERS,
        test: CORNERS_TEST,
      },
    }),
    patch({
      target: strip.STRIP_LOOK,
      reached: () => strip.STRIP_LOOK,
      where: { file: "packages/render/src/strip-look.ts", symbol: "STRIP_LOOK", type: "StripLook" },
      fields: { draw: spine },
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
