import type { FlueState, World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue-shape.js";
import type { Layout } from "./layout.js";

/**
 * **What THE FLUE is asking for**: page forty-one of the readings, **read and
 * silent** since 7 October 2026.
 *
 * It said `CALL` over `NOW` at the sight to the pilot and `FIRE` (or `HOLD`
 * on a beam level) in a scan box at the hull to the navigator. The owner had
 * the box and the words taken off when the sight became glass: *remove the
 * scanner box and the text*. What a level asks is now one sentence under the
 * flue on both screens (`flue-card.ts`), and whose mouth it waits on is the
 * siren's, `SAY WHEN TO SHOOT` and `SHOOT WHEN TOLD` (`comms-boss.ts`).
 */
export function flueCues(_l: Layout, _world: World, _s: FlueState): readonly BossCue[] {
  return [];
}
