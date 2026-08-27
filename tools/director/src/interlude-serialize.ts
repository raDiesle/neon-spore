import type { InterludeEntry } from "@neon-spore/sim";

/**
 * Regenerates `GAPS` in `interludes.ts`, the same way `serialize.ts`
 * regenerates `WAVES` in `waves.ts` — the browser cannot write a file, so the
 * editor produces a diff you can review and commit.
 *
 * Not a generalisation of `serializeWaves`. That function's job is walking a
 * `Wave[]` — field wrapping, entry arrays, pod arrays, three shapes of boss —
 * and none of that machinery has anything to say about a `Record<number,
 * InterludeEntry>` keyed by gap. Bending one marker-and-body routine to cover
 * both shapes would mean every reader of either file learns the other's
 * fields to find the few lines that are actually shared: find a marker, slice
 * the prefix, join a body, done. That much is worth the copy; the rest is not
 * worth sharing. `waves.ts` is also five lines from its 250-line ceiling, so
 * growing its serializer to also know about gaps would be the wrong file to
 * put this in even if the shapes matched.
 */
export function serializeGaps(source: string, gaps: Record<number, InterludeEntry>): string {
  const marker = "export const GAPS: Record<number, InterludeEntry> = {";
  const idx = source.indexOf(marker);
  if (idx === -1) {
    throw new Error("Could not find GAPS record in source");
  }

  const prefix = source.slice(0, idx + marker.length);
  const gapNums = Object.keys(gaps)
    .map(Number)
    .sort((a, b) => a - b);
  const lines = gapNums.map((wave) => `  ${wave}: { kind: "${gaps[wave]!.kind}" },`);

  return `${prefix}\n${lines.join("\n")}\n};\n`;
}
