import type { ControlId } from "@neon-spore/content";
import type { Command } from "@neon-spore/sim";
import { assertNever } from "./never.js";
import type { Hold } from "./touch.js";

/**
 * What pressing a lobe says. A lookup, not a rule — every entry is the command
 * that control has always sent. Split out of `touch.ts` on line count.
 *
 * The switch is exhaustive over `ControlId`, on purpose: two strips
 * (`cannon`, `shield`) are answered directly by `touchDown` before
 * `lobeUnder` ever asks about them, and THE GAUGE's own round
 * (`gaugeLeft`/`gaugeRight`/`gaugeCall`) is read by `apps/game/src/gauge.ts`
 * instead — both say so here rather than falling through a `default` that
 * could not tell "decided" from "forgotten" apart from a real lobe.
 */
export function lobeMeans(id: ControlId): { command: Command; hold: Hold | null } | null {
  switch (id) {
    case "guard":
      return { command: { kind: "guard" }, hold: null };
    case "intake":
      return { command: { kind: "intake" }, hold: null };
    case "lance":
      return { command: { kind: "prime", on: true }, hold: { kind: "lance" } };
    case "fireRed":
      return { command: { kind: "fire", color: "red" }, hold: null };
    case "fireCyan":
      return { command: { kind: "fire", color: "cyan" }, hold: null };
    // THE FLEET's five. The salvo is one press and is over the moment it
    // happens; each arrow is one square and is over just as fast — there is
    // nothing held here, which is why a hold would be wrong: a thumb resting
    // on an arrow that walked the sights would take the counting out of the
    // fight, and the counting is the fight (`sim/fleet.ts`).
    case "salvo":
      return { command: { kind: "salvo" }, hold: null };
    case "aimLeft":
      return { command: { kind: "aim", dcol: -1, drow: 0 }, hold: null };
    case "aimRight":
      return { command: { kind: "aim", dcol: 1, drow: 0 }, hold: null };
    case "aimUp":
      return { command: { kind: "aim", dcol: 0, drow: -1 }, hold: null };
    case "aimDown":
      return { command: { kind: "aim", dcol: 0, drow: 1 }, hold: null };
    case "cannon":
    case "shield":
    case "gaugeLeft":
    case "gaugeRight":
    case "gaugeCall":
      return null;
    default:
      return assertNever(id);
  }
}
