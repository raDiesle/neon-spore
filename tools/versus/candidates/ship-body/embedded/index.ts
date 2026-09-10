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
import { wired } from "../gullet/nerves.js";
import { body, CORNERS, CORNERS_TEST, flesh, pore, ROWS, spine, wet } from "./panel.js";
import { skinFolds } from "./sheen.js";

/**
 * `ship:body` / `embedded` — there is no panel; the lower screen is the body.
 *
 * The owner, after five ships: *right now all look similar from basis.* They
 * did, because every one kept a rail in a trough across the width and two
 * buttons in wet sockets in a row, and painted the tissue round them. This is
 * the first card that moves the basis. The buttons are **pores** — a
 * depression in the flesh with the flesh ringed round it, no socket and no
 * plate — and they stand out at the corners where the thumbs are. The rail is
 * a **spine**: a lit cord running through the body with a node per column and
 * a swollen node on the column held. Broad folds run across the whole lower
 * screen, hull and chamber alike, and the same light lies over both, so
 * nothing says where a ship ends and a panel starts because there is no
 * panel.
 *
 * It patches three records nothing else in this slot had touched — the
 * arrangement (`PANEL_PLAN`, read by the layout and by `bandLobes`, so the
 * hit regions move with the pores), the rail (`STRIP_LOOK`) and the socket
 * (`LOBE_LOOK`); the five ships beside it pass the shipped values through so
 * the slot stays one question. The wiring is GULLET's cords, borrowed: veins
 * to the lobes were in the concept picture the owner chose this from.
 *
 * How it loses: pores in the corners are further from the columns they fire
 * into than a row in the middle, and a spine with no trough round it may read
 * as a wire rather than a rail. Both are answered by a thumb, not an eye.
 */
export const SHIP_EMBEDDED: Variant = {
  slot: "ship:body",
  name: "embedded",
  sentence:
    "there is no panel — the lower screen is the ship's body, the buttons are pores in the flesh out at the thumbs, the rail is a lit spine through it with a node per column, and broad folds and one light run across hull and chamber alike",
  dir: "tools/versus/candidates/ship-body/embedded",
  patches: [
    patch({
      target: content.HULL,
      reached: () => content.HULL,
      where: {
        file: "packages/content/src/ship-silhouettes.ts",
        symbol: "HULL",
        type: "HullSilhouette",
      },
      fields: { lobes: 10, depth: 0.14, wobble: 0.06, seed: 0.5 },
    }),
    patch({
      target: seat.P1_SKIN.hull,
      reached: () => seat.seatSkin("p1").hull,
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        body: ["#C08CF4", "#7A36BE", "#3E1668", "#1A0836"],
        rim: "#C86CFF",
        edge: "#F6ECFF",
        muzzle: "#1C0E30",
      },
    }),
    patch({
      target: seat.P1_SKIN,
      reached: () => seat.seatSkin("p1"),
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        tint: "#C86CFF",
        ground: ["#1A0836", "#160730", "#0E0420", "#06020C"],
        flesh: ["#B27AF2", "#8650CC", "#6440A8"],
      },
    }),
    patch({
      target: sheen.HULL_SHEEN,
      reached: () => sheen.HULL_SHEEN,
      where: { file: "packages/render/src/hull-sheen.ts", symbol: "HULL_SHEEN", type: "HullSheen" },
      fields: { passes: skinFolds },
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
      fields: { name: "embedded", paint: body },
    }),
    patch({
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: saggingRoof(2.6, 0.25), attach: flesh },
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
      fields: { socket: pore, gloss: wet },
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
