import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { CURTAIN_COLS, curtainBody, type World } from "@neon-spore/sim";
import {
  CURTAIN_GIVE_ACROSS,
  CURTAIN_GIVE_SAG,
  CURTAIN_GIVE_SAG_MAX,
  type CurtainGive,
  curtainGive,
  NO_GIVE,
} from "../src/curtain-give.js";
import { curtainHem } from "../src/curtain-hem.js";
import { computeLayout } from "../src/layout.js";
import { body, stood } from "./curtain-harness.js";
import { CFG, FRAME_TIMEOUT_MS } from "./frame-harness.js";

/**
 * THE CURTAIN gives under a hand (`curtain-give.ts`): the cloth goes ahead of
 * the rail by what the hand has carried and not yet been paid, dips where it
 * is held, deepens its dip when two hands pull apart, does not snap back the
 * frame the column is paid, and never shows a core from under its trailing
 * edge.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
const MID = 400;

/** The fabric, covered, with each seat's hand on it carrying `p1`/`p2` of a column, or off it with `null`. */
function held(p1: number | null, p2: number | null): World {
  const world = stood(false);
  const sheet = curtainBody(world, body(world));
  if (sheet === undefined) throw new Error("no fabric");
  sheet.fromCol = sheet.col;
  if (p1 !== null) {
    world.gripP1 = sheet.id;
    world.pushP1 = { milli: Math.round(p1 * CFG.gripPushMilli), cols: 0 };
  }
  if (p2 !== null) {
    world.gripP2 = sheet.id;
    world.pushP2 = { milli: Math.round(p2 * CFG.gripPushMilli), cols: 0 };
  }
  return world;
}

function giveOf(world: World, beatPhase = 0, gathered = 0): CurtainGive {
  const c = body(world);
  const sheet = curtainBody(world, c);
  if (sheet === undefined) throw new Error("no fabric");
  return curtainGive(L, world, c, sheet, beatPhase, MID, gathered);
}

describe("THE CURTAIN gives under a hand", () => {
  it("hangs as it was with no hand on it", () => {
    expect(giveOf(held(null, null))).toBe(NO_GIVE);
  });

  it("carries the cloth under one hand the way it went, and dips it", () => {
    const g = giveOf(held(0.5, null));
    expect(g.x).toBe(MID);
    expect(g.across / L.tile).toBeCloseTo(0.5 * CURTAIN_GIVE_ACROSS, 2);
    expect(g.sag / L.tile).toBeCloseTo(CURTAIN_GIVE_SAG, 9);
    expect(giveOf(held(-0.5, null)).across).toBeCloseTo(-g.across, 6);
  });

  it("is seen: a full carry takes the cloth half a tile", () => {
    expect(giveOf(held(0.99, null)).across / L.tile).toBeGreaterThan(0.45);
  });

  it("holds two hands pulling apart where they are, and stretches the dip between them", () => {
    const apart = giveOf(held(0.6, -0.6));
    const together = giveOf(held(0.6, 0.6));
    expect(Math.abs(apart.across)).toBeLessThan(1e-9);
    expect(apart.sag).toBeGreaterThan(together.sag);
  });

  it("does not snap back the frame the column is paid", () => {
    const before = giveOf(held(0.999, null), 1);
    const world = held(1, null);
    const sheet = curtainBody(world, body(world));
    if (sheet === undefined || world.pushP1 === null) throw new Error("no fabric");
    sheet.fromCol = sheet.col;
    sheet.col += 1;
    world.pushP1.cols = 1;
    const after = giveOf(world, 0);
    expect(after.across).toBeCloseTo(before.across, 0);
  });

  it("strains no further than its caps, however far the hands have gone", () => {
    expect(giveOf(held(5, 5)).across / L.tile).toBeLessThanOrEqual(CURTAIN_GIVE_ACROSS);
    expect(giveOf(held(5, -5)).sag / L.tile).toBeLessThanOrEqual(CURTAIN_GIVE_SAG_MAX);
  });

  it("dies as the hem is gathered", () => {
    const g = giveOf(held(0.5, null), 0, 1);
    expect(g.across).toBe(0);
    expect(g.sag).toBe(0);
  });
});

describe("THE CURTAIN's cloth under a hand", () => {
  const X0 = 100;
  const CY = 400;
  const ALL = [true, true, true, true, true, true, true];
  const AT_LEFT: CurtainGive = { x: X0, across: 0.5 * L.tile, sag: 0.2 * L.tile, spread: L.tile };

  it("keeps the trailing edge over its column, so no core is shown from under it", () => {
    const pulledRight = curtainHem(L, X0, CY, ALL, 0, 0, 0, 0, AT_LEFT);
    expect(pulledRight[CURTAIN_COLS - 1]?.to.x).toBe(X0);
    const pulledLeft = curtainHem(L, X0, CY, ALL, 0, 0, 0, 0, {
      ...AT_LEFT,
      across: -AT_LEFT.across,
    });
    expect(pulledLeft[CURTAIN_COLS - 1]?.to.x).toBeLessThan(X0);
  });

  it("dips the hem most under the hand", () => {
    const rest = curtainHem(L, X0, CY, ALL, 0, 0, 0);
    const held = curtainHem(L, X0, CY, ALL, 0, 0, 0, 0, AT_LEFT);
    const dips = held.map((s, i) => s.joint.y - (rest[i]?.joint.y ?? 0));
    // Right to left: the scallop nearest the hand, the last, dips furthest.
    const nearest = dips[CURTAIN_COLS - 1] ?? 0;
    expect(Math.max(...dips)).toBe(nearest);
    expect(dips[0] ?? 0).toBeLessThan(nearest);
  });
});
