import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, WARDEN_PHASES, type World } from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";
import { spyPulls } from "./pull-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE WARDEN's hatch is the PULL LAB's knob on a channel that fills before
 * the lift** (`warden-track.ts`): under GLARE the knob rides the carry the
 * thumb has made and the channel fills green behind it on both screens, and
 * the navigator's copy wears the partner's clock.
 */

beforeAll(installCanvasGlobals);

const GLARE = WARDEN_PHASES[1]!.above;

function carried(milli: number): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("warden");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "warden") throw new Error("the warden's wave installed no warden");
  b.plates = GLARE;
  b.hatchCarryMilli = milli;
  return world;
}

function drawn(role: ViewRole, world: World): string {
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (_tick, w) => {
      step(w, []);
    },
  });
  return log.join("|");
}

const count = (text: string, colour: string): number => text.split(colour).length - 1;

describe("THE WARDEN's hatch track", () => {
  it.each(ROLES)("fills green with the carry, and not before it, on %s", (role) => {
    const none = count(drawn(role, carried(0)), PALETTE.good);
    const some = count(drawn(role, carried((CFG.wardenThrowMilli * 3) / 4)), PALETTE.good);
    expect(none).toBe(0);
    expect(some).toBeGreaterThan(0);
  });

  it.each(ROLES)("carries the knob from the eye toward the side the thumb went, on %s", (role) => {
    // The channel runs `wardenThrowMilli` either side of the eye, the knob
    // starting in the middle (`warden-track.ts`).
    const at = (milli: number) => {
      const { tracks } = spyPulls(() => drawn(role, carried(milli)));
      const hatch = tracks.filter((t) => t.o.key === "warden:hatch");
      expect(hatch.length).toBeGreaterThan(0);
      return hatch.map((t) => t.o.at);
    };
    expect(at(0).every((a) => a === 0.5)).toBe(true);
    expect(at(CFG.wardenThrowMilli / 2).every((a) => a > 0.5 && a < 1)).toBe(true);
    expect(at(-CFG.wardenThrowMilli).every((a) => a === 0)).toBe(true);
  });

  it("asks either way with two heads on the pilot's knob, and shows none on the navigator's", () => {
    const knobs = (role: ViewRole, milli: number) => {
      const spied = spyPulls(() => drawn(role, carried(milli)));
      const hatch = spied.knobs.filter((k) => k.key === "warden:hatch");
      expect(hatch.length).toBeGreaterThan(0);
      return hatch;
    };
    expect(knobs("p1", 0).every((k) => k.either === true && k.way !== null)).toBe(true);
    expect(
      knobs("p1", -CFG.wardenThrowMilli / 2).every((k) => !k.either && (k.way?.dx ?? 0) < 0),
    ).toBe(true);
    expect(knobs("p2", 0).every((k) => k.way === null && k.theirs === true)).toBe(true);
  });

  it("wears the partner's ring and clock on the navigator's screen alone", () => {
    const theirs = rgba(PALETTE.text, 0.8);
    const world = () => carried(CFG.wardenThrowMilli / 2);
    expect(count(drawn("p2", world()), theirs)).toBeGreaterThan(0);
    expect(count(drawn("p1", world()), theirs)).toBe(0);
    expect(count(drawn("test", world()), theirs)).toBe(0);
  });
});
