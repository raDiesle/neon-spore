/**
 * **A core's hurt**: a little smaller and brighter for every hit it has taken —
 * the figure THE VISE's kernel set (§28, *Colour*) and THE RIME's and THE
 * PLUMB's cores wear, each a body whose health is the shots it has left.
 *
 * One function because it had become three: each boss's pose file carried its
 * own copy of the same two lines, and the copies table
 * (`packages/sim/test/copies-table.ts`) now holds the next one out.
 */
export function coreHurt(hits: number): { size: number; bright: number } {
  return { size: Math.max(0.55, 1 - 0.12 * hits), bright: Math.min(1, 0.55 + 0.2 * hits) };
}
