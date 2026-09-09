import * as join from "../../../../../packages/render/src/band-join.js";
import { patch, type Variant } from "../../../variant.js";
import { saggingRoof } from "../fused/tissue.js";
import { vascular } from "./paint.js";

/**
 * `panel:ship-join` / `vessel` — the panel is a circulatory system, and the
 * controls are where it ends.
 *
 * The owner asked for this one almost by name: *maybe more veins, big and small
 * ones which hold the buttons cannon and so on, controlling it*. Every other
 * card in this slot answers *how does a control hang off the ship*; this one
 * answers *what is the ship's own plumbing doing down here*, and the controls
 * are simply the last thing it reaches.
 *
 * **Two controls share a trunk.** That is the whole difference between this and
 * FUSED, and it is a claim about what the panel is: an aorta leaves the ship,
 * comes down, and parts into two branches that end in two buttons. Five stalks
 * from one ceiling say *five organs on one ship*; one vessel forking says *one
 * organ with five ends*, which is nearer to what the owner asked for when he
 * asked for everything to be grown together.
 *
 * **The network closes.** A transverse vessel runs the full width behind
 * everything, so the two seats' trees are one tree and the rails a column
 * slides along have something feeding them. It is not attached to a strip and
 * could not be — `attach` is told which controls a screen carries and never
 * which strips it draws — so it is a vessel that passes under the rail rather
 * than one that ends at it, and reads correctly on a panel with no rail at all.
 *
 * **And it is mostly too fine to follow.** Sixty capillaries leave the branches
 * and die out in the tissue. A pipe has one thickness and ends where it is
 * going; a vessel has every thickness at once and most of it goes nowhere in
 * particular, which is the difference between plumbing and anatomy.
 *
 * How it can lose. It is the busiest thing that has ever been on this band, and
 * the band is read by two people at speed while somebody is talking at them —
 * eleven columns of ammunition sit directly above it. If the tree reads as
 * texture behind the buttons it has won; if it reads as *lines*, it has put
 * lines across the one part of the screen that must stay legible, and FUSED is
 * the quieter answer standing next to it.
 */
export const JOIN_VESSEL: Variant = {
  slot: "panel:ship-join",
  name: "vessel",
  sentence:
    "the chamber is one circulatory system — an aorta leaves the ship for every pair of controls, forks halfway down, ends in the buttons, and ties into a transverse vessel running the whole width, with capillaries too fine to follow",
  dir: "tools/versus/candidates/panel-join/vessel",
  patches: [
    patch({
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: saggingRoof(2.2, 0.26), attach: vascular },
    }),
  ],
};
