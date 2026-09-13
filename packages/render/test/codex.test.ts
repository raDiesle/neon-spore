import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { createWorld, type SpawnEntry, startWave, ticksPerBeat, type World } from "@neon-spore/sim";
import { showsCodex } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE CODEX's split: a fault kept from the seat it acts on.**
 *
 * Every other split in this game keeps a fact about the *field* from one player.
 * This keeps a fact about the navigator's own two buttons from the navigator —
 * they work, they answer the thumb, and while the key is over they do each
 * other's job. A navigator shown the shimmer would press the other colour and
 * there would be nothing left to say, so the picture is the pilot's and the
 * whole coupling rests on that (`sim/codex.ts`).
 */

const TPB = ticksPerBeat(CFG);

beforeAll(installCanvasGlobals);

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });

function codexWorld(): World {
  const world = createWorld(CFG, 3);
  startWave(world, 0, [slick(3), slick(5)], [], null, false, 0, { kind: "codex" });
  return world;
}

describe("showsCodex", () => {
  it("is the pilot's, never the navigator's, and both for the rig", () => {
    expect(showsCodex("p1")).toBe(true);
    expect(showsCodex("p2")).toBe(false);
    expect(showsCodex("test")).toBe(true);
  });
});

describe("the frames", () => {
  it("draw more on the pilot's screen than on the navigator's while the key is over", () => {
    // The shimmer and the lantern over the field are both the pilot's, so the
    // two screens cannot cost the same. If this ever stops being true, the
    // navigator is being shown the fault and the wave has no question in it.
    const p1 = runFrames(codexWorld(), "p1", TPB * 2);
    const p2 = runFrames(codexWorld(), "p2", TPB * 2);
    expect(p1.ctx.calls).toBeGreaterThan(p2.ctx.calls);
  });

  for (const role of ROLES) {
    it(`draw a faulted wave on ${role} without a throw`, () => {
      const run = runFrames(codexWorld(), role, TPB * 2);
      expect(run.ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("cost the navigator exactly what an unfaulted wave costs, and the pilot more", () => {
    // The sharp version of the claim above, one role at a time: on the pilot's
    // screen a faulted wave draws more than a clean one, and on the navigator's
    // the two are indistinguishable. If the second ever stops holding, something
    // about the fault has reached the seat it is kept from.
    const plain = () => createWorld(CFG, 3, [slick(3), slick(5)]);
    const pilot = {
      faulted: runFrames(codexWorld(), "p1", TPB).ctx.calls,
      clean: runFrames(plain(), "p1", TPB).ctx.calls,
    };
    const navigator = {
      faulted: runFrames(codexWorld(), "p2", TPB).ctx.calls,
      clean: runFrames(plain(), "p2", TPB).ctx.calls,
    };
    expect(pilot.faulted).toBeGreaterThan(pilot.clean);
    expect(navigator.faulted).toBe(navigator.clean);
  });
});
