import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, type GaugeState, startWave, step } from "@neon-spore/sim";
import { deskDown, pressSeat } from "../src/desk-grab.js";
import { pointerSeats } from "../src/desk-seat.js";
import { gaugeBandGrip } from "../src/gauge-grip.js";
import { gaugeDial } from "../src/gauge-round.js";
import { computeLayout } from "../src/layout.js";
import type { Field } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

/**
 * **THE HANDOVER on the test screen**, where one mouse picks its seat by what
 * is under it (`deskDown`) and the band is drawn for the other seat.
 *
 * The host used to sign every press as this device's while the panels were
 * traded, which is right for the band and wrong for the field: the seat
 * `deskDown` had just picked for the navigator's handle went out as player 1
 * and the simulation refused it. `pressSeat` keeps the field's seat and
 * re-signs only the band.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout(VIEWPORT, CFG, "test");
const BOTH = pointerSeats("test", undefined);

/** THE GAUGE's round in play, its band wound — a handle only the navigator has. */
function gauge(): GaugeState {
  const world = createWorld(CFG, 5);
  const index = waveWith("gauge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const g = world.boss;
  if (g === null || g.kind !== "gauge") throw new Error("the gauge's wave installed no gauge");
  g.phase = "play";
  g.boundBeat = 3;
  return g;
}

function field(seat: 1 | 2, g: GaugeState): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: g,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("a press while THE HANDOVER has the panels traded", () => {
  it("keeps the seat the control on the field names", () => {
    const g = gauge();
    const at = gaugeBandGrip(L, DEFAULT_CONFIG, gaugeDial(L), g);
    const t = deskDown(L, at.x, at.y, BOTH, (seat) => field(seat, g));
    if (t === null) throw new Error("the gauge's band answered no seat");
    expect(t.player).toBe(2);
    // This device is seat 1 and the handover is on: the navigator's handle is
    // still the navigator's.
    expect(pressSeat(L, at.y, t, true, 1)).toBe(2);
  });

  it("signs a press on the band with this device", () => {
    const g = gauge();
    const y = L.shieldStrip.y;
    expect(y).toBeGreaterThanOrEqual(L.bandTop);
    const t = deskDown(L, L.width / 2, y, BOTH, (seat) => field(seat, g));
    if (t === null) throw new Error("the shield's strip answered no seat");
    expect(t.player).toBe(2);
    expect(pressSeat(L, y, t, true, 1)).toBe(1);
    // And out of the handover, the band's own half stands.
    expect(pressSeat(L, y, t, false, 1)).toBe(2);
  });
});
