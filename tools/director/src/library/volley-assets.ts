import { emberSeams, pittedStone, shippedSeams, shippedStone } from "@neon-spore/render";
import type { Asset } from "./types.js";
import { drawVolleyStage } from "./volley-stage.js";

/**
 * THE VOLLEY's three shells — what the stone is and what a seam is.
 *
 * `creature:volley` was decided on 11 September 2026: the owner took EMBER
 * into the game and said "keep CREATURE:VOLLEY · PITTED for 'Shapes' page, i
 * like this rotation - maybe to apply for 'Meteors'". So three are here, on
 * the game's own volley, walking the plate count down together: the shell it
 * wears, the painted seams it wore until that day, and the pitted stone.
 */

const FROM = "THE VOLLEY · creature:volley";

export const VOLLEY_EMBER: Asset = {
  id: "volley-ember",
  label: "EMBER",
  from: FROM,
  inGame: true,
  claim:
    "A grey ball with four seams that glow red from inside, breathing. Look at the seams as the plates come off: the stone is scorched dark along both sides, a warm white core shows in the middle, and each ward makes them burn wider and brighter.",
  note: "In the game since 11 September 2026 — the owner's pick.",
  draw: (c, f) => drawVolleyStage(c, f, { stone: shippedStone, seams: emberSeams }),
};

export const VOLLEY_PAINTED: Asset = {
  id: "volley-painted",
  label: "PAINTED",
  from: FROM,
  claim:
    "The same ball with the four seams as red lines painted on the stone, each with a soft glow. Look at the seams as the plates come off: they stay the same whether the ball is whole or nearly gone.",
  note: "What the volley wore until 11 September 2026. EMBER's rim is still this one.",
  draw: (c, f) => drawVolleyStage(c, f, { stone: shippedStone, seams: shippedSeams }),
};

export const VOLLEY_PITTED: Asset = {
  id: "volley-pitted",
  label: "PITTED",
  from: FROM,
  claim:
    "The stone born with seven small pits, placed on the ball and turned by the roll. Look at a pit near the edge: it thins to a sliver, goes round the back and comes back in — which is what says ball rather than coin. The seams are the painted ones.",
  note: "Kept on 11 September 2026 — the owner likes this rotation, and suggests trying it on the meteors.",
  draw: (c, f) => drawVolleyStage(c, f, { stone: pittedStone, seams: shippedSeams }),
};
