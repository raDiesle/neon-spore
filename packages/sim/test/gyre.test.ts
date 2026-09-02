import { describe, expect, it } from "bun:test";
import { onBeat } from "../src/beat.js";
import { advanceBullets, fire } from "../src/bullets.js";
import { applyCommand } from "../src/commands.js";
import { DEFAULT_CONFIG, hullRow, type SimConfig, ticksPerBeat } from "../src/config.js";
import { setGrip } from "../src/grip.js";
import { gyreMountsLeft, gyreSpinPerBeat, gyreSucked } from "../src/gyre.js";
import {
  GYRE_CLICKS,
  GYRE_LAP_BEATS,
  GYRE_MOUNTS,
  GYRE_RADIUS,
  GYRE_RING,
  gyreClick,
  gyreLap,
  gyreRestCol,
  gyreRestRow,
  mountClick,
  mountColor,
} from "../src/gyre-rim.js";
import { hashWorld } from "../src/hash.js";
import type { Creature } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * THE GYRE: six bodies on a turning rim, a diamond that sinks a row a lap, and
 * a maw that slows the turn from anywhere.
 *
 * What is worth pinning is the half a reader of `gyre.ts` cannot check by eye.
 * The rim has to stay six *distinct* tiles at every one of its twelve
 * positions — if two mounts ever share a column the pair is naming a lane with
 * two answers in it. The colours have to alternate all the way round, because
 * that is the creature. The maw has to work with the cannon nowhere near the
 * wheel, because that is the coupling. And the wheel has to grind the ship
 * eventually and break when it is cleared, because those are the two ways a
 * wave with one in it can end.
 */

const cfg: SimConfig = { ...DEFAULT_CONFIG, briefings: false };

/** A world with one wheel and nothing else, `beats` beats after it entered. */
function withGyre(beats = 0): World {
  const world = createWorld(cfg, 1);
  startWave(world, 0, [{ beat: 0, col: gyreRestCol(cfg), kind: "gyre", color: null }]);
  for (let i = 0; i <= beats; i++) onBeat(world);
  return world;
}

const hub = (world: World): Creature => world.creatures.find((c) => c.kind === "gyre")!;
const mounts = (world: World): Creature[] => world.creatures.filter((c) => c.kind === "mount");

/** Open the maw, the way player 1's lobe does. */
function suck(world: World): void {
  applyCommand(world, { tick: world.tick, player: 1, command: { kind: "intake" } });
}

describe("the rim", () => {
  it("arrives as a hub and six bodies", () => {
    const world = withGyre();
    expect(world.creatures).toHaveLength(1 + GYRE_MOUNTS);
    expect(gyreMountsLeft(world, hub(world).id)).toBe(GYRE_MOUNTS);
  });

  /**
   * The whole reason `GYRE_RING` is a table of twelve tiles and not a circle.
   * At an arbitrary angle two of the six round onto tiles a whole radius in
   * from where the other four land: the wheel visibly buckles, and two bodies
   * end up on one tile, which is a body the pair can never shoot.
   *
   * **Two mounts sharing a column is not that failure, and is not a defect.**
   * A rim is round and a column is a line through it, so at half the positions
   * of the turn three columns carry two bodies each and at the other half four
   * carry one or two. A shot meets the lower of the pair and the upper one is
   * still there afterwards — a lane worth two shots, which the pair can see
   * and can say. What must never happen is two bodies on one *tile*, and that
   * is what is pinned. The most a column may ever carry is pinned with it: at
   * three the lane would be unreadable.
   */
  it("never stands two bodies on one tile, at any position of the turn", () => {
    for (let click = 0; click < GYRE_CLICKS; click++) {
      const perCol = new Map<number, number>();
      const tiles = new Set<string>();
      for (let slot = 0; slot < GYRE_MOUNTS; slot++) {
        const [dcol, drow] = GYRE_RING[mountClick(click, slot)]!;
        perCol.set(dcol, (perCol.get(dcol) ?? 0) + 1);
        tiles.add(`${dcol},${drow}`);
      }
      expect(tiles.size, `click ${click}`).toBe(GYRE_MOUNTS);
      expect(Math.max(...perCol.values()), `click ${click}`).toBeLessThanOrEqual(2);
    }
  });

  /** Every rim tile is exactly the radius out, in the metric a grid has. */
  it("keeps every position on the rim", () => {
    for (const [dcol, drow] of GYRE_RING) {
      expect(Math.max(Math.abs(dcol), Math.abs(drow))).toBe(GYRE_RADIUS);
    }
  });

  it("alternates red and cyan the whole way round", () => {
    const world = withGyre();
    const bySlot = [...mounts(world)].sort((a, b) => (a.gyreSlot ?? 0) - (b.gyreSlot ?? 0));
    expect(bySlot.map((c) => c.color)).toEqual(["red", "cyan", "red", "cyan", "red", "cyan"]);
    for (const c of bySlot) expect(c.color).toBe(mountColor(c.gyreSlot ?? 0));
  });

  it("carries them: every mount stands where the turn says, on every beat", () => {
    const world = withGyre();
    for (let i = 0; i < 20; i++) {
      onBeat(world);
      const h = hub(world);
      for (const c of mounts(world)) {
        const [dcol, drow] = GYRE_RING[mountClick(gyreClick(h), c.gyreSlot ?? 0)]!;
        expect(c.col).toBe(h.col + dcol);
        expect(c.row).toBe(h.row + drow);
      }
    }
  });
});

describe("the route", () => {
  it("falls a row a beat until it reaches the middle, then stops falling", () => {
    const world = withGyre();
    const rest = gyreRestRow(cfg);
    for (let i = 1; i <= rest; i++) {
      onBeat(world);
      expect(hub(world).row).toBe(i);
    }
    // From here it walks. It never falls past its own diamond again, and the
    // sinking below is what takes it lower.
    const seen: number[] = [];
    for (let i = 0; i < GYRE_LAP_BEATS; i++) {
      onBeat(world);
      seen.push(hub(world).row);
    }
    expect(Math.max(...seen)).toBeLessThanOrEqual(rest + 2);
    expect(Math.min(...seen)).toBeGreaterThanOrEqual(rest - 2);
  });

  it("comes back to the same point of the diamond a lap later, a row lower", () => {
    const world = withGyre();
    // Walk it into the patrol first. The last beat of the fall is not the
    // first beat of the lap — it lands dead centre and the diamond starts from
    // there — so a lap has to be measured from a beat that is already on one.
    while (hub(world).row < gyreRestRow(cfg)) onBeat(world);
    onBeat(world);
    const at = { col: hub(world).col, row: hub(world).row };
    for (let i = 0; i < GYRE_LAP_BEATS; i++) onBeat(world);
    expect(hub(world).col).toBe(at.col);
    // A row lower, and that is the sinking rather than a drift: one lap, one row.
    expect(hub(world).row).toBe(at.row + 1);
  });

  it("stops sinking at gyreSinkLaps, and the hub never reaches the hull", () => {
    const world = withGyre();
    for (let i = 0; i < gyreRestRow(cfg) + GYRE_LAP_BEATS * (cfg.gyreSinkLaps + 3); i++) {
      onBeat(world);
      const h = world.creatures.find((c) => c.kind === "gyre");
      if (!h) break;
      expect(h.row).toBeLessThanOrEqual(hullRow(cfg) - GYRE_RADIUS);
    }
    expect(gyreLap(cfg, 500)).toBe(cfg.gyreSinkLaps);
  });

  /**
   * Being slow has to cost something, or the wheel is a puzzle with no clock
   * on it. Left alone it grinds: once the circuit has sunk as far as it goes,
   * whichever body is at the foot of the wheel when it passes the bottom of
   * the diamond is a body that reached the ship.
   */
  it("takes hull once it has sunk, without the hub ever arriving", () => {
    const world = withGyre();
    const before = world.hullMilli;
    for (let i = 0; i < gyreRestRow(cfg) + GYRE_LAP_BEATS * (cfg.gyreSinkLaps + 2); i++) {
      onBeat(world);
    }
    expect(world.hullMilli).toBeLessThan(before);
    expect(gyreMountsLeft(world, hub(world).id)).toBeLessThan(GYRE_MOUNTS);
  });
});

describe("the turn", () => {
  it("gets faster the longer it is up, and stops at one position a beat", () => {
    const world = withGyre();
    const first = gyreSpinPerBeat(world, hub(world));
    for (let i = 0; i < 6; i++) onBeat(world);
    expect(gyreSpinPerBeat(world, hub(world))).toBeGreaterThan(first);
    for (let i = 0; i < 200; i++) onBeat(world);
    const h = world.creatures.find((c) => c.kind === "gyre");
    if (h) expect(gyreSpinPerBeat(world, h)).toBe(cfg.gyreSpinCapMilli);
  });

  /**
   * The coupling, and the one assertion this creature exists for: the cannon
   * is parked in column zero, five columns from the wheel, and the pull works
   * anyway. A version that needed the column would pass every other test in
   * this file and be a different creature.
   */
  it("slows under the maw, wherever the cannon is standing", () => {
    const world = withGyre(gyreRestRow(cfg) + 8);
    world.cannonCol = 0;
    const loose = gyreSpinPerBeat(world, hub(world));
    suck(world);
    expect(gyreSucked(world)).toBe(true);
    const held = gyreSpinPerBeat(world, hub(world));
    expect(held).toBe(cfg.gyreSuckSpinMilli);
    expect(held).toBeLessThan(loose);
  });

  it("turns fewer positions over the window than it would have", () => {
    const beats = 4;
    const step = (pull: boolean): number => {
      const world = withGyre(gyreRestRow(cfg) + 8);
      if (pull) suck(world);
      const from = hub(world).gyreTurnMilli ?? 0;
      for (let i = 0; i < beats; i++) onBeat(world);
      return ((hub(world).gyreTurnMilli ?? 0) - from + GYRE_CLICKS * 1000) % (GYRE_CLICKS * 1000);
    };
    expect(step(true)).toBeLessThan(step(false));
  });

  it("lets go when the window runs out", () => {
    const world = withGyre(gyreRestRow(cfg));
    suck(world);
    const ticks = Math.round((cfg.gyreSuckMs / 1000) * cfg.tickHz);
    world.tick += ticks + 1;
    expect(gyreSucked(world)).toBe(false);
  });
});

describe("clearing one", () => {
  /** A hand on a wheel drags at nothing, so it is refused on both halves. */
  it("cannot be gripped, hub or body", () => {
    const world = withGyre();
    setGrip(world, 1, hub(world).id);
    expect(world.gripP1).toBe(0);
    setGrip(world, 2, mounts(world)[0]!.id);
    expect(world.gripP2).toBe(0);
  });

  /**
   * A shot fired up a column the hub is standing in has to reach whatever is
   * beyond it. The middle of a wheel is empty — no body stands there, and a
   * hub that stopped bolts would be a wall across five columns of the field.
   */
  it("does not stop a shot at its hub", () => {
    const world = withGyre(gyreRestRow(cfg));
    const h = hub(world);
    // Take the whole rim off so the only thing left in the column is the hub.
    world.creatures = world.creatures.filter((c) => c.kind === "gyre");
    world.cannonCol = h.col;
    fire(world, "red");
    const tpb = ticksPerBeat(cfg);
    for (let i = 0; i < tpb * 3; i++) {
      world.tick += 1;
      advanceBullets(world);
    }
    // It went past the hub and out of the top of the field rather than being
    // spent on it — the hub is still there and the bolt is not.
    expect(world.creatures.find((c) => c.kind === "gyre")).toBeDefined();
    expect(world.bullets).toHaveLength(0);
  });

  it("breaks and goes when the last body comes off it", () => {
    const world = withGyre(gyreRestRow(cfg));
    const id = hub(world).id;
    const gone = new Set(mounts(world).map((c) => c.id));
    world.creatures = world.creatures.filter((c) => !gone.has(c.id));
    expect(gyreMountsLeft(world, id)).toBe(0);
    onBeat(world);
    expect(world.creatures.find((c) => c.kind === "gyre")).toBeUndefined();
    expect(world.events.some((e) => e.type === "gyreBroke")).toBe(true);
  });

  it("pays for the wheel on top of the six bodies", () => {
    const world = withGyre(gyreRestRow(cfg));
    const before = world.score;
    world.creatures = world.creatures.filter((c) => c.kind === "gyre");
    onBeat(world);
    // The break *and* the wave, because taking the last body off the last
    // wheel is both at once: `breakSpentGyres` runs at the top of the beat, so
    // the field is genuinely empty by the time the clear test at the bottom of
    // it asks — which is the whole reason that call is where it is.
    expect(world.score - before).toBe(cfg.scoreGyreBreak + cfg.scoreWave);
  });
});

/**
 * The property that matters for lockstep, asked the way every other replay in
 * this package asks it: two runs of the same beats in one process, compared
 * against each other rather than against a pinned constant
 * (`docs/decisions.md` #19).
 */
describe("determinism", () => {
  it("fingerprints the same twice over a whole encounter", () => {
    const run = (): number => {
      const world = withGyre();
      for (let i = 0; i < 40; i++) {
        onBeat(world);
        if (i === 12) suck(world);
        if (i === 20) {
          world.cannonCol = 4;
          fire(world, "cyan");
        }
        world.tick += ticksPerBeat(cfg);
        advanceBullets(world);
      }
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
