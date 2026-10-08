import { describe, expect, it } from "bun:test";
import type { CoreVerdict } from "../src/core-verdict.js";
import { hashWorld } from "../src/hash.js";
import { oculusStruck, oculusVerdict } from "../src/oculus-shot.js";
import type { Bullet, Color } from "../src/types.js";
import { viseStruck, viseVerdict } from "../src/vise-shot.js";
import type { World } from "../src/world.js";
import * as oculusRig from "./oculus-rig.js";
import * as viseRig from "./vise-rig.js";

/**
 * **A core with a second ask in a column of its own** — THE OCULUS's look
 * and THE VISE's spit — says what a bolt meets
 * through `coreVerdict`'s `aside`. The picture stops a bolt on that verdict,
 * so it must agree with the boss's `…Struck` on every column and colour, and
 * asking it must change nothing.
 */

interface Case {
  name: string;
  make: () => World;
  verdict: (world: World, col: number, color: Color) => CoreVerdict;
  struck: (world: World, bullet: Bullet) => boolean;
  shot: (color: Color, col: number) => Bullet;
}

const CASES: Case[] = [
  ...[2, 7].map((n) => ({
    name: `THE OCULUS, step ${n}`,
    make: () => oculusRig.toStep(n),
    verdict: oculusVerdict,
    struck: oculusStruck,
    shot: oculusRig.shot,
  })),
  ...[4, 8].map((n) => ({
    name: `THE VISE, step ${n}`,
    make: () => viseRig.toStep(n),
    verdict: viseVerdict,
    struck: viseStruck,
    shot: viseRig.shot,
  })),
];

describe("a core's aside verdict", () => {
  for (const c of CASES) {
    it(`${c.name}: changes nothing, and agrees with the shot on every column and colour`, () => {
      const seen = new Set<CoreVerdict>();
      for (let col = 0; col < c.make().cfg.cols; col++) {
        for (const color of ["red", "cyan"] as const) {
          const world = c.make();
          const before = hashWorld(world);
          const v = c.verdict(world, col, color);
          expect(hashWorld(world)).toBe(before);
          seen.add(v);
          expect(c.struck(world, c.shot(color, col))).toBe(v !== null);
          // Only a colour met or missed moves the world; armour costs nothing.
          const moved = hashWorld(world) !== before;
          expect([col, color, v, moved]).toEqual([col, color, v, v === "target" || v === "wrong"]);
        }
      }
      expect(seen.has(null)).toBe(true);
    });
  }

  it("lets the aside column take the shot, and keeps the middle the core's armour", () => {
    const oculus = oculusRig.toStep(7);
    expect(oculusVerdict(oculus, oculusRig.MID - 2, "red")).toBe("target");
    expect(oculusVerdict(oculus, oculusRig.MID, "red")).toBe("armour");
    const vise = viseRig.toStep(8);
    expect(viseVerdict(vise, viseRig.MID + 2, "red")).toBe("target");
    expect(viseVerdict(vise, viseRig.MID + 2, "cyan")).toBe("wrong");
  });
});
