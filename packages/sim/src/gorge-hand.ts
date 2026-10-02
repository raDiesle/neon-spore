import type { SimConfig } from "./config.js";
import { midCol } from "./config.js";
import {
  type GorgeState,
  gorgeBoss,
  gorgeBottom,
  gorgeDue,
  gorgePhase,
  gorgeSated,
} from "./gorge.js";
import { gorgeRowOf } from "./gorge-ring.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **Player 1's tap on THE GORGE's ring**, off the wire, on the tick.
 *
 * Cut off `gorge-step.ts` at the seam every boss's hand file cuts: next door
 * is what the bubbles do on the beat, and this is what the thumb does. On the
 * tick rather than the beat (`boss-hands.ts`), so a tap lands on the bubble
 * the pilot saw at the bottom and not on the one the ring turned to since.
 *
 * `gorgeLobe` with `id` the bubble. Only the pilot's press counts, and only
 * on the bubble at the bottom of a ring while it is still shut: each press
 * is one tap, and `gorgeOpenTaps` of them open it to shots. His, because the
 * pilot is the seat shown the order — he knows which bubble is worth opening
 * — and the navigator is loading the colour it will take. The taps are lost
 * when the ring turns it away (`gorge-ring.ts`), so an opening is a thing to
 * do on the bubble that is due, and quickly.
 *
 * Every other press on the name is dropped without a sound, as THE GAUGE's
 * hidden half is (`gauge-hand.ts`): the other seat's screen never draws that
 * mark, so there is nothing to refuse.
 */

export const gorgeTapSeat = 1;

/**
 * **The bubbles a seat's thumb has a mark on**: the pilot's on the bottom
 * bubble of a ring while it is shut and still wants shots; nobody's else.
 * What the press is gated on and what the picture draws (`render/gorge-grip.ts`).
 */
export function gorgeOffers(g: GorgeState, cfg: SimConfig, seat: 1 | 2): number[] {
  if (seat !== gorgeTapSeat || gorgePhase(g) !== "ring") return [];
  const i = gorgeBottom(g);
  const k = g.intakes[i];
  return k !== undefined && !gorgeSated(k) && k.taps < cfg.gorgeOpenTaps ? [i] : [];
}

/**
 * **The bubbles that ask a seat for a thumb**: those on offer that are due,
 * so the halo never asks for a bubble a shot would be refused by
 * (`render/gorge-marks.ts`).
 */
export function gorgeAsks(g: GorgeState, cfg: SimConfig, seat: 1 | 2): number[] {
  return gorgeOffers(g, cfg, seat).filter((i) => gorgeDue(g, i));
}

export function gorgeHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "gorgeLobe" || !command.on) return;
  const g = gorgeBoss(world);
  if (g === null) return;
  const i = command.id ?? -1;
  if (!gorgeOffers(g, world.cfg, player).includes(i)) return;
  const k = g.intakes[i];
  if (k === undefined) return;
  k.taps += 1;
  const left = world.cfg.gorgeOpenTaps - k.taps;
  world.events.push({
    type: "gorgeTap",
    row: gorgeRowOf(world.cfg, g),
    col: midCol(world.cfg),
    left,
  });
}
