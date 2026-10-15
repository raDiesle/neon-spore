import type { BlisterFrame } from "./blister-bodies.js";
import { blisterBodyOf } from "./blister-pick.js";
import { drawPurrBody } from "./blister-rub-purr.js";
import { drawUrchinBody } from "./blister-rub-urchin.js";
import { drawWashboardBody } from "./blister-rub-washboard.js";
import type { Body } from "./creature-body-in.js";

/**
 * **THE BLISTER's RUB body: URCHIN, WASHBOARD or PURR, one per blister** (the
 * owner, 15 October 2026, on `blister:rub`: *i like all of them, build them
 * into game and randomly iterate over them*).
 */

const BODIES = [drawUrchinBody, drawWashboardBody, drawPurrBody] as const;

export function drawRubBody(b: Body, f: BlisterFrame): void {
  BODIES[rubBodyOf(b.c.id)]?.(b, f);
}

/** 0 for URCHIN, 1 for WASHBOARD, 2 for PURR (`blister-pick.ts`). */
export function rubBodyOf(id: number): number {
  return blisterBodyOf(id, BODIES.length);
}
