import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type ControlSetId, controlSet, partnerSeat } from "@neon-spore/content";
import { createWorld, startWave } from "@neon-spore/sim";
import { PARTNER_GREY, partnerUnder } from "../src/band-partner.js";
import { bandLobes, computeLayout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  stripsDrawn,
  waveOnPanel,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * The other phone's controls, drawn dead on the first rungs (`band-partner.ts`).
 *
 * The owner, 19 October 2026: on STANDARD 1 and 2 each phone shows where the
 * partner's controls are, greyed, and a press on one tells the player whose
 * job it is. Three things are asked: the dead half is drawn on a phone and
 * nowhere else, a press on it is answered as the partner's seat, and that
 * press still sends nothing to the simulation.
 */

const PARTNERED: ControlSetId[] = ["standard1", "standard2"];
const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function field(seat: 1 | 2, id: ControlSetId): Field {
  const world = createWorld(CFG, 2, []);
  return {
    creatures: [],
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.5,
    skinY: null,
    beat: 0,
    waveBeat: 0,
    tick: 0,
    seat,
    cfg: CFG,
    boss: null,
    controls: controlSet(id),
    faults: [],
    well: false,
  };
}

function drawn(id: ControlSetId, role: ViewRole): { log: string; strips: string[] } {
  const world = createWorld(CFG, 2);
  startWave(world, waveOnPanel(id), [], []);
  const log: string[] = [];
  const strips = stripsDrawn(() =>
    runFrames(world, role, 2, {
      every: 1,
      onCanvas: (c) => {
        c.log = log;
      },
    }),
  );
  return { log: log.join("|"), strips };
}

describe("the partner's controls on a phone", () => {
  it("is asked for by the first two rungs and by no other panel", () => {
    expect(partnerSeat(controlSet("standard1"), 1)).toBe(2);
    expect(partnerSeat(controlSet("standard2"), 2)).toBe(1);
    expect(partnerSeat(controlSet("standard2"), "both")).toBeNull();
    for (const id of ["default", "standard4", "standard5"] as const) {
      expect(partnerSeat(controlSet(id), 1), id).toBeNull();
    }
  });

  for (const id of PARTNERED) {
    it(`draws player 2's buttons dead on player 1's phone, on ${id}`, () => {
      const { log, strips } = drawn(id, "p1");
      expect(log).toContain(PARTNER_GREY);
      expect(strips).toContain("cannon");
    });

    it(`draws player 1's cannon strip dead on player 2's phone, on ${id}`, () => {
      const { log, strips } = drawn(id, "p2");
      expect(log).toContain(PARTNER_GREY);
      expect(strips).toContain("cannon");
    });
  }

  it("draws nothing dead on the screen that carries both seats, or on the full panel", () => {
    expect(drawn("standard2", "test").log).not.toContain(PARTNER_GREY);
    expect(drawn("default", "p1").log).not.toContain(PARTNER_GREY);
    expect(drawn("default", "p2").log).not.toContain(PARTNER_GREY);
  });

  for (const id of PARTNERED) {
    it(`answers a press on the dead buttons as the partner's, and sends nothing, on ${id}`, () => {
      const set = controlSet(id);
      const p1 = layout("p1");
      for (const lobe of bandLobes(layout("p2"), set, 2)) {
        const { x, y } = lobe.circle;
        expect(partnerUnder(p1, set, x, y)).toBe(2);
        expect(touchDown(p1, x, y, field(1, id))).toBeNull();
      }
      const p2 = layout("p2");
      const y = p2.cannonStrip.y;
      expect(partnerUnder(p2, set, p2.width / 2, y)).toBe(1);
      expect(touchDown(p2, p2.width / 2, y, field(2, id))).toBeNull();
    });
  }

  it("answers nothing as the partner's on the test screen or above the band", () => {
    const set = controlSet("standard2");
    const test = layout("test");
    for (const lobe of bandLobes(test, set, 2)) {
      expect(partnerUnder(test, set, lobe.circle.x, lobe.circle.y)).toBeNull();
    }
    const p1 = layout("p1");
    expect(partnerUnder(p1, set, p1.width / 2, p1.bandTop - 4)).toBeNull();
  });
});
