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
import { bed, chamber, floor, gloss, life, skin } from "./paint.js";

/**
 * `ship:body` / `heart` — the shipped panel, with every button a beating heart.
 *
 * The other answer to the owner's brief of 11 September 2026. GLAND keeps
 * EMBEDDED's arrangement; this keeps the game's — the rail in its trough and
 * the buttons in their row, so a thumb that knows the panel finds nothing
 * moved — and puts the whole change into the material and the organs. The
 * skin is the same clear wet surface with no grain (`wet.ts`), nine ribs
 * leave the very top of the hull and run down through the chamber as ridges
 * in the flesh rather than hanging ribbons, and each button is a **heart**:
 * a swelling nearly twice its size with nine vessels out of it that reach
 * its neighbours', beating a little over once a second with light inside it,
 * plasma welling from under it, and a beaded cord up to the rail (`organ.ts`).
 * PLASM's big bubbles lie along the floor under all of it.
 *
 * The colours are the shipped panel's, untouched.
 */
export const SHIP_HEART: Variant = {
  slot: "ship:body",
  name: "heart",
  sentence:
    "the shipped panel with nothing moved — rail in its trough, buttons in their row — but the skin is a clear wet surface with no grain, nine ribs run from the very top of the hull down through the flesh, and every button is a heart nearly twice its size, veined to its neighbours, beating with light inside it and welling plasma",
  dir: "tools/versus/candidates/ship-body/heart",
  patches: [
    patch({
      target: content.HULL,
      reached: () => content.HULL,
      where: {
        file: "packages/content/src/ship-silhouettes.ts",
        symbol: "HULL",
        type: "HullSilhouette",
      },
      fields: { lobes: 14, depth: 0.12, wobble: 0.05, seed: 0.4 },
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
      fields: { name: "heart", paint: floor },
    }),
    patch({
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: saggingRoof(3.2, 0.36), attach: chamber },
    }),
    patch({
      target: plan.PANEL_PLAN,
      reached: () => plan.PANEL_PLAN,
      where: { file: "packages/render/src/panel-plan.ts", symbol: "PANEL_PLAN", type: "PanelPlan" },
      // The shipped arrangement, passed through: nothing moves under a thumb.
      fields: {
        cannonRow: plan.PANEL_PLAN.cannonRow,
        shieldRow: plan.PANEL_PLAN.shieldRow,
        lobeRow: plan.PANEL_PLAN.lobeRow,
        solo: plan.PANEL_PLAN.solo,
        test: plan.PANEL_PLAN.test,
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
