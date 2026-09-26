import { describe, expect, test } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { instarHand } from "@neon-spore/hands";
import { instarBoss, instarDown, step, ticksPerBeat } from "@neon-spore/sim";
import { bossWorld } from "../src/poses-bosses-kit.js";

/**
 * **THE INSTAR played from its entrance to its fall**, with the right answer
 * to every step and nothing else: every step lands, in the script's order,
 * once each, and not one strikes the hull, refuses a thumb or slips a mark.
 * The director's `down` pose only asks that the fight end; this asks that no
 * step on the way was a dead end the hand had to lose to get past — the
 * guard for a new act whose marks sit where no thumb can finish them.
 */
describe("THE INSTAR, played through", () => {
  const w = bossWorld("instar");
  const landed: number[] = [];
  const bad: string[] = [];
  const tpb = ticksPerBeat(w.cfg);
  const stop = w.tick + 600 * tpb;
  while (w.tick < stop) {
    const s = instarBoss(w);
    if (s === null || instarDown(s)) break;
    step(
      w,
      instarHand(w).map((c) => ({ ...c, tick: w.tick })),
    );
    for (const e of w.events) {
      if (e.type === "instarLand") landed.push(e.step);
      if (e.type === "instarStrike" || e.type === "instarRefuse" || e.type === "instarSlip") {
        const at = instarBoss(w)?.cursor ?? -1;
        bad.push(`${e.type} at step ${at} (${INSTAR_SCRIPT[at]?.pose ?? "?"})`);
      }
    }
  }

  test("reaches the fall", () => {
    const s = instarBoss(w);
    expect(s !== null && instarDown(s)).toBe(true);
  });

  test("lands every step once, in order", () => {
    expect(landed).toEqual(INSTAR_SCRIPT.map((_, i) => i));
  });

  test("never strikes, refuses or slips", () => {
    expect(bad).toEqual([]);
  });
});
