import { fresh, type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";
import { BREACH_ROCKS_POSE, BREACH_STRIKE_POSE, METEOR_HIT_POSE } from "./poses-damage.js";
import { GUIDE_FILM_POSE, LOST_SCREEN_POSE } from "./poses-guide.js";
import { HANDOVER_TRADE_POSE } from "./poses-handover.js";
import { INSTAR_BARE_POSE } from "./poses-instar-bare.js";
import { INSTAR_BROOD_POSE } from "./poses-instar-brood.js";
import { INSTAR_REAR_POSE, INSTAR_SPREAD_POSE } from "./poses-instar-spit.js";
import { SLOW_RUNS_OUT_POSE, SLOW_WINDOW_POSE } from "./poses-slow.js";
import { BREAK_POSE, BULB_STRUCK_POSE } from "./poses-struck.js";

/**
 * The half of `poses-versus.ts` that shows something other than a body: the
 * panel, the ship taking damage, and the states borrowed from a round or a
 * screen — THE SLOW's two, the handover, the guide. Split from it on 25
 * September 2026 with `poses-versus-bodies.ts`, the other half.
 */

/**
 * The first wave that names no control set of its own and so draws the
 * `default` one — both ACTION faces. Written as a number with its reason
 * beside it rather than derived: `poses.test.ts` builds every pose here, so a
 * wave list that reordered under this fails there rather than quietly drawing
 * a band with nothing on it.
 */
export const WAVE_WITH_BOTH_FACES = 14;

/**
 * The band with an ACTION face on it. Every other pose on the sheet starts
 * wave 0, whose control set is `standard1` — a cannon and a red button — so
 * neither GUARD nor INTAKE has ever been drawn in one, and the
 * `panel:action-face` slot had nothing on screen to argue about.
 *
 * That slot is decided and gone — the owner picked the emblems, and
 * `action-face.ts` draws them on every action button now. The pose stays, the
 * way `GRIP · THE PUSH PAUSE` did for the same reason: it is the only card in
 * the gallery that shows the panel's own two faces, and they are worth a
 * picture whether or not anybody is voting on them.
 */
const BAND_POSE: Pose = {
  name: "BAND · THE ACTION FACES",
  note: "Player 1's control panel. It has a slider for the cannon and two round buttons beside it: a lobe swelling upwards for the shield, and the same lobe pressed inwards with specks falling into it for the maw.",
  lookAt:
    "the two round buttons at the bottom of the panel — SHIELD on the left, SUCK on the right",
  crop: "band",
  build: () => {
    const w = fresh([], [], null, {}, WAVE_WITH_BOTH_FACES);
    run(w, TPB * 2);
    return w;
  },
};

/** Every compared look whose state is not a body, in the order the sheet shows them. */
export const VERSUS_STATE_POSES: Pose[] = [
  BAND_POSE,
  METEOR_HIT_POSE,
  BREAK_POSE,
  BULB_STRUCK_POSE,
  BREACH_ROCKS_POSE,
  BREACH_STRIKE_POSE,
  HANDOVER_TRADE_POSE,
  GUIDE_FILM_POSE,
  LOST_SCREEN_POSE,
  SLOW_WINDOW_POSE,
  SLOW_RUNS_OUT_POSE,
  INSTAR_BROOD_POSE,
  INSTAR_BARE_POSE,
  INSTAR_REAR_POSE,
  INSTAR_SPREAD_POSE,
];
