import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue, WAVES } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { handedLayout, handedRole, handedView } from "../src/handover.js";
import { handoverWords } from "../src/handover-look.js";
import { computeLayout } from "../src/layout.js";
import type { ViewState } from "../src/renderer.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stripsDrawn,
  VIEWPORT,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE HANDOVER: the two panels change screens, and nothing else changes.**
 *
 * The fault is drawn by not being drawn: the renderer seats itself with the other
 * seat's role for the length of the window, and the whole band, the hull's
 * colour, the radar and every hidden read follow from that one substitution
 * (`handover.ts`). So the tests that matter here are about *which seat a frame
 * was drawn for*, and the sharpest of them is the strip — the pilot's screen
 * carries the cannon strip every other beat of the game and carries the
 * navigator's shield strip while the panels are away.
 */

const TPB = ticksPerBeat(CFG);
const AT = CFG.handoverAtBeat;
const HOLD = CFG.handoverHoldBeats;
const WARN = CFG.handoverWarnBeats;
/** Invulnerable for the reason the simulation's own test gives: nobody is
 * pressing anything here, so a mortal ship is over before the window shuts and
 * a run that is over stops counting beats. */
const CONFIG = { ...CFG, hullInvulnerable: true };

beforeAll(installCanvasGlobals);

/**
 * **The shipped wave**, by the fault it carries rather than by an index: the band
 * is drawn from the wave's own panel, and wave 0 is a rung of the standard ladder
 * with one strip on it — a screen that drew nothing would have proved nothing
 * about a panel changing hands.
 */
const INDEX = WAVES.findIndex((w) => w.malfunction?.kind === "handover");
if (INDEX === -1) throw new Error("no wave carries THE HANDOVER");

function handWorld(fault = true): World {
  const world = createWorld(CONFIG, 3);
  const queue = buildQueue(INDEX, CONFIG.cols);
  startWave(world, INDEX, queue, [], null, false, 0, fault ? { kind: "handover" } : null);
  return world;
}

/** A world standing a few ticks into the fault's `beat`th — clear of the edge,
 * so nothing here turns on which side of a beat boundary a tick falls. */
function atBeat(beat: number, fault = true): World {
  const world = handWorld(fault);
  for (let t = 0; t <= (beat + 1) * TPB + 4; t++) step(world, []);
  return world;
}

const layout = (role: "p1" | "p2" | "test") => computeLayout(VIEWPORT, CONFIG, role);

describe("which seat a device is playing", () => {
  it("is its own until the window opens, the other one's inside it, and its own after", () => {
    expect(handedRole("p1", atBeat(AT - 1))).toBe("p1");
    expect(handedRole("p1", atBeat(AT))).toBe("p2");
    expect(handedRole("p2", atBeat(AT))).toBe("p1");
    expect(handedRole("p1", atBeat(AT + HOLD))).toBe("p1");
  });

  it("never trades on the rig, which is both halves already", () => {
    expect(handedRole("test", atBeat(AT))).toBe("test");
  });

  it("never trades on a wave with no fault on it", () => {
    expect(handedRole("p1", atBeat(AT, false))).toBe("p1");
  });

  it("hands back the same layout and the same frame when nothing is traded", () => {
    // Identity and not a copy: the hit test builds one of these per touch, and
    // an ordinary wave must allocate nothing for a fault it does not carry.
    const world = atBeat(0);
    const l = layout("p1");
    expect(handedLayout(l, world)).toBe(l);
    const view = { world, role: "p1" } as unknown as ViewState;
    expect(handedView(view)).toBe(view);
  });

  it("seats the layout and the frame together while they are traded", () => {
    const world = atBeat(AT);
    expect(handedLayout(layout("p1"), world).role).toBe("p2");
    const view = { world, role: "p2" } as unknown as ViewState;
    expect(handedView(view).role).toBe("p1");
  });
});

describe("the plate on the lip of the band", () => {
  it("says nothing at all on a wave with no fault, or early in one that has it", () => {
    expect(handoverWords(layout("p1"), atBeat(AT, false))).toBeNull();
    expect(handoverWords(layout("p1"), atBeat(AT - WARN - 1))).toBeNull();
  });

  it("counts the trade down on both screens, in the same words", () => {
    const world = atBeat(AT - 1);
    expect(handoverWords(layout("p1"), world)).toBe("PANELS TRADE IN 1");
    expect(handoverWords(layout("p2"), world)).toBe("PANELS TRADE IN 1");
  });

  it("counts the panels back, and tells the rig the truth about its own", () => {
    const world = atBeat(AT);
    expect(handoverWords(layout("p1"), world)).toBe(`THEIR PANEL — BACK IN ${HOLD}`);
    // The rig holds both halves and trades with nobody, so it is told the fault
    // is on rather than that the panel under its thumb is somebody else's.
    expect(handoverWords(layout("test"), world)).toBe(`PANELS TRADED — BACK IN ${HOLD}`);
  });
});

describe("the band itself", () => {
  const drawnFor = (role: "p1" | "p2", beat: number): ("cannon" | "shield")[] =>
    stripsDrawn(() => {
      runFrames(atBeat(beat), role, 1, { every: 1 });
    });

  it("gives the pilot the navigator's strip while the panels are away", () => {
    // The whole fault in one assertion: the same screen, the same wave, two
    // beats apart, carrying the other seat's only sliding control.
    expect(drawnFor("p1", AT - 1)).toEqual(["cannon"]);
    expect(drawnFor("p1", AT)).toEqual(["shield"]);
    expect(drawnFor("p2", AT)).toEqual(["cannon"]);
  });

  it("gives them back", () => {
    expect(drawnFor("p1", AT + HOLD)).toEqual(["cannon"]);
    expect(drawnFor("p2", AT + HOLD)).toEqual(["shield"]);
  });
});

describe("the frames", () => {
  for (const role of ROLES) {
    it(`draws the whole wave for ${role} without the canvas refusing a value`, () => {
      const { ctx } = runFrames(handWorld(), role, (AT + HOLD + 8) * TPB, { every: 12 });
      expect(ctx.calls).toBeGreaterThan(0);
    });
  }
});
