import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { hullRow, type LampreyStep, midCol } from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES } from "./frame-harness.js";
import { BITE, count, frame, posed } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LAMPREY's plug, drawn (`render/src/lamprey-plug-look.ts`,
 * `lamprey-wound.ts`): the bitten button out of its socket on the screen
 * that has it — the socket's bleeding rim the mark of it — and left loose
 * after; the eel's mouth inside the ship on every screen; the hull torn where
 * it bit. `sim/test/lamprey-plug.test.ts` proves the rules.
 */

const PLUG: LampreyStep = { ...BITE, ask: "plug", holder: 2, teeth: 0, button: "intake" };
/** The socket's rim, which only a button out of it draws. */
const SOCKET = rgba(PALETTE.red, 0.7);
/** The tear in the hull. */
const TEAR = rgba(PALETTE.red, 0.75);

function plugged(phase: "bite" | "leap", out: number) {
  return (w: Parameters<typeof posed>[0]) =>
    posed(w, phase, PLUG, (s) => {
      s.col = midCol(CFG);
      s.row = hullRow(CFG);
      s.tailX = 0;
      s.tailY = -1000;
      s.plugMilli = out;
      s.plugs = [0];
      s.bitten = [hullRow(CFG) * CFG.cols + midCol(CFG)];
    });
}

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

describe("THE LAMPREY's plug", () => {
  it("draws SUCK out of its socket only on the screens that have it", () => {
    expect(count(frame("p1", plugged("bite", 600)), SOCKET)).toBeGreaterThan(0);
    expect(count(frame("test", plugged("bite", 600)), SOCKET)).toBeGreaterThan(0);
    expect(count(frame("p2", plugged("bite", 600)), SOCKET)).toBe(0);
    expect(
      count(
        frame("p1", (w) => posed(w)),
        SOCKET,
      ),
    ).toBe(0);
  });

  it("leaves the button loose once the eel has gone", () => {
    expect(count(frame("p1", plugged("leap", 100)), SOCKET)).toBeGreaterThan(0);
  });

  it.each(ROLES)("draws the mouth inside the ship and the hull torn, on %s", (role) => {
    const drawn = frame(role, plugged("bite", 600));
    expect(count(drawn, TEAR)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.lampreyTooth)).toBeGreaterThan(0);
    expect(
      count(
        frame(role, (w) => posed(w)),
        TEAR,
      ),
    ).toBe(0);
  });
});
