import { describe, expect, it } from "bun:test";
import { balloonSinks, balloonSplitsLeft } from "../src/balloon.js";
import { balloonGlidePhase, balloonHoldPhase } from "../src/balloon-clock.js";
import { balloonIsRubbed, balloonSideTaut } from "../src/balloon-pull.js";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { midCol } from "../src/config-derived.js";
import { hashWorld } from "../src/hash.js";
import { shieldRow } from "../src/hull-guard.js";
import type { Creature, DragTarget, TimedCommand } from "../src/types.js";
import { failHolds } from "../src/wave-fail.js";
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

/**
 * `onTick` is for the one thing a wave can no longer author: a balloon standing
 * at a wall. Every arrival glides to the middle band now
 * (`balloon-entry.ts`), so a body only reaches a wall by caroming there, and a
 * test about what happens at one has to put it there.
 */
function play(
  queue: SpawnEntry[],
  ticks: number,
  inputs: TimedCommand[] = [],
  onTick?: (tick: number, world: World) => void,
): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    onTick?.(t, world);
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
/**
 * **The row a balloon came in on, read off the body rather than computed.**
 *
 * It used to be `hullRow - 1` exactly: a balloon appeared out of nothing one
 * row above the ship. The owner moved the arrival to a wall on 14 September
 * 2026, one or two rows above the shield and drawn from the seeded `Rng`
 * (`balloon-entry.ts`), so the number is a fact about the run rather than
 * about the config — and every expectation below counts from wherever this
 * one started.
 */
const entryRowOf = (world: World): number => only(world).fromRow;
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
  it("comes in at a wall, above the shield, and holds still while it swells", () => {
    const { world } = play([balloon(3)], TPB * 2);
    const c = only(world);
    // One or two rows above the dome, never the ship's own row and never the
    // top: the band the owner named (`balloon-entry.ts`).
    expect(c.row).toBeLessThan(shieldRow(CFG));
    expect(c.row).toBeGreaterThanOrEqual(shieldRow(CFG) - CFG.balloonEntryRowsUp);
    // Standing still by now: the glide is over and the swell is what is left.
    // The `from` field is the subject either way round, and it is the one that
    // may be absent — so it goes on the left, where `toBe` will take it.
    expect(c.fromRow).toBe(c.row);
    expect(c.fromCol).toBe(c.col);
    expect(c.kind).toBe("balloon");
  });

  it("is drawn gliding in out of the wall on the beat it arrives", () => {
    // **On the arrival beat and only then**, which is the whole of the glide:
    // the swell puts `fromCol` back to `col` on every beat after it
    // (`stepBalloon`), so the slide out of the wall is drawn over one beat
    // exactly as a crossing rock's is, and the body has settled after it.
    //
    // For that one beat the body is genuinely out over the field between the
    // two columns (`creatureLane`), which is why a bolt fired up the column it
    // is heading for misses it — the case below waits for the second beat.
    const { world } = play([balloon(3)], TPB + 1);
    const c = only(world);
    // Painted in the left half, so it comes in at the left wall.
    expect(c.fromCol).toBe(0);
    expect(c.col).toBeGreaterThan(0);
    // Sideways and not downwards: it has no fall to be drawn making.
    expect(c.fromRow).toBe(c.row);
  });

  it("glides to somewhere around the middle rather than to the column it was painted in", () => {
    // The band is `balloonEntryBandCols` wide, centred on the field: wide
    // enough that the column is worth calling out, narrow enough that it is
    // never a corner.
    const half = Math.floor(CFG.balloonEntryBandCols / 2);
    for (const painted of [0, 3, 6]) {
      const { world } = play([balloon(painted)], TPB * 2);
      const c = only(world);
      expect(Math.abs(c.col - midCol(CFG)), `painted ${painted}`).toBeLessThanOrEqual(half);
    }
  });

  it("climbs a row and a lane a step once it has filled, a step every few beats", () => {
    // The first step is on the beat the swell ends and the next `EVERY` beats
    // later, so a run ending just past the second step has exactly two behind
    // it — and one ending a beat short of the second has exactly one.
    const { world } = play([balloon(3)], TPB * (FIRST_STEP + EVERY));
    const c = only(world);
    const entry = entryRowOf(play([balloon(3)], TPB * 2).world);
    expect(c.row).toBe(entry - CLIMBS * CFG.balloonRiseRows);
    const between = play([balloon(3)], TPB * (FIRST_STEP + EVERY) - 1);
    expect(only(between.world).row).toBe(entry - CFG.balloonRiseRows);
  });

  it("keeps where a step set out from until the next one, and glides over all of it", () => {
    // `fromRow` is the step's origin for every beat of the step, not only the
    // first — `beat.ts` skips the balloon's reset — and the phase the picture
    // reads runs 0..1 across the step rather than across each beat.
    const { world } = play([balloon(3)], TPB * (FIRST_STEP + EVERY - 1));
    const c = only(world);
    const entry = entryRowOf(play([balloon(3)], TPB * 2).world);
    expect(c.fromRow).toBe(entry);
    expect(c.row).toBe(entry - CFG.balloonRiseRows);
    expect(balloonGlidePhase(CFG, world.beat, 0, c)).toBeCloseTo((EVERY - 1) / EVERY);
    expect(balloonGlidePhase(CFG, world.beat, 1, c)).toBe(1);
    expect(balloonGlidePhase(CFG, world.beat - (EVERY - 1), 0, c)).toBe(0);
  });

  it("climbs faster when the wave authored a speed", () => {
    const fast = play([balloon(3, 2)], TPB * (FIRST_STEP + EVERY));
    const entry = entryRowOf(play([balloon(3, 2)], TPB * 2).world);
    expect(only(fast.world).row).toBe(entry - CLIMBS * 2);
  });

  it("turns into a torch at the top rather than going off there", () => {
    // **The owner's rule of 14 September 2026.** The top of the field used to
    // be a silent bill: the pair watched a body go up, lost hull for it, and
    // had nothing to do about it in between. A torch is a body they have to
    // answer, and what it does when it lands is what a torch always does.
    const entry = entryRowOf(play([balloon(3)], TPB * 2).world);
    const steps = Math.ceil(entry / CFG.balloonRiseRows) + 1;
    const { world, events } = play([balloon(3)], TPB * (FIRST_STEP + steps * EVERY));
    expect(events.filter((e) => e.type === "balloonTopped")).toHaveLength(1);
    // And the ship is charged nothing for it. `balloonBurst` is gone from the
    // event union along with the bill it carried, so what is asserted is the
    // bill itself: no `breach` came out of the top of the field.
    expect(events.some((e) => e.type === "breach")).toBe(false);
    // The hull is untouched at the moment it turns: nothing has struck it, and
    // the wave is still on — what the torch does is the torch's business.
    expect(failHolds(world)).toBe(false);
    // And the body that is left is a torch standing where the climb ended,
    // carrying none of the balloon's own state.
    const torch = world.creatures.find((c) => c.kind === "torch");
    expect(torch).toBeDefined();
    expect(torch?.balloonSplits).toBeUndefined();
    expect(torch?.balloonDir).toBeUndefined();
  });

  it("is drawn arriving at the top before it turns", () => {
    // The step that puts it on the top row does not turn it: it stands there
    // for the length of a step, drawn gliding onto it, and turns on the next.
    const entry = entryRowOf(play([balloon(3)], TPB * 2).world);
    const steps = Math.ceil(entry / CFG.balloonRiseRows);
    const arrived = play([balloon(3)], TPB * (FIRST_STEP + (steps - 1) * EVERY));
    const c = only(arrived.world);
    expect(c.row).toBe(0);
    expect(c.kind).toBe("balloon");
    expect(arrived.events.some((e) => e.type === "balloonTopped")).toBe(false);
  });

  it("is not answered by a shot in either colour", () => {
    // Aimed where the body actually is: a balloon glides to a column the
    // `Rng` drew rather than standing in the one it was painted in
    // (`balloon-entry.ts`), so the column is read off a run rather than
    // assumed.
    // **Fired after the glide beat, with the cannon held under the body.**
    // Two things about this creature make the aim a live question now: it
    // glides to a column the `Rng` drew rather than standing where it was
    // painted, and for the beat of that glide it is genuinely out over the
    // field between the wall and its landing column (`creatureLane`) — a bolt
    // fired up the column it is heading for misses, because it is not there
    // yet. So the shot waits for the second beat, when it is standing still
    // and swelling.
    const fireAt = TPB * 2 + 2;
    const inputs: TimedCommand[] = [
      { tick: fireAt, player: 2, command: { kind: "fire", color: "red" } },
      { tick: fireAt + 1, player: 2, command: { kind: "fire", color: "cyan" } },
    ];
    const { world, events } = play([balloon(3)], TPB * 4, inputs, (_t, w) => {
      const c = w.creatures[0];
      if (c) w.cannonCol = c.col;
    });
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
    // one thing becoming two — and **both go up**, which is the owner's rule
    // of 14 September 2026: *a balloon never goes downwards*. The right-hand
    // half used to be sent to the ship's row to burst against the plating.
    const halves = byCol(world);
    const parent = only(play([balloon(3)], TPB * 2).world).col;
    expect(halves.map((c) => c.col)).toEqual([parent - 1, parent + 1]);
    expect(halves.map((c) => balloonSinks(c))).toEqual([false, false]);
  });

  it("holds each half still for the swell before it moves", () => {
    // The delay the owner asked for, and it is the same swell a fresh arrival
    // has: the halves are given `balloonBeat` of the beat the rub landed on,
    // so they fill where the parent stood before either of them moves.
    const entry = entryRowOf(play([balloon(3)], TPB * 2).world);
    const still = play([balloon(3)], TPB * HALVES_STEP - 1, rub(ON_FIELD, 1));
    expect(still.world.creatures.map((c) => c.row)).toEqual([entry, entry]);
    const after = play([balloon(3)], TPB * HALVES_STEP, rub(ON_FIELD, 1));
    // Both halves have gone up a row: neither of them sinks any more.
    expect(byCol(after.world).map((c) => c.row)).toEqual([
      entry - CFG.balloonRiseRows,
      entry - CFG.balloonRiseRows,
    ]);
  });

  it("sends both halves on up, so neither ever reaches the plating", () => {
    // **The rule that replaced the sinking half** (14 September 2026). It used
    // to be put on the ship's row and burst against the plating for the top's
    // own price; a body that rises for the whole of its life except once is
    // two creatures wearing one name, and the owner said so.
    const entry = entryRowOf(play([balloon(3)], TPB * 2).world);
    const { world, events } = play([balloon(3)], TPB * (HALVES_STEP + EVERY), rub(ON_FIELD, 1));
    expect(events.some((e) => e.type === "breach")).toBe(false);
    // Both still on the field, both above where they split, and the hull has
    // paid nothing.
    expect(world.creatures).toHaveLength(2);
    for (const c of world.creatures) {
      expect(balloonSinks(c)).toBe(false);
      expect(c.row).toBeLessThan(entry);
    }
    expect(failHolds(world)).toBe(false);
    expect(world.scars).toHaveLength(0);
  });

  it("sends both halves inward when the parent split against a wall", () => {
    // A balloon in the leftmost column has no lane to its left, so the two
    // halves stand in the wall column and the one beside it — and both head
    // into the field rather than one of them into the wall.
    //
    // **Carried there rather than authored there.** A wave cannot paint a
    // balloon at a wall any more: every arrival glides to the middle band
    // (`balloon-entry.ts`), and a body reaches a wall only by caroming into
    // one. So the test puts it there, which is what a run would have done a
    // few beats later.
    const { world } = play([balloon(3)], ON_FIELD + GIVES + 1, rub(ON_FIELD, 1), (t, w) => {
      if (t === ON_FIELD - 1) {
        const c = w.creatures[0];
        if (c) c.col = 0;
      }
    });
    const halves = byCol(world);
    expect(halves.map((c) => c.col)).toEqual([0, 1]);
    expect(halves.map((c) => c.balloonDir)).toEqual([1, 1]);
    // And both go up, which is the rule that replaced the sinking half.
    expect(halves.map((c) => balloonSinks(c))).toEqual([false, false]);
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
