import { calyx, foamCage, globe, moons, springs } from "@neon-spore/render";
import { drawRecoilStage } from "./recoil-stage.js";
import type { Asset } from "./types.js";

/**
 * THE RECOIL's five cages — the frame round a body that turns its colour
 * over on every bounce.
 *
 * `creature:recoil` was decided on 11 September 2026: the owner took GLOBE
 * into the game and said "have this for 'shapes' page to be reused for
 * another upcoming enemy: CREATURE:RECOIL · MOONS and CREATURE:RECOIL · FOAM
 * and CREATURE:RECOIL · CALYX". So five are here on the game's own recoil,
 * spending their ribs together: the globe it wears, the springs it wore until
 * that day, and the three kept for an enemy not built yet.
 */

const FROM = "THE RECOIL · creature:recoil";

export const RECOIL_GLOBE: Asset = {
  id: "recoil-globe",
  label: "GLOBE",
  from: FROM,
  inGame: true,
  claim:
    "A wire ball round the body that turns slowly: each rib is a full ring through both poles, thick and lit where it passes in front, thin and dim behind. Look at the equator ring as the ribs go: a spent rib stays as a dark stub at the pole.",
  note: "In the game since 11 September 2026 — the owner's pick.",
  draw: (c, f) => drawRecoilStage(c, f, globe),
};

export const RECOIL_SPRINGS: Asset = {
  id: "recoil-springs",
  label: "SPRINGS",
  from: FROM,
  claim:
    "A hoop round the body held off it by zigzag springs, one per bounce, each with a bolt at its head, all drawn as glowing lines in one plane. Look at a spring as the ribs go: a spent one goes dark and ember-coloured.",
  note: "What the recoil wore until 11 September 2026.",
  draw: (c, f) => drawRecoilStage(c, f, springs),
};

export const RECOIL_MOONS: Asset = {
  id: "recoil-moons",
  label: "MOONS",
  from: FROM,
  claim:
    "Small solid balls circling the body on a tilted orbit, one per bounce, each lit on its upper-left side. Look at one ball going round: it grows as it comes in front of the body and shrinks and dims as it passes behind.",
  note: "Kept on 11 September 2026 — the owner wants it for an upcoming enemy.",
  draw: (c, f) => drawRecoilStage(c, f, moons),
};

export const RECOIL_FOAM: Asset = {
  id: "recoil-foam",
  label: "FOAM",
  from: FROM,
  claim:
    "A ring of soft bubbles clinging to the body, one cluster per bounce, each with a pale highlight on its upper left. Look at the bubbles: they wobble and swell on their own, and a spent cluster has gone dark.",
  note: "Kept on 11 September 2026 — the owner wants it for an upcoming enemy.",
  draw: (c, f) => drawRecoilStage(c, f, foamCage),
};

export const RECOIL_CALYX: Asset = {
  id: "recoil-calyx",
  label: "CALYX",
  from: FROM,
  claim:
    "Broad petals fanning out from behind the body like a flower's cup, one per bounce, each shaded darker toward its base. Look at the petals as the ribs go: a spent one wilts and hangs lower than the rest.",
  note: "Kept on 11 September 2026 — the owner wants it for an upcoming enemy.",
  draw: (c, f) => drawRecoilStage(c, f, calyx),
};
