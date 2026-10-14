import {
  HYDRA_SPAN,
  type HydraState,
  type HydraStep,
  hydraPerSide,
  hydraRank,
  midCol,
  rimLapMilli,
  type SimConfig,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE HYDRA's geometry**: where the body hangs, how far it reaches, and
 * where every head of every kind stands on the field. It hangs over the
 * middle column, a slime with its necks run out from it, and its size is read
 * off the level, never kept: it is a little smaller for every level of heads
 * stopped.
 *
 * **A side's heads come down over its own column**, three out from the
 * middle (`hydraSideCol`) — the pilot's on the left, the navigator's on the
 * right — and the maws hang over the columns they open on. Every place here
 * is a function of the state, so the marks the next lane puts on a head find
 * it where it is drawn.
 */

/** The row the body's centre hangs on, in rows: under the seat switcher, with the field below it. */
export const HYDRA_ROW = 3.4;

/** How far the body reaches across at the first level, in tiles: half a column past the columns a bolt meets it in. */
export const HYDRA_BODY_TILES = HYDRA_SPAN + 0.5;

/** How much smaller the body is for each level stopped, in tiles. */
export const HYDRA_SHRINK_TILES = 0.15;

/** How tall the body stands against how wide it is. */
export const HYDRA_TALL = 0.8;

/** Where a side's top bite head hangs, the rows between two, and how far the window lets them fall. */
export const BITE_ROW = 6.2;
export const BITE_GAP_ROWS = 1.6;
export const BITE_FALL_ROWS = 2.2;
/** How far out each bite head under another stands, in tiles. */
export const BITE_STEP_TILES = 0.95;

/** Where along its neck, root to head, a bite neck is cut. */
export const CUT_ALONG = 0.78;

/** The row a coil lies wound on, and its innermost turn, in tiles. */
export const COIL_ROW = 10.9;
export const COIL_CORE_TILES = 0.32;

/** The row a side's head of eyes hangs on, how big it is, and the ring its eyes sit round. */
export const EYE_ROW = 8.0;
export const EYE_HEAD_TILES = 1.25;
export const EYE_RING_TILES = 0.72;

/** The row a maw hangs on at the middle, and how much lower each column out. */
export const MAW_ROW = 7.0;
export const MAW_DROOP_ROWS = 0.45;

/** A point on the screen. */
export interface At {
  x: number;
  y: number;
}

/** The body's centre on the screen, hung where it stands once in. */
export function hydraCentre(l: Layout, cfg: SimConfig): At {
  return { x: fieldX(l, midCol(cfg)), y: tileCY(l, HYDRA_ROW) };
}

/** How far the body reaches across from its centre now, in pixels. */
export function hydraReach(l: Layout, s: HydraState): number {
  return (HYDRA_BODY_TILES - HYDRA_SHRINK_TILES * s.cursor) * l.tile;
}

/** The screen x of a seat's side: over its own column, three out from the middle. */
export function hydraSideX(l: Layout, cfg: SimConfig, seat: 0 | 1): number {
  return fieldX(l, midCol(cfg) + (seat === 0 ? -3 : 3));
}

/** Which way a seat's side lies from the body on this screen: -1 left, 1 right. */
export function hydraSideSign(l: Layout, cfg: SimConfig, seat: 0 | 1): -1 | 1 {
  return hydraSideX(l, cfg, seat) < hydraCentre(l, cfg).x ? -1 : 1;
}

/**
 * Where a neck leaves the body: round its lower rim toward its side, the
 * upper heads nearer the shoulder. `slot` of `n` on that side; `r` the
 * body's reach now.
 */
export function hydraRoot(c: At, r: number, side: -1 | 1, slot: number, n: number): At {
  const a = 0.55 + (0.6 * (slot + 0.5)) / Math.max(1, n);
  return {
    x: c.x + side * Math.sin(a) * r * 0.9,
    y: c.y + Math.cos(a) * r * HYDRA_TALL * 0.9,
  };
}

/**
 * Bite head `i`'s jaw, fallen `fall` (0..1) of the way the window lets it. A
 * side's heads stand in a stair, the top one nearest the middle and each one
 * under it a step lower and further out, so no neck lies over another.
 */
export function hydraBiteAt(
  l: Layout,
  cfg: SimConfig,
  step: HydraStep,
  i: number,
  fall: number,
): At {
  const seat = i < hydraPerSide(step) ? 0 : 1;
  const rank = hydraRank(step, i);
  const side = hydraSideSign(l, cfg, seat);
  return {
    x:
      hydraSideX(l, cfg, seat) +
      side * (rank - (hydraPerSide(step) - 1) / 2) * BITE_STEP_TILES * l.tile,
    y: tileCY(l, BITE_ROW + rank * BITE_GAP_ROWS + fall * BITE_FALL_ROWS),
  };
}

/** A seat's coil's middle, where its head bites and its lever turns round. */
export function hydraCoilAt(l: Layout, cfg: SimConfig, seat: 0 | 1): At {
  return { x: hydraSideX(l, cfg, seat), y: tileCY(l, COIL_ROW) };
}

/** How far out a coil's outer turn lies now, in tiles: one ring a lap still wound. */
export function hydraCoilRing(cfg: SimConfig): number {
  return cfg.hydraCoilRimMilli / 1000;
}

/** Laps a seat's coil still has wound, fractional: the laps asked less what it has turned off. */
export function hydraWound(cfg: SimConfig, s: HydraState, seat: 0 | 1, laps: number): number {
  const lap = rimLapMilli(cfg.hydraCoilRimMilli);
  return Math.max(0, laps - s.unwoundMilli[seat] / lap);
}

/** A seat's head of eyes. */
export function hydraEyeHeadAt(l: Layout, cfg: SimConfig, seat: 0 | 1): At {
  return { x: hydraSideX(l, cfg, seat), y: tileCY(l, EYE_ROW) };
}

/** Eye `k` of `n` round its head, the first at the top, going round toward the body. */
export function hydraEyeAt(l: Layout, head: At, side: -1 | 1, k: number, n: number): At {
  const a = -Math.PI / 2 - side * ((Math.PI * 2 * k) / n);
  const ring = EYE_RING_TILES * l.tile;
  return { x: head.x + Math.cos(a) * ring, y: head.y + Math.sin(a) * ring * 0.92 };
}

/** How big an eye is, in tiles: smaller the more there are. */
export function hydraEyeSize(n: number): number {
  return n > 4 ? 0.25 : 0.3;
}

/** Maw `i`'s head, over the column it opens on. */
export function hydraMawAt(l: Layout, cfg: SimConfig, step: HydraStep, i: number): At {
  const off = step.offsets?.[i] ?? 0;
  return {
    x: fieldX(l, midCol(cfg) + off),
    y: tileCY(l, MAW_ROW + Math.abs(off) * MAW_DROOP_ROWS),
  };
}
