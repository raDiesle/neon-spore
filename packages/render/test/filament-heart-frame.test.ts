import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { rgba } from "../src/hex.js";
import { PALETTE } from "../src/palette.js";
import { armed, BODY, count, drawn, frame, hung, tracing } from "./filament-states.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE FILAMENT as the inside of an alien — the owner, 25 September 2026:
 * *its the inner of its body and the vene to travel with some weapon … the
 * other player needs some other tool … the hearth inside*. The body is a
 * heart, the lit run a vein, and each thumb carries its tool: player 1 the
 * rasp in steel, player 2 the corona in gold (`filament-look.ts`).
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

describe("THE FILAMENT's heart, vein and tools", () => {
  it.each(ROLES)("hangs a heart rimmed in the sheen's warm end, on %s", (role) => {
    const arm = frame(role, (w) => armed(w, 0));
    expect(count(arm.text, BODY)).toBeGreaterThan(0);
    expect(count(arm.text, PALETTE.sheenWarm)).toBeGreaterThan(0);
  });

  it.each(ROLES)("draws the lit run as a vein, with a wall the arm has not, on %s", (role) => {
    const arm = frame(role, (w) => armed(w, 0));
    const trace = frame(role, (w) => tracing(w, 3, 1));
    const wall = (t: string) => count(t, `${PALETTE.sheenDeep}|`);
    expect(wall(trace.text)).toBeGreaterThan(wall(arm.text));
    expect(count(trace.text, rgba(PALETTE.sheenMid, 0.55))).toBeGreaterThan(0);
  });

  it("carries each screen's own tool bright and the partner's at half", () => {
    const p1 = frame("p1", (w) => tracing(w, 3, 1));
    const p2 = frame("p2", (w) => tracing(w, 3, 1));
    // Player 1's screen: the rasp is his, the corona hers.
    expect(count(p1.text, PALETTE.rock)).toBeGreaterThan(0);
    expect(count(p1.text, half(PALETTE.pod))).toBeGreaterThan(0);
    expect(count(p1.text, PALETTE.pod)).toBe(0);
    // Player 2's screen: the other way round.
    expect(count(p2.text, PALETTE.pod)).toBeGreaterThan(0);
    expect(count(p2.text, half(PALETTE.rock))).toBeGreaterThan(0);
    expect(count(p2.text, PALETTE.rock)).toBe(0);
  });

  it.each(ROLES)("carries no tool before the thumbs count, on %s", (role) => {
    const arm = frame(role, (w) => armed(w, 0));
    expect(count(arm.text, PALETTE.pod)).toBe(0);
    expect(count(arm.text, half(PALETTE.rock))).toBe(0);
  });
});

function half(hex: string): string {
  return rgba(hex, 0.45);
}
