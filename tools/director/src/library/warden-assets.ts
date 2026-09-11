import { drawWardenSurface, mantle, roll, whorl } from "@neon-spore/render";
import type { Asset } from "./types.js";
import { drawWardenStage } from "./warden-stage.js";

/**
 * THE WARDEN's four surfaces — everything on the ring between its material
 * and the door over its eye.
 *
 * `creature:warden` was decided on 11 September 2026: the owner kept the
 * surface the game had and said of the other three, *i like the alternatives
 * a lot, move them to the Shapes page*. So all four are here on the game's own
 * warden, on one clock: the one it wears, and the three that stood beside it
 * on VERSUS, each a different answer to what a body with a hole for a middle
 * is made of.
 */

const FROM = "THE WARDEN · creature:warden";

export const WARDEN_SURFACE: Asset = {
  id: "warden-surface",
  label: "SURFACE",
  from: FROM,
  inGame: true,
  claim:
    "Dark rock with five veins running in from the rim, small eyelets blinking across it, and lifted plates round the edge. Look at the veins: they breathe in length, and every eyelet brightens as the door opens.",
  note: "Kept on 11 September 2026 against three alternatives — the owner's pick.",
  draw: (c, f) => drawWardenStage(c, f, drawWardenSurface),
};

export const WARDEN_MANTLE: Asset = {
  id: "warden-mantle",
  label: "MANTLE",
  from: FROM,
  claim:
    "Four rings of soft overlapping lobes from the rim down to the hole, each ring darker than the last. Look at the lower-right wall of each lobe: that is where the light is, which is what makes the hole read as the bottom of a throat. A swell runs round the rings.",
  note: "Kept on 11 September 2026 — the owner likes it a lot. Grown-in-folds material for a body that should read as flesh.",
  draw: (c, f) => drawWardenStage(c, f, mantle),
};

export const WARDEN_ROLL: Asset = {
  id: "warden-roll",
  label: "ROLL",
  from: FROM,
  claim:
    "The ring shaded as a tube, bright along its crest and dark at the lip of the hole. Look at the eyelets and veins: they surface at the outer edge as slivers, widen over the crest and narrow into the hole, as though the whole surface were rolling inward.",
  note: "Kept on 11 September 2026 — the owner likes it a lot. A surface that swallows, for a body whose middle is a mouth.",
  draw: (c, f) => drawWardenStage(c, f, roll),
};

export const WARDEN_WHORL: Asset = {
  id: "warden-whorl",
  label: "WHORL",
  from: FROM,
  claim:
    "Thirty ridged fibres wind a third of a turn from the rim into the hole, over a bowl that is darkest at the lip. Look at the fibres: the whole whorl turns slowly, and a bead of green runs down each one into the hole on its own time.",
  note: "Kept on 11 September 2026 — the owner likes it a lot. Muscle for a body that should be seen drawing something in.",
  draw: (c, f) => drawWardenStage(c, f, whorl),
};
