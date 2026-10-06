import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { mimicBoss } from "@neon-spore/sim";
import { commsCall } from "../src/comms.js";
import { bossDuty, bossSirenRight } from "../src/comms-boss.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";
import { CORE, posed, SIGN, SPLIT, stood } from "./mimic-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * THE MIMIC lights the siren top right (the owner, 6 October 2026: *add
 * "Tiles" "Tell P2 Where" to the top right to the siren*): the seat that
 * sees the picture is called, and each screen's job is written under the
 * dial (`render/src/comms-mimic.ts`).
 */

describe("THE MIMIC's siren", () => {
  it.each([1, 2] as const)("calls the reader, seat %i, and tells each seat its job", (reader) => {
    const world = stood();
    posed(world, "sign", { ...SIGN, reader });
    const other = reader === 1 ? 2 : 1;
    expect(commsCall(world)).toEqual({ p1: reader === 1, p2: reader === 2 });
    expect(bossDuty(`p${reader}`, world)).toBe(`TILES · TELL P${other} WHERE`);
    expect(bossDuty(`p${other}`, world)).toBe(`TAP WHERE P${reader} SAYS`);
    expect(bossSirenRight(world)).toBe(true);
  });

  it("calls both on a split, each to tell one half and tap the other", () => {
    const world = stood();
    posed(world, "sign", SPLIT);
    expect(commsCall(world)).toEqual({ p1: true, p2: true });
    expect(bossDuty("p1", world)).toBe("TELL P2 WHERE · TAP WHERE P2 SAYS");
    expect(bossDuty("p2", world)).toBe("TELL P1 WHERE · TAP WHERE P1 SAYS");
  });

  it("names the next picture's reader through a bare core, and goes out with the last", () => {
    const world = stood();
    posed(world, "core", CORE, (s) => {
      s.steps[1] = { ...SIGN, reader: 2 };
    });
    expect(commsCall(world)).toEqual({ p1: false, p2: true });
    const s = mimicBoss(world);
    if (s === null) throw new Error("no mimic");
    s.steps.length = 1;
    expect(commsCall(world)).toBeNull();
    s.steps[0] = SIGN;
    s.phase = "spent";
    expect(commsCall(world)).toBeNull();
    expect(bossSirenRight(world)).toBe(false);
  });
});
