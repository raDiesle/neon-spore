import type { BossPart } from "@neon-spore/content";
import {
  type BatonState,
  batonBoss,
  type CandleState,
  candleBoss,
  DIASTOLE_SIDES,
  diastoleBoss,
  diastoleChamberCol,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { socketPoint, socketReach } from "./baton-socket-draw.js";
import { candleFlameY } from "./candle-glow.js";
import type { AnchorPoint } from "./caption-anchor.js";
import { bossAnchorD } from "./caption-anchor-boss-d.js";
import { around, box } from "./caption-anchor-box.js";
import { diastoleY } from "./diastole-draw.js";
import { type Layout, tileCX } from "./layout.js";
import { showsCandleFace } from "./view-role-clocks.js";

/**
 * **Where the fixtures of THE CANDLE, THE BATON and THE DIASTOLE are** — the
 * third of `caption-anchor-boss.ts`, split off `-b` on line count, and read
 * the same way: each line asks the boss's own draw file, and a part a screen
 * does not draw is no ring at all.
 *
 * These three came in the sweep that took the forty-three hull pages off the
 * hull (`docs/queue.md`, 18 September 2026). All three films said *the field
 * goes black*, *one sends and the other shoots*, *the left beats in threes* at
 * the middle of the hull, because a ring is only as good as the thing it can
 * be put round and there was nothing else nameable.
 */

export function bossAnchorC(
  l: Layout,
  world: World,
  part: BossPart | undefined,
  beatPhase: number,
): AnchorPoint | null {
  const cfg = world.cfg;
  const candle = candleBoss(world);
  if (candle !== null) return candlePart(l, candle, part);
  const baton = batonBoss(world);
  if (baton !== null) return batonArm(l, cfg, baton);
  const diastole = diastoleBoss(world);
  if (diastole !== null) return diastolePart(l, cfg, part);
  // The four of the fourth file, on the same line-count argument.
  return bossAnchorD(l, world, part, beatPhase);
}

/** How much of a tile the flame's own light is worth as a ring. */
const FLAME_RING = 0.7;

/**
 * THE CANDLE: the flame, wherever it hangs this frame — the root, plus
 * however far the pilot's thumb has carried it down the wick
 * (`candle-glow.ts`), so the ring is on the light rather than on the hook it
 * came off. `face`, the far end of the cone it eats flashes out of, and the
 * navigator is not shown that at all.
 */
function candlePart(l: Layout, c: CandleState, part: BossPart | undefined): AnchorPoint | null {
  if (part === "face") {
    if (!showsCandleFace(l.role)) return null;
    // The mouth of the cone, at the top of the faced column, where
    // `drawCandleGlow` lays its two far corners down.
    const r = l.tile * 0.5;
    return box({ x: tileCX(l, c.faceCol), y: l.gridTop + l.tile * 0.5, rx: r, ry: r });
  }
  const r = l.tile * FLAME_RING;
  return box({ x: tileCX(l, c.col), y: candleFlameY(l, c), rx: r, ry: r });
}

/**
 * THE BATON: the arm, from the base socket to the last one still on it — the
 * thing that is sent, and the whole of what *one sends, the other shoots* is
 * about. A shed socket is still drawn as a husk on the thread, so the ring
 * does not shrink up the arm as the fight is won (`baton-socket-draw.ts`).
 */
function batonArm(l: Layout, cfg: SimConfig, b: BatonState): AnchorPoint | null {
  return around(
    b.sockets.map((_, i) => socketPoint(l, cfg, b, i)),
    socketReach(l),
  );
}

/** How much of a tile a chamber is worth at rest. */
const CHAMBER_RX = 0.62;

/**
 * THE DIASTOLE: both chambers on their shelf, and `left` for the pilot's own
 * one — the chamber that beats in threes on his screen and stands grey on
 * hers, which is the one thing the two opening pages are about
 * (`diastole-draw.ts`). Both screens draw both chambers, so neither part is
 * ever no ring: what differs between the seats is the colour, not the mass.
 *
 * The state is not asked for, which is the one thing worth saying: a chamber
 * that has collapsed is drawn as a husk *where it hung*, so the shelf is the
 * same two columns from the first beat to the last.
 */
function diastolePart(l: Layout, cfg: SimConfig, part: BossPart | undefined): AnchorPoint | null {
  const y = diastoleY(l);
  const sides = part === "left" ? [-1 as const] : DIASTOLE_SIDES;
  return around(
    sides.map((side) => ({ x: tileCX(l, diastoleChamberCol(cfg, side)), y })),
    l.tile * CHAMBER_RX,
  );
}
