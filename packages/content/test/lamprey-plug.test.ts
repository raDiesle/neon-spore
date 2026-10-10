import { describe, expect, it } from "bun:test";
import { control, controlSet, WAVES } from "../src/index.js";

/**
 * **A plug bites a button the pressing seat has** (`sim/lamprey-plug.ts`): the
 * worker — the seat not on the tail — presses the bitten button back in, so it
 * has to be on that seat's panel in the wave the plug is in, or the stay can
 * only run out.
 */
describe("THE LAMPREY's plugs", () => {
  const plugs = WAVES.flatMap((wave) =>
    wave.boss?.kind === "lamprey"
      ? wave.boss.steps.filter((s) => s.ask === "plug").map((step) => ({ wave, step }))
      : [],
  );

  it("are in the shipped wave", () => {
    expect(plugs.length).toBeGreaterThan(0);
  });

  it("each bite a button on the worker's own panel", () => {
    for (const { wave, step } of plugs) {
      const button = step.button ?? "intake";
      const worker = step.holder === 1 ? 2 : 1;
      expect(controlSet(wave.controls).controls, `${wave.name} has no ${button}`).toContain(button);
      expect(control(button).player, `${wave.name}'s ${button} is not player ${worker}'s`).toBe(
        worker,
      );
    }
  });
});
