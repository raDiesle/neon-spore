import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE LAMPREY: a sucker mouth bitten onto the hull, crawling along it, one
 * seat's thumb pinning the jaw and the other's knocking its teeth out one at
 * a time; then a gullet that has to be shot in the colour it shows
 * (`docs/spec/bosses-choreographed.md` §41).
 *
 * **The rule is one sentence**: one of you keeps a thumb on the crawling jaw,
 * and the other taps the one lit tooth before it snaps back.
 *
 * `lampreyJaw` is `FollowTarget`, the reading of THE FLUE's tap and THE
 * GALL's pinch (`gall-hand.ts`): the drag's `id` is the column under the
 * thumb and `on` whether it is down, so the jaw is held while the pinner's
 * thumb is within `lampreyGripCols` of `jawCol` — wherever the jaw has crawled
 * to. `lampreyTooth` is `RepeatedTap`, THE VALVE's edge (`valve-hand.ts`) with
 * the tooth as its `id`: only the lit tooth cracks, and after it the lit tooth
 * jumps two places round the ring, never to the one beside it.
 *
 * **Neither hand gates the other**, and the two fail in two pictures: a tap
 * that misses, or a tooth's window run out, snaps the last tooth back in; a
 * jaw let go deepens `biteMilli`, and a full bite is a hull hit, the wave.
 *
 * **Its health is the teeth.** Five of the seven knocked out over two bites
 * drop the mouth off the hull; the last two stay, and are bitten with again
 * every time a shot at the gullet runs out. The gullet takes three hits.
 */

/** Teeth on the ring. */
export const LAMPREY_TEETH = 7;
/** How far round the ring the lit tooth jumps after a crack: never the one beside it. */
export const LAMPREY_JUMP = 2;

/**
 * Where the scene is: swimming in, a bite on the hull, pulling off it between
 * bites, reared over the hull with the gullet lit, recoiling from a hit, and
 * limp, falling away, spent.
 */
export const LAMPREY_PHASES = ["entering", "bite", "loose", "rearing", "recoil", "spent"] as const;
export type LampreyPhase = (typeof LAMPREY_PHASES)[number];

/** What a step asks: a bite to pin and pull teeth from, or a shot at the gullet. */
export const LAMPREY_ASKS = ["bite", "gullet"] as const;
export type LampreyAsk = (typeof LAMPREY_ASKS)[number];

/**
 * One step of the script, authored on the wave. **A gullet step's bite fields
 * are its re-bite**: what the eel lunges with when the shot runs out.
 */
export interface LampreyStep {
  ask: LampreyAsk;
  /** The seat that pins the jaw; the other taps the teeth. */
  pinner: 1 | 2;
  /** Teeth the bite asks to have knocked out. */
  teeth: number;
  /** Beats each lit tooth waits for its tap before it snaps back. */
  toothBeats: number;
  /** The hull column the mouth bites onto. */
  col: number;
  /** Which way the jaw crawls first: -1 left, 1 right. */
  crawl: -1 | 1;
  /** Beats between one crawl of a column and the next. */
  crawlBeats: number;
  /** The colour a shot must be, or `"either"`. Only a gullet step reads it. */
  color: Color | "either";
  /** Beats a gullet step stays lit for its shot. A bite reads nothing here. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface LampreyEntry {
  kind: "lamprey";
  steps: readonly LampreyStep[];
}

export interface LampreyState {
  kind: "lamprey";
  /** Copied at install and never written again. */
  steps: LampreyStep[];
  phase: LampreyPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** The hull column the mouth is on. */
  jawCol: number;
  /** Which way it is crawling: -1 left, 1 right. */
  crawlDir: -1 | 1;
  /** `world.beat` it last crawled. */
  crawlBeat: number;
  /** How deep the bite is, thousandths of a full bite. It carries from bite to bite. */
  biteMilli: number;
  /** The teeth knocked out for good, a mask of `LAMPREY_TEETH` bits. */
  teethOut: number;
  /** The tooth lit while a bite is on; the last one lit between bites. */
  litTooth: number;
  /** `world.beat` the lit tooth's window began. */
  toothBeat: number;
  /** The teeth cracked in this bite, in order; a snap puts the last one back. */
  pulled: number[];
  /** Whether this bite is a gullet step's re-bite, whose teeth are not lost. */
  rebiting: boolean;
  /** Shots the gullet has taken. */
  hits: number;
  /** The column under each seat's thumb on the jaw, or -1 with it up. */
  holdCol: [number, number];
  /** Whether each seat's thumb is down on the teeth, so a tap is an edge. */
  tapDown: [boolean, boolean];
}

export function lampreyBoss(world: World): LampreyState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "lamprey" ? boss : null;
}

/** The step lit or being re-bitten for, or null with none. */
export function lampreyStep(s: LampreyState): LampreyStep | null {
  return s.steps[s.cursor] ?? null;
}

/** Whether a bite is on: the jaw to pin and a tooth lit. */
export function lampreyBiting(s: LampreyState): boolean {
  return s.phase === "bite";
}

/** The seat pinning the jaw in the bite that is on, or null. */
export function lampreyPinner(s: LampreyState): 1 | 2 | null {
  return lampreyBiting(s) ? (lampreyStep(s)?.pinner ?? null) : null;
}

/** The seat tapping the teeth in the bite that is on — the one not pinning — or null. */
export function lampreyTapper(s: LampreyState): 1 | 2 | null {
  const pinner = lampreyPinner(s);
  return pinner === null ? null : pinner === 1 ? 2 : 1;
}

/** Whether a tooth is still on the ring: neither out for good nor cracked in this bite. */
export function lampreyToothIn(s: LampreyState, tooth: number): boolean {
  return (s.teethOut & (1 << tooth)) === 0 && !s.pulled.includes(tooth);
}

/** Teeth still on the ring. */
export function lampreyTeethIn(s: LampreyState): number {
  let n = 0;
  for (let t = 0; t < LAMPREY_TEETH; t++) if (lampreyToothIn(s, t)) n += 1;
  return n;
}

/**
 * The tooth to light after `from`: the first still in, `LAMPREY_JUMP` places
 * on and then round the ring — so the one beside it comes last of all — or -1
 * with the ring bare.
 */
export function lampreyNextTooth(s: LampreyState, from: number): number {
  for (let k = LAMPREY_JUMP; k < LAMPREY_JUMP + LAMPREY_TEETH; k++) {
    const t = (((from + k) % LAMPREY_TEETH) + LAMPREY_TEETH) % LAMPREY_TEETH;
    if (lampreyToothIn(s, t)) return t;
  }
  return -1;
}

/** Whether the pinner's thumb is on the jaw this instant. */
export function lampreyHeld(world: World, s: LampreyState): boolean {
  const pinner = lampreyPinner(s);
  if (pinner === null) return false;
  const at = s.holdCol[pinner - 1] ?? -1;
  return at !== -1 && Math.abs(at - s.jawCol) <= world.cfg.lampreyGripCols;
}

/** Whether the gullet is lit to be shot. */
export function lampreyFiring(s: LampreyState): boolean {
  return s.phase === "rearing";
}

/** Limp and falling away: the fight is over. */
export function lampreyDone(s: LampreyState): boolean {
  return s.phase === "spent";
}

/** A fresh lamprey: swimming in, every tooth in, no bite, no thumb down. */
export function freshLamprey(
  beat: number,
  col: number,
  steps: readonly LampreyStep[],
): LampreyState {
  return {
    kind: "lamprey",
    steps: steps.map((step) => ({ ...step })),
    phase: "entering",
    phaseBeat: beat,
    cursor: 0,
    jawCol: col,
    crawlDir: 1,
    crawlBeat: beat,
    biteMilli: 0,
    teethOut: 0,
    litTooth: 0,
    toothBeat: beat,
    pulled: [],
    rebiting: false,
    hits: 0,
    holdCol: [-1, -1],
    tapDown: [false, false],
  };
}
