import type { Point } from "@neon-spore/content";
import { PULL_TRACK_W, type PullTrack } from "@neon-spore/render";
import { BEAT_SECONDS } from "./hold-lab-rule.js";
import { freshPull, type LabPull, lift, move, press, tick } from "./pull-lab-rule.js";
import { LAB_KNOB, LAB_TILE, LAB_W, type LabShape } from "./pull-lab-shapes.js";

/**
 * **Two gestures in one action, as THE COMBO LAB plays them** — the owner,
 * 12 October 2026, on THE LAMPREY: *treat pull and hold as a new separate
 * category of action, either to wait for other player or just for some time
 * — so combining user on screen actions in a same action.*
 *
 * The pull is the PULL LAB's own rule (`pull-lab-rule.ts`), its picks
 * unchanged: short is refused, red; half a tile off the path fails. **The
 * whole way is not a count here but the start of a hold**: the knob stays at
 * the end under the thumb, and is counted only when the hold is done —
 *
 * - **`beats`**: once it has been held there for the beats the combo asks;
 * - **`partner`**: once the partner — the lab's own hand, on a knob of its
 *   own drawn the way the game draws a partner's, with no channel — has
 *   pulled theirs the whole way. Their pull only goes while this one is held
 *   at the end, as THE LAMPREY's head only comes while the tail is out.
 *
 * Let go before the hold is done, it is refused, red, and the knob goes
 * home — the partner's with it. Seconds, not ticks: nothing here is stored
 * by the game.
 */

export type ComboKey = "beats" | "partner";

export interface Combo {
  key: ComboKey;
  label: string;
  /** What the hold at the end waits for, in a sentence. */
  says: string;
  /** Which rows of the CONTROLS page ask it today. */
  like: string;
  /** Beats held at the end, for `beats`. */
  beats: number;
  /** The partner's knob: its own track, pulled by the lab's hand. */
  partner: PullTrack | null;
  shape: LabShape;
}

/** How long the partner takes to come in once the hold is on, and to pull the whole way. */
export const PARTNER_WAKES = 0.5;
export const PARTNER_PULLS = 1.6;
/** Seconds after a count, with the hand off, before a fresh knob comes in. */
export const FRESH_AFTER = 0.45;

const LEN = LAB_TILE * 5;
/** The channel's width, the PULL LAB's (`pull-lab-shapes.ts`). */
const W = LAB_KNOB * PULL_TRACK_W;

/** A straight pull down the field at `x`, the PULL LAB's DOWN moved sideways. */
export function downShape(x: number): LabShape {
  const track: PullTrack = {
    pts: [
      { x, y: LAB_TILE * 3 },
      { x, y: LAB_TILE * 3 + LEN },
    ],
    w: W,
  };
  return { key: "down", label: "DOWN", direction: "down", like: "", track, origin: 0 };
}

/** The partner's knob: up the right of the field, THE LAMPREY's head off its tile. */
export const PARTNER_TRACK: PullTrack = {
  pts: [
    { x: LAB_W * 0.72, y: LAB_TILE * 9.5 },
    { x: LAB_W * 0.72, y: LAB_TILE * 9.5 - LEN * 0.8 },
  ],
  w: W,
};

export const COMBOS: readonly Combo[] = [
  {
    key: "partner",
    label: "PULL, HOLD FOR THE PARTNER",
    says: "pulled the whole way, then held at the end until the partner has pulled theirs",
    like: "THE LAMPREY's tail in an apart or a tow, held out while the head is pulled",
    beats: 0,
    partner: PARTNER_TRACK,
    shape: downShape(LAB_W * 0.3),
  },
  {
    key: "beats",
    label: "PULL, HOLD FOR 2 BEATS",
    says: "pulled the whole way, then held at the end for two beats",
    like: "no row yet — the same action with a clock in the partner's place",
    beats: 2,
    partner: null,
    shape: downShape(LAB_W / 2),
  },
];

export const comboOf = (key: string): Combo =>
  COMBOS.find((c) => c.key === key) ?? (COMBOS[0] as Combo);

export type ComboVerdict = "counted" | "refused" | "strayed";

export interface LabCombo {
  /** The thumb's pull: the PULL LAB's state, a whole pull being the hold's start. */
  pull: LabPull;
  /** `hold` while the knob is held at the end; `done` counted, the hand still down. */
  phase: "pull" | "hold" | "done";
  /** How much of the hold is done, 0..1: the beats, or the partner's pull. */
  fill: number;
  /** Seconds the hold has been on, and since the hand last came off one. */
  held: number;
  verdict: ComboVerdict | null;
  /** Seconds since the verdict. */
  since: number;
  /** The fill when the verdict came, for a refusal to drain from. */
  from: number;
  counted: number;
  refused: number;
  strayed: number;
  /** Counted, and its fresh knob has not come in yet. */
  waiting: boolean;
}

export function freshCombo(c: Combo): LabCombo {
  return {
    pull: freshPull(c.shape),
    phase: "pull",
    fill: 0,
    held: 0,
    verdict: null,
    since: 0,
    from: 0,
    counted: 0,
    refused: 0,
    strayed: 0,
    waiting: false,
  };
}

function give(s: LabCombo, v: ComboVerdict): void {
  s.verdict = v;
  s.since = 0;
  s.from = s.fill;
}

export function pressCombo(c: Combo, s: LabCombo, at: Point): boolean {
  if (s.waiting || s.phase !== "pull") return false;
  const took = press(c.shape, s.pull, at);
  if (took) s.verdict = null;
  return took;
}

export function moveCombo(c: Combo, s: LabCombo, at: Point): void {
  if (s.phase !== "pull") return;
  const before = s.pull.strayed;
  move(c.shape, s.pull, at, "half");
  if (s.pull.strayed > before) {
    give(s, "strayed");
    s.strayed++;
    return;
  }
  if (s.pull.phase !== "full") return;
  // The whole way: not counted, held — the knob stays at the end, no verdict on it.
  s.pull.counted--;
  s.pull.verdict = null;
  s.pull.last = null;
  s.phase = "hold";
  s.held = 0;
  s.fill = 0;
}

export function liftCombo(c: Combo, s: LabCombo): void {
  if (s.phase === "done") {
    s.phase = "pull";
    lift(c.shape, s.pull, "refuse");
    return;
  }
  if (s.phase === "hold") {
    // Let go at the end before the hold is done: refused, and home slowly.
    s.phase = "pull";
    give(s, "refused");
    s.refused++;
    const p = s.pull;
    p.phase = "home";
    p.verdict = "refused";
    p.last = "refused";
    p.since = 0;
    p.age = 0;
    p.from = { at: p.at, off: { ...p.off } };
    p.slow = true;
    p.lifted = 0;
    s.fill = 0;
    return;
  }
  const before = s.pull.refused;
  lift(c.shape, s.pull, "refuse");
  if (s.pull.refused > before) {
    give(s, "refused");
    s.refused++;
  }
}

/** The clock: the hold fills — by the beats, or as the partner pulls — and a fresh knob comes in. */
export function tickCombo(c: Combo, s: LabCombo, dt: number): void {
  tick(c.shape, s.pull, dt);
  if (s.verdict) s.since += dt;
  if (s.waiting && s.phase === "pull" && s.pull.phase === "idle" && s.since >= FRESH_AFTER) {
    const kept = s;
    Object.assign(s, freshCombo(c), {
      counted: kept.counted,
      refused: kept.refused,
      strayed: kept.strayed,
    });
  }
  if (s.phase !== "hold") return;
  s.held += dt;
  s.fill =
    c.partner === null
      ? Math.min(1, s.held / (c.beats * BEAT_SECONDS))
      : Math.min(1, Math.max(0, s.held - PARTNER_WAKES) / PARTNER_PULLS);
  if (s.fill < 1) return;
  give(s, "counted");
  s.counted++;
  s.phase = "done";
  s.waiting = true;
  s.pull.verdict = "counted";
  s.pull.last = "counted";
  s.pull.since = 0;
  s.pull.age = 0;
  s.pull.from = { at: s.pull.at, off: { x: 0, y: 0 } };
}

/** How far along their track the partner's knob is, 0..1: the fill, draining after a refusal. */
export function partnerAt(s: LabCombo): number {
  if (s.phase !== "pull") return s.fill;
  if (s.verdict === "refused") return s.from * Math.max(0, 1 - s.since / 0.5);
  return 0;
}
