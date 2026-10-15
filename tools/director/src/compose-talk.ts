import type { Step } from "./compose-steps.js";

/**
 * **A block's talk, rising beside its pressure** — `docs/spec/wave-curriculum.md`
 * §5.1. The owner, 15 October 2026: difficulty *should also include … how
 * often players need to talk to each other.* Pressure counts what the hands
 * do and `waveTalk` what the voices do; a block keeps both rising.
 *
 * Talk is a target, not a bound. Pressure's ramp is a rule (decision 6) and
 * a draw outside it is never kept; talk only says which of the draws inside
 * it to prefer — the same pressure with the talk nearest the step's aim.
 * A step's talk is chosen out of whole facts, and a bound in whole facts
 * would refuse blocks that pressure alone composes.
 */

/** How much a rising step's talk aims to add over the step before it, and
 * how much R5 aims to take away. Half a fact a step: a sentence every other
 * wave. */
export const TALK_RISE_AIM = 0.5;
export const TALK_DIP_AIM = 1;

/** What a fact off the aim costs against a tenth off pressure's: pressure
 * leads, and talk decides between the draws pressure leaves equal. */
export const TALK_WEIGHT = 0.5;

/** A fall where the aim is a rise — or a first step under the block before's
 * gentlest talk — costs this many times a rise past the aim. */
export const TALK_FALL = 2;

/** Where a step's talk aims, given the talk of the step before it and how
 * many steps back that stands. */
export function talkAim(step: Step, before: number, back = 1): number {
  if (step.ramp === "dip") return before - TALK_DIP_AIM;
  return before + TALK_RISE_AIM * back;
}

/** What a talk costs against its aim: twice as much below it on a rise. */
export function talkCost(step: Step, talk: number, aim: number): number {
  const off = talk - aim;
  const under = off < 0 && step.ramp !== "dip" ? TALK_FALL : 1;
  return TALK_WEIGHT * Math.abs(off) * under;
}
