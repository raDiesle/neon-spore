import { type Mechanic, type MechanicId, mechanic, unreachedMechanics } from "@neon-spore/content";

/**
 * `unreachedMechanics()` and `mechanic()` are the whole truth of it — this
 * file adds nothing to what a mechanic *is*, only the one thing a warning
 * needs and the registry does not carry: where a person would go to fix it.
 *
 * Pure on purpose, same as `tools/checks/checks.ts` beside it: the question
 * is a small transform over a list `@neon-spore/content` already computes,
 * and that is the kind of thing that should be tested without touching git or
 * a filesystem.
 */

/**
 * `Reach` minus `"run"` — the same narrowing `unreachedMechanics` already
 * does at the type it hands back. A `run` mechanic reaches every wave or
 * none, so asking "where would it go" is the wrong question, and this module
 * never has to answer it.
 */
export type OrphanReach = Exclude<Mechanic["reach"], "run">;

export interface Orphan {
  id: MechanicId;
  what: string;
  reach: OrphanReach;
  /** Where a person would go to connect it, in one line. */
  fix: string;
}

const FIX: Record<OrphanReach, string> = {
  spawn: "place it in a wave — packages/content/src/waves.ts",
};

/**
 * One row per unreached mechanic. Takes the id list rather than computing it
 * so a test can hand it a fabricated list without a real wave to write.
 *
 * A `"run"` id throws rather than being quietly skipped: `unreachedMechanics`
 * already promises never to hand one over, and a caller that broke that
 * promise wants to know, not to have this function paper over it.
 */
export function orphanReport(ids: readonly MechanicId[] = unreachedMechanics()): Orphan[] {
  return ids.map((id) => {
    const m = mechanic(id);
    if (m.reach === "run") {
      throw new Error(`${id} is a run-wide switch, not something a wave or a gap reaches`);
    }
    return { id, what: m.what, reach: m.reach, fix: FIX[m.reach] };
  });
}
