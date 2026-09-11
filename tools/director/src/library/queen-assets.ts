import { armour, carapace, facetShell, scutes } from "@neon-spore/render";
import { drawQueenStage } from "./queen-stage.js";
import type { Asset } from "./types.js";

/**
 * THE BULB QUEEN's four shells — what the biggest body on any field is made
 * of, between the marks under her and the torches on her wings.
 *
 * `creature:queen` was decided on 11 September 2026: the owner took SCUTES
 * into the game and kept the other two here by name — CARAPACE, "i like it a
 * lot, can be used like for a 'roller' enemy or obstacle", and FACET, "can be
 * used for metal enemy or obstacle". So all four are on her own contour, on
 * one clock: the plates she wears, the flat rock she wore, and the two kept
 * for bodies not built yet.
 */

const FROM = "THE BULB QUEEN · creature:queen";

export const QUEEN_SCUTES: Asset = {
  id: "queen-scutes",
  label: "SCUTES",
  from: FROM,
  inGame: true,
  claim:
    "Seven overlapping plates lapped from the wings in toward the middle, each a ridge with a lit near side. Look at the seams between plates: they slide against each other as she breathes, and the middle plate rides highest.",
  note: "In the game since 11 September 2026 — the owner's pick.",
  draw: (c, f) => drawQueenStage(c, f, scutes),
};

export const QUEEN_ARMOUR: Asset = {
  id: "queen-armour",
  label: "ARMOUR",
  from: FROM,
  claim:
    "One flat plate of grey rock, lit from the upper left to the lower right, with the rock's outline round it. Look at the middle: nothing on it moves or catches the light.",
  note: "What she wore until 11 September 2026.",
  draw: (c, f) => drawQueenStage(c, f, armour),
};

export const QUEEN_CARAPACE: Asset = {
  id: "queen-carapace",
  label: "CARAPACE",
  from: FROM,
  claim:
    "A domed back with rows of small dark pores pinned to it, shaded to a cool rim with a wet highlight on the upper-left shoulder. Look at one pore near the top edge: as she heaves it rises over the crest as a sliver, widens, and sinks under the lower edge.",
  note: "Kept on 11 September 2026 — the owner likes it a lot, for a roller enemy or an obstacle.",
  draw: (c, f) => drawQueenStage(c, f, carapace),
};

export const QUEEN_FACET: Asset = {
  id: "queen-facet",
  label: "FACET",
  from: FROM,
  claim:
    "A cut stone: a flat table in the middle and a ring of angled planes running down from it to the corners of her outline, each plane lit by which way it faces. Look at the planes on the upper left against the lower right: the ones facing the light are pale, the rest dark.",
  note: "Kept on 11 September 2026 — the owner wants it for a metal enemy or an obstacle.",
  draw: (c, f) => drawQueenStage(c, f, facetShell),
};
