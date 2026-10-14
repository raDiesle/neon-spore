import { describe, expect, it } from "bun:test";
import { type BastionStep, bastionLeft } from "../src/bastion.js";
import {
  BASTION_PLATES_A_SIDE,
  BASTION_TRACKS,
  bastionTrackAt,
  bastionTrackLen,
  bastionTrackPoints,
} from "../src/bastion-track.js";
import { bastion, CFG, install, lift, plate, pullPlate, tick, toLayer } from "./bastion-rig.js";

/**
 * THE BASTION's tracks (`sim/bastion-track.ts`): a curved plate tears only
 * when carried along its curve to the end; a thumb that strays off it loses
 * the plate, said, and holds nothing until it lifts; a thumb cannot cut
 * across a bend; and every curve is as long as its table says, and the
 * right side's the left's mirrored.
 */

/** Armour whose top plate on each side is pulled along `track`. */
const curved = (track: BastionStep["tracks"] & {}): BastionStep[] => [
  { layer: "plates", tracks: track, beats: 40 },
];

describe("THE BASTION's tracks", () => {
  it("tears a curved plate carried along its curve to the end", () => {
    for (const track of ["sweep", "snake", "climb"] as const) {
      const world = install(curved([track]));
      toLayer(world);
      expect(pullPlate(world, 0)).toContain("bastionTear");
      expect(pullPlate(world, 1)).toContain("bastionTear");
      expect(bastionLeft(bastion(world))).toBe(6);
    }
  });

  it("slips a plate whose thumb strays off its curve, says so, and holds nothing until it lifts", () => {
    const world = install(curved(["sweep"]));
    toLayer(world);
    const s = bastion(world);
    tick(world, [plate(1, 0)]);
    const mid = bastionTrackAt(CFG, "sweep", 0, 1200);
    tick(world, [plate(1, 0, mid.x, mid.y)]);
    expect(s.pullMilli[0]).toBeGreaterThan(1000);
    const off = CFG.bastionSlackMilli + 400;
    expect(tick(world, [plate(1, 0, mid.x + off, mid.y - off)])).toContain("bastionSnap");
    expect(s.pullMilli[0]).toBe(0);
    tick(world, [plate(1, 0, mid.x, mid.y)]);
    expect(s.pullMilli[0]).toBe(0);
    tick(world, [lift(1, 0)]);
    expect(pullPlate(world, 0)).toContain("bastionTear");
  });

  it("lets no thumb cut across a bend to the curve's end", () => {
    const world = install(curved(["snake"]));
    toLayer(world);
    const s = bastion(world);
    const len = bastionTrackLen(CFG, "snake");
    const end = bastionTrackAt(CFG, "snake", 0, len);
    tick(world, [plate(1, 0)]);
    const types = tick(world, [plate(1, 0, end.x, end.y)]);
    expect(types).not.toContain("bastionTear");
    expect(s.pullMilli[0]).toBeLessThan(CFG.bastionStrideMilli + 1);
    expect(bastionLeft(s)).toBe(8);
  });

  it("is as long as its table, and the right side's is the left's mirrored", () => {
    for (const track of BASTION_TRACKS) {
      const len = bastionTrackLen(CFG, track);
      for (let k = 0; k < BASTION_PLATES_A_SIDE; k++) {
        const left = bastionTrackPoints(CFG, track, k);
        const right = bastionTrackPoints(CFG, track, k + BASTION_PLATES_A_SIDE);
        expect(right).toEqual(left.map((p) => ({ x: p.x === 0 ? 0 : -p.x, y: p.y })));
        let walked = 0;
        for (let j = 1; j < left.length; j++) {
          const a = left[j - 1] ?? { x: 0, y: 0 };
          const b = left[j] ?? a;
          walked += Math.hypot(b.x - a.x, b.y - a.y);
        }
        expect(Math.abs(walked - len)).toBeLessThan(len * 0.01);
      }
    }
  });

  it("pulls further than the straight pull of 1800 it was, on every track", () => {
    for (const track of BASTION_TRACKS) expect(bastionTrackLen(CFG, track)).toBeGreaterThan(1800);
  });
});
