import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { type PlacedFault, TO_THE_END } from "../src/fault-placed.js";
import { faultSwallows } from "../src/fault-swallow.js";
import { handedOver, handoverLeft, handoverWarning } from "../src/handover.js";
import { hashWorld } from "../src/hash.js";
import { MALFUNCTION_KINDS } from "../src/malfunction.js";
import type { Command, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE HANDOVER, and the claim that is the whole of it: **the simulation does not
 * change.**
 *
 * The fault trades the two panels between the two screens for a window in the
 * middle of the wave. Nothing on the field moves for it, no command is swallowed
 * and no state is kept — so what is held below is a clock (the window opens on
 * the beat it says and closes on the beat it says) and an identity: the same wave
 * played twice from one seed with the same presses is the same wave tick by tick
 * with the fault on it and without, and the two fingerprints differ by the tag
 * and by nothing else.
 *
 * The queue is authored here rather than taken from `@neon-spore/content`, which
 * `packages/sim` may not import (rule 1). Two bodies and a rock, which is what
 * the shipped wave opens with.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const AT = CFG.handoverAtBeat;
const HOLD = CFG.handoverHoldBeats;
const WARN = CFG.handoverWarnBeats;

const QUEUE: SpawnEntry[] = [
  { beat: 0, col: 3, kind: "slick", color: "red" },
  { beat: 2, col: 5, kind: "meteor", color: null },
  { beat: 6, col: 1, kind: "bulb", color: "cyan" },
  { beat: 10, col: 4, kind: "slick", color: "red" },
];

/**
 * A world on the wave, with the fault or without it.
 *
 * `hullInvulnerable`, which is the only departure from the shipped numbers here:
 * the wave is played with no hand on the strips in most of these tests, so every
 * body reaches the hull and a mortal ship is over before the window has shut —
 * and a run that is over stops counting beats (`step` returns), which would make
 * every expectation about the far side of the window pass for the wrong reason.
 */
function handWorld(fault = true): World {
  const world = createWorld({ ...CFG, hullInvulnerable: true }, 7);
  startWave(world, 0, [...QUEUE], [], null, false, 0, [
    ...(fault ? [{ kind: "handover", at: AT, beats: HOLD } as PlacedFault] : []),
  ]);
  return world;
}

/** Every press both worlds are given, so that the comparison is about the fault
 * and not about one of them being left idle: the cannon crosses the field, the
 * dome follows it a column behind, and a colour goes out on every fourth beat. */
const PRESSES: TimedCommand[] = [];
for (let beat = 0; beat < 24; beat++) {
  const tick = beat * TPB + 1;
  PRESSES.push({ tick, player: 1, command: { kind: "cannonCol", col: beat % 7 } });
  PRESSES.push({ tick, player: 2, command: { kind: "shieldCol", col: (beat + 6) % 7 } });
  if (beat % 4 === 0) PRESSES.push({ tick, player: 2, command: { kind: "fire", color: "red" } });
  if (beat % 4 === 2) PRESSES.push({ tick, player: 1, command: { kind: "guard" } });
}

function byTick(inputs: TimedCommand[]): Map<number, TimedCommand[]> {
  const out = new Map<number, TimedCommand[]>();
  for (const i of inputs) out.set(i.tick, [...(out.get(i.tick) ?? []), i]);
  return out;
}

/**
 * A world standing on `step` of the **fault's** count, which is the wave's beat
 * less one (`faultStep`): `startWave` leaves `waveBeat` at 0 and `onBeat` moves
 * it a tick into each beat, so reaching the fault's beat *n* is a tick past the
 * start of the wave's beat *n + 1*. The arithmetic is here rather than in the
 * helper's callers so that every expectation below reads in the fault's own
 * numbers — the ones an author sets on the slider.
 */
function atBeat(beat: number, fault = true): World {
  const world = handWorld(fault);
  for (let t = 0; t <= (beat + 1) * TPB; t++) step(world, []);
  return world;
}

describe("the window", () => {
  it("is shut until the beat it is authored on", () => {
    for (let beat = 0; beat < AT; beat++) {
      expect(handedOver(atBeat(beat)), `traded on beat ${beat}`).toBe(false);
    }
  });

  it("opens on that beat and holds for handoverHoldBeats", () => {
    for (let beat = AT; beat < AT + HOLD; beat++) {
      expect(handedOver(atBeat(beat)), `not traded on beat ${beat}`).toBe(true);
    }
  });

  it("gives the panels back, and does not take them again", () => {
    for (let beat = AT + HOLD; beat < AT + HOLD + 24; beat++) {
      expect(handedOver(atBeat(beat)), `still traded on beat ${beat}`).toBe(false);
    }
  });

  it("counts the warning down to the trade, on both screens and on no other wave", () => {
    // The count is the number of beats left, so the last beat before the trade
    // reads 1 and the beat of the trade reads nothing: it has happened.
    expect(handoverWarning(atBeat(AT - WARN))).toBe(WARN);
    expect(handoverWarning(atBeat(AT - 1))).toBe(1);
    expect(handoverWarning(atBeat(AT))).toBe(0);
    expect(handoverWarning(atBeat(AT - WARN - 1))).toBe(0);
    expect(handoverWarning(atBeat(AT - 1, false))).toBe(0);
  });

  it("counts the panels back out of it", () => {
    expect(handoverLeft(atBeat(AT))).toBe(HOLD);
    expect(handoverLeft(atBeat(AT + HOLD - 1))).toBe(1);
    expect(handoverLeft(atBeat(AT + HOLD))).toBe(0);
    expect(handoverLeft(atBeat(AT - 1))).toBe(0);
  });
});

/**
 * **The rows the fault is placed on**, which is where the window comes from
 * since 15 September 2026.
 *
 * It used to be three numbers on the fault itself — `at`, `beats` and `every`
 * — and this file worked out which turn of the cycle a beat fell in. Every
 * fault is a pencil on the map now (`sim/fault-placed.ts`), so a wave that
 * wants the panels traded three times **places it three times**, and there is
 * no cycle arithmetic left anywhere: the placements are the windows.
 */
describe("the rows the wave places it on", () => {
  /** A world on a wave that places its trades where it likes. */
  function placed(faults: PlacedFault[], beat: number): World {
    const world = createWorld({ ...CFG, hullInvulnerable: true }, 7);
    startWave(world, 0, [...QUEUE], [], null, false, 0, faults);
    for (let t = 0; t <= (beat + 1) * TPB; t++) step(world, []);
    return world;
  }
  const trade = (at: number, beats: number): PlacedFault => ({ kind: "handover", at, beats });

  it("trades on the beat row the pencil is on, and comes home at its end", () => {
    const one = (beat: number) => handedOver(placed([trade(4, 2)], beat));
    expect([3, 4, 5, 6].map(one)).toEqual([false, true, true, false]);
  });

  it("keeps trading when the wave places it more than once, and comes home between", () => {
    // The owner's answer of 13 September 2026 — both shapes, over a period of
    // beat rows — said with pencils instead of a period: two beats away, three
    // times, six apart.
    const many = [trade(4, 2), trade(10, 2), trade(16, 2)];
    const traded = (beat: number) => handedOver(placed(many, beat));
    expect([4, 5, 10, 11, 16].map(traded)).toEqual([true, true, true, true, true]);
    expect([3, 6, 9, 12, 15].map(traded)).toEqual([false, false, false, false, false]);
  });

  it("counts down to the next placement, not only to the first", () => {
    const many = [trade(4, 2), trade(10, 2), trade(16, 2)];
    const left = (beat: number) => handoverWarning(placed(many, beat));
    expect(left(2)).toBe(2);
    expect(left(8)).toBe(2);
    expect(left(9)).toBe(1);
  });

  it("holds to the end of the wave when the pencil names no length", () => {
    // `TO_THE_END` is what a placement with no `beats` means, and it is what
    // every wave that used to carry a whole-wave fault is written with.
    const forever = (beat: number) =>
      handedOver(placed([{ kind: "handover", at: 3, beats: TO_THE_END }], beat));
    expect([2, 3, 30].map(forever)).toEqual([false, true, true]);
  });
});

describe("the fault itself", () => {
  it("swallows nothing, on any beat of the window", () => {
    // Every kind the other four take away, at the moment this one is at its
    // loudest. A fault that swallowed a press here would be taking a control
    // away, which is the one thing it does not do (`faultSwallows`).
    const kinds: Command[] = [
      { kind: "cannonCol", col: 2 },
      { kind: "shieldCol", col: 4 },
      { kind: "guard" },
      { kind: "fire", color: "red" },
      { kind: "prime", on: true, color: "cyan" },
    ];
    for (const beat of [0, AT - 1, AT, AT + HOLD - 1, AT + HOLD]) {
      const world = atBeat(beat);
      for (const c of kinds) {
        expect(faultSwallows(world, c), `${c.kind} swallowed on beat ${beat}`).toBe(false);
      }
    }
  });

  it("keeps its place on the wire, because the hash pushes its index", () => {
    // `hash.ts` pushes `MALFUNCTION_KINDS.indexOf(kind)`, so the list is
    // append-only: inserting a kind would renumber every replay before it.
    // Written against the last kind there was and failed on the next one that
    // was appended correctly, which is the opposite of what it is for — so it
    // names the five that were here instead, in their order, and a sixth or a
    // seventh on the end is free.
    expect([...MALFUNCTION_KINDS].slice(0, 5)).toEqual([
      "cannon",
      "shield",
      "steer",
      "codex",
      "handover",
    ]);
  });

  it("leaves the simulation identical to the same wave played without it", () => {
    // The claim the whole mechanic rests on. Both worlds are given the same
    // presses from the same seed and compared every tick — not only at the end,
    // because a difference that cancelled itself out would pass that.
    const withFault = handWorld(true);
    const without = handWorld(false);
    const inputs = byTick(PRESSES);
    for (let t = 0; t < 24 * TPB; t++) {
      const at = inputs.get(t) ?? [];
      step(withFault, at);
      step(without, at);
      const where = `tick ${t}`;
      expect(shape(withFault), where).toEqual(shape(without));
    }
  });

  it("differs from that wave by the tag and by nothing else", () => {
    // The fingerprint *must* differ: `malfunction` is a field of `World` and
    // every field of `World` is hashed (rule 4). What the test above holds is
    // that nothing the tag reaches has moved.
    const withFault = handWorld(true);
    const without = handWorld(false);
    for (let t = 0; t < 6 * TPB; t++) {
      step(withFault, []);
      step(without, []);
    }
    expect(hashWorld(withFault)).not.toBe(hashWorld(without));
    withFault.faults = [];
    expect(hashWorld(withFault)).toBe(hashWorld(without));
  });
});

/** Everything the two worlds must agree about, in one shape: what is on the
 * field, what is in the air, what the ship is doing and what it has taken. */
function shape(world: World): unknown {
  return {
    beat: world.beat,
    waveBeat: world.waveBeat,
    creatures: world.creatures.map((c) => ({ ...c })),
    bullets: world.bullets.map((b) => ({ ...b })),
    scars: world.scars.map((s) => ({ ...s })),
    pods: world.pods.map((p) => ({ ...p })),
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    balance: world.balance,
    guard: world.guard,
    events: world.events.map((e) => ({ ...e })),
  };
}
