import type { ScriptedEntry } from "@neon-spore/sim";

/**
 * **The scripted bosses, written back out**: THE SEAM and every scene after
 * it — the kinds `sim/wave-boss-scripted.ts` installs (`isScriptedEntry`), so
 * the next one is written back out the day it is installed.
 *
 * Cut out of `serialize-boss.ts` when THE BURGEE took it to its 250-line
 * limit, along the one seam that file had: next door, a boss is a name or a
 * list named; here, a boss is a list of steps written out whole, because the
 * list *is* the fight and each step is short enough to read on one line.
 *
 * **One writer for all of them.** Every step of these is strings and numbers,
 * so it is written field by field in the order the wave wrote it, a field left
 * out of the wave left out again. There used to be a template per boss, and a
 * template is a place where a field added to a step is quietly dropped on the
 * way back; this cannot drop one. The director's round trip
 * (`test/wave-save.test.ts`) writes every shipped wave back byte for byte.
 */

/** One step, `{ key: value, … }` in the order it was authored. */
function step(s: object): string {
  const fields = Object.entries(s)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  return `{ ${fields.join(", ")} }`;
}

/** A scripted boss written back out, its steps on the one line. */
export function serializeScripted(boss: ScriptedEntry): string {
  const steps: readonly object[] = boss.steps;
  return `{ kind: "${boss.kind}", steps: [${steps.map(step).join(", ")}] }`;
}
