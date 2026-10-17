import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, THROB_TURN_MILLI, throbFacing, throbTurnMilli } from "@neon-spore/sim";
import { ownArc } from "../src/throb.js";

/**
 * THE THROB says which trigger answers it by the colour of the half at the
 * bottom of the body (the owner, 17 October 2026). The body is drawn turned by
 * `throbTurnMilli`, so the screen's straight-down lies at `π/2 − spin` in the
 * body's own space; that has to fall inside the authored wedge — `ownArc` either
 * side of straight down — exactly while `throbFacing` says the authored colour
 * answers. Every thousandth of a turn, at the shipped face and at two it could
 * be tuned to.
 */
describe("the throb's halves", () => {
  for (const face of [DEFAULT_CONFIG.throbFaceMilli, 300, 700]) {
    const cfg = { ...DEFAULT_CONFIG, throbFaceMilli: face };
    const period = Math.max(1, cfg.throbSpinBeats);
    const at = (t: number): number => ((t + 0.5) / THROB_TURN_MILLI) * period;

    it(`puts the answering colour at the bottom, face ${face}`, () => {
      const arc = ownArc(cfg);
      for (let t = 0; t < THROB_TURN_MILLI; t++) {
        const beats = at(t);
        const spin = (throbTurnMilli(cfg, beats) / THROB_TURN_MILLI) * Math.PI * 2;
        // How far the screen's bottom is from the authored half's middle.
        const off = Math.abs(Math.atan2(Math.sin(-spin), Math.cos(-spin)));
        // The one thousandth the edge itself sits on the bottom belongs to
        // either half, and the rule has to give it to one of them.
        if (Math.abs(off - arc) < 1e-9) continue;
        expect(off < arc).toBe(throbFacing(cfg, beats));
      }
    });
  }

  it("cuts the body in two down the middle at the shipped face", () => {
    expect(ownArc(DEFAULT_CONFIG)).toBeCloseTo(Math.PI / 2);
  });
});
