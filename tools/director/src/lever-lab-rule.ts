import type { Point } from "@neon-spore/content";
import { pullTrackPoint } from "@neon-spore/render";
import { BEAT_SECONDS } from "./hold-lab-rule.js";
import { depthOf, type LeverSetup, mineShape, partnerDepth } from "./lever-lab-setup.js";
import { freshPull, type LabPull, press as pressPull, tick as tickPull } from "./pull-lab-rule.js";
import { nearest, strayReach } from "./pull-lab-stray.js";

/**
 * **The one generic LEVER, as THE LEVER LAB plays it** — LEVER — CARRY TO A
 * DEPTH AND HOLD's SUGGESTED line made a toy: *one drawn groove, one reach,
 * one grip threshold, one spring-back*. The PULL LAB's knob and channel
 * (`pull-lab-rule.ts`), with what a lever has and a pull does not:
 *
 * - **the depth is the value**, for as long as the thumb stays: carrying to
 *   the end counts nothing by itself, and the knob stands where it is put;
 * - **a zone on the groove** (`LeverAsk`): none (the depth alone is read),
 *   past a grip, or inside a band — and held there for the beats the HOLD
 *   LAB counts (`HOLD_ASKS`); out of the zone, the count starts again;
 * - **a lift springs it back**, counted or not; let go before the count is
 *   refused, red, as the owner picked for the pull (*short · red*), and half
 *   a tile off the groove fails (*off path · fails past 1/2 tile*);
 * - **a pair** (`LeverPair`): the partner's lever beside it, played by the
 *   lab, and the zone asked of each (BOTH) or of the two summed (SUMMED) —
 *   two of the three ways the game sums a pair today.
 *
 * Seconds, not ticks: the director's own clock, nothing the game stores.
 */

/** How fast the partner's knob follows: a share of the way each second. */
const PARTNER_EASE = 5;

export interface LabLever {
  /** The hand's lever: the PULL LAB's knob, whose `full` phase is counted with the thumb down. */
  mine: LabPull;
  /** The partner's depth, 0..1; always 0 for ONE. */
  theirs: number;
  /** How much of the hold in the zone is done, 0..1. */
  fill: number;
}

export function freshLever(setup: LeverSetup): LabLever {
  return { mine: freshPull(mineShape(setup)), theirs: 0, fill: 0 };
}

/** The value the zone is asked of: the hand's depth, or the pair's mean when summed. */
export function leverValue(setup: LeverSetup, l: LabLever): number {
  const mine = depthOf(mineShape(setup), l.mine.at);
  return setup.pair === "summed" ? (mine + l.theirs) / 2 : mine;
}

const inside = (z: readonly [number, number], v: number): boolean =>
  v >= z[0] - 1e-6 && v <= z[1] + 1e-6;

/** The zone met now: by the value, and for TWO · EACH by the partner's depth too. */
export function inZone(setup: LeverSetup, l: LabLever): boolean {
  const z = setup.ask.zone;
  if (!z) return false;
  if (!inside(z, leverValue(setup, l))) return false;
  return setup.pair !== "both" || inside(z, l.theirs);
}

const held = (p: LabPull): boolean => p.phase === "held" || p.phase === "full";

export function press(setup: LeverSetup, l: LabLever, at: Point): boolean {
  const ok = pressPull(mineShape(setup), l.mine, at);
  if (ok) l.fill = 0;
  return ok;
}

/** The knob follows the thumb along the groove and stands where it is put; off it is a failure. */
export function move(setup: LeverSetup, l: LabLever, at: Point, touch = false): void {
  const p = l.mine;
  if (!held(p)) return;
  const s = mineShape(setup);
  const n = nearest(s.track, p.at, at);
  const q = pullTrackPoint(s.track, n.k);
  p.off = { x: at.x - q.x, y: at.y - q.y };
  const reach = strayReach("half", touch);
  if (reach !== null && n.off > reach) {
    p.phase = "home";
    verdict(p, "strayed");
    p.strayed++;
    p.slow = true;
    l.fill = 0;
    return;
  }
  p.at = n.k;
  if (s.origin > 0 && Math.abs(p.at - s.origin) > 0.04) p.sign = p.at > s.origin ? 1 : -1;
}

function verdict(p: LabPull, v: "counted" | "refused" | "strayed"): void {
  p.verdict = v;
  p.since = 0;
  p.age = 0;
  p.from = { at: p.at, off: { ...p.off } };
  p.last = v === "counted" ? "counted" : "refused";
}

/** Let go: it springs back whatever it came to; a zone not yet held through is refused. */
export function lift(setup: LeverSetup, l: LabLever): void {
  const p = l.mine;
  if (!held(p)) return;
  p.lifted = 0;
  const was = p.phase;
  p.phase = "home";
  l.fill = 0;
  if (was === "full" || !setup.ask.zone) return;
  // A lever that never left its rest is a tap, and a tap is never refused.
  if (depthOf(mineShape(setup), p.at) < 0.04) return;
  verdict(p, "refused");
  p.refused++;
  p.slow = true;
}

/** The clock: the partner follows, the hold in the zone fills, and a knob let go springs back. */
export function tick(setup: LeverSetup, l: LabLever, dt: number): void {
  const p = l.mine;
  const want = setup.pair !== "one" && held(p) ? partnerDepth(setup) : 0;
  l.theirs += (want - l.theirs) * Math.min(1, PARTNER_EASE * dt);
  if (p.phase === "held" && setup.ask.zone) {
    l.fill = inZone(setup, l) ? Math.min(1, l.fill + dt / (setup.beats.beats * BEAT_SECONDS)) : 0;
    if (l.fill >= 1) {
      p.phase = "full";
      verdict(p, "counted");
      p.counted++;
    }
  }
  // The PULL LAB's clock springs the knob home and fades the verdict.
  tickPull(mineShape(setup), p, dt);
}
