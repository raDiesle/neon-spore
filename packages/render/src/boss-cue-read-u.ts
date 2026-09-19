import {
  type DiastoleState,
  diastoleBridgeCol,
  diastoleChamberCol,
  diastoleClamped,
  diastoleClampHolds,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { diastoleY } from "./diastole-draw.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **What THE DIASTOLE is asking for** — the readings' page `u`, split off
 * `boss-cue-read-c.ts` on 19 September 2026 alongside THE SCUTTLE, which
 * went to page `t`; THE LEAD stayed on page three, alone. The finding that
 * reserved page three (`docs/queue.md`) had already said what was left of it
 * to split: one page a boss, the way THE THROAT, THE ORRERY and THE LEDGER
 * had already gone to pages eleven, twelve and fifteen. The letter rather
 * than a number is page `s`'s own reason — a sibling lane is writing another
 * page the same day, and a number here would be a number about whichever of
 * the three lands first.
 *
 * THE DIASTOLE is the last of the three, and the plainest instance of the
 * rule that put them together: two counts, one each, and **neither is ever
 * cued** — `diastoleCues`' own doc comment below says which two and why.
 */

/** THE CHOIR's frame, in tiles, and the lift a mark takes over a hull line. */
const HALF_W = 0.72;
const HALF_H = 0.66;

function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W, halfH: l.tile * HALF_H, seed };
}

/**
 * THE DIASTOLE. Two counts, one each, and neither is ever cued — that is the
 * boss, and `diastole-bridge.ts` already refuses to say when the coincidence
 * is for the same reason.
 *
 * What is cued is the sentence the fight turns on: from the beat the right
 * chamber wakes, **a single-chamber hit stops landing** and only the beam in
 * the bridge's column takes anything at all. The bridge is the one part of
 * this body both screens read the same, so the mark is on it, and the word is
 * hers because the lance is filled by holding a colour.
 *
 * **Alone, the two words follow the thumb**, which is the half this reading
 * was missing until 18 September 2026: it wrote both of them for the whole of
 * the phase, and for most of the phase neither was true.
 *
 * - No thumb on the chamber: `HOLD` / `CLAMP` on the ring, his — the beat now
 *   has to be held as well as found (`diastole-clamp.ts`) — and **nothing at
 *   all to her**. The beam lands only under the clamp (`diastoleOpen`), so a
 *   word over the bridge before there is one is a word over a lance that is
 *   refusing, which is the objection THE MAZE's reading makes about a handle
 *   the ship has taken away.
 * - The clamp on and its window open: `HOLD` / `BURN` on the bridge, hers, and
 *   **nothing to him**. What the fight wants of his thumb then is *let go
 *   before the dial closes* — a clamp held past its window spasms the chamber
 *   — so `HOLD` would be the field asking for the failure, and the ring's own
 *   dial is the whole of what is left to say (`handle-draw.ts`).
 * - The window lapsed with the thumb still down: nothing on either screen. He
 *   is late, the dial has closed, and the next thing the round does is the
 *   spasm.
 *
 * It says *where* and *what* and never *when* — the when is the navigator's to
 * say, in both phases. A spasm cues nothing: there is nothing to hold for
 * eight beats, and the chamber's shudder is the whole of the announcement.
 */
export function diastoleCues(l: Layout, world: World, b: DiastoleState): readonly BossCue[] {
  if (b.phase !== "two" && b.phase !== "alone") return [];
  const y = diastoleY(l);
  const burn = markAt(2, "HOLD", "BURN", tileCX(l, diastoleBridgeCol(world.cfg)), y, l, 57);
  if (b.phase !== "alone") return [burn];
  if (!diastoleClamped(b)) {
    return [markAt(1, "HOLD", "CLAMP", tileCX(l, diastoleChamberCol(world.cfg, 1)), y, l, 79)];
  }
  return diastoleClampHolds(b, world.beat) ? [burn] : [];
}
