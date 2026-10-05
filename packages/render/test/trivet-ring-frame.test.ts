import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type TrivetState, trivetBoss, type World } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { trivetRingLift, trivetRung } from "../src/trivet-ring.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";
import { stood } from "./trivet-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE TRIVET's ring, drawn (`render/src/trivet-ring.ts`): the planted feet
 * shivering under the spent hub and throwing rings out across the field,
 * dying out across the phase, with no lit colour; a pad held down keeps its
 * foot sprung up. Set rather than played to; `sim/test/trivet-ring.test.ts`
 * proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

/** The last shot in, both feet planted, the ring `beats` beats in. */
function ringing(world: World, beats: number): TrivetState {
  const s = trivetBoss(world);
  if (s === null) throw new Error("the trivet wave stood no stand");
  s.phase = "ring";
  s.phaseBeat = world.beat - beats;
  s.feet = [2, 2];
  s.hits = 4;
  s.hubLit = false;
  s.padsDown = [0, 0];
  s.jolts = 0;
  s.stirred = false;
  return s;
}

function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

const count = (text: string, colour: string) => text.split(colour).length - 1;

describe("THE TRIVET's ring", () => {
  it.each(ROLES)("dies out across the phase, on %s", (role) => {
    const opening = frame(role, (w) => ringing(w, 0));
    expect(frame(role, (w) => ringing(w, 2))).not.toBe(opening);
  });

  it.each(ROLES)("lights nothing, on %s", (role) => {
    // Against the ring died out: whatever the screen draws in red or cyan, the ring adds none.
    const text = frame(role, (w) => ringing(w, 0));
    const settled = frame(role, (w) => ringing(w, 12));
    for (const lit of [PALETTE.red, PALETTE.cyan, PALETTE.trivetSocket])
      expect(count(text, lit)).toBe(count(settled, lit));
  });

  it.each(ROLES)("keeps a held foot sprung up, on %s", (role) => {
    const loose = frame(role, (w) => ringing(w, 1));
    const held = frame(role, (w) => {
      ringing(w, 1).padsDown = [1, 0];
    });
    expect(held).not.toBe(loose);
  });

  it("is a beat longer for every jolt, and nothing outside the ring", () => {
    const world = stood();
    const s = ringing(world, 1);
    const plain = trivetRung(s, CFG, world.beat, 0) ?? 1;
    s.jolts = 2;
    expect(trivetRung(s, CFG, world.beat, 0) ?? 1).toBeLessThan(plain);
    s.phase = "rest";
    expect(trivetRung(s, CFG, world.beat, 0)).toBeNull();
  });

  it("springs a jolted foot up and settles it, and holds it up while its pad is down", () => {
    const world = stood();
    const s = ringing(world, 1);
    expect(trivetRingLift(s, 0, 0)).toBe(0);
    expect(trivetRingLift(s, 0, 1)).toBeGreaterThan(trivetRingLift(s, 0, 0.5));
    s.padsDown = [1, 0];
    expect(trivetRingLift(s, 0, 0)).toBeGreaterThan(0);
    expect(trivetRingLift(s, 1, 0)).toBe(0);
  });
});
