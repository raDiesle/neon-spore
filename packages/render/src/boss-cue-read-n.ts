import {
  type GorgeState,
  gorgeBottom,
  gorgeColOf,
  gorgeDue,
  gorgeLevelOf,
  gorgePhase,
  gorgeSated,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { markAt } from "./boss-cue-frame.js";
import { gorgeBubbleAt } from "./gorge-place.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **What THE GORGE is asking for** — page fourteen of the readings, its own
 * page because `boss-cue-read.ts` held three fights in 199 lines of its 250.
 *
 * The fight is *which bubble, how many, and in what colour*, and the pilot is
 * the seat shown the counts and the order (`gorge-draw.ts`), so **which**
 * bubble is his to pick and say. A word that sent him to a column while the
 * choice was still his would be the field overruling the one decision this
 * boss hands him — so on a row in any order the reading says nothing at all.
 *
 * **Where the column is not his choice, `MOVE` stands on the cannon**: on an
 * ordered row, the one bubble due; on a ring, the middle column, the only
 * one the bottom bubble can be shot up (`sim/gorge-step.ts`). Never when the
 * cannon is already there.
 *
 * **`TAP` stands on a ring's bottom bubble while it is shut and due**, on the
 * pilot's screen: his thumb opens it (`sim/gorge-hand.ts`), and the ring will
 * turn it away on its count, so it is the word with a clock on it.
 *
 * **And the navigator is told only what the cannon's own column can
 * answer**: `FIRE` over the bubble in the cannon's column, when it is due and
 * open. THE THROAT's pairing — one gesture across two seats — so while the
 * cannon is elsewhere she is told nothing rather than told to fire up a lane
 * the shot cannot reach the bubble from. *Which colour* is never written: it
 * is on her screen already, in the bubble's floor, and saying it is the
 * sentence the fight is.
 *
 * Nothing between levels and nothing in `out`.
 */

/**
 * THE GORGE. Three moments: the tap on the pilot's screen outranks the
 * column, because the ring is turning on it and the cannon can follow a beat
 * later; on hers there is only the one.
 */
export function gorgeCues(l: Layout, world: World, g: GorgeState): readonly BossCue[] {
  const cfg = world.cfg;
  const phase = gorgePhase(g);
  if (phase !== "row" && phase !== "ring") return [];
  const level = gorgeLevelOf(g);
  const out: BossCue[] = [];

  // The bubble owed now, where there is exactly one.
  let due = -1;
  if (phase === "ring") due = gorgeBottom(g);
  else if (level.ordered) due = g.intakes.findIndex((_, i) => gorgeDue(g, i));
  const k = g.intakes[due];
  const owed = k !== undefined && !gorgeSated(k) && gorgeDue(g, due);
  const shut = phase === "ring" && k !== undefined && k.taps < cfg.gorgeOpenTaps;

  if (owed && shut) {
    const p = gorgeBubbleAt(l, cfg, g, due);
    out.push({ ...markAt(1, "PRESS", "TAP", p.x, p.y - l.tile * 0.5, l, 76), why: "TO OPEN IT" });
  }
  const dueCol = owed ? gorgeColOf(cfg, g, due) : -1;
  if (dueCol >= 0 && dueCol !== world.cannonCol) {
    out.push(markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 77));
  }

  // Hers: the bubble up the cannon's column, if a shot there would be taken.
  const here = g.intakes.findIndex((_, i) => gorgeColOf(cfg, g, i) === world.cannonCol);
  const h = g.intakes[here];
  const open = phase !== "ring" || (h !== undefined && h.taps >= cfg.gorgeOpenTaps);
  if (h !== undefined && !gorgeSated(h) && gorgeDue(g, here) && open) {
    const p = gorgeBubbleAt(l, cfg, g, here);
    out.push({ ...markAt(2, "PRESS", "FIRE", p.x, p.y - l.tile * 0.5, l, 34), why: "TO FEED IT" });
  }
  return out;
}
