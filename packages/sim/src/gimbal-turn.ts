import { TURN } from "./bearing.js";
import type { SimConfig } from "./config.js";
import { type GimbalRing, type GimbalState, INNER, OUTER } from "./gimbal.js";

/**
 * **Turn one ring by `by` thousandths on the true wheel, and the inner with
 * the outer.** The outer ring is the frame the inner is hung in, so a turn of
 * his carries hers `gimbalCarryPct` of the way — a real gimbal's, and the
 * reason the pair has an order to find. Hers carries nothing back. Every turn
 * goes through here, the hand's and the drift's, so the two cannot disagree.
 */
export function gimbalTurnRing(s: GimbalState, cfg: SimConfig, ring: GimbalRing, by: number): void {
  s.atMilli[ring] = wrapMilli(s.atMilli[ring] + by);
  if (ring === OUTER) {
    s.atMilli[INNER] = wrapMilli(s.atMilli[INNER] + Math.trunc((by * cfg.gimbalCarryPct) / 100));
  }
}

function wrapMilli(m: number): number {
  return ((m % TURN) + TURN) % TURN;
}
