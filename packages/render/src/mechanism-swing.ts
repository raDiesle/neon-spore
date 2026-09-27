import type { World } from "@neon-spore/sim";
import { HUSH } from "./idle-drift.js";
import { type PartRow, partDrift, partSeed, STILL } from "./idle-drift-parts.js";
import { slowHush } from "./slow-hush.js";

/**
 * **A mechanism swings only what hangs or hinges** (`docs/spec/living-bosses.md`
 * §1, "A mechanism is not an animal"): THE DAVIT's hook on its chain, THE
 * PLUMB's bob on its hook, THE SLING's tines on the crotch. Nothing rigid
 * wobbles, and the rest of each machine stays where its script holds it.
 *
 * One angle a part, in the plane we see, about its joint: the part drift's
 * `rotate` with the parent held still, so the table's ceilings and the
 * never-snaps test are the part drift's own (`idle-drift-parts.test.ts`). The
 * caller turns the canvas about the joint by it, and hands in the hush —
 * `swingHush`, since every step of these three opens THE SLOW: a tenth on a
 * part the window's mark is on, which is what keeps the mark still while it
 * asks (`tools/director/test/boss-hush.test.ts`), and a third elsewhere.
 *
 * `MECHANISM_SWING` is how much of the row's range each boss takes. The
 * shipped 0 draws no transform at all; it is the seam a VERSUS candidate
 * patches (`tools/versus/candidates/*-swing/`).
 */

export type SwingBoss = "davit" | "plumb" | "sling";

/** How much of its row's range each boss's hung part swings through: 0 dead still, 1 the table's. */
export const MECHANISM_SWING: Record<SwingBoss, number> = { davit: 0, plumb: 0, sling: 0 };

/**
 * The row of the part table each hung part moves like: the hook a hand on
 * its wrist, the bob an arm — heavy and slow — and a tine a hand again.
 */
const ROW: Readonly<Record<SwingBoss, PartRow>> = { davit: "hand", plumb: "arm", sling: "hand" };

/** Each boss's seed, its number in `bosses-choreographed.md`, so no two swing in step. */
const SEED: Readonly<Record<SwingBoss, number>> = { davit: 35, plumb: 31, sling: 32 };

/** Part `part` of `boss`'s swing at `time` seconds, radians, scaled by `hush`; 0 while the boss is still. */
export function mechanismSwing(boss: SwingBoss, part: number, time: number, hush: number): number {
  const reach = MECHANISM_SWING[boss] * hush;
  if (reach === 0) return 0;
  return partDrift(time, partSeed(SEED[boss], part), ROW[boss], () => STILL, reach).rotate;
}

/** What a boss's script is, to `windowStep`: the three share the shape. */
interface Scripted<T> {
  readonly phase: string;
  readonly steps: readonly T[];
  readonly cursor: number;
}

/**
 * The step THE SLOW's last window opened for: the lit one, and in a rest or
 * after the script the one before the cursor. A step that ran out without
 * being answered rests with the cursor where it was, so for that one rest
 * this names the step before it — the hush eases from a third to a tenth or
 * back as the rest starts, a few pixels, on the beat the step springs back.
 */
export function windowStep<T>(s: Scripted<T>): T | undefined {
  return s.phase === "lit" || s.phase === "still" ? s.steps[s.cursor] : s.steps[s.cursor - 1];
}

/**
 * A hung part's hush (`HUSH` in `idle-drift.ts`): 1 with no window, and
 * inside one, eased by `slowHush`, a tenth when the window's mark is on the
 * part (`carried`) and a third when it is somewhere else on the machine.
 */
export function swingHush(world: World, beat: number, beatPhase: number, carried: boolean): number {
  return slowHush(world, beat, beatPhase, carried ? HUSH.liveMark : HUSH.marks);
}
