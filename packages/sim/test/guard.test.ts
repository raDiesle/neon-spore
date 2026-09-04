import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { hullPercent, shieldRow } from "../src/hull.js";
import { fallTilesPerBeat, type RockKind } from "../src/kinds.js";
import type { TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * Two reports from the owner, and one cause under both of them.
 *
 * *The shield button does not shield.* At the moment a rock meets the shield,
 * pressing the trigger did nothing at all: the rule was only asked on the
 * ship's own row, a whole beat further down, so the press the player makes
 * while watching the rock touch the dome was answered by nothing.
 *
 * *A deflected rock arrives before it leaves.* Same cause, seen from the other
 * side: a rock that was turned away had already travelled through the shield
 * to the plating before anything happened to it, so the turn came from inside
 * the thing that was supposed to have stopped it.
 *
 * The owner suspected the cannon's column, because a rock that got that far
 * ends up drawn over the ship next to whichever lobe is standing there. The
 * cannon has nothing to do with it, and the last test here pins that.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
/**
 * Where the shield stands, written out by hand exactly once and on purpose.
 * Everything below measures against *this*, never against `shieldRow` — a
 * test that asks the rule where the rule is cannot fail when the rule is
 * wrong, and this file exists to fail when it is.
 */
const SHIELD = HULL - 1;

/** A creature listed at wave-beat 0 stands on row `r` at beat `r + 1`. */
const tickOfRow = (row: number): number => TPB * (row + 1);
/** The beat the rock meets the shield, and the beat it would meet the ship. */
const SHIELD_TICK = tickOfRow(SHIELD);
const IMPACT_TICK = tickOfRow(HULL);
/**
 * The beat the rock is actually *through* the ship. It is not `IMPACT_TICK`:
 * a rock's fall stops on the hull row instead of carrying it past, and it
 * stands there for the one beat render/ spends drawing it cross that last
 * tile. That beat is the third and last time the shield is asked, and it is
 * the one the owner was pressing on when nothing happened.
 */
const BREACH_TICK = IMPACT_TICK + TPB;

const rock = (col: number, kind: RockKind = "meteor"): SpawnEntry => ({
  beat: 0,
  col,
  kind,
  color: null,
});
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});

interface Run {
  world: World;
  events: SimEvent[];
  /** The lowest row anything was ever seen standing on. */
  deepestRow: number;
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  let deepestRow = -1;
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
    for (const c of world.creatures) deepestRow = Math.max(deepestRow, c.row);
  }
  return { world, events, deepestRow };
}

describe("the shield answers a rock where the shield is", () => {
  it("stands one row above the ship, which is where the dome is", () => {
    expect(shieldRow(CFG)).toBe(SHIELD);
  });

  it("turns a rock away on the beat it meets the shield", () => {
    // Report one, as a rule: the trigger pressed while the rock is coming down
    // onto the shield. Stop the run on that beat — before the rock could
    // possibly have reached the ship — and the rock must already be gone.
    const { world, events } = run([rock(5)], SHIELD_TICK + 1, [
      shieldTo(10, 5),
      guard(SHIELD_TICK - 20),
    ]);
    expect(world.guard.deflected).toBe(1);
    expect(world.guard.tries).toBe(1);
    expect(world.creatures).toHaveLength(0);
    expect(hullPercent(world)).toBe(100);
    expect(events.some((e) => e.type === "deflect")).toBe(true);
  });

  it("turns it away before it has travelled through the shield", () => {
    // Report two, as a rule. `deepestRow` is the deepest row anything was seen
    // *alive* on, and a rock is removed on the beat it is answered — so a rock
    // turned at the surface is last seen a row above it, and one carried on to
    // the plating is last seen standing on the shield's own row with the dome
    // already behind it.
    const { deepestRow } = run([rock(5)], IMPACT_TICK + 1, [
      shieldTo(10, 5),
      guard(SHIELD_TICK - 20),
    ]);
    expect(deepestRow).toBe(SHIELD - 1);
  });

  it("still saves the hull from a trigger that comes in the last beat", () => {
    // The row moved; nothing that used to be answerable stopped being. A press
    // made after the rock has already sunk into the shield still turns it, at
    // the plating, which is the only place left to turn it from.
    const { world } = run([rock(5)], IMPACT_TICK + 1, [shieldTo(10, 5), guard(IMPACT_TICK - 20)]);
    expect(world.guard.deflected).toBe(1);
    expect(world.guard.tries).toBe(1);
    expect(hullPercent(world)).toBe(100);
  });

  it("counts one try for a rock that is answered three times and turned none of them", () => {
    const { world } = run([rock(5)], BREACH_TICK + 1, [shieldTo(10, 5)]);
    expect(world.guard.tries).toBe(1);
    expect(world.guard.mistimed).toBe(1);
    expect(world.guard.deflected).toBe(0);
  });

  it("still breaks the hull on the ship's own row, not a beat early", () => {
    // The shield's row is where a rock is *asked*, not where it lands. A rock
    // nobody answers goes all the way down, and the damage arrives with it.
    const early = run([rock(5)], SHIELD_TICK + 1);
    expect(hullPercent(early.world)).toBe(100);
    // And not on the beat it *reaches* the ship either. It lands there and
    // stands on the plating for the beat render/ draws it arriving; the hull
    // is whole for all of that beat, and breaks at the end of it.
    const landing = run([rock(5)], IMPACT_TICK + 1);
    expect(hullPercent(landing.world)).toBe(100);
    const late = run([rock(5)], BREACH_TICK + 1);
    expect(hullPercent(late.world)).toBeLessThan(100);
    // Last seen alive standing on the plating — the row it landed on and was
    // removed from, rather than a row short of it.
    expect(late.deepestRow).toBe(HULL);
  });

  it("still answers the trigger on the beat the rock is standing on the ship", () => {
    // The report this file was reopened for: *the shield does nothing when
    // there is no room left*. A press made while watching the rock cross the
    // last tile used to arrive after the simulation had already resolved it,
    // because that tile was a replay of a body it had removed a beat earlier
    // (`rock-impact.ts`). The rock now stands on the ship for exactly that
    // beat, and the press lands on something.
    const { world, events } = run([rock(5)], BREACH_TICK + 1, [
      shieldTo(10, 5),
      guard(BREACH_TICK - 20),
    ]);
    expect(world.guard.deflected).toBe(1);
    expect(world.guard.tries).toBe(1);
    expect(hullPercent(world)).toBe(100);
    expect(events.some((e) => e.type === "deflect")).toBe(true);
  });

  it("gives every tier the same one beat on the plating, however fast it fell", () => {
    // A torch covers thirteen tiles a beat and used to spend the whole of
    // that last step as a picture of something already gone. The fall stops
    // on the hull row for every tier, so the beat of grace is the same one.
    const tiers: RockKind[] = ["meteor", "meteorFast", "meteorFastest", "torch"];
    for (const kind of tiers) {
      const rate = fallTilesPerBeat(kind);
      const landTick = TPB * (Math.ceil(HULL / rate) + 1);
      const { world } = run([rock(4, kind)], landTick + TPB + 1, [
        shieldTo(10, 4),
        guard(landTick + TPB - 20),
      ]);
      expect({ kind, deflected: world.guard.deflected }).toEqual({ kind, deflected: 1 });
      expect({ kind, hull: hullPercent(world) }).toEqual({ kind, hull: 100 });
    }
  });

  it("answers every rock tier at the surface, whatever its speed", () => {
    const tiers: RockKind[] = [
      "meteor",
      "meteorMedium",
      "meteorFast",
      "meteorFaster",
      "meteorFastest",
      "torch",
    ];
    for (const kind of tiers) {
      // The beat this tier first stands at or past the shield's surface.
      const rate = fallTilesPerBeat(kind);
      const beat = Math.ceil(SHIELD / rate) + 1;
      const answerTick = TPB * beat;
      const { world } = run([rock(4, kind)], answerTick + 1, [
        shieldTo(10, 4),
        guard(answerTick - 20),
      ]);
      expect({ kind, deflected: world.guard.deflected, left: world.creatures.length }).toEqual({
        kind,
        deflected: 1,
        left: 0,
      });
      expect(hullPercent(world)).toBe(100);
    }
  });
});

describe("the cannon's column", () => {
  it("has no bearing on a deflection, parked in the shield's column or away from it", () => {
    // The owner's suspicion, answered: `resolveHull` never reads `cannonCol`,
    // and two runs that differ only in where the cannon is parked come out
    // with the same fingerprint — not merely the same outcome.
    const inputs = (cannonCol: number): TimedCommand[] => [
      shieldTo(10, 5),
      aim(10, cannonCol),
      guard(SHIELD_TICK - 20),
    ];
    const together = run([rock(5)], SHIELD_TICK + 1, inputs(5));
    const apart = run([rock(5)], SHIELD_TICK + 1, inputs(0));
    expect(together.world.guard.deflected).toBe(1);
    expect(apart.world.guard.deflected).toBe(1);
    expect(together.world.cannonCol).toBe(5);
    expect(apart.world.cannonCol).toBe(0);
    together.world.cannonCol = apart.world.cannonCol;
    expect(hashWorld(together.world)).toBe(hashWorld(apart.world));
  });

  it("does not hold a rock at the ship when it is parked under one", () => {
    // "Sometimes it is not reflected at all and sticks to the ship at the
    // cannon." Every tier, cannon parked dead under the rock: it still goes.
    const tiers: RockKind[] = ["meteor", "meteorMedium", "meteorFast", "torch"];
    for (const kind of tiers) {
      const rate = fallTilesPerBeat(kind);
      const answerTick = TPB * (Math.ceil(SHIELD / rate) + 1);
      const { world } = run([rock(4, kind)], answerTick + 1, [
        shieldTo(10, 4),
        aim(10, 4),
        guard(answerTick - 20),
      ]);
      expect({ kind, left: world.creatures.length }).toEqual({ kind, left: 0 });
      expect({ kind, hull: hullPercent(world) }).toEqual({ kind, hull: 100 });
    }
  });
});
