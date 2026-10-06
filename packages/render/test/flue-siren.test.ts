import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { handedOver } from "@neon-spore/sim";
import { commsCall } from "../src/comms.js";
import { BOLT, posed, stood, words } from "./flue-harness.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * THE FLUE lights the siren (the owner, 6 October 2026: *show siren … p1 needs
 * to tell p2 when to shoot*), and every other level trades the two panels, so
 * the word under the dial follows the panel onto the other phone.
 */

const SAY = "SAY WHEN TO SHOOT";
const SHOOT = "SHOOT WHEN TOLD";

function said(role: "p1" | "p2", cursor: number): string[] {
  return words(role, (w) => {
    posed(w, BOLT, 0, (s) => {
      s.cursor = cursor;
    });
  }).map((b) => b.text);
}

describe("THE FLUE's siren", () => {
  it("lights the mouth of the panel shown the ember", () => {
    const world = stood();
    posed(world, BOLT);
    expect(commsCall(world)).toEqual({ p1: true, p2: false });
  });

  it("asks the pilot to say when and the navigator to shoot on it", () => {
    expect(said("p1", 0)).toContain(SAY);
    expect(said("p2", 0)).toContain(SHOOT);
  });

  it("hands each job to the other phone on a traded level", () => {
    const world = stood();
    posed(world, BOLT, 0, (s) => {
      s.cursor = 1;
    });
    expect(handedOver(world)).toBe(true);
    expect(said("p1", 1)).toContain(SHOOT);
    expect(said("p2", 1)).toContain(SAY);
  });

  it("goes out with the flue", () => {
    const world = stood();
    posed(world, null, 0, (s) => {
      s.phase = "spent";
    });
    expect(commsCall(world)).toBeNull();
  });
});
