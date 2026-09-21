import type { BossPart } from "@neon-spore/content";
import type { SimConfig, World } from "@neon-spore/sim";
import type { AnchorPoint } from "./caption-anchor.js";
import { box } from "./caption-anchor-box.js";
import { gaugeDial } from "./gauge-round.js";
import type { Layout } from "./layout.js";
import { mazeDrum } from "./maze-walls.js";
import { repriseTearBox } from "./reprise-draw.js";

/**
 * **Where the fixtures of THE GAUGE, THE MAZE and THE REPRISE are** — the
 * sixth of `caption-anchor-boss.ts`, split off `-e` on line count.
 *
 * **These three are rounds and not bosses**, and that was the question the
 * queue entry left open: a round is its own picture, and one that throws the
 * field away might have wanted an anchor of its own beside `boss` rather than
 * a line in here. It did not. All three are installed as `world.boss` — a
 * round has been a boss wave since the eleven behind THE GAUGE cost an entry
 * rather than a panel — so `bossAnchor` already reaches them, and each has
 * exactly one fixture its film has a page about. The whole of the difference
 * is that none of these takes a `part`.
 *
 * PINBALL is the fourth film of that entry and has no line here at all: its
 * one page is *the cannon also catches*, and the cannon already has an anchor
 * — `{ at: "ship" }`, the swelling on the hull it is reached through. THE
 * CLAW's two pages ended the same way. A kind with no page asking for it
 * would be a branch nothing calls.
 */

export function bossAnchorF(
  l: Layout,
  world: World,
  _part: BossPart | undefined,
): AnchorPoint | null {
  const cfg = world.cfg;
  const kind = world.boss?.kind;
  if (kind === "gauge") return gaugeFace(l);
  if (kind === "maze") return mazeWheel(l, cfg);
  if (kind === "reprise") return box(repriseTearBox(l, cfg));
  return null;
}

/**
 * THE GAUGE: the dial, which is the round. It is a half-circle standing on
 * its pivot, so the ring is half as tall as it is wide — the one shape in the
 * game for which that is the honest box rather than a concession
 * (`gauge-round.ts` places it, and the marks and the needle are both inside
 * it; neither is a page's subject on its own).
 */
function gaugeFace(l: Layout): AnchorPoint {
  const dial = gaugeDial(l);
  return box({ x: dial.cx, y: dial.cy - dial.r * 0.5, rx: dial.r, ry: dial.r * 0.5 });
}

/**
 * THE MAZE: the drum of rings over the ship, the one gap in its rim and all.
 * `mazeDrum` is the circle the walls are drawn in, the string hangs off and a
 * press is answered against — three files and one circle, and this is the
 * fourth to ask it rather than the first to guess.
 */
function mazeWheel(l: Layout, cfg: SimConfig): AnchorPoint {
  const drum = mazeDrum(l, cfg);
  return box({ x: drum.cx, y: drum.cy, rx: drum.r, ry: drum.r });
}
