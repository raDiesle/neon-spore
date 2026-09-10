import * as content from "../../../../../packages/content/src/index.js";
import * as ground from "../../../../../packages/render/src/band-ground.js";
import * as join from "../../../../../packages/render/src/band-join.js";
import * as light from "../../../../../packages/render/src/hull-light.js";
import * as sheen from "../../../../../packages/render/src/hull-sheen.js";
import * as seat from "../../../../../packages/render/src/seat-skin.js";
import * as nerves from "../../../../../packages/render/src/ship-nerves.js";
import { saggingRoof, sameLight } from "../../../join.js";
import { patch, type Variant } from "../../../variant.js";
import { wired } from "./nerves.js";
import { lip, mouthLight } from "./sheen.js";
import { throat } from "./throat.js";

/**
 * `ship:body` / `gullet` — the ship is a mouth.
 *
 * The owner asked for a whole new ship on 10 September 2026: *cannon, suck and
 * shield on surface and button controls. anything else you can completely be
 * creative what alien living fluid space ship to build.* This is the first
 * answer, chosen by him from four, and it takes the one gesture the ship
 * already makes — the maw, a lobe turned inside out to swallow a pod — and
 * makes it what the ship *is*. The hull is a lip. The field is what it eats.
 * The panel is the throat, and the buttons are glands in its wall.
 *
 * **Eight records, one body.** The contour goes from fourteen shallow ripples to
 * nine deeper, slower folds, which is a lip and not a ridge. The skin keeps the seat's
 * hue and goes wet: a paler edge, a redder flesh, a darker inside. The material
 * is `sheen.ts` — a swallow passing down the lip every three seconds, creases
 * across it, gloss on its edge alone. The light is the ship's own across its
 * width with the inside of the mouth glowing up from below. And the chamber
 * is `throat.ts`: rings of muscle closer and darker with depth, a channel
 * narrowing down the middle, glands between the rings. And the wiring is
 * `nerves.ts`: every control is a tendon on the organ it moves — the cannon's
 * knob roots a cord that runs up through the throat and the lip to the base of
 * the cannon lobe, the shield's likewise, and each button's thread joins the
 * cord of the organ it speaks to. And the join is the ship's own: the roof
 * sags over every control and the chamber is lit and grained the way the lip
 * is (`tools/versus/join.ts`), which is what the closed `panel:ship-join`
 * slot found and the ships took over.
 *
 * Cannon, maw and shield are the same lobes on the same membrane: nothing a
 * player aims with moved. The maw in particular is unchanged and is the point —
 * on a ship that is a mouth, the suck is the ship doing what it does.
 *
 * How it loses. A lip is a stronger shape than a film, and the field above it
 * is read by colour at 26 px; if the folds or the swallow pull the eye down
 * off the columns, the ship has become the thing the pair looks at, which is
 * the one thing the ship must never be. And the throat's rings are horizontal
 * lines across the panel — if they read as rails, the buttons have lost their
 * own rails to them.
 */
export const SHIP_GULLET: Variant = {
  slot: "ship:body",
  name: "gullet",
  sentence:
    "the ship is a mouth — the hull a wet, creased lip with a swallow passing down it, the panel the throat behind it in rings of muscle, the maw's suck the one thing the ship was always doing",
  dir: "tools/versus/candidates/ship-body/gullet",
  patches: [
    patch({
      target: content.HULL,
      reached: () => content.HULL,
      where: {
        file: "packages/content/src/ship-silhouettes.ts",
        symbol: "HULL",
        type: "HullSilhouette",
      },
      fields: { lobes: 9, depth: 0.16, wobble: 0.05, seed: 0.73 },
    }),
    patch({
      target: seat.P1_SKIN.hull,
      reached: () => seat.seatSkin("p1").hull,
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      fields: {
        body: ["#D89CFF", "#8E36C8", "#4A1268", "#1C0530"],
        rim: "#E29CFF",
        edge: "#FFF0FF",
        muzzle: "#2A0620",
      },
    }),
    patch({
      target: seat.P1_SKIN,
      reached: () => seat.seatSkin("p1"),
      where: { file: "packages/render/src/seat-skin.ts", symbol: "P1_SKIN", type: "SeatSkin" },
      // `ground[0]` is the hull's last body stop, as the record's own rule says.
      fields: {
        tint: "#E29CFF",
        ground: ["#1C0530", "#26073A", "#0E0316", "#050109"],
        flesh: ["#C878F8", "#8E44D8", "#6A3AB8"],
      },
    }),
    patch({
      target: sheen.HULL_SHEEN,
      reached: () => sheen.HULL_SHEEN,
      where: { file: "packages/render/src/hull-sheen.ts", symbol: "HULL_SHEEN", type: "HullSheen" },
      fields: { passes: lip },
    }),
    patch({
      target: light.HULL_LIGHT,
      reached: () => light.HULL_LIGHT,
      where: { file: "packages/render/src/hull-light.ts", symbol: "HULL_LIGHT", type: "HullLight" },
      fields: { lit: mouthLight },
    }),
    patch({
      target: ground.BAND_GROUND,
      reached: () => ground.BAND_GROUND,
      where: {
        file: "packages/render/src/band-ground.ts",
        symbol: "BAND_GROUND",
        type: "BandGround",
      },
      fields: { name: "throat", paint: throat },
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
