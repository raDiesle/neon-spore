import type { CatalogueEntry } from "../catalogue.js";
import { arm, cluster, glyphed, slab } from "../forms.js";
import { DRIFT, SWELL, TURN, TWITCH } from "../motions.js";
import { hullArc } from "../subjects.js";

/**
 * Drafts for the mechanics and the control ideas: things that are not
 * creatures.
 *
 * The four control ideas in `docs/spec/ideas.md` — Interference, Bearing
 * waves, the Codebook table, Inverted instructions — all do the same thing to
 * a player: they change what a press means without changing the press. That is
 * the hardest kind of thing to draw, and the reason to draw it early. A rule
 * the pair cannot see is a rule they will read as a bug, and the only surface
 * that can carry it is the ship itself, which both players are looking at.
 *
 * `docs/spec/ideas.md` also warns that several of these were written for free
 * flight. Anything here is grounded in the cannon, the shield and the beat, or
 * it does not belong in the catalogue.
 */
export const SYSTEM_DRAFTS: CatalogueEntry[] = [
  {
    subject: glyphed("BEARING RING", "a ring of marks that turns", 40, 40, 12, 0.35),
    motion: TURN,
    status: "draft",
    slot: "ship",
    suggests: "Bearing waves",
    owner:
      "a coordinate grid needs a zero, and a ring that turns has one you can name out loud without a number: the mark at the top. The one draft that is a reference rather than a body",
  },
  {
    subject: slab("CODE PLATE", "a plate on the hull, six-sided and flat", 34, 26, 5),
    motion: SWELL,
    status: "draft",
    slot: "ship",
    suggests: "Codebook table",
    owner:
      "the key has to live somewhere a player can point at and read to the other one. Flat and made, so it never reads as part of the membrane; small enough to sit beside the cannon lobe without competing with it",
  },
  {
    subject: cluster("INTERFERENCE", "two bodies of the same size, never merging", {
      bodies: 2,
      radius: 28,
      spread: 1.35,
      period: 5,
      floor: 0.9,
    }),
    motion: TWITCH,
    status: "draft",
    slot: "ship",
    suggests: "Interference",
    owner:
      "one player's colours are swapped and they do not know it, so the tell must be visible to the *other* player: two equal bodies that lean and never resolve into one, drawn where the partner is looking",
  },
  {
    subject: hullArc("SWAP ARC", "a span of hull with the sides traded", 0.3),
    motion: undefined,
    status: "draft",
    slot: "ship",
    suggests: "Inverted instructions",
    owner:
      "the Spaceteam principle needs the ship itself to look wrong rather than the button: a span of the membrane read right-to-left, so the shape a player describes is not the shape their hands are on",
  },
  {
    subject: arm("THE NEEDLE", "a straight corridor, barely bending", 130, 0.16),
    motion: DRIFT,
    status: "draft",
    slot: "field",
    suggests: "The Needle",
    owner:
      "a geometric corridor, which is a line and not a creature. Almost no bend, so it reads as drawn rather than grown — and it crosses columns, which is the only thing on this page that does",
  },
  {
    subject: arm("LIGHT TRACE", "a trailing line that lags what made it", 90, 1.5),
    motion: DRIFT,
    status: "draft",
    slot: "field",
    suggests: "Light traces",
    owner:
      "the whip is the whole idea: the bend runs down the trace and arrives late at the tip, so a trace says where something *was* rather than where it is",
  },
];
