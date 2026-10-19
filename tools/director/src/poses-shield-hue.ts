import { WAVES } from "@neon-spore/content";
import { guardArmed, hullRow } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
  fresh,
  guard,
  type Pose,
  runUntil,
  shoot,
  POSE_TPB as TPB,
  ward,
} from "./pose-kit.js";

/** SALVAGE: its panel carries SHIELD on one seat and CYAN on the other. By id,
 * for the reason `WAVE_WITH_BOTH_FACES` gives (`poses-versus-states.ts`), and
 * looked up here because that file imports this one. */
const SALVAGE = WAVES.findIndex((w) => w.id === "salvage");

/**
 * The shield lit beside a cyan shot, on the panel that carries both buttons.
 *
 * Judged here: `shield:hue`. The owner, 19 October 2026: the shield and the
 * button that lights it are *very similar to the cyan shoot* — they are the
 * same hex, `PALETTE.shield` and `PALETTE.cyan` both `#2FE0F0`. So the
 * question can only be asked with both on one frame: the rim armed in one
 * column, a cyan bolt leaving the cannon four columns over, player 1's
 * SHIELD button lit, and player 2's CYAN button and shield strip beside it.
 *
 * Handed over with the bolt a few rows up and the guard still lit, and
 * replayed on the event cadence, because a guard is only lit for its window.
 */
export const SHIELD_BESIDE_CYAN_POSE: Pose = {
  name: "SHIELD · BESIDE A CYAN SHOT",
  note: "The shield armed in one column and a cyan shot leaving the cannon in another, with both panels showing: the SHIELD button on player 1's, the CYAN button and the shield strip on player 2's.",
  lookAt:
    "the lit shield over the hull, the cyan bolt beside it, and the SHIELD and CYAN buttons on the two panels",
  crop: "ship",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = fresh([], [], null, {}, SALVAGE);
    const cmds = [aim(0, 7), ward(0, 3), guard(TPB), shoot(TPB, "cyan")];
    runUntil(w, "a cyan bolt in the air under a lit shield", cmds, (x) => {
      const b = x.bullets[0];
      return b !== undefined && guardArmed(x) && b.row <= hullRow(x.cfg) - 2;
    });
    return w;
  },
};
