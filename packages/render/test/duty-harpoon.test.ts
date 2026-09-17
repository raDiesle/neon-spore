import { describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  startWave,
  step,
  TO_THE_END,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { dutyWord } from "../src/duty.js";
import { CFG, FRAME_TIMEOUT_MS } from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **MOVE CANNON! and MOVE SHIELD!**, the two words the owner asked for on 14
 * September 2026 — under the dial of the seat that cannot move the control
 * being asked for.
 *
 * `duty.ts`'s table already had a word for each of these two kinds, written
 * for them as *creatures*. What is proved here is the swap: a body fired onto
 * a control by a fault takes the specific wording on the seat without that
 * control, the seat holding it keeps the general one, and a wave that placed
 * no pencil is untouched.
 */

const TPB = ticksPerBeat(CFG);

/** A world on a wave placing this fault, run a beat so the body is on. */
function fired(kind: "leech" | "limpet"): World {
  const world = createWorld({ ...CFG, hullInvulnerable: true }, 3);
  startWave(world, 0, [], [], null, false, 0, [{ kind, at: 0, beats: TO_THE_END }]);
  for (let t = 0; t < TPB; t++) step(world, []);
  return world;
}

describe("a control held by a fault rather than by a body that fell on it", () => {
  it("asks the navigator for the cannon, because the cannon is not theirs", () => {
    const world = fired("leech");
    expect(dutyWord("p2", world)).toBe("MOVE CANNON!");
  });

  it("asks the pilot for the shield, for the same reason the other way round", () => {
    const world = fired("limpet");
    expect(dutyWord("p1", world)).toBe("MOVE SHIELD!");
  });

  it("leaves the seat that is holding the control its own word", () => {
    // It can feel the control failing and the only answer is the thumb already
    // on it, so what it reads is what it has to do rather than what to say.
    expect(dutyWord("p1", fired("leech"))).toBe("KEEP MOVING");
    expect(dutyWord("p2", fired("limpet"))).toBe("KEEP MOVING");
  });

  it("says nothing of the sort when the body is a creature and no pencil was placed", () => {
    const world = createWorld({ ...CFG }, 3, [{ beat: 0, col: 3, kind: "leech", color: null }]);
    for (let t = 0; t < TPB * 3; t++) step(world, []);
    // The creature's own rows, which are the table's and are not this file's
    // business beyond their staying put.
    expect(dutyWord("p2", world)).toBe("SAY MOVE");
  });
});
