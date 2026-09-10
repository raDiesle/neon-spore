import * as content from "../../../../../packages/content/src/index.js";
import * as ground from "../../../../../packages/render/src/band-ground.js";
import * as light from "../../../../../packages/render/src/hull-light.js";
import * as sheen from "../../../../../packages/render/src/hull-sheen.js";
import * as seat from "../../../../../packages/render/src/seat-skin.js";
import * as nerves from "../../../../../packages/render/src/ship-nerves.js";
import { patch, type Variant } from "../../../variant.js";
import { wired } from "../gullet/nerves.js";
import { carapace, hardLight, shell } from "./paint.js";

/**
 * `ship:body` / `chitin` — the ship is a carapace, wet and black, glittering under a hard sun.
 *
 * The owner's own reference: *glittering sun reflecting like in "aliens"
 * movie*. Everything else in this slot is soft and lit from within; this is
 * hard and lit from outside. Eleven plates with dark seams between them, one
 * sharp white sun on the crown of each, and pinpoint glints flickering all
 * over the wet shell. The chamber is the inside of the shell: ribs, and the
 * same glints on the same black. The skin is the seat's hue driven nearly to
 * black so the specular has something to sit on — this is the one ship whose
 * violet you would only see where the light is not.
 *
 * **A concept card.** The owner said on 10 September 2026 that a new look may
 * be designed as a picture first if it saves tokens, so long as the picture
 * and the code do not part company; this card is that picture, drawn by the
 * code it would ship as and shot once, rough, so what he picks from is what he
 * gets. GULLET's wiring is borrowed — every control a tendon on its organ —
 * because the connections are the same question on every ship and only the
 * one he chooses will get its own answer.
 */
export const SHIP_CHITIN: Variant = {
  slot: "ship:body",
  name: "chitin",
  sentence:
    "the ship is a carapace — wet black plates with dark seams, one hard white sun on the crown of each and pinpoint glints flickering over the shell, the panel the ribbed inside of it, the seat's violet visible only where the light is not",
  dir: "tools/versus/candidates/ship-body/chitin",
  patches: [
    patch({
      target: content.HULL,
      reached: () => content.HULL,
      where: {
        file: "packages/content/src/ship-silhouettes.ts",
        symbol: "HULL",
        type: "HullSilhouette",
      },
      fields: { lobes: 12, depth: 0.14, wobble: 0.02, seed: 0.9 },
    }),
    patch({
      target: seat.P1_SKIN.hull,
      reached: () => seat.seatSkin("p1").hull,
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        body: ["#6A5A8C", "#2A1C44", "#100A1E", "#060310"],
        rim: "#8C74C0",
        edge: "#FFFFFF",
        muzzle: "#0A0614",
      },
    }),
    patch({
      target: seat.P1_SKIN,
      reached: () => seat.seatSkin("p1"),
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        tint: "#8C74C0",
        ground: ["#060310", "#08041A", "#040210", "#020108"],
        flesh: ["#6E5A9A", "#4A3A72", "#302450"],
      },
    }),
    patch({
      target: sheen.HULL_SHEEN,
      reached: () => sheen.HULL_SHEEN,
      where: { file: "packages/render/src/hull-sheen.ts", symbol: "HULL_SHEEN", type: "HullSheen" },
      fields: { passes: carapace },
    }),
    patch({
      target: light.HULL_LIGHT,
      reached: () => light.HULL_LIGHT,
      where: { file: "packages/render/src/hull-light.ts", symbol: "HULL_LIGHT", type: "HullLight" },
      fields: { lit: hardLight },
    }),
    patch({
      target: ground.BAND_GROUND,
      reached: () => ground.BAND_GROUND,
      where: {
        file: "packages/render/src/band-ground.ts",
        symbol: "BAND_GROUND",
        type: "BandGround",
      },
      fields: { name: "chitin", paint: shell },
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
