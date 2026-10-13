import type { TimedCommand } from "@neon-spore/sim";
import type { FieldControlDef } from "./field-control-def.js";
import type { Still } from "./field-stills.js";
import type { Pose } from "./pose-kit.js";

/**
 * **A person's take in ▶ TRY IT, kept for the page's session**, for the cards
 * AUTO cannot play (`field-stills.ts` `stillTicks` null): THE GUM, THE
 * BALLOON, THE LEDGER and the rest said *play it with ▶ TRY IT* and showed
 * nothing in ▤ STILLS or ▤ COMPARE ALL USES (`docs/queue.md`, 9 October 2026).
 *
 * What is kept is the commands, not the frames: the world is the pose's,
 * stood up again, and the simulation is deterministic, so the same commands
 * on the same ticks are the same take — drawn by `field-stills-art.ts`
 * exactly as AUTO's are, at no cost while nobody looks at it.
 *
 * In memory and nowhere else: a reload forgets every take, which is what a
 * take tried at a desk is worth.
 */

export interface Take {
  /** Every command the mouse sent since the pose was stood up, at its tick. */
  sent: readonly TimedCommand[];
  /** The six moments, in ticks from the pose's own (`takeMoments`). */
  moments: readonly Still[];
}

const TAKES = new Map<string, Take>();

const keyOf = (pose: Pose, rows: readonly FieldControlDef[]): string =>
  `${pose.name}|${rows.map((r) => r.name).join("·")}`;

/** Keep a take for this card, over whatever it kept before. */
export function keepTake(pose: Pose, rows: readonly FieldControlDef[], take: Take): void {
  TAKES.set(keyOf(pose, rows), take);
}

/** The take kept for this card, if one was played since the page opened. */
export function takeFor(pose: Pose, rows: readonly FieldControlDef[]): Take | undefined {
  return TAKES.get(keyOf(pose, rows));
}
