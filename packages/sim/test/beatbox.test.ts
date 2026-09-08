import { describe, expect, it } from "bun:test";
import {
  beatboxBeatFor,
  beatboxDeadline,
  beatboxHitsMade,
  beatboxIsBox,
  beatboxWanted,
  beatboxWindowTicks,
} from "../src/beatbox.js";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import type { Creature, TimedCommand } from "../src/types.js";
import {
  createWorld,
  MILLI,
  type SimEvent,
  type SpawnEntry,
  step,
  type World,
} from "../src/world.js";

/**
 * THE BEATBOX, and the three things about it that are new to this simulation.
 *
 * The first is that a press is judged by **when** it arrived rather than by
 * what was under it. Nothing else in this game asks that question of a body —
 * the guard asks it of the ship — so the whole of `beatboxBeatFor` is tested
 * here, including the boundary the config has to stay inside for the question
 * to have one answer at all.
 *
 * The second is that a run is committed by **stopping**, and that both ways of
 * getting it wrong are answered *at once* rather than on the next beat. Every
 * other creature is answered by doing something; this one is answered by doing
 * something and then not doing it. A run that stops short is judged the instant
 * the beat it skipped closes; a run that goes one tap too far is judged on that
 * tap. Both moments are asserted below to the tick, because a beat's grace is
 * exactly what was taken out of them.
 *
 * The third is what a **wrong** count costs. Getting it wrong is not simply
 * failing to kill the thing: the hull pays, and the body stays on the field
 * with its run wiped, which is a second chance rather than a punishment
 * doubled. That combination is easy to get backwards and it is asserted
 * directly.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const box = (col: number, beats?: number): SpawnEntry => ({
  beat: 0,
  col,
  kind: "beatbox",
  color: null,
  ...(beats === undefined ? {} : { beats }),
});

/** Player 2's thumb, on the tick named. */
const tap = (tick: number, id: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "tap", id },
});

/**
 * The tick a beat turns over on.
 *
 * `onBeat` runs after the tick counter has moved (`step.ts`), so beat `b`
 * begins at `b * TPB` — and a command applied on that tick sees the world with
 * `world.beat` already `b`, which is what makes a tap there land exactly on
 * the beat.
 */
const at = (beat: number): number => beat * TPB;

/** The first body id a wave hands out. Ids come off `world.nextId`, which a
 * fresh world starts at 1, and one box is the only arrival in most of these. */
const FIRST = 1;

interface Run {
  world: World;
  events: SimEvent[];
}

/**
 * The hull mends a little every tick (`regenerateHull`), which is right for
 * the game and useless for an assertion about what one discharge cost. The
 * runs that weigh the hull turn it off; nothing else about them changes.
 */
const NO_REGEN = { ...CFG, hullRegenPerSecond: 0 };

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

const only = (world: World): Creature => {
  expect(world.creatures).toHaveLength(1);
  return world.creatures[0] as Creature;
};

/** A run of `n` taps, one on each beat from `from`, all on the beat. */
const runOf = (from: number, n: number, id = FIRST): TimedCommand[] =>
  Array.from({ length: n }, (_, i) => tap(at(from + i), id));

describe("which beat a tap is for", () => {
  it("cannot reach two beats at once, which is what makes the answer single", () => {
    // The property the whole creature rests on, held against the shipped
    // config rather than assumed: a window wider than half a beat would put
    // one tick inside the windows of two neighbouring beats.
    expect(beatboxWindowTicks(CFG) * 2).toBeLessThan(TPB);
  });

  it("is this beat when the thumb is late, and the next one when it is early", () => {
    const world = createWorld({ ...CFG }, 0, []);
    const edge = beatboxWindowTicks(CFG);
    // Tick and beat are stepped by hand here rather than through `step`,
    // because what is under test is the reading and not the loop.
    world.beat = 4;
    world.tick = at(4);
    expect(beatboxBeatFor(world)).toBe(4);
    world.tick = at(4) + edge;
    expect(beatboxBeatFor(world)).toBe(4);
    world.tick = at(5) - edge;
    expect(beatboxBeatFor(world)).toBe(5);
    // And in between, nothing at all.
    world.tick = at(4) + Math.floor(TPB / 2);
    expect(beatboxBeatFor(world)).toBeNull();
  });
});

describe("a box on the field", () => {
  it("arrives carrying the count the wave authored, and no run", () => {
    const { world } = run([box(3, 4)], TPB * 2);
    const c = only(world);
    expect(beatboxIsBox(c)).toBe(true);
    expect(beatboxWanted(c)).toBe(4);
    expect(beatboxHitsMade(c)).toBe(0);
  });

  it("takes the config's own count when the wave names none", () => {
    const { world } = run([box(3)], TPB * 2);
    expect(beatboxWanted(only(world))).toBe(CFG.beatboxBeats);
  });

  it("refuses a shot, in either colour, and stays exactly as it was", () => {
    const inputs: TimedCommand[] = [
      { tick: TPB + 1, player: 1, command: { kind: "cannonCol", col: 3 } },
      { tick: TPB + 2, player: 2, command: { kind: "fire", color: "red" } },
    ];
    const { world, events } = run([box(3, 3)], TPB * 4, inputs);
    expect(beatboxIsBox(only(world))).toBe(true);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(world.score).toBe(0);
  });
});

describe("how fast a box comes down", () => {
  it("takes a tile every other beat, which is half of everything else", () => {
    // Six beats of falling. A slick would be six rows down the field; a box is
    // three. Read off the body rather than off the config, so a change to
    // `beatboxFallBeats` that did not reach `slowStep` fails here.
    const start = run([box(3, 3)], at(1) + 1).world;
    const later = run([box(3, 3)], at(7) + 1).world;
    expect(only(later).row - only(start).row).toBe(3);
  });
});

describe("a run", () => {
  it("is committed by stopping, and the right count silences the box", () => {
    // Three taps on beats 1, 2 and 3, then nothing. Beat 4 goes by with the
    // window still open and beat 5 is where it locks in.
    //
    // The rock is there to keep the wave *open*: clearing one is worth
    // `scoreWave` on its own (`wave-end.ts`), and a box that happened to be
    // the last body on the field would have that bonus folded into the number
    // this asserts.
    const queue = [box(3, 3), { beat: 30, col: 0, kind: "meteor", color: null } as SpawnEntry];
    const { world, events } = run(queue, at(7), runOf(1, 3), NO_REGEN);
    expect(world.creatures.some(beatboxIsBox)).toBe(false);
    expect(events.filter((e) => e.type === "beatboxSilent")).toHaveLength(1);
    expect(events.some((e) => e.type === "beatboxWave")).toBe(false);
    expect(world.score).toBe(CFG.scoreBeatboxSilence);
    expect(world.hullMilli).toBe(100 * MILLI);
  });

  it("counts one tap per beat, so a second inside one window is ignored", () => {
    const inputs = [...runOf(1, 2), tap(at(2) + 1, FIRST)];
    const { world } = run([box(3, 3)], at(3) + 1, inputs);
    expect(beatboxHitsMade(only(world))).toBe(2);
  });

  it("does not start on a thumb that landed between two beats", () => {
    const off = at(1) + Math.floor(TPB / 2);
    const { world, events } = run([box(3, 3)], at(3), [tap(off, FIRST)]);
    expect(beatboxHitsMade(only(world))).toBe(0);
    expect(events.some((e) => e.type === "beatboxTap")).toBe(false);
    // A press that reached nothing says so the way the rest of the field does.
    expect(events.some((e) => e.type === "reject")).toBe(true);
  });

  it("is not extended by a tap that skipped a beat — that run was already over", () => {
    // Taps on beats 1 and 2, nothing on 3, and one on 4. The last one starts a
    // fresh run rather than making the first one three long, and the first is
    // committed at two against a box asking for three.
    const inputs = [...runOf(1, 2), tap(at(4), FIRST)];
    const { world, events } = run([box(3, 3)], at(4) + 1, inputs);
    expect(events.filter((e) => e.type === "beatboxWave")).toHaveLength(1);
    // Still there, and counting again from the tap that broke the old run.
    expect(beatboxHitsMade(only(world))).toBe(1);
  });
});

describe("a mistake is answered at once", () => {
  const full = 100 * MILLI;

  it("judges a skipped beat when that beat's window shuts, not a beat later", () => {
    // Two taps against a box asking for three, and then nothing. The run is
    // over the moment beat 3's window closes — one tick past the deadline —
    // and it must not still be open on the tick before it.
    const world = createWorld({ ...NO_REGEN }, 0, [box(3, 3)]);
    const inputs = new Map(runOf(1, 2).map((i) => [i.tick, [i]]));
    const deadline = at(3) + beatboxWindowTicks(CFG);
    let fired = -1;
    for (let t = 0; t < at(6); t++) {
      step(world, inputs.get(t) ?? []);
      if (fired < 0 && world.events.some((e) => e.type === "beatboxWave")) fired = world.tick;
    }
    // The deadline the reading names, and the tick the discharge actually
    // landed on, are the same moment — not the same *beat*, the same tick.
    expect(deadline).toBe(at(3) + beatboxWindowTicks(CFG));
    expect(fired).toBe(deadline + 1);
    // And that is well inside beat 3, rather than at beat 4 where a whole
    // beat of grace would have put it.
    expect(fired).toBeLessThan(at(4));
  });

  it("names the deadline off the beat the last tap was for", () => {
    const { world } = run([box(3, 4)], at(2) + 1, runOf(1, 2));
    expect(beatboxDeadline(CFG, only(world))).toBe(at(3) + beatboxWindowTicks(CFG));
  });

  it("charges one tap too many on that tap, and does not count it", () => {
    // A box asking for two, tapped three times. The third is refused as a run
    // rather than folded into one: the discharge is on beat 3 itself, and the
    // count on the event is the two that were right.
    const { world, events } = run([box(3, 2)], at(3) + 1, runOf(1, 3), NO_REGEN);
    const wave = events.find((e) => e.type === "beatboxWave");
    expect(wave).toBeDefined();
    expect(wave?.hits).toBe(2);
    expect(world.hullMilli).toBe(full - CFG.damageBeatboxWave * MILLI);
    // The run is wiped rather than left standing at one: the tap that broke it
    // is not the first tap of a new run.
    expect(beatboxHitsMade(only(world))).toBe(0);
  });

  it("stamps the tick a discharge happened on, for the red render draws", () => {
    const { world } = run([box(3, 2)], at(3) + 1, runOf(1, 3), NO_REGEN);
    expect(only(world).beatboxWrong).toBe(at(3));
    // And the tap's own tick is cleared with the run it belonged to.
    expect(only(world).beatboxTick).toBeUndefined();
  });

  it("stamps the tick a counted tap arrived on, which is not the beat", () => {
    // A thumb a few ticks early is credited to the beat it was reaching for
    // and stamped with the tick it actually landed on — the two are different
    // numbers, and the picture is timed from the second.
    const early = at(2) - 3;
    const { world } = run([box(3, 3)], at(2) + 1, [tap(early, FIRST)]);
    const c = only(world);
    expect(c.beatboxBeat).toBe(2);
    expect(c.beatboxTick).toBe(early);
  });
});

describe("a wrong count", () => {
  const full = 100 * MILLI;

  it("discharges at the hull and leaves the body falling", () => {
    // Two taps against a box asking for three: short, which is the mistake the
    // creature is built around — the pilot's number never arrived in time.
    const { world, events } = run([box(3, 3)], at(5), runOf(1, 2), NO_REGEN);
    const waves = events.filter((e) => e.type === "beatboxWave");
    expect(waves).toHaveLength(1);
    expect(world.hullMilli).toBe(full - CFG.damageBeatboxWave * MILLI);
    // The body is still there, and its run has been wiped so the height it has
    // left is another go at it.
    const c = only(world);
    expect(beatboxIsBox(c)).toBe(true);
    expect(beatboxHitsMade(c)).toBe(0);
    expect(world.score).toBe(0);
  });

  it("is a miss when the count is over as well as under", () => {
    const { world, events } = run([box(3, 2)], at(6), runOf(1, 3), NO_REGEN);
    expect(events.filter((e) => e.type === "beatboxWave")).toHaveLength(1);
    expect(events.some((e) => e.type === "beatboxSilent")).toBe(false);
    expect(world.hullMilli).toBeLessThan(full);
  });

  it("leaves no scar, because nothing struck the ship", () => {
    const { world } = run([box(3, 3)], at(5), runOf(1, 2));
    expect(world.scars).toHaveLength(0);
  });
});

describe("only player 2 may tap", () => {
  it("ignores the pilot's thumb entirely", () => {
    const inputs: TimedCommand[] = [
      { tick: at(1), player: 1, command: { kind: "tap", id: FIRST } },
      { tick: at(2), player: 1, command: { kind: "tap", id: FIRST } },
      { tick: at(3), player: 1, command: { kind: "tap", id: FIRST } },
    ];
    const { world, events } = run([box(3, 3)], at(5), inputs);
    expect(beatboxHitsMade(only(world))).toBe(0);
    expect(events.some((e) => e.type === "beatboxTap")).toBe(false);
  });
});

describe("lockstep", () => {
  it("fingerprints the same twice over the same inputs", () => {
    // Two boxes wanting different counts, one answered and one miscounted, so
    // the run covers a silence, a discharge and a body still falling — every
    // field this creature writes moves at least once.
    const queue = [box(1, 2), box(5, 3)];
    const inputs = [...runOf(1, 2, FIRST), ...runOf(1, 2, FIRST + 1)];
    const a = run(queue, at(8), inputs);
    const b = run(queue, at(8), inputs);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    // And it is not a trivial agreement: the run really did both things.
    expect(a.events.some((e) => e.type === "beatboxSilent")).toBe(true);
    expect(a.events.some((e) => e.type === "beatboxWave")).toBe(true);
  });

  it("notices a run that differs by one tap", () => {
    const queue = [box(3, 3)];
    const a = run(queue, at(6), runOf(1, 3));
    const b = run(queue, at(6), runOf(1, 2));
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
