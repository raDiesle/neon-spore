import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, THROB_TURN_MILLI, throbFacing } from "@neon-spore/sim";
import { farShare } from "../src/throb.js";

/**
 * THE THROB's middle says nothing about which trigger answers it any more
 * (the owner, 20 September 2026), so the rim is the whole of that sentence:
 * the other colour holds more than half of it exactly while `throbFacing` says
 * the authored colour does not answer. Every thousandth of a turn, at the
 * shipped face and at two it could be tuned to.
 */
describe("the throb's rim", () => {
  for (const face of [DEFAULT_CONFIG.throbFaceMilli, 300, 700]) {
    const cfg = { ...DEFAULT_CONFIG, throbFaceMilli: face };
    const period = Math.max(1, cfg.throbSpinBeats);
    const at = (t: number): number => ((t + 0.5) / THROB_TURN_MILLI) * period;

    it(`gives the other colour the rim exactly while it answers, face ${face}`, () => {
      for (let t = 0; t < THROB_TURN_MILLI; t++) {
        const share = farShare(cfg, at(t));
        if (throbFacing(cfg, at(t))) expect(share).toBeLessThanOrEqual(0.5);
        else expect(share).toBeGreaterThanOrEqual(0.5);
      }
    });

    it(`is all authored facing the cannon and all the other colour half a turn round, face ${face}`, () => {
      expect(farShare(cfg, at(0))).toBe(0);
      expect(farShare(cfg, at(THROB_TURN_MILLI / 2))).toBe(1);
    });
  }
});
