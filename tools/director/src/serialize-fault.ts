import type { WaveFault } from "@neon-spore/content";

/**
 * **A `Malfunction` as its own source, arm by arm**, and every field of the arm
 * is written: one this misses is one the editor deletes the first time somebody
 * saves the wave that carried it.
 *
 * Here beside the boss's own line (`serialize-boss.ts`) for the same reason
 * that one is out of `serialize.ts` — both are a *wave's* one-line fact
 * written back out, and that is the file that fills up. Given a page of its
 * own when THE DAVIT's branch put `serialize-boss.ts` past the limit
 * (`sim/malfunction.ts`).
 */
export function faultLine(m: WaveFault): string {
  const parts = [`kind: "${m.kind}"`];
  if (m.kind === "cannon" && m.color !== undefined) parts.push(`color: "${m.color}"`);
  // THE FLIP's seat, on the same terms as the colour above: it is the only
  // thing this fault says, and a save that dropped it would turn every
  // navigator's flip into a pilot's on the way through the editor
  // (`content/wave-faults.ts`, `sim/flip.ts`).
  if (m.kind === "flip" && m.seat !== undefined) parts.push(`seat: ${m.seat}`);
  // The rows it is placed on, and both are optional on purpose: a fault that
  // names neither enters on the wave's first beat and holds to the end, which
  // is every fault the game had before they were placed at all
  // (`content/wave-faults.ts`).
  if (m.at !== undefined) parts.push(`at: ${m.at}`);
  if (m.beats !== undefined) parts.push(`beats: ${m.beats}`);
  return `{ ${parts.join(", ")} }`;
}
