import { bevel, drawPlates, iris } from "@neon-spore/render";
import { drawLidStage } from "./lid-stage.js";
import type { Asset } from "./types.js";

/**
 * THE LID's three armours — what stands between the pair and the lens, and
 * how it gets out of the way.
 *
 * `creature:lid` was decided on 11 September 2026: the owner took IRIS into
 * the game and said "keep the CREATURE:LID · BEVEL with the graphic of opening
 * like a iron curtain to see something behind for upcoming creatures". So
 * three are here, on the game's own lid, pulling one cord: the iris it wears,
 * the flat plates it wore until that day, and the bevelled plates kept for a
 * body not built yet.
 */

const FROM = "THE LID · creature:lid";

export const LID_IRIS: Asset = {
  id: "lid-iris",
  label: "IRIS",
  from: FROM,
  inGame: true,
  claim:
    "Six round grey leaves overlapping like a camera's diaphragm, shut to a point at the middle of the eye. Look at the middle as the cord is pulled: a rounded hole grows from the point and the leaves turn a little as they part, each with a dark line where it rides over the next.",
  note: "In the game since 11 September 2026 — the owner's pick.",
  draw: (c, f) => drawLidStage(c, f, iris),
};

export const LID_PLATES: Asset = {
  id: "lid-plates",
  label: "PLATES",
  from: FROM,
  claim:
    "Two flat grey plates meeting on one straight seam, two grooves on each. Look at the seam as the cord is pulled: it opens into a slot and the plates slide straight out to the sides.",
  note: "What the lid wore until 11 September 2026.",
  draw: (c, f) => drawLidStage(c, f, drawPlates),
};

export const LID_BEVEL: Asset = {
  id: "lid-bevel",
  label: "BEVEL",
  from: FROM,
  claim:
    "The same two sliding plates given a thickness: each face is shaded as it wraps toward the edge, and the inner edge of each is a wall — bright on the right plate, dark on the left. Look at the two walls as the plates part: they open like an iron curtain, with something behind.",
  note: "Kept on 11 September 2026 — the owner wants this iron-curtain opening for an upcoming creature.",
  draw: (c, f) => drawLidStage(c, f, bevel),
};
