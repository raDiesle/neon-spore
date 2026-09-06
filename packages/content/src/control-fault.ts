import type { Malfunction } from "@neon-spore/sim";
import { type ControlSet, layoutSet, setControls, setHas } from "./control-sets.js";
import type { ControlDef, ControlId } from "./controls.js";

/**
 * **What a wave's fault does to the panel it is played on**, and the one place
 * either half of it is decided.
 *
 * Two questions, and three files used to be able to answer them differently:
 * *which lobes does this seat have in front of it*, asked by the band that
 * draws them, the hit test that answers them and the ghost thumb a rehearsal
 * presses them with; and *is this one dead*, asked by the button's own face.
 * `control-sets.ts` next door answers the first for a wave with no fault, and
 * this is the same answer with one taken away.
 *
 * **Nothing is put back.** A fault used to hand the broken seat a relief lobe
 * in exchange, and the owner took that button out on 6 September 2026: he did
 * not want it. So a fault is now purely a subtraction, and the only answer to
 * one is where the seat that can still move decides to stand.
 *
 * **A fault does not make a new panel, and that is why it lives here rather
 * than in `CONTROL_SETS`.** A set is a whole panel and sets do not compose —
 * "the standard panel plus a button" is exactly the thing that file exists to
 * refuse. Nothing here composes one: the set is untouched, its lobes stand
 * where the set puts them, and what changes is that one of them answers
 * nothing and one more is standing at the end of the row. A cannon fault reads
 * the same on STANDARD, on STANDARD 4 and on the lance panel, because it is a
 * rule about a *control* and not a list of buttons.
 */

/**
 * Whether this control is one the fault has taken over — drawn, and answering
 * nobody.
 *
 * It says what `faultSwallows` says in `packages/sim/src/malfunction.ts`, one
 * level up: that one is about a *command* arriving at the world and this is
 * about a *button* on a panel, and the two are not the same list — a swipe on
 * the hull is a `fire` with no lobe anywhere near it. The simulation is the
 * one that enforces the rule; this is the one that has to draw it, and a
 * button that quietly did nothing would be indistinguishable from a button
 * that is broken, which is the mistake `drawLock` already exists to avoid.
 */
export function controlBroken(id: ControlId, m: Malfunction | null | undefined): boolean {
  if (!m) return false;
  if (m.kind === "cannon") return id === "fireRed" || id === "fireCyan";
  return id === "guard";
}

/**
 * One seat's row of lobes this wave, as **slots**: a control, or `null` where
 * the panel's rung holds one back.
 *
 * Slots rather than a list, because that is the rule `bandLobes` was built
 * around and it must survive a fault: a reduced panel is laid out against the
 * panel it reduces, so the buttons a rung does carry stand exactly where they
 * will stand on the full panel and the missing ones leave a gap. Handing back
 * a filtered list would centre the survivors and move every button a pair has
 * already learned.
 *
 * The dead buttons stay exactly where they are — that is the whole picture of
 * a malfunction, and a panel that quietly rearranged itself would read as a
 * different panel rather than as the same one gone wrong.
 */
export function panelSlots(set: ControlSet, player: 1 | 2): readonly (ControlDef | null)[] {
  const lobes = setControls(layoutSet(set), player).filter((c) => c.form === "lobe");
  return lobes.map((c) => (setHas(set, c.id) ? c : null));
}
