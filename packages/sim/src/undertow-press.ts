import { guardArmed } from "./hull-guard.js";
import { mawOpen } from "./pod-intake.js";
import type { Command } from "./types.js";
import { type UndertowLobe, undertowBoss, undertowEbbing, undertowLobeAt } from "./undertow.js";
import type { World } from "./world.js";

/**
 * THE UNDERTOW's answers, and the tap, all on the **tick**.
 *
 * The clock that sets the questions is `undertow-step.ts`, on the beat; an
 * answer that waited for the next beat would put a queue between *now* and the
 * taking, so the two controls are asked here every tick from `step.ts` and the
 * tap is heard the tick it arrives (`boss-hands.ts`).
 */

/** Whether the control this lobe's colour names is on it right now. */
function answered(world: World, l: UndertowLobe): boolean {
  if (l.answer === "maw") return world.cannonCol === l.col && mawOpen(world);
  return world.shieldCol === l.col && guardArmed(world);
}

/**
 * **Every standing lobe its answer is on**, taken. A yellow lobe by the maw
 * opened with the cannon under it; a shield-coloured one by the shield raised
 * in its column. The wrong control on a lobe does nothing — that is the call
 * the colour asks for. A bowing lobe has not come through yet, a tall one is
 * the tap's, and a shrinking level answers nothing: the clock has already won.
 *
 * Asked every tick rather than on the press, so a maw opened over a bow takes
 * the lobe the tick it stands, and a shield already up is an answer too.
 */
export function undertowAnswers(world: World): void {
  const u = undertowBoss(world);
  if (u === null || undertowEbbing(u)) return;
  for (const l of [...u.lobes]) {
    if (l.stage !== "standing" || !answered(world, l)) continue;
    u.lobes.splice(u.lobes.indexOf(l), 1);
    u.taken += 1;
    world.events.push({ type: "undertowTaken", col: l.col });
  }
}

/**
 * **A thumb on a tall lobe** shrinks it back to standing, with its stand
 * started again — so it can be answered, and so it grows again if it is not.
 * Anything else under the thumb is not a handle: a bow has not come through,
 * and a standing lobe is the colour's to answer, not the thumb's.
 */
export function undertowTapped(world: World, col: number): void {
  const u = undertowBoss(world);
  if (u === null || undertowEbbing(u)) return;
  const l = undertowLobeAt(u, col);
  if (l === null || l.stage !== "tall") return;
  l.stage = "standing";
  l.stageBeat = world.beat;
  l.tapped = true;
  world.events.push({ type: "undertowTapped", col });
}

/**
 * `undertowTap` off the wire, from **either seat**: both screens draw the hull
 * and the lobes on it, so whoever sees it grow first may put a thumb on it.
 * Only the press counts; the lift says nothing.
 */
export function undertowTapHeard(world: World, command: Command): void {
  if (command.kind !== "drag" || command.target !== "undertowTap" || !command.on) return;
  undertowTapped(world, command.id ?? -1);
}
