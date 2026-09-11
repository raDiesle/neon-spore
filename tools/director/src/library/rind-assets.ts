import { flakes, pod, slough } from "@neon-spore/render";
import { drawRindStage, shippedShed } from "./rind-stage.js";
import type { Asset } from "./types.js";

/**
 * THE RIND's four sheds — the half-second in which a layer comes off.
 *
 * `creature:rind` was decided on 11 September 2026: the owner kept the shed
 * the game draws and said "'CREATURE:RIND' keep current and move the versus
 * alternative effects to 'Shapes' page". So four are here on the game's own
 * rind, losing its layers together: the husk it throws today, and the three
 * looks that stood against it, kept to be seen.
 */

const FROM = "THE RIND · creature:rind";

export const RIND_HUSK: Asset = {
  id: "rind-husk",
  label: "HUSK",
  from: FROM,
  inGame: true,
  claim:
    "The outline the body had is crushed onto the smaller body, and the skin is thrown outward as a thinning ring that breaks into plates on the way, in a bloom of the body's own colour. Look at the ring as it goes: it comes apart into short arcs and fades.",
  note: "In the game since it shipped — the owner kept it on 11 September 2026.",
  draw: (c, f) => drawRindStage(c, f, shippedShed),
};

export const RIND_FLAKES: Asset = {
  id: "rind-flakes",
  label: "FLAKES",
  from: FROM,
  claim:
    "The skin comes apart into a dozen thick pieces thrown outward, each tumbling as it goes, lit on its face where it sits toward the upper left and dark on its underside, and falling a little as it fades. Look at one piece: it turns edge-on and shows its other face.",
  note: "Kept on 11 September 2026 — the owner asked for it on this page.",
  draw: (c, f) => drawRindStage(c, f, flakes),
};

export const RIND_POD: Asset = {
  id: "rind-pod",
  label: "POD",
  from: FROM,
  claim:
    "The skin splits into two halves like a seed pod, each swinging open on a hinge at the body's side and falling away, lit on the face that turns toward the upper left. Look at the two halves: they open and drop apart, the smaller body left standing between them.",
  note: "Kept on 11 September 2026 — the owner asked for it on this page.",
  draw: (c, f) => drawRindStage(c, f, pod),
};

export const RIND_SLOUGH: Asset = {
  id: "rind-slough",
  label: "SLOUGH",
  from: FROM,
  claim:
    "The skin slides off the body downward in one piece, keeping its outline, stretching and thinning as it drops and fading as it goes. Look at the space below the body: the whole old outline hangs there for a moment before it is gone.",
  note: "Kept on 11 September 2026 — the owner asked for it on this page.",
  draw: (c, f) => drawRindStage(c, f, slough),
};
