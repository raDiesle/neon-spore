import { describe, expect, it } from "bun:test";
import { slingLitStep, step, type TimedCommand } from "../src/index.js";
import { MID, rightColor, sling, TPB, toStep } from "./sling-rig.js";

/**
 * **A boss's core is met where it hangs** (`core-along.ts`): a bolt up the
 * middle into THE SLING's lit yoke is a hit on the tick it crosses the
 * yoke, judged by the same calls as past the top and said with where it was
 * met, and the bolt goes no further.
 */

describe("a core met where it hangs", () => {
  it("is THE SLING's yoke hit on the tick the bolt reaches it", () => {
    const world = toStep(4);
    const lit = slingLitStep(sling(world));
    if (lit === null) throw new Error("nothing is lit");
    const t = world.tick;
    const cmds: TimedCommand[] = [
      { tick: t, player: 1, command: { kind: "cannonCol", col: MID } },
      { tick: t + 1, player: 2, command: { kind: "fire", color: rightColor(lit) } },
    ];
    const seen: string[] = [];
    let at = Number.NaN;
    while (world.tick < t + TPB * 2 && !seen.includes("slingHit")) {
      step(
        world,
        cmds.filter((c) => c.tick === world.tick),
      );
      for (const e of world.events) {
        seen.push(e.type);
        if (e.type === "shotOut") at = e.atMilli;
      }
    }
    expect(seen).toContain("slingHit");
    expect(at).toBeGreaterThan(0);
    expect(world.bullets).toHaveLength(0);
  });
});
