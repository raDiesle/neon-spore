import { describe, expect, it } from "bun:test";
import { mimicShapesOfSize } from "@neon-spore/sim";
import { WAVES } from "../src/waves.js";

/**
 * THE MIMIC's script against its pictures: the owner, 6 October 2026, *make
 * sure no pattern repeats*. The simulation picks a picture not yet up this
 * fight (`sim/mimic-step.ts`), so every size the script asks for has to hold
 * more pictures than the script puts up at that size — a split two — with
 * room left over for windows run out, each of which puts up a new one.
 */
describe("THE MIMIC's script", () => {
  it("never asks for more pictures of a size than there are, with three spare", () => {
    const wave = WAVES.find((w) => w.id === "theMimic");
    const boss = wave?.boss;
    if (boss?.kind !== "mimic") throw new Error("THE MIMIC has no mimic boss");
    const asked = new Map<number, number>();
    for (const step of boss.steps) {
      if (step.ask !== "sign" && step.ask !== "split") continue;
      const n = (step.ask === "split" ? 2 : 1) + (step.changes ? 1 : 0);
      asked.set(step.size, (asked.get(step.size) ?? 0) + n);
    }
    for (const [size, n] of asked) {
      expect(mimicShapesOfSize(size).length, `${size} square`).toBeGreaterThanOrEqual(n + 3);
    }
  });
});
