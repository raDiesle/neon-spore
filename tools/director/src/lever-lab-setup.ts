import { PULL_TRACK_W, type PullTrack } from "@neon-spore/render";
import { type HoldAsk, holdAsk } from "./hold-lab-rule.js";
import { LAB_H, LAB_KNOB, LAB_TILE, LAB_W, type LabShape } from "./pull-lab-shapes.js";

/**
 * **What THE LEVER LAB can be set to** (`lever-lab.ts`): what the lever
 * asks, its groove, its seats and the beats of its hold — each a choice on
 * the bar, all four one key in the URL — and the grooves themselves, in the
 * PULL LAB's field pixels (`pull-lab-shapes.ts`). The rule that plays them
 * is `lever-lab-rule.ts`.
 */

export type LeverAskKey = "depth" | "grip" | "band";

export interface LeverAsk {
  key: LeverAskKey;
  label: string;
  /** Where on the groove the value must be, as depths 0..1; null asks nothing. */
  zone: readonly [number, number] | null;
  like: string;
}

export const LEVER_ASKS: readonly LeverAsk[] = [
  { key: "depth", label: "DEPTH ONLY", zone: null, like: "THE SPOOL's brake" },
  {
    key: "grip",
    label: "PAST A GRIP",
    zone: [0.6, 1],
    like: "THE HASP's latch, THE RATCHET's catch, THE MANTLE's knobs, THE VISE's lobes",
  },
  {
    key: "band",
    label: "IN A BAND",
    zone: [0.4, 0.7],
    like: "THE SINEW's handles, THE PLUMB's stones",
  },
];

export type LeverGrooveKey = "down" | "sideways";
export type LeverPair = "one" | "both" | "summed";

export const LEVER_GROOVES: readonly { key: LeverGrooveKey; label: string; like: string }[] = [
  { key: "down", label: "DOWN", like: "a knob down a rail" },
  {
    key: "sideways",
    label: "SIDEWAYS, EITHER WAY",
    like: "THE CAPSTAN's cradle, THE PLUMB's beam",
  },
];

export const LEVER_PAIRS: readonly { key: LeverPair; label: string; like: string }[] = [
  { key: "one", label: "ONE", like: "one seat" },
  { key: "both", label: "TWO · EACH", like: "THE MANTLE's two knobs, each deep enough" },
  { key: "summed", label: "TWO · SUMMED", like: "THE SINEW's two handles, read as one strain" },
];

/** What the lab is set to, and its key in the URL: `grip-down-one`. */
export interface LeverSetup {
  ask: LeverAsk;
  groove: LeverGrooveKey;
  pair: LeverPair;
  beats: HoldAsk;
}

export function leverSetup(key: string): LeverSetup {
  const [a, g, p, b] = key.split("-");
  return {
    ask: LEVER_ASKS.find((x) => x.key === a) ?? (LEVER_ASKS[1] as LeverAsk),
    groove: LEVER_GROOVES.find((x) => x.key === g)?.key ?? "down",
    pair: LEVER_PAIRS.find((x) => x.key === p)?.key ?? "one",
    beats: holdAsk(b ?? "2"),
  };
}

export const setupKey = (s: LeverSetup): string =>
  `${s.ask.key}-${s.groove}-${s.pair}-${s.beats.key}`;

const LEN = LAB_TILE * 5.5;
const W = LAB_KNOB * PULL_TRACK_W;
const MID = LAB_W / 2;
/** How far apart a pair's two grooves stand, either side of the middle. */
const APART = LAB_TILE * 2;

const line = (x0: number, y0: number, x1: number, y1: number): PullTrack => ({
  pts: [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
  ],
  w: W,
});

/** The groove a seat's lever runs in: `side` -1 for the hand's, 1 for the
 * partner's, 0 alone. A sideways groove rests in its middle. */
export function grooveOf(groove: LeverGrooveKey, side: -1 | 0 | 1): LabShape {
  if (groove === "down") {
    const x = MID + side * APART;
    return {
      key: "down",
      label: "DOWN",
      direction: "down",
      like: "",
      track: line(x, LAB_TILE * 3, x, LAB_TILE * 3 + LEN),
      origin: 0,
    };
  }
  const y = LAB_H / 2 + side * APART;
  const half = LAB_TILE * 3.6;
  return {
    key: "sideways",
    label: "SIDEWAYS",
    direction: "signed",
    like: "",
    track: line(MID - half, y, MID + half, y),
    origin: 0.5,
  };
}

/** How deep a knob is, 0..1, whichever way a two-way groove was carried. */
export const depthOf = (s: LabShape, at: number): number =>
  s.origin === 0 ? at : Math.min(1, Math.abs(at - s.origin) / s.origin);

/** Where along the groove a depth stands, on the side `sign` names. */
export const atOf = (s: LabShape, depth: number, sign: 1 | -1 = 1): number =>
  s.origin === 0 ? depth : s.origin + sign * depth * s.origin;

/** The partner's depth while the hand holds: in its zone for TWO · EACH, a
 * share of the strain for TWO · SUMMED, so the hand finds the rest. */
export const PARTNER_SUM = 0.5;
export function partnerDepth(setup: LeverSetup): number {
  if (setup.pair === "summed") return PARTNER_SUM;
  const z = setup.ask.zone;
  return z ? (z[0] + Math.min(1, z[1])) / 2 : 0.6;
}

/** The hand's groove: alone in the middle, or the left of a pair. */
export const mineShape = (setup: LeverSetup): LabShape =>
  grooveOf(setup.groove, setup.pair === "one" ? 0 : -1);
export const theirShape = (setup: LeverSetup): LabShape => grooveOf(setup.groove, 1);
