import { describe, expect, it } from "bun:test";
import { balloonSinks, balloonSplitsLeft } from "../src/balloon.js";
import { balloonGlidePhase, balloonHoldPhase } from "../src/balloon-clock.js";
import { balloonIsRubbed, balloonSideTaut } from "../src/balloon-pull.js";
import { DEFAULT_CONFIG, hullRow, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import type { Creature, DragTarget, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE BALLOON, and the three things about it that are new to this simulation.
 *
 * The first is a body that goes **up** and leaves on its own. THE CHUTE climbs
 * too, but it turns round at the top and comes back down; this one is the only
 * arrival in the game that can beat the pair by getting *away* from the ship,
 * and what it costs is charged to the hull from the far end of the field.
 *
 * The second is an answer made of **two seats at once**. Every gesture before
 * it is the pilot's — THE LID's cord, THE CHOIR's arrows — and each of their
 * tests is about one hand and a window. Here neither hand does anything alone
 * and there is no window at all: the two pulls simply have to be taut on the
 * same body on the same tick, and stay that way.
 *
 * The third is what a rub *does*, which is not the same thing twice: the first
 * splits and the second finishes, so the pair is made to agree about one body
 * and then about two.
 *
 * And the three the owner asked for on 9 September 2026, which are all
 * timing: a step every `balloonClimbBeats` rather than every beat, a hold at
 * full stretch before the skin gives, and halves that part — one on up, one
 * down to the ship.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** Comfortably past `balloonTautMilli`, in the sign each seat's side wants. */
const FAR = CFG.balloonTautMilli + 400;

const balloon = (col: number, rise?: number): SpawnEntry => ({
  beat: 0,
  col,
  kind: "balloon",
  color: null,
  ...(rise === undefined ? {} : { rise }),
});

/**
 * The first tick a hand can reach a balloon authored at beat 0.
 *
 * A wave's arrivals are put on the field by `onBeat`, which runs on the tick
 * the beat turns over — so for the whole of beat zero there is nothing to take
 * hold of. `choir.test.ts` learnt this the same way and says so.
 */
const ON_FIELD = TPB + 2;

/** One seat's hand on one handle, carried `milli` from where it grabbed. The
 * grab at zero goes first, the way a real finger sends one
 * (`render/touch.ts`). */
const pull = (
  tick: number,
  player: 1 | 2,
  target: DragTarget,
  milli: number,
  id: number,
): TimedCommand[] => [
  { tick, player, command: { kind: "drag", target, on: true, fromMilli: 0, id } },
  { tick: tick + 1, player, command: { kind: "drag", target, on: true, fromMilli: milli, id } },
];

/** Both hands on one body, taut on the same tick — the whole of the gesture. */
const rub = (tick: number, id: number): TimedCommand[] => [
  ...pull(tick, 1, "balloonLeft", -FAR, id),
  ...pull(tick, 2, "balloonRight", FAR, id),
];

interface Run {
  world: World;
  events: SimEvent[];
}

function play(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const only = (world: World): Creature => {
  expect(world.creatures).toHaveLength(1);
  return world.creatures[0] as Creature;
};

/** The field's bodies, leftmost first, so a pair of halves reads as [left, right]. */
const byCol = (world: World): Creature[] => [...world.creatures].sort((a, b) => a.col - b.col);

/** The row an arrival appears on: one above the ship's own. */
const ENTRY = hullRow(CFG) - 1;
/** How many steps the timed runs below measure. */
const CLIMBS = 2;
/** Beats one step takes, and so beats between one and the next. */
const EVERY = CFG.balloonClimbBeats;
/** Ticks both hands have to stay taut before the body gives. */
const HOLD = CFG.balloonHoldBeats * TPB;
/** Ticks from a rub sent at `tick` to the body giving: the second message of
 * the pull is the taut one, and the hold runs from there. */
const GIVES = 1 + HOLD;
/** Beats from an arrival authored at beat 0 to its first step: it lands on
 * beat 1 and swells through `balloonSwellBeats` of them. A run of
 * `TPB * b` ticks has turned beat `b` over, so `play(TPB * FIRST_STEP)` ends
 * with that step taken and one tick fewer ends without it. */
const FIRST_STEP = 1 + CFG.balloonSwellBeats;
/** The beat the halves of a rub sent at `ON_FIELD` take their first step:
 * the beat the body gave on, plus their own swell. */
const HALVES_STEP = Math.floor((ON_FIELD + GIVES) / TPB) + CFG.balloonSwellBeats;

describe("a body that goes up", () => {
  it("appears one row above the ship and holds still while it swells", () => {
    const { world } = play([balloon(3)], TPB * 2);
    const c = only(world);
    // The entry row, and it is still on it: the swell is `balloonSwellBeats`
    // long and nothing moves until it is over.
    expect(c.row).toBe(ENTRY);
    expect(c.kind).toBe("balloon");
  });

  it("climbs a row and a lane a step once it has filled, a step every few beats", () => {
    // The first step is on the beat the swell ends and the next `EVERY` beats
    // later, so a run ending just past the second step has exactly two behind
    // it — and one ending a beat short of the second has exactly one.
    const { world } = play([balloon(3)], TPB * (FIRST_STEP + EVERY));
    const c = only(world);
    expect(c.row).toBe(ENTRY - CLIMBS * CFG.balloonRiseRows);
    // And it has left the lane it appeared in, which is the diagonal.
    expect(c.col).not.toBe(3);
    const between = play([balloon(3)], TPB * (FIRST_STEP + EVERY) - 1);
    expect(only(between.world).row).toBe(ENTRY - CFG.balloonRiseRows);
  });

  it("keeps where a step set out from until the next one, and glides over all of it", () => {
    // `fromRow` is the step's origin for every beat of the step, not only the
    // first — `beat.ts` skips the balloon's reset — and the phase the picture
    // reads runs 0..1 across the step rather than across each beat.
    const { world } = play([balloon(3)], TPB * (FIRST_STEP + EVERY - 1));
    const c = only(world);
    expect(c.fromRow).toBe(ENTRY);
    expect(c.row).toBe(ENTRY - CFG.balloonRiseRows);
    expect(balloonGlidePhase(CFG, world.beat, 0, c)).toBeCloseTo((EVERY - 1) / EVERY);
    expect(balloonGlidePhase(CFG, world.beat, 1, c)).toBe(1);
    expect(balloonGlidePhase(CFG, world.beat - (EVERY - 1), 0, c)).toBe(0);
  });

  it("climbs faster when the wave authored a speed", () => {
    const fast = play([balloon(3, 2)], TPB * (FIRST_STEP + EVERY));
    expect(only(fast.world).row).toBe(ENTRY - CLIMBS * 2);
  });

  it("bursts at the top of the field and the hull pays for it", () => {
    // Long enough for the swell and the whole climb, whatever the field's
    // height: the entry row is the ship's less one, a step every `EVERY`
    // beats, and one more step for the burst itself.
    const steps = ENTRY / CFG.balloonRiseRows + 1;
    const { world, events } = play([balloon(3)], TPB * (FIRST_STEP + steps * EVERY));
    expect(world.creatures).toHaveLength(0);
    expect(events.filter((e) => e.type === "balloonBurst")).toHaveLength(1);
    expect(world.retries).toBe(1);
    // Nothing struck the ship, so nothing is torn in the plating: the burst
    // happened a whole field away from the hull it cost (`burstBalloon`).
    expect(world.scars).toHaveLength(0);
  });

  it("is drawn arriving at the top before it goes off", () => {
    // The step that puts it on the top row does not burst it: it stands there
    // for the length of a step, drawn gliding onto it, and goes on the next.
    const steps = ENTRY / CFG.balloonRiseRows;
    const arrived = play([balloon(3)], TPB * (FIRST_STEP + (steps - 1) * EVERY));
    const c = only(arrived.world);
    expect(c.row).toBe(0);
    expect(c.fromRow).toBe(CFG.balloonRiseRows);
    expect(arrived.events.some((e) => e.type === "balloonBurst")).toBe(false);
  });

  it("is not answered by a shot in either colour", () => {
    const inputs: TimedCommand[] = [
      { tick: ON_FIELD, player: 1, command: { kind: "cannonCol", col: 3 } },
      { tick: ON_FIELD + 1, player: 2, command: { kind: "fire", color: "red" } },
      { tick: ON_FIELD + 2, player: 2, command: { kind: "fire", color: "cyan" } },
    ];
    const { world, events } = play([balloon(3)], TPB * 3, inputs);
    expect(only(world).kind).toBe("balloon");
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    // Not a colour miss: no ammunition was ever going to be right, so the
    // balance is not charged for it (`balloonStruck`).
    expect(world.balance.colorMisses).toBe(0);
  });
});

describe("two hands at once", () => {
  it("does nothing on one hand, however far it is carried", () => {
    const { world } = play([balloon(3)], TPB * 3, pull(ON_FIELD, 1, "balloonLeft", -FAR, 1));
    const c = only(world);
    expect(balloonSideTaut(CFG, c, 1)).toBe(true);
    expect(balloonSideTaut(CFG, c, 2)).toBe(false);
    expect(balloonIsRubbed(CFG, c)).toBe(false);
    expect(balloonSplitsLeft(c)).toBe(CFG.balloonSplits);
  });

  it("does nothing when the two hands are on different bodies", () => {
    const inputs = [
      ...pull(ON_FIELD, 1, "balloonLeft", -FAR, 1),
      ...pull(ON_FIELD, 2, "balloonRight", FAR, 2),
    ];
    const { world, events } = play([balloon(1), balloon(5)], TPB * 3, inputs);
    expect(world.creatures).toHaveLength(2);
    expect(events.some((e) => e.type === "balloonSplit")).toBe(false);
  });

  it("does nothing when both hands pull inward instead of apart", () => {
    const inputs = [
      ...pull(ON_FIELD, 1, "balloonLeft", FAR, 1),
      ...pull(ON_FIELD, 2, "balloonRight", -FAR, 1),
    ];
    const { world } = play([balloon(3)], TPB * 3, inputs);
    expect(balloonIsRubbed(CFG, only(world))).toBe(false);
  });

  it("refuses a seat reaching for the other's handle", () => {
    const inputs = [
      ...pull(ON_FIELD, 2, "balloonLeft", -FAR, 1),
      ...pull(ON_FIELD, 1, "balloonRight", FAR, 1),
    ];
    const { world } = play([balloon(3)], TPB * 3, inputs);
    const c = only(world);
    expect(balloonSideTaut(CFG, c, 1)).toBe(false);
    expect(balloonSideTaut(CFG, c, 2)).toBe(false);
  });
});

describe("the hold", () => {
  it("does not give on the tick both hands reach taut", () => {
    const { world, events } = play([balloon(3)], ON_FIELD + 3, rub(ON_FIELD, 1));
    const c = only(world);
    expect(balloonIsRubbed(CFG, c)).toBe(true);
    expect(events.some((e) => e.type === "balloonSplit")).toBe(false);
    // But the hold has begun, and the picture can read how far along it is.
    expect(c.balloonTautTick).toBe(ON_FIELD + 1);
    expect(balloonHoldPhase(CFG, world.tick, c)).toBeGreaterThan(0);
    expect(balloonHoldPhase(CFG, world.tick, c)).toBeLessThan(1);
  });

  it("gives once both hands have held taut for the hold", () => {
    const short = play([balloon(3)], ON_FIELD + GIVES, rub(ON_FIELD, 1));
    expect(short.events.some((e) => e.type === "balloonSplit")).toBe(false);
    const { world, events } = play([balloon(3)], ON_FIELD + GIVES + 1, rub(ON_FIELD, 1));
    expect(events.filter((e) => e.type === "balloonSplit")).toHaveLength(1);
    expect(world.creatures).toHaveLength(2);
  });

  it("starts again from nothing when a hand slackens inside it", () => {
    const slack: TimedCommand = {
      tick: ON_FIELD + Math.floor(HOLD / 2),
      player: 1,
      command: { kind: "drag", target: "balloonLeft", on: true, fromMilli: 0, id: 1 },
    };
    const inputs = [...rub(ON_FIELD, 1), slack];
    const { world, events } = play([balloon(3)], ON_FIELD + GIVES + 1, inputs);
    expect(events.some((e) => e.type === "balloonSplit")).toBe(false);
    expect(only(world).balloonTautTick).toBeUndefined();
  });
});

describe("what a rub does", () => {
  it("splits the first time, into two a lane either side of the parent", () => {
    const { world, events } = play([balloon(3)], ON_FIELD + GIVES + 1, rub(ON_FIELD, 1));
    expect(events.filter((e) => e.type === "balloonSplit")).toHaveLength(1);
    expect(world.creatures).toHaveLength(2);
    // Each half is one generation smaller, and neither is held: the hands were
    // on a body that has stopped existing.
    for (const c of world.creatures) {
      expect(balloonSplitsLeft(c)).toBe(CFG.balloonSplits - 1);
      expect(c.balloonPullP1).toBeUndefined();
      expect(c.balloonPullP2).toBeUndefined();
      expect(c.balloonTautTick).toBeUndefined();
    }
    // A lane either side of where the parent stood, which is the picture of
    // one thing becoming two — and the two go different ways: the left half
    // on up, the right half down.
    const halves = byCol(world);
    expect(halves.map((c) => c.col)).toEqual([2, 4]);
    expect(halves.map((c) => balloonSinks(c))).toEqual([false, true]);
    expect(world.score).toBe(CFG.scoreBalloonRub);
  });

  it("holds each half still for the swell before it moves", () => {
    // The delay the owner asked for, and it is the same swell a fresh arrival
    // has: the halves are given `balloonBeat` of the beat the rub landed on,
    // so they fill where the parent stood before either of them moves.
    const still = play([balloon(3)], TPB * HALVES_STEP - 1, rub(ON_FIELD, 1));
    expect(still.world.creatures.map((c) => c.row)).toEqual([ENTRY, ENTRY]);
    const after = play([balloon(3)], TPB * HALVES_STEP, rub(ON_FIELD, 1));
    // The climber has gone up a row; the sinker is clamped on the ship's row.
    expect(byCol(after.world).map((c) => c.row)).toEqual([
      ENTRY - CFG.balloonRiseRows,
      hullRow(CFG),
    ]);
  });

  it("sinks a half onto the ship, where it bursts for the burst's price and no scar", () => {
    // The halves' first step puts the sinker on the ship's row, and the step
    // after it is the one on which the body goes — not before, so the picture
    // has drawn it arriving. One tick short, the hull is whole.
    const arriving = play([balloon(3)], TPB * (HALVES_STEP + EVERY) - 1, rub(ON_FIELD, 1));
    expect(arriving.world.hullMilli).toBe(100 * 1000);
    expect(byCol(arriving.world).map((c) => c.row)).toEqual([
      ENTRY - CFG.balloonRiseRows,
      hullRow(CFG),
    ]);
    const { world, events } = play([balloon(3)], TPB * (HALVES_STEP + EVERY), rub(ON_FIELD, 1));
    const bursts = events.filter((e) => e.type === "balloonBurst");
    expect(bursts).toHaveLength(1);
    expect(bursts[0]).toMatchObject({ row: hullRow(CFG) });
    // The climber is still on the field; the sinker is gone, and the hull
    // paid for it — the top's price, and no scar, because nothing struck the
    // plating (`burstBalloon`).
    expect(balloonSinks(only(world))).toBe(false);
    expect(world.retries).toBe(1);
    expect(world.scars).toHaveLength(0);
  });

  it("sends both halves inward when the parent split against a wall", () => {
    // A balloon in the leftmost column has no lane to its left, so the two
    // halves stand in the wall column and the one beside it, still one up and
    // one down — and both head into the field rather than one at the wall.
    const { world } = play([balloon(0)], ON_FIELD + GIVES + 1, rub(ON_FIELD, 1));
    const halves = byCol(world);
    expect(halves.map((c) => c.col)).toEqual([0, 1]);
    expect(halves.map((c) => c.balloonDir)).toEqual([1, 1]);
    expect(halves.map((c) => balloonSinks(c))).toEqual([false, true]);
  });

  it("pops the second time, and the hull pays nothing at all", () => {
    const second = ON_FIELD + GIVES + 2;
    const inputs = [...rub(ON_FIELD, 1), ...rub(second, 2)];
    const { world, events } = play([balloon(3)], second + GIVES + 1, inputs);
    expect(events.filter((e) => e.type === "balloonPop")).toHaveLength(1);
    // One of the two halves is gone and the other is untouched — the pair has
    // to agree all over again about the one that is left.
    expect(world.creatures).toHaveLength(1);
    expect(balloonSplitsLeft(world.creatures[0] as Creature)).toBe(0);
    expect(world.retries).toBe(0);
    expect(world.score).toBe(CFG.scoreBalloonRub + CFG.scoreBalloonPop);
  });
});

describe("determinism", () => {
  it("fingerprints the same twice over the same inputs", () => {
    const inputs = [...rub(ON_FIELD, 1), ...rub(ON_FIELD + GIVES + 2, 2)];
    const a = play([balloon(1), balloon(5, 2)], TPB * 8, inputs);
    const b = play([balloon(1), balloon(5, 2)], TPB * 8, inputs);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });
});
