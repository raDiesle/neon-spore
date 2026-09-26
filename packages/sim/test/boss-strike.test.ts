import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bossStrikesHull } from "../src/boss-strike.js";
import { DEFAULT_CONFIG } from "../src/config.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { createWorld } from "../src/world.js";

/**
 * A boss's window running out is the boss's own blow, not a rock (the owner,
 * 26 September 2026; `boss-strike.ts`, `docs/spec/bosses.md`).
 */

describe("bossStrikesHull", () => {
  it("is the same hit as ever, with the boss named on it", () => {
    const world = createWorld(DEFAULT_CONFIG, 1);
    bossStrikesHull(world, "oculus", 4);
    expect(world.failTick).not.toBe(NOT_FAILED);
    expect(world.scars.map((s) => s.col)).toEqual([4]);
    const breach = world.events.find((e) => e.type === "breach");
    expect(breach).toMatchObject({ col: 4, weight: "heavy", by: "oculus" });
    expect(breach).not.toHaveProperty("blow");
  });

  it("names which blow, for a boss with more than one", () => {
    const world = createWorld(DEFAULT_CONFIG, 1);
    bossStrikesHull(world, "ratchet", 5, 0, "bolt");
    const breach = world.events.find((e) => e.type === "breach");
    expect(breach).toMatchObject({ col: 5, by: "ratchet", blow: "bolt" });
  });
});

/**
 * **The ratchet.** A hull hit that is a rock falling out of row 0 is the
 * stand-in the rule retired. These are the files that still make one, each
 * waiting on its own queue item; the list only ever gets shorter, and a new
 * file here is a new boss breaking the rule.
 */
const STILL_A_ROCK = new Set([
  // The blow itself, which keeps the rock's kind for the scar and the sound.
  "boss-strike.ts",
  // A rock or a line that may really be in the picture: each is looked at.
  "keel-step.ts",
  "filament-step.ts",
  // The rounds and interludes, which have no boss body to strike from.
  "fleet.ts",
  "gauge-round.ts",
  "maze-verdict.ts",
  "mirror-round.ts",
  "pinball-round.ts",
  "pulse-round.ts",
  "scout-arena.ts",
  "snake-move.ts",
]);

/**
 * The files that name the rock at all, as `git grep` finds them: 14 of the
 * 640-odd in `src/`. Handing every one of those to `readFileSync` took 7.8 s
 * under a full check on 26 September 2026 and failed the 5-second timeout, as
 * `tools/test/build-stamp.test.ts` had before it. The regex below still
 * decides, since a call may break across lines and `git grep` reads a line at a
 * time; this only says which files are worth its while. `--untracked` keeps a
 * file a lane has not committed yet in reach.
 */
function namingTheRock(dir: string): string[] {
  const out = Bun.spawnSync(
    ["git", "grep", "-l", "--untracked", "-F", '"meteorFastest"', "--", "*.ts"],
    { cwd: dir },
  );
  // 1 is `git grep` finding nothing, which is an answer; anything else is not.
  if (out.exitCode !== 0 && out.exitCode !== 1) throw new Error(out.stderr.toString());
  return out.stdout
    .toString()
    .split("\n")
    .filter((f) => f !== "" && !f.includes("/"));
}

describe("a rock nobody saw fall", () => {
  it("is made only by the files still waiting for their own blow", () => {
    const dir = join(import.meta.dir, "../src");
    const makers = namingTheRock(dir).filter((f) =>
      // To the statement's end, not the first `)`: `midCol(world.cfg)` as the
      // column closed the call early, and four files on the list went unseen.
      /breachHull\([^;]*?"meteorFastest"/.test(readFileSync(join(dir, f), "utf8")),
    );
    const fresh = makers.filter((f) => !STILL_A_ROCK.has(f));
    expect(fresh).toEqual([]);
    // And the list only gets shorter: a file that has its own blow now comes
    // off it, or a new rock in it would pass unseen.
    const spent = [...STILL_A_ROCK].filter((f) => !makers.includes(f));
    expect(spent).toEqual([]);
  });
});
