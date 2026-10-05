import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { antiphonOrganCircle } from "../src/antiphon-shape.js";
import { commsCall } from "../src/comms.js";
import { bossDuty } from "../src/comms-boss.js";
import { Effects } from "../src/effects.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { underAim } from "../src/slow-fuse-place.js";
import { aim } from "../src/slow-intake-aim.js";
import { bare, count, drawn, frame, grown, hung } from "./antiphon-frame-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE ANTIPHON as redesigned on 5 October 2026**, the parts the organ's and
 * the rail's pages do not ask: the veins on both screens, no window thread
 * left over the body (the slow meter is the clock), the reveal at the
 * organ's place on arrival, and the siren's two jobs swapping every level.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const L = computeLayout(VIEWPORT, CFG, "test");

describe("THE ANTIPHON's veins", () => {
  it.each(ROLES)("join the rail to the organ's place, on %s", (role) => {
    const veined = frame(role, (w) => void grown(w)).text;
    const none = frame(role, () => {}).text;
    expect(count(veined, PALETTE.vein)).toBeGreaterThan(count(none, PALETTE.vein));
  });

  it.each(ROLES)("leave no window thread over the body, on %s", (role) => {
    const up = frame(role, (w) => void grown(w)).text;
    const none = frame(role, () => {}).text;
    expect(count(up, PALETTE.shieldRim)).toBe(count(none, PALETTE.shieldRim));
  });
});

describe("THE ANTIPHON under THE SLOW", () => {
  it("keeps the rail and the organ's place whole, and the fuse under them", () => {
    const world = hung();
    grown(world);
    const at = aim(world, L, 0, 0);
    const organ = antiphonOrganCircle(L, CFG);
    const sharp = at.sharp;
    if (sharp === undefined) throw new Error("no rectangle left whole");
    expect(sharp.y + sharp.h).toBeGreaterThan(organ.y + organ.r);
    expect(sharp.y).toBeLessThan(organ.y - L.tile * CFG.antiphonVeinRows);
    expect(underAim(at).bottom).toBeGreaterThan(organ.y + organ.r);
  });
});

describe("THE ANTIPHON's reveal", () => {
  it("stands what arrived at the organ's place for a moment, then goes, and resets", () => {
    const fx = new Effects();
    fx.ingest([{ type: "antiphonPit", col: 5, shape: 3, pits: 1 }], L, 0, () => 0, CFG);
    expect(fx.boss.antiphon.reveal.showing).toBe(true);
    fx.update(0.5, L);
    expect(fx.boss.antiphon.reveal.showing).toBe(true);
    fx.update(1, L);
    expect(fx.boss.antiphon.reveal.showing).toBe(false);
    fx.ingest([{ type: "antiphonHarden", col: 2, shape: 4 }], L, 0, () => 0, CFG);
    expect(fx.boss.antiphon.reveal.showing).toBe(true);
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});

describe("THE ANTIPHON's siren", () => {
  it("gives the explainer EXPLAIN SHAPE and the chooser CHOOSE SHAPE, swapping a level on", () => {
    const world = hung();
    const s = bare(world);
    expect(bossDuty("p1", world)).toBe("EXPLAIN SHAPE");
    expect(bossDuty("p2", world)).toBe("CHOOSE SHAPE");
    expect(bossDuty("test", world)).toBe("EXPLAIN SHAPE · CHOOSE SHAPE");
    expect(commsCall(world)).toEqual({ p1: true, p2: false });
    s.pits = [4];
    expect(bossDuty("p1", world)).toBe("CHOOSE SHAPE");
    expect(bossDuty("p2", world)).toBe("EXPLAIN SHAPE");
    expect(commsCall(world)).toEqual({ p1: false, p2: true });
  });

  it("writes the job under the dial on each screen, and goes quiet once the body is down", () => {
    const world = hung();
    grown(world);
    expect(drawn(world, "p1", 3).words).toContain("EXPLAIN SHAPE");
    expect(drawn(world, "p2", 3).words).toContain("CHOOSE SHAPE");
    bare(world).downBeat = world.beat;
    expect(bossDuty("p1", world)).toBeNull();
    expect(commsCall(world)).toBeNull();
  });
});
