import { WAVES } from "@neon-spore/content";
import { waveName } from "./measure.js";

/**
 * WHICH WAVES A RUN COVERS.
 *
 * Its own file because it asks nothing of a browser: `measure.ts` is one run
 * taken off a real Chrome, and this is a line of text turned into a list of
 * indices, which is the one part of a run a test can hold without launching
 * anything. It is also what made `measure.ts` outgrow the limit the day the
 * narrow run arrived.
 *
 * The narrow run is the ordinary one — a lane that adds a creature measures the
 * waves that creature appears in, and the whole game is swept only when a
 * baseline is being taken.
 */

/**
 * Which waves a run covers, resolved from what the caller asked for.
 *
 * A name is matched the way a person would say it — case and surrounding space
 * ignored — and a number is the one the HUD prints, which is 1-based. An ask
 * that matches nothing is an error rather than an empty run: a session that
 * mistyped a wave and got a clean sweep of zero waves would read it as a pass.
 */
export function wavesAsked(asked: readonly string[]): number[] {
  if (asked.length === 0) return WAVES.map((_, i) => i);
  const out: number[] = [];
  for (const one of asked) {
    const want = one.trim();
    const number = Number(want);
    const index = Number.isInteger(number)
      ? number - 1
      : WAVES.findIndex((_, i) => waveName(i).toLowerCase() === want.toLowerCase());
    if (index < 0 || index >= WAVES.length) {
      throw new Error(
        `no wave called ${JSON.stringify(want)} — say its number or the name the HUD prints`,
      );
    }
    if (!out.includes(index)) out.push(index);
  }
  return out.sort((a, b) => a - b);
}
