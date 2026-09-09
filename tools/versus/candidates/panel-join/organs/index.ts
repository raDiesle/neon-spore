import * as join from "../../../../../packages/render/src/band-join.js";
import { patch, type Variant } from "../../../variant.js";
import { grown } from "./paint.js";

/**
 * `panel:ship-join` / `organs` — every button is the swollen end of something
 * the membrane grew, rather than something the membrane feeds.
 *
 * A control already stands in a socket the ship grew for it: a wet depression
 * in the panel's tissue with a lip of its own, and a contour with lobes rather
 * than a circle, because *everything else in this game is a grown edge*
 * (`lobe-shell.ts`). And a feeder already runs from the membrane down to each
 * one, which is the owner's sentence — *like it is part of the ship* — said in
 * one line.
 *
 * One line is what it is. A tendril a pixel and a half wide says the button is
 * *supplied* by the ship, the way a lamp is supplied by its flex; it does not
 * say the button is *made of* the ship. Cut the tendril and the panel is still
 * a plate with five things standing on it.
 *
 * ORGANS answers the other way. Each control is the end of a trunk that leaves
 * the roof as a wide shoulder — the membrane bulging where the organ came out
 * of it, not a stalk meeting a flat ceiling at a point — pinches to a waist,
 * and flares back out into the button, overlapping its socket rather than
 * stopping above it. The owner's rule about a body's parts is that they merge
 * into one mass and that a connector drawn between separated parts is not
 * enough; this is that rule applied to the one object on the screen that is
 * made of separated parts by construction.
 *
 * **The roof is untouched**, deliberately. This candidate's whole argument is
 * that the integration is missing *below* the membrane rather than along it, so
 * the ceiling keeps its own slow wobble and the pair is looking at one thing.
 *
 * **It costs one fill and one stroke for the whole panel**, whatever a wave's
 * control set holds — the bargain `band-slime.ts` makes for its pendants, and
 * it is the same order of work the feeders it replaces did.
 *
 * How it can lose, and both ways are about the same thing. **The panel gets
 * crowded.** Five trunks a tile wide at the shoulder is a great deal more
 * tissue in a strip the pair has to find a button in at a glance, and if a
 * trunk reads as a *shape* rather than as tissue it has become a sixth thing on
 * a panel of five. The second is nearer the bone: a socket is dark on purpose,
 * so a button reads as sitting in a hole, and flesh flaring over its lip is
 * flesh filling that hole in. If the buttons stop looking pressable, this
 * candidate has traded the panel's one job for a picture.
 */
export const JOIN_ORGANS: Variant = {
  slot: "panel:ship-join",
  name: "organs",
  sentence:
    "each control is the swollen end of a trunk grown out of the membrane — a wide shoulder at the roof, a waist, and a flare that overlaps the socket — where the shipped panel hangs a thread to it",
  dir: "tools/versus/candidates/panel-join/organs",
  patches: [
    patch({
      target: join.BAND_JOIN,
      // No accessor: `band-seam.ts` and `band.ts` both read the export itself.
      // The module namespace is the whole route there is.
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: join.wobbleCeiling, attach: grown },
    }),
  ],
};
