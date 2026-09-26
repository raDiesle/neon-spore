import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun, type SimEvent } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES, stepSpan } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * ONE LAST CHANCE's rehearsal, run and watched. The film is three pages that
 * each depend on a rule of `sim/shield-push.ts` — the push at the dome, the
 * body still pushed while page two reads ONCE ONLY, and the shot on page
 * three killing it before the second fall reaches the hull. Change how far a
 * push climbs or how long it takes and one of those pages stops meaning what
 * it says, in a film nobody re-watches once it is written.
 */
describe("the rehearsal for ONE LAST CHANCE", () => {
  it("pushes the slick once, carries the words through page two and shoots it on page three", () => {
    const scene = SCENES.oneLastChance;
    const wave = WAVES.findIndex((w) => w.guide?.scene === "oneLastChance");
    const run = new SceneRun(sceneScript("oneLastChance", wave, DEFAULT_CONFIG));
    const seen: { tick: number; e: SimEvent }[] = [];
    const spent: SimEvent[] = [];
    const pageTwo = stepSpan(scene, 1).from;
    let pushedOnPageTwo = false;
    for (let t = 0; t < scene.ticks - 1; t++) {
      spent.length = 0;
      run.advance(spent);
      for (const e of spent) seen.push({ tick: t, e });
      if (t === pageTwo + 60) pushedOnPageTwo = run.world.creatures.some((c) => c.pushed === true);
    }
    const push = seen.filter((s) => s.e.type === "shieldPush");
    const kill = seen.find((s) => s.e.type === "destroy");
    expect(push, "the shield never pushed the slick back up").toHaveLength(1);
    expect(push[0]?.tick ?? Infinity, "the push lands after page two opens").toBeLessThan(pageTwo);
    expect(pushedOnPageTwo, "page two reads ONCE ONLY over a body that is not pushed").toBe(true);
    expect(kill, "the shot on page three never landed").toBeDefined();
    expect(seen.some((s) => s.e.type === "breach")).toBe(false);
    expect(run.world.creatures).toHaveLength(0);
  });
});
