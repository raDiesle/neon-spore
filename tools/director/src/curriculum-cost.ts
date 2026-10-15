import {
  arrivalTalk,
  type ControlSetId,
  FAULT_TALK,
  faultMechanic,
  PRESSURE_DEFAULT_WEIGHT,
  PRESSURE_PER_FAULT,
  PRESSURE_WEIGHT,
} from "@neon-spore/content";
import type { CreatureKind, MalfunctionKind } from "@neon-spore/sim";

/**
 * **What a new thing costs to learn** — `docs/spec/wave-curriculum.md` §4.1.
 * The owner, 15 October 2026: difficulty *should also include difficulty of
 * each enemy, for example how often players need to talk to each other*, and
 * *controls/malfunction brushes are also more difficult in general.*
 *
 * One number per thing a wave can introduce, from the two scores a wave
 * already has: what one arrival of it weighs in `wavePressure`, and what it
 * asks to be said in `waveTalk`. A body is its weight and its facts; a fault
 * is what it adds to pressure while it runs and the sentences it costs; a
 * panel is a lever like a fault, and the sentences it adds to who does what.
 * The curriculum teaches new things in rising order of this
 * (`curriculum-order.ts`).
 */

/** The sentences a new panel adds: THE LANCE's hold is one more thing to
 * call (*hold red*), THE CLAW's panel splits the arm across both seats. */
export const PANEL_TALK: Readonly<Partial<Record<ControlSetId, number>>> = {
  default: 1,
  claw: 2,
};

/** What a panel no row names adds. */
const PANEL_TALK_DEFAULT = 2;

const FAULT_OF = new Map<string, MalfunctionKind>(
  (Object.keys(FAULT_TALK) as MalfunctionKind[]).map((kind) => [faultMechanic({ kind }), kind]),
);

/** The cost of one mechanic a wave introduces, by id. */
export function thingCost(id: string): number {
  const fault = FAULT_OF.get(id);
  if (fault) return PRESSURE_PER_FAULT + FAULT_TALK[fault];
  const weight = PRESSURE_WEIGHT[id] ?? PRESSURE_DEFAULT_WEIGHT;
  return weight + arrivalTalk({ kind: id as CreatureKind as never });
}

/** The cost of a new panel. */
export function panelCost(panel: ControlSetId): number {
  return PRESSURE_PER_FAULT + (PANEL_TALK[panel] ?? PANEL_TALK_DEFAULT);
}

/** Whether a mechanic id is a fault — a malfunction brush. */
export const isFault = (id: string): boolean => FAULT_OF.has(id);
