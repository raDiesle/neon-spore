import type { PullTrack, PullWay } from "@neon-spore/render";
import { PULL_TRACK_W } from "@neon-spore/render";

/**
 * **The shapes the one generic PULL can take**, for the PULL LAB
 * (`pull-lab.ts`). The owner, 10 October 2026, on PULL PAST A DISTANCE's
 * SUGGESTED line — *one generic PULL with the direction a named field (down ·
 * up · either · signed) and one drawn arrow for it* — asked to try that one
 * control on an empty field, straight, either way and along a curve, before
 * any wave is moved onto it.
 *
 * Each is a track in the lab's own field pixels (`LAB_W` × `LAB_H`, a tile of
 * `LAB_TILE`) and **where along it the hand takes hold**: 0 for a pull that
 * goes one way, ½ for one that may go either. There was a rope that went any
 * way, laid the way the hand went; the owner took that pull out of the game
 * (10 October 2026), and THE WARDEN's tether is a DOWN now.
 */

export const LAB_TILE = 34;
export const LAB_W = LAB_TILE * 9;
export const LAB_H = LAB_TILE * 12;
/** The knob's radius: the game's handles are about four tenths of a tile. */
export const LAB_KNOB = LAB_TILE * 0.42;

/** The four directions the suggestion names, and the path the lab adds. */
export type PullDirection = "down" | "up" | "either" | "signed" | "path";

export interface LabShape {
  key: string;
  label: string;
  direction: PullDirection;
  /** Which rows of PULL PAST A DISTANCE pull this way today — what it stands for. */
  like: string;
  track: PullTrack;
  /** 0 or ½: where the knob rests. */
  origin: number;
}

const W = LAB_KNOB * PULL_TRACK_W;
const MID = LAB_W / 2;

const straight = (x0: number, y0: number, x1: number, y1: number): PullTrack => ({
  pts: [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
  ],
  w: W,
});

/** `n` points along `f(u)` for u in [0, 1]. */
function curve(f: (u: number) => { x: number; y: number }, n = 40): PullTrack {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(f(i / n));
  return { pts, w: W };
}

const LEN = LAB_TILE * 5.5;

export const LAB_SHAPES: readonly LabShape[] = [
  {
    key: "down",
    label: "DOWN",
    direction: "down",
    like: "THE WARDEN's tether, THE HIVE's haul, THE VANE's housing, THE FLEET's wreck, THE LEDGER's pull",
    track: straight(MID, LAB_TILE * 3, MID, LAB_TILE * 3 + LEN),
    origin: 0,
  },
  {
    key: "up",
    label: "UP",
    direction: "up",
    like: "THE CURTAIN's hem, THE STARE's lashes",
    track: straight(MID, LAB_TILE * 9, MID, LAB_TILE * 9 - LEN),
    origin: 0,
  },
  {
    key: "either",
    label: "UP OR DOWN",
    direction: "either",
    like: "THE SCOUT's prime",
    track: straight(MID, LAB_H / 2 - LEN * 0.6, MID, LAB_H / 2 + LEN * 0.6),
    origin: 0.5,
  },
  {
    key: "signed",
    label: "SIDEWAYS, SIGNED",
    direction: "signed",
    like: "THE TRAPEZE's zones, THE TASTER's wipe, THE BLISTER's swipe",
    track: straight(MID - LAB_TILE * 3.6, LAB_H / 2, MID + LAB_TILE * 3.6, LAB_H / 2),
    origin: 0.5,
  },
  {
    key: "curve",
    label: "CURVE",
    direction: "path",
    like: "THE LAMPREY's head in a tow",
    // A quarter turn, down and out to the right, the way the eel's body bends.
    track: curve((u) => {
      const a = (u * Math.PI) / 2;
      const r = LAB_TILE * 4.2;
      return { x: LAB_TILE * 2 + r * (1 - Math.cos(a)), y: LAB_TILE * 3 + r * Math.sin(a) };
    }),
    origin: 0,
  },
  {
    key: "s",
    label: "S-CURVE",
    direction: "path",
    like: "THE ANTIPHON's vein, down to the organ",
    track: curve((u) => ({
      x: MID + LAB_TILE * 2.4 * Math.sin(u * Math.PI * 2),
      y: LAB_TILE * 2.5 + u * LAB_TILE * 7,
    })),
    origin: 0,
  },
];

export function labShape(key: string): LabShape {
  return LAB_SHAPES.find((s) => s.key === key) ?? (LAB_SHAPES[0] as LabShape);
}

/** The arrow's way, read off a straight track's two ends: from `origin` to `to`. */
export function wayAlong(t: PullTrack, to: 0 | 1): PullWay {
  const a = t.pts[0];
  const b = t.pts[t.pts.length - 1];
  if (!a || !b) return { dx: 0, dy: 1 };
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const s = to === 1 ? 1 : -1;
  return { dx: ((b.x - a.x) / len) * s, dy: ((b.y - a.y) / len) * s };
}
