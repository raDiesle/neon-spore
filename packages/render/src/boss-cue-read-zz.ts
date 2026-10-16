import { type GeodeState, geodeCracksIn, type World } from "@neon-spore/sim";
import { cueAimAt, markAt } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { geodePieces, geodePose } from "./geode-place.js";
import type { Layout } from "./layout.js";

/**
 * **What THE GEODE is asking for**, on a page of its own among the readings.
 *
 * The fight is *which crack, and in what colour*, and the two are on
 * different screens: the navigator sees where each crack runs, the pilot the
 * crystal's colour (`view-role-clocks-c.ts`). So **the pilot is told
 * nothing** — sliding under the crack the navigator names is the choice he
 * makes on her word — and **the navigator is told only what the cannon's own
 * column can answer**, THE BROOD's pairing: `HOLD` on the crack the cannon is
 * under, since a beam is a colour held while the cannon keeps still, aimed
 * at the crack as it is drawn. *Which colour* is never written and never lit
 * (`shows` is left off): on her screen the crack is white, and the colour is
 * the pilot's to say.
 *
 * Nothing while the stone comes in, breaks apart, lands or shatters: no crack
 * is lit to burn.
 */
export function geodeCues(
  l: Layout,
  world: World,
  s: GeodeState,
  beatPhase = 0,
): readonly BossCue[] {
  const here = geodeCracksIn(world, s, world.cannonCol);
  const i = here[0];
  if (i === undefined) return [];
  const p = geodePose(l, world, s, s.cursor, world.beat, beatPhase);
  const piece = geodePieces(l, world, s, s.cursor, p, s.cutTick)[i];
  if (piece === undefined) return [];
  const aim = cueAimAt(l, { x: piece.crackX, y: (piece.y0 + piece.y1) / 2 });
  // One mark per crack, so moving to the next is a new mark rather than this one leaping.
  const cue = markAt(2, "HOLD", "HOLD", aim.x, aim.y, l, 530 + s.cursor * 10 + i);
  return [{ ...cue, aim, why: "TO CUT IT" }];
}
