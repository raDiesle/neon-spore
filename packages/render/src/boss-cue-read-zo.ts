import { type FlueState, flueLitLevel, midCol, type World } from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame, markAt } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import { flueSightAt, flueSightR } from "./flue-shape.js";
import type { Layout } from "./layout.js";

/**
 * **What THE FLUE is asking for**: page forty-one of the readings, said only
 * while a level is lit, and to one seat each (`cueSeen`).
 *
 * **`CALL` over `NOW` at the sight, to the pilot**, who alone is drawn the
 * ember (`showsFlueEmber`): the pilot's part is to say when, early enough
 * for the shot to get there. The word stands still on the sight rather than
 * riding the ember, so it never says *now* on its own.
 *
 * **`FIRE` at the hull under the held cannon on a bolt level, `HOLD` on a
 * beam level**, to the navigator, whose trigger it is. Both aim at the sight,
 * where the shot is judged. The level's colour is never named — the sight is
 * drawn in it — and nor is the count, which the pips under it are.
 */

/** A beam level's word: hold the prime, and the beam goes when it is full. */
const FILL = { kind: "HOLD", word: "HOLD", why: "WHILE THE BEAM FILLS" } as const;
const BOLT = { kind: "PRESS", word: "FIRE" } as const;

export function flueCues(l: Layout, world: World, s: FlueState): readonly BossCue[] {
  const level = flueLitLevel(s);
  if (level === null) return [];
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const sight = flueSightAt(l, world.cfg);
  const aim = { ...sight, r: flueSightR(l) };
  const x = fieldX(l, midCol(world.cfg));
  const fire = level.weapon === "beam" ? FILL : BOLT;
  return [
    markAt(1, "CALL", "NOW", sight.x, sight.y, l, 168),
    { seat: 2, ...fire, x, y: l.hullY, ...frame, aim, seed: 167 },
  ];
}
