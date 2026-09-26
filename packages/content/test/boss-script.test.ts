import { describe, expect, it } from "bun:test";
import {
  bossScript,
  bossScriptLabel,
  bossScriptOf,
  createWorld,
  DEFAULT_CONFIG,
  NOT_A_SCRIPT,
  startWave,
  type World,
} from "@neon-spore/sim";
import { buildBoss } from "../src/queue.js";
import { WAVES } from "../src/waves.js";

/**
 * Every boss wave the game ships, installed, and read for its place in its
 * script (`packages/sim/src/boss-script.ts`). A boss that keeps a `cursor` is
 * choreographed, and one whose script the reader cannot find would show the
 * director and the HUD nothing — this is where that fails, by the wave's name.
 */

const CFG = DEFAULT_CONFIG;

function fight(index: number): World {
  const world = createWorld(CFG, 1, []);
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  return world;
}

const BOSS_WAVES = WAVES.flatMap((w, i) =>
  w.boss === undefined ? [] : [{ name: w.name, index: i }],
);

describe("a choreographed boss's place in its script", () => {
  it("is read on every boss wave whose boss keeps a cursor", () => {
    const missing: string[] = [];
    let read = 0;
    for (const { name, index } of BOSS_WAVES) {
      const boss = fight(index).boss;
      if (boss === null || !("cursor" in boss) || NOT_A_SCRIPT.includes(boss.kind)) continue;
      const script = bossScriptOf(boss);
      if (script === null || script.of === 0) missing.push(`${name} (${boss.kind})`);
      else read += 1;
    }
    expect(missing).toEqual([]);
    expect(read).toBeGreaterThan(10);
  });

  it("is null for a boss with no script, and for THE REPRISE's echo", () => {
    for (const { index } of BOSS_WAVES) {
      const world = fight(index);
      const boss = world.boss;
      if (boss === null || ("cursor" in boss && !NOT_A_SCRIPT.includes(boss.kind))) continue;
      expect(bossScript(world)).toBeNull();
    }
  });

  it("opens THE INSTAR on its first step, named by its pose", () => {
    const index = WAVES.findIndex((w) => w.name === "THE INSTAR");
    const script = bossScript(fight(index));
    expect(script?.at).toBe(0);
    expect(script?.name).not.toBeNull();
    expect(bossScriptLabel(script ?? { at: 0, of: 0, name: null })).toMatch(
      /^STEP 1 \/ \d+ · \d+ TO GO · [A-Z]/,
    );
  });
});

describe("the readout", () => {
  it("counts from one and says how many are still to come", () => {
    expect(bossScriptLabel({ at: 6, of: 25, name: "curl" })).toBe("STEP 7 / 25 · 18 TO GO · CURL");
    expect(bossScriptLabel({ at: 24, of: 25, name: null })).toBe("STEP 25 / 25 · 0 TO GO");
    expect(bossScriptLabel({ at: 25, of: 25, name: null })).toBe("STEP 25 / 25 · DONE");
  });
});
