import { describe, expect, it } from "bun:test";
import {
  bastionFrontGun,
  bastionLeft,
  bastionPiecesAll,
  bastionPlateOf,
  bastionPlateWay,
} from "../src/bastion.js";
import { bastionStruck, bastionVerdict } from "../src/bastion-shot.js";
import {
  bastion,
  CFG,
  hashWorld,
  install,
  lift,
  MID,
  only,
  PULL,
  plate,
  pullPlate,
  rim,
  runUntil,
  shield,
  shot,
  TPB,
  tick,
  toLayer,
} from "./bastion-rig.js";

/**
 * THE BASTION's receipts, one rule a test (`sim/bastion.ts`): each seat
 * pulls only its own plates, and only out; a plate let go short snaps back
 * and nothing else is lost; the rim turns the moon and the gun at the front
 * is the one a shot meets, in its colour; a node is burst by the shield and
 * charges again when it is not; the port is met in its column in either
 * colour; a shell run out grows back with no hull hit; and the last shell
 * off blows the core.
 */

describe("THE BASTION", () => {
  it("installs every shell on, and lights the plates after it comes in", () => {
    const world = install();
    const s = bastion(world);
    expect(s.phase).toBe("enter");
    expect(bastionPiecesAll(s)).toBe(8 + 6 + 5 + 3);
    const seen = toLayer(world);
    expect(seen.has("bastionLayer")).toBe(true);
    expect(bastion(world).cursor).toBe(0);
  });

  it("tears a plate pulled out past the reach along its own way", () => {
    const world = install();
    toLayer(world);
    const s = bastion(world);
    const types = pullPlate(world, 0, bastionPlateWay(bastionPlateOf(s, 0)));
    expect(types).toContain("bastionTear");
    expect(bastionLeft(s)).toBe(7);
    expect(bastionPlateOf(s, 0)).toBe(1);
  });

  it("counts nothing pulled sideways or back towards the core", () => {
    const world = install();
    toLayer(world);
    const s = bastion(world);
    const [wx, wy] = bastionPlateWay(0);
    tick(world, [plate(1, 0)]);
    tick(world, [plate(1, 0, -wy * 3, wx * 3)]);
    expect(s.pullMilli[0]).toBe(0);
    tick(world, [plate(1, 0, -wx * 3, -wy * 3)]);
    expect(s.pullMilli[0]).toBe(0);
    expect(bastionLeft(s)).toBe(8);
  });

  it("snaps a plate let go short back, and only that one starts over", () => {
    const world = install();
    toLayer(world);
    const s = bastion(world);
    pullPlate(world, 1, bastionPlateWay(bastionPlateOf(s, 1)));
    expect(bastionLeft(s)).toBe(7);
    const types = pullPlate(world, 0, bastionPlateWay(0), PULL / 2);
    expect(types).toContain("bastionSnap");
    expect(bastionLeft(s)).toBe(7);
    expect(bastionPlateOf(s, 0)).toBe(0);
    expect(s.pullMilli[0]).toBe(0);
  });

  it("holds nothing more under a thumb that tore until it lifts", () => {
    const world = install();
    toLayer(world);
    const s = bastion(world);
    const [wx, wy] = bastionPlateWay(0);
    tick(world, [plate(1, 0)]);
    tick(world, [plate(1, 0, wx * 2, wy * 2)]);
    expect(bastionLeft(s)).toBe(7);
    tick(world, [plate(1, 0, wx * 4, wy * 4)]);
    expect(bastionLeft(s)).toBe(7);
    tick(world, [lift(1, 0)]);
    expect(pullPlate(world, 0, bastionPlateWay(1))).toContain("bastionTear");
  });

  it("says a thumb on the partner's plates or the navigator's on the rim, and moves nothing", () => {
    const world = install();
    toLayer(world);
    expect(tick(world, [plate(2, 0)])).toContain("bastionWrong");
    expect(tick(world, [rim(2, 0)])).toContain("bastionWrong");
    expect(bastionLeft(bastion(world))).toBe(8);
  });

  it("sheds the plates when all eight are off, then lights the ring", () => {
    const world = install();
    toLayer(world);
    const s = bastion(world);
    const seen = new Set<string>();
    for (let k = 0; k < 4; k++) {
      for (const side of [0, 1] as const) {
        for (const t of pullPlate(world, side, bastionPlateWay(bastionPlateOf(s, side))))
          seen.add(t);
      }
    }
    expect(seen.has("bastionShed")).toBe(true);
    expect(s.phase).toBe("shed");
    expect(s.cursor).toBe(1);
    toLayer(world);
    expect(bastion(world).steps[bastion(world).cursor]?.layer).toBe("ring");
  });

  it("turns the moon by the pilot's rim, either way, and only on the ring", () => {
    const world = install(only("ring"));
    toLayer(world);
    const s = bastion(world);
    tick(world, [rim(1, 0)]);
    tick(world, [rim(1, 400)]);
    const one = s.yawMilli;
    expect(one).not.toBe(0);
    tick(world, [rim(1, 0)]);
    expect(s.yawMilli).toBe(0);
    tick(world, [rim(1, -400)]);
    expect(s.yawMilli).toBe(360_000 - one);
  });

  it("blows the gun at the front shot in its colour, and keeps it on the wrong one", () => {
    const world = install(only("ring"));
    toLayer(world);
    const s = bastion(world);
    expect(bastionFrontGun(world, s)).toBe(0);
    expect(bastionVerdict(world, MID, "cyan")).toBe("wrong");
    expect(bastionVerdict(world, MID + 1, "red")).toBe("armour");
    bastionStruck(world, shot(MID, "cyan"));
    expect(bastionLeft(s)).toBe(6);
    bastionStruck(world, shot(MID, "red"));
    expect(world.events.map((e) => e.type)).toContain("bastionGun");
    expect(bastionLeft(s)).toBe(5);
    expect(bastionFrontGun(world, s)).toBe(-1);
    s.yawMilli = 300_000;
    expect(bastionFrontGun(world, s)).toBe(1);
    expect(bastionVerdict(world, MID, "cyan")).toBe("target");
  });

  it("bursts a charging node under a raised shield", () => {
    const world = install(only("lattice"));
    toLayer(world);
    const s = bastion(world);
    expect(s.dischargeBeat).toBeGreaterThan(0);
    const seen = shield(world, MID - 2);
    expect(seen.has("bastionBurst")).toBe(true);
    expect(bastionLeft(s)).toBe(4);
  });

  it("charges the same node again when its lightning came down unanswered", () => {
    const world = install(only("lattice"));
    toLayer(world);
    const s = bastion(world);
    const seen = runUntil(world, (w) => bastion(w).dischargeBeat < 0);
    expect(seen.has("bastionArc")).toBe(true);
    expect(world.guard.tries).toBe(0);
    expect(bastionLeft(s)).toBe(5);
    const again = runUntil(world, (w) => bastion(w).dischargeBeat >= 0, 4);
    expect(again.has("bastionCharge")).toBe(true);
  });

  it("takes the port in its own column in either colour, and nothing elsewhere", () => {
    const world = install(only("port"));
    toLayer(world);
    const s = bastion(world);
    expect(bastionVerdict(world, MID, "red")).toBe("armour");
    bastionStruck(world, shot(MID - 2, "cyan"));
    expect(world.events.map((e) => e.type)).toContain("bastionPort");
    expect(bastionVerdict(world, MID + 1, "red")).toBe("target");
    expect(bastionLeft(s)).toBe(2);
  });

  it("grows a shell run out back whole, with no hull hit, and lights it again", () => {
    const world = install(only("ring"));
    toLayer(world);
    const s = bastion(world);
    bastionStruck(world, shot(MID, "red"));
    const scars = world.scars.length;
    const seen = runUntil(world, (w) => bastion(w).phase === "regrow", 50);
    expect(seen.has("bastionRegrow")).toBe(true);
    expect(world.scars.length).toBe(scars);
    toLayer(world);
    expect(bastionLeft(s)).toBe(6);
    expect(s.cursor).toBe(0);
  });

  it("blows the core after the last shell, and leaves", () => {
    const world = install(only("port"));
    toLayer(world);
    for (const col of [MID - 2, MID + 1, MID]) bastionStruck(world, shot(col, "red"));
    expect(bastion(world).phase).toBe("spent");
    const seen = runUntil(world, (w) => w.boss === null, CFG.bastionSpentBeats + 2);
    expect(seen.has("bastionOut")).toBe(true);
  });

  it("plays the same moon to the same hash", () => {
    const run = () => {
      const world = install();
      toLayer(world);
      pullPlate(world, 0, bastionPlateWay(0));
      for (let t = 0; t < TPB * 3; t++) tick(world);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
