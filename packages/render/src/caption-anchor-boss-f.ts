import type { BossPart } from "@neon-spore/content";
import type { SimConfig, SpoolState, World } from "@neon-spore/sim";
import type { AnchorPoint } from "./caption-anchor.js";
import { box } from "./caption-anchor-box.js";
import { flueCentre, flueSlotHalf, flueUnitR } from "./flue-shape.js";
import { gaugeDial } from "./gauge-round.js";
import type { Layout } from "./layout.js";
import { mazeDrum } from "./maze-walls.js";
import { repriseTearBox } from "./reprise-draw.js";
import { spoolPlaced } from "./spool-pose.js";
import { spoolGaugeAt } from "./spool-shape.js";
import { trapezeOnArc } from "./trapeze-shape.js";

/**
 * **Where the fixtures of THE GAUGE, THE MAZE and THE REPRISE are** — the
 * sixth of `caption-anchor-boss.ts`, split off `-e` on line count — and THE
 * SPOOL's gauge, THE FLUE's row and THE TRAPEZE's swing, the newest bosses
 * whose films asked, because this file had room.
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
  beatPhase: number,
): AnchorPoint | null {
  const cfg = world.cfg;
  const kind = world.boss?.kind;
  if (kind === "gauge") return gaugeFace(l);
  if (kind === "maze") return mazeWheel(l, cfg);
  if (kind === "reprise") return box(repriseTearBox(l, cfg));
  if (world.boss?.kind === "spool") return spoolGauge(l, world, world.boss, beatPhase);
  if (kind === "flue") return flueRow(l, cfg);
  if (kind === "trapeze") return trapezeSwing(l, cfg);
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

/**
 * THE SPOOL: the navigator's gauge under the barrel, which is the half of the
 * fight only her screen shows — both of the film's pages on her seat are
 * about it. Asked of the pose the drawing hangs it off (`spoolPlaced`), so a
 * caption follows the body in as it swings on rather than waiting where it
 * will come to rest. The box is the track and the bead's height, no more: a
 * box round the whole body would stand the caption off the gauge by the
 * height of the flanges.
 */
function spoolGauge(l: Layout, world: World, s: SpoolState, beatPhase: number): AnchorPoint {
  const pose = spoolPlaced(l, world.cfg, s, world.beat, beatPhase);
  const { mid, half } = spoolGaugeAt(l, pose);
  return box({ x: mid.x, y: mid.y, rx: half, ry: l.tile * 0.3 });
}

/**
 * THE FLUE: the row of flesh the spore runs in, end to end. Every page of
 * its film is about the spore and the sight on that row — seen, called, shot
 * at blind — so the box is the row and the caption stands clear under it.
 * The flue's sway on its strings is a tilt round the sight, too small to
 * walk a caption off it.
 */
function flueRow(l: Layout, cfg: SimConfig): AnchorPoint {
  const c = flueCentre(l, cfg);
  return box({ x: c.x, y: c.y, rx: flueSlotHalf(l, cfg), ry: flueUnitR(l) });
}

/**
 * THE TRAPEZE: the bottom of the swing, where the alien passes, as wide as
 * it swings in a film. Every page of its film is about the swing coming back
 * over a side, so the box stays still while the alien goes through it — a
 * caption walking with the swing would be unreadable — and the caption
 * stands clear under it, over the zones.
 */
function trapezeSwing(l: Layout, cfg: SimConfig): AnchorPoint {
  const c = trapezeOnArc(l, cfg, 0, -SWING_UP);
  return box({ x: c.x, y: c.y, rx: SWING_HALF * l.tile, ry: SWING_UP * l.tile });
}

/** THE TRAPEZE's box: how far up the ropes it reaches and how wide it is, in tiles. */
const SWING_UP = 0.9;
const SWING_HALF = 3;
