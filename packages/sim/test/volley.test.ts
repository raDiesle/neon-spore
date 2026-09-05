import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  hullRow,
  isGrippable,
  isWardable,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  volleyFloor,
  volleyIsClimbing,
  volleyPlatesLeft,
  wornKind,
} from "../src/index.js";
import type { Creature } from "../src/types.js";

/**
 * THE VOLLEY: a rock the shield hits **back up the field** three times before
 * the body inside it is loose.
 *
 * What is worth pinning here is the half a reader of `volley.ts` cannot check
 * by eye — that it really does fall like every other rock, that it is turned
 * at the shield's own row rather than a row inside the ship, that a ward
 * leaves the body on the field, that it takes exactly `volleyPlates` of them
 * and not one more, that the shell bursts in mid-air, that the cannon is worth
 * nothing until it has, and that a second device walking the same beats
 * arrives at the same fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
/**
 * Where the shield answers it: one row above the ship, written out by hand and
 * on purpose. Everything below measures against *this* rather than against
 * `shieldRow` — `guard.test.ts` makes the same move for the same reason, that
 * a test which asks the rule where the rule is cannot fail when the rule is
 * wrong, and the owner's report was that it was.
 */
const SHIELD = HULL - 1;
/** The same run with the hull's mending switched off, so a damage figure is
 * the damage rather than the damage less a second of regrowth. */
const LANE: SimConfig = { ...CFG, hullRegenPerSecond: 0 };

const volley = (col: number, color: "red" | "cyan" = "red"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "volley",
  color,
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shield = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = [], cfg = CFG): Run {
  const world = createWorld({ ...cfg }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const only = (world: Run["world"]): Creature | undefined => world.creatures[0];
const returns = (events: SimEvent[]): Extract<SimEvent, { type: "volleyReturn" }>[] =>
  events.filter((e): e is Extract<SimEvent, { type: "volleyReturn" }> => e.type === "volleyReturn");
const hatches = (events: SimEvent[]): Extract<SimEvent, { type: "volleyHatch" }>[] =>
  events.filter((e): e is Extract<SimEvent, { type: "volleyHatch" }> => e.type === "volleyHatch");

/**
 * The pair holding one column with the trigger down for the whole run — the
 * shield in `col` from the first tick and `guard` pressed on every beat. It is
 * every ward this creature can be given, which is what the counting tests
 * below are about: the answer must be three and not "as many as you like".
 */
function warding(col: number, beats: number): TimedCommand[] {
  const inputs: TimedCommand[] = [shield(0, col)];
  for (let beat = 0; beat <= beats; beat++) inputs.push(guard(TPB * beat));
  return inputs;
}

/**
 * The tick a body entered at beat 0 is standing on a given row: a tile a beat,
 * landing one beat behind the arrival. `guard.test.ts` writes the same line
 * for the same rocks, and a volley falls at exactly the rate it assumes.
 */
function tickAtRow(row: number): number {
  return TPB * (row + 1);
}

/**
 * It falls **like a rock**, and the owner's second report is the whole of this
 * block: it used to come in on a diagonal of its own and be answered a row
 * below the dome, so it neither looked like a ball nor read as a thing the
 * shield had hit back.
 */
describe("the fall", () => {
  it("holds its lane the whole way down, a tile a beat", () => {
    for (const beats of [3, 7, 11]) {
      const body = only(run([volley(4)], tickAtRow(beats) + 1).world)!;
      expect(body.row, `after ${beats} beats`).toBe(beats);
      expect(body.col, `after ${beats} beats`).toBe(4);
    }
  });

  it("stands on the shield's own row rather than stepping over it", () => {
    expect(only(run([volley(4)], tickAtRow(SHIELD) + 1).world)!.row).toBe(SHIELD);
  });

  it("is clamped onto the ship's row exactly as a rock is", () => {
    expect(only(run([volley(4)], tickAtRow(HULL) + 1).world)!.row).toBe(HULL);
    expect(volleyFloor(CFG)).toBe(HULL);
  });

  /** A hand is worth nothing against a body that spends half its life going
   * the wrong way for a brake, and the body that comes out of the shell — an
   * ordinary slick or bulb — takes one again. */
  it("refuses a hand while the shell is on and the body inside takes one", () => {
    expect(isGrippable("volley")).toBe(false);
    expect(isGrippable("slick")).toBe(true);
  });
});

describe("what a ward does", () => {
  it("turns it at the shield's own row, not a row inside the ship", () => {
    const { world, events } = run([volley(3)], tickAtRow(SHIELD) + 1, warding(3, HULL), LANE);
    expect(returns(events)).toHaveLength(1);
    expect(returns(events)[0]!.row).toBe(SHIELD);
    // And it is already going the other way on the same beat — the ward is a
    // hit back rather than a body held against the dome.
    expect(volleyIsClimbing(only(world)!)).toBe(true);
  });

  it("leaves it on the field, takes a plate and sends it back up", () => {
    const { world, events } = run([volley(3)], tickAtRow(SHIELD) + 1, warding(3, HULL), LANE);
    const body = only(world)!;
    expect(returns(events)[0]!.left).toBe(LANE.volleyPlates - 1);
    expect(volleyPlatesLeft(body)).toBe(LANE.volleyPlates - 1);
    // Still a rock with something in it, and the hull is untouched.
    expect(body.kind).toBe("volley");
    expect(hullPercent(world)).toBe(100);
    // It counted as a ward, so the pair's record and their score say so.
    expect(world.guard.deflected).toBe(1);
    expect(world.score).toBe(LANE.scoreDeflect + LANE.scoreVolleyReturn);
  });

  /**
   * No `deflect`, and it is the sharpest claim in this file. That event is
   * what `render/deflect.ts` throws a tumbling rock away from the dome on, and
   * the body it would be describing is still standing there, climbing — so the
   * pair would be shown two of it (`sim/ward.ts`).
   */
  it("says volleyReturn and never deflect, because the body is still there", () => {
    const { events } = run([volley(3)], tickAtRow(SHIELD) + 1, warding(3, HULL), LANE);
    expect(events.filter((e) => e.type === "deflect")).toHaveLength(0);
    expect(events.filter((e) => e.type === "destroy")).toHaveLength(0);
  });

  it("climbs volleyRiseBeats and then falls again, down the same column", () => {
    const at = tickAtRow(SHIELD);
    const inputs = warding(3, HULL);
    const top = run([volley(3)], at + TPB * LANE.volleyRiseBeats + 1, inputs, LANE);
    const climbed = only(top.world)!;
    expect(climbed.row).toBe(SHIELD - LANE.volleyRiseRows * LANE.volleyRiseBeats);
    expect(volleyIsClimbing(climbed)).toBe(false);
    // It leaves faster than it arrived, which is what makes a ward read as a
    // hit back rather than as a nudge.
    expect(LANE.volleyRiseRows).toBeGreaterThan(1);
    // And one beat later it is coming down again, a tile a beat, in its lane.
    const after = only(
      run([volley(3)], at + TPB * (LANE.volleyRiseBeats + 1) + 1, inputs, LANE).world,
    )!;
    expect(after.row).toBe(climbed.row + 1);
    expect(after.col).toBe(3);
  });
});

describe("the count, and what is left at the end of it", () => {
  /** One rally: the climb, and then the same rows back down at a tile a beat. */
  const RALLY = LANE.volleyRiseBeats + LANE.volleyRiseRows * LANE.volleyRiseBeats;
  const HATCH_BEAT = SHIELD + 1 + RALLY * (LANE.volleyPlates - 1) + LANE.volleyRiseBeats;

  it("takes exactly volleyPlates wards, and the last one opens it", () => {
    const { world, events } = run(
      [volley(3)],
      TPB * (HATCH_BEAT + 1),
      warding(3, HATCH_BEAT + 1),
      LANE,
    );
    expect(returns(events)).toHaveLength(LANE.volleyPlates);
    expect(returns(events).map((e) => e.left)).toEqual([2, 1, 0]);
    expect(hatches(events)).toHaveLength(1);
    expect(world.guard.deflected).toBe(LANE.volleyPlates);
    expect(hullPercent(world)).toBe(100);
    expect(only(world)!.kind).toBe("slick");
  });

  it("bursts in mid-air rather than on the ship, and hands over a body with a colour", () => {
    const { events } = run(
      [volley(3, "cyan")],
      TPB * (HATCH_BEAT + 1),
      warding(3, HATCH_BEAT + 1),
      LANE,
    );
    const hatch = hatches(events)[0]!;
    expect(hatch.row).toBe(SHIELD - LANE.volleyRiseRows * LANE.volleyRiseBeats);
    expect(hatch.row).toBeGreaterThan(0);
    expect(hatch.row).toBeLessThan(HULL);
    expect(hatch.kind).toBe("bulb");
    expect(hatch.color).toBe("cyan");
  });

  it("falls a tile a beat once the shell is off, and dies to the matching shot", () => {
    const open = TPB * (HATCH_BEAT + 1);
    const inputs = [
      ...warding(3, HATCH_BEAT + 1),
      aim(open, 3),
      fire(open, "red"),
      ...Array.from({ length: 6 }, (_, k) => fire(open + TPB * (k + 1), "red")),
      ...Array.from({ length: 6 }, (_, k) => aim(open + TPB * (k + 1), 3)),
    ];
    const { world, events } = run([volley(3, "red")], open + TPB * 7, inputs, LANE);
    expect(events.filter((e) => e.type === "destroy").length).toBeGreaterThan(0);
    expect(world.creatures).toHaveLength(0);
    expect(hullPercent(world)).toBe(100);
  });
});

describe("the two controls, in order", () => {
  /**
   * The whole creature as a number: nothing the cannon does touches it while
   * the shell is on. `isWardable` is the one rule both halves of that read —
   * `resolve` gives the shot a crater and `resolveHull` offers the body the
   * shield's row.
   */
  it("cannot be shot while the shell is on, whatever colour", () => {
    expect(isWardable("volley")).toBe(true);
    const at = tickAtRow(4);
    const inputs = [
      shield(0, 10),
      ...[0, 1].flatMap((k) => [
        aim(at + k, 3),
        fire(at + k, k === 0 ? "red" : "cyan"),
        aim(at + TPB + k, 3),
        fire(at + TPB + k, k === 0 ? "red" : "cyan"),
      ]),
    ];
    const { world, events } = run([volley(3)], at + TPB * 3, inputs, LANE);
    expect(events.filter((e) => e.type === "destroy")).toHaveLength(0);
    expect(events.filter((e) => e.type === "hole").length).toBeGreaterThan(0);
    expect(only(world)!.kind).toBe("volley");
    expect(volleyPlatesLeft(only(world)!)).toBe(LANE.volleyPlates);
  });

  it("costs a rock's damage when nobody wards it", () => {
    const { world } = run([volley(3)], tickAtRow(HULL) + TPB + 1, [], LANE);
    expect(world.creatures).toHaveLength(0);
    expect(hullPercent(world)).toBe(100 - LANE.damageMeteor);
    expect(world.guard.tries).toBe(1);
  });

  it("is drawn as the slick or the bulb its colour names", () => {
    expect(wornKind(only(run([volley(3, "red")], TPB + 1, [], LANE).world)!)).toBe("slick");
    expect(wornKind(only(run([volley(3, "cyan")], TPB + 1, [], LANE).world)!)).toBe("bulb");
  });
});

describe("two devices", () => {
  it("replays deterministically: warded, opened and shot", () => {
    const replay = record({
      name: "volley warded three times",
      seed: 6,
      queue: [volley(0, "red"), volley(10, "cyan")],
      ticks: TPB * 40,
      inputs: [
        // The shield walked across the bottom with the trigger down, then the
        // cannon swept the lanes: everything either seat can do to one.
        ...Array.from({ length: 36 }, (_, beat) => shield(TPB * beat, beat % CFG.cols)),
        ...Array.from({ length: 36 }, (_, beat) => guard(TPB * beat)),
        ...Array.from({ length: 36 }, (_, beat) => aim(TPB * beat + 1, (beat * 3) % CFG.cols)),
        ...Array.from({ length: 36 }, (_, beat) => fire(TPB * beat + 2, beat % 2 ? "cyan" : "red")),
      ],
    });
    const world = runReplay(replay);
    expect(world.beat).toBeGreaterThan(0);
    // Not a pinned constant — two runs of the same replay in one process is
    // the property lockstep actually needs (docs/decisions.md #19).
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("puts the plates and the climb into the fingerprint, so two devices cannot differ", () => {
    const at = tickAtRow(SHIELD) + 1;
    const warded = run([volley(3)], at, warding(3, HULL), LANE).world;
    const missed = run([volley(3)], at, [shield(0, 0)], LANE).world;
    expect(hashWorld(warded)).not.toBe(hashWorld(missed));
  });
});
