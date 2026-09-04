import { type ControlId, controlPress } from "@neon-spore/content";
import type { Command } from "@neon-spore/sim";
import { assertNever } from "./never.js";
import type { Hold } from "./touch.js";

/**
 * Which lobes a finger can press, and what each of them says.
 *
 * The *saying* is not here any more: `content/src/control-command.ts` is the
 * one copy of what every control on every panel sends, because there used to
 * be four of them and a guide's rehearsal could not reach any of the round
 * ones. What is left here is the half that is genuinely this file's — which
 * ids a lobe answers at all, and which of them a thumb stays on.
 *
 * Split out of `touch.ts` on line count.
 *
 * The switch is exhaustive over `ControlId`, on purpose: two strips
 * (`cannon`, `shield`) are answered directly by `touchDown` before
 * `lobeUnder` ever asks about them, and a round's own slabs — THE GAUGE's
 * three and SNAKE's four — are read by their own listener in `apps/game`
 * instead. All of them say so here rather than falling through a `default`
 * that could not tell "decided" from "forgotten" apart from a real lobe.
 */
export function lobeMeans(id: ControlId): { command: Command; hold: Hold | null } | null {
  switch (id) {
    case "guard":
    case "intake":
    case "fireRed":
    case "fireCyan":
      return { command: controlPress(id).down, hold: null };
    case "lance":
      return { command: controlPress(id).down, hold: { kind: "lance" } };
    // THE FLEET's five. The salvo is one press and is over the moment it
    // happens; each arrow is one square and is over just as fast — there is
    // nothing held here, which is why a hold would be wrong: a thumb resting
    // on an arrow that walked the sights would take the counting out of the
    // fight, and the counting is the fight (`sim/fleet.ts`).
    case "salvo":
    case "aimLeft":
    case "aimRight":
    case "aimUp":
    case "aimDown":
      return { command: controlPress(id).down, hold: null };
    case "cannon":
    case "shield":
    case "gaugeLeft":
    case "gaugeRight":
    case "gaugeCall":
    case "snakeLeft":
    case "snakeRight":
    case "snakeFire":
    case "snakeMaw":
    // PINBALL's four, read by their own listener in `apps/game` — the bucket's
    // two are *held*, which no lobe is, so they could not be answered here.
    case "pinLeft":
    case "pinRight":
    case "pinLatch":
    case "pinLaunch":
      return null;
    default:
      return assertNever(id);
  }
}
