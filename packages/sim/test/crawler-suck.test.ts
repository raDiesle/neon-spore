import { describe, expect, it } from "bun:test";
import { applyCommand } from "../src/commands.js";
import { linkIsArmoured, linkIsSucked } from "../src/crawler-part.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  linkOrder,
  type SimConfig,
  type SimEvent,
  shieldAsked,
  step,
  suckAsked,
  ticksPerBeat,
} from "../src/index.js";
import type { Creature } from "../src/types.js";

/**
 * THE CRAWLER's suck ring: the fourth answer along a worm, taken by the maw
 * with the cannon under it (`crawler-suck.ts`), and the SHIELD and SUCK
 * buttons lit when a ring of theirs stands over them (`ship-asks.ts`).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const wormOf = (world: ReturnType<typeof createWorld>): Creature[] =>
  world.creatures.filter((c) => c.kind === "crawler").sort((a, b) => linkOrder(a) - linkOrder(b));

/** A worm of four segments, walked until its suck ring is on the field. */
function suckOnField(): ReturnType<typeof createWorld> {
  const world = createWorld({ ...CFG }, 0, [
    { beat: 0, col: 0, kind: "crawler", color: null, segments: 4, side: "left" },
  ]);
  for (let t = 0; t < TPB * 40; t++) {
    step(world, []);
    const ring = wormOf(world).find(linkIsSucked);
    if (ring && ring.col >= 0) return world;
  }
  throw new Error("the suck ring never came on");
}

const ringOf = (world: ReturnType<typeof createWorld>): Creature =>
  wormOf(world).find(linkIsSucked)!;

describe("the maw under a suck ring", () => {
  it("takes it on the press with the cannon under it, and closes the body up", () => {
    const world = suckOnField();
    const ring = ringOf(world);
    const before = wormOf(world).length;
    world.cannonCol = ring.col;
    applyCommand(world, { tick: world.tick, player: 1, command: { kind: "intake" } });
    expect(wormOf(world)).toHaveLength(before - 1);
    expect(wormOf(world).some(linkIsSucked)).toBe(false);
    expect(world.events.some((e: SimEvent) => e.type === "crawlerSwallow")).toBe(true);
    // Nothing thrown: no deflect, no hole, no break.
    expect(world.events.some((e: SimEvent) => e.type === "deflect" || e.type === "hole")).toBe(
      false,
    );
  });

  it("takes nothing when the cannon is a column off", () => {
    const world = suckOnField();
    const ring = ringOf(world);
    world.cannonCol = ring.col === 0 ? 1 : ring.col - 1;
    applyCommand(world, { tick: world.tick, player: 1, command: { kind: "intake" } });
    expect(wormOf(world).some(linkIsSucked)).toBe(true);
  });

  it("is not the dome's: an armed shield under it leaves it standing", () => {
    const world = suckOnField();
    for (let t = 0; t < TPB * 2; t++) {
      world.shieldCol = Math.max(0, ringOf(world).col);
      world.guardTick = world.tick;
      step(world, []);
    }
    expect(wormOf(world).some(linkIsSucked)).toBe(true);
  });

  it("hashes which ring is the mouth's", () => {
    const world = suckOnField();
    const before = hashWorld(world);
    delete ringOf(world).crawlerSuck;
    expect(hashWorld(world)).not.toBe(before);
  });
});

describe("the buttons a ring lights", () => {
  it("lights SUCK with the cannon under the suck ring, and only then", () => {
    const world = suckOnField();
    const ring = ringOf(world);
    world.cannonCol = ring.col === 0 ? 1 : ring.col - 1;
    expect(suckAsked(world)).toBe(false);
    world.cannonCol = ring.col;
    expect(suckAsked(world)).toBe(true);
  });

  it("lights SHIELD with the shield under a shield ring", () => {
    const world = suckOnField();
    const plate = wormOf(world).find((c) => linkIsArmoured(c) && c.col >= 0)!;
    world.shieldCol = plate.col;
    expect(shieldAsked(world)).toBe(true);
    world.shieldCol = ringOf(world).col;
    expect(shieldAsked(world)).toBe(false);
  });
});
