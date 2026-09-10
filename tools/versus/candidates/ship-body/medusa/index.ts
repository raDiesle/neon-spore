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
import { saggingRoof, sameLight } from "../../../join.js";
import { patch, type Variant } from "../../../variant.js";
import { wired } from "../gullet/nerves.js";
import { arms, bell } from "./paint.js";

/**
 * `ship:body` / `medusa` — the jellyfish the ship already is, all the way.
 *
 * The least different of the four, on purpose. The bell keeps its
 * bioluminescence and its lit rim and gains its anatomy: radial canals fanning
 * from the middle of the bell out to the edge, a gastric pouch in the middle
 * breathing over four seconds. The chamber is the bell's underside — oral
 * arms, frilled ribbons hanging the whole height of the panel between the
 * controls, which is what a jellyfish keeps under its bell. The contour is
 * the shipped one, because this is the card that says the ship was right.
 *
 * **A concept card.** The owner said on 10 September 2026 that a new look may
 * be designed as a picture first if it saves tokens, so long as the picture
 * and the code do not part company; this card is that picture, drawn by the
 * code it would ship as and shot once, rough, so what he picks from is what he
 * gets. GULLET's wiring is borrowed — every control a tendon on its organ —
 * because the connections are the same question on every ship and only the
 * one he chooses will get its own answer.
 */
export const SHIP_MEDUSA: Variant = {
  slot: "ship:body",
  name: "medusa",
  sentence:
    "the jellyfish the ship already is, all the way — radial canals and a breathing pouch under the film, oral arms hanging the height of the panel between the controls, the contour left exactly as it ships",
  dir: "tools/versus/candidates/ship-body/medusa",
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
        body: ["#B99CF8", "#7232B8", "#361064", "#150632"],
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
        flesh: ["#B47CFF", "#8450E8", "#6446C8"],
      },
    }),
    patch({
      target: sheen.HULL_SHEEN,
      reached: () => sheen.HULL_SHEEN,
      where: { file: "packages/render/src/hull-sheen.ts", symbol: "HULL_SHEEN", type: "HullSheen" },
      fields: { passes: bell },
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
      fields: { name: "medusa", paint: arms },
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
      fields: { ceiling: saggingRoof(3.4, 0.4), attach: sameLight },
    }),
    patch({
      target: plan.PANEL_PLAN,
      reached: () => plan.PANEL_PLAN,
      where: { file: "packages/render/src/panel-plan.ts", symbol: "PANEL_PLAN", type: "PanelPlan" },
      // The shipped arrangement, passed through: this ship changes its skin
      // and not where the hands go.
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
      fields: { socket: lobe.LOBE_LOOK.socket, gloss: lobe.LOBE_LOOK.gloss },
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
