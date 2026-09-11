import { arms, drawTentacles } from "@neon-spore/render";
import type { Asset } from "./types.js";
import { comb } from "./wisp-comb.js";
import { skirt } from "./wisp-skirt.js";
import { drawWispStage } from "./wisp-stage.js";

/**
 * THE WISP's four fringes — what hangs under the bell.
 *
 * `creature:wisp` was decided on 11 September 2026: the owner took ARMS into
 * the game and said of the rest, *i like them a lot, i want to build much more
 * enemies later on which look like this — a jellyfish with arms floating
 * under it*. So all four are here, on the game's own wisp, jumping together:
 * the one it wears, the threads it wore until that day, and the two that
 * stood beside ARMS on VERSUS.
 */

const FROM = "THE WISP · creature:wisp";

export const WISP_ARMS: Asset = {
  id: "wisp-arms",
  label: "ARMS",
  from: FROM,
  inGame: true,
  claim:
    "Four wide ribbons hang from under the middle of the bell. Look at their edges: the side toward the light is bright, the other side is dark, and a ribbon going round the back thins to a sliver.",
  note: "In the game since 11 September 2026 — the owner's pick.",
  draw: (c, f) => drawWispStage(c, f, arms),
};

export const WISP_THREADS: Asset = {
  id: "wisp-threads",
  label: "THREADS",
  from: FROM,
  claim:
    "Eight thin lines hang from the rim of the bell, half of them behind it. Look at how each one brightens and dims on its own as the signal comes and goes.",
  note: "What the wisp wore until 11 September 2026. ARMS still borrows its brightening.",
  draw: (c, f) => drawWispStage(c, f, drawTentacles),
};

export const WISP_COMB: Asset = {
  id: "wisp-comb",
  label: "COMB",
  from: FROM,
  claim:
    "Eight short rows of paddles under the rim, each row beating from top to bottom. Look at the colour running down a row — cyan to violet to red, the bell's own colours going somewhere.",
  note: "Kept for a body that should look busy rather than hanging — the beat is the whole of it.",
  draw: (c, f) => drawWispStage(c, f, comb),
};

export const WISP_SKIRT: Asset = {
  id: "wisp-skirt",
  label: "SKIRT",
  from: FROM,
  claim:
    "One see-through curtain hangs from the whole rim down to a scalloped foot. Look at the near half: it hangs lower and brighter than the far half, which is what says the rim goes round.",
  note: "Kept for a body with an underside — a veil with folds that turn.",
  draw: (c, f) => drawWispStage(c, f, skirt),
};
