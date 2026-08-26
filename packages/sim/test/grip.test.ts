import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  fallTilesPerBeat,
  gripCount,
  gripsCreature,
  hashWorld,
  NO_GRIP,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE GRIP: a hand held on something falling slows it, and nothing else about
 * it changes. These tests pin the two halves of that sentence — that it really
 * is slower, and that it really is nothing else — and the one rule that keeps
 * two devices in step: a grip is world state, so it is in the fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const grip = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});

function world(queue: SpawnEntry[], cfg: SimConfig = CFG) {
  return createWorld({ ...cfg }, 0, queue);
}

/**
 * Run `beats` beats, sending each command on the tick it is listed for. The
 * clock is the world's own, so a second call carries on where the first left
 * off — a command is timed against the run, not against the call.
 */
function play(w: ReturnType<typeof world>, beats: number, inputs: TimedCommand[] = []): void {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const until = w.tick + TPB * beats;
  while (w.tick < until) step(w, byTick.get(w.tick) ?? []);
}

/**
 * A field deep enough that nothing reaches the hull mid-test. Every rock tier
 * falls several tiles a beat, and a creature that is removed cannot be
 * compared with one that is still falling.
 */
const TALL: SimConfig = { ...CFG, rows: 200 };

const only = (w: ReturnType<typeof world>) => {
  const c = w.creatures[0];
  if (!c) throw new Error("the field is empty");
  return c;
};

const one = (kind: SpawnEntry["kind"]): SpawnEntry[] => [
  { beat: 0, col: 3, kind, color: kind === "slick" ? "red" : null },
];

describe("a hand on a creature", () => {
  it("slows the fall without moving the column", () => {
    const free = world(one("slick"));
    play(free, 8);
    const held = world(one("slick"));
    play(held, 8, [grip(TPB, 1, 1)]);

    expect(held.creatures[0]?.row).toBeLessThan(free.creatures[0]?.row ?? 0);
    expect(held.creatures[0]?.col).toBe(free.creatures[0]?.col ?? -1);
  });

  it("holds a rock too — the kind that can never be shot", () => {
    for (const kind of ["meteor", "meteorFastest", "torch"] as const) {
      const free = world(one(kind), TALL);
      play(free, 6);
      const held = world(one(kind), TALL);
      play(held, 6, [grip(TPB, 2, 1)]);
      expect(only(held).row).toBeLessThan(only(free).row);
    }
  });

  it("still falls: a grip buys beats, it does not stop anything", () => {
    const held = world(one("meteorFast"), TALL);
    play(held, 2, [grip(TPB, 1, 1)]);
    const before = only(held).row;
    play(held, 4);
    expect(only(held).row).toBeGreaterThan(before);
  });

  it("compounds when both players pull", () => {
    const onePlayer = world(one("meteorFast"), TALL);
    play(onePlayer, 8, [grip(TPB, 1, 1)]);
    const both = world(one("meteorFast"), TALL);
    play(both, 8, [grip(TPB, 1, 1), grip(TPB, 2, 1)]);

    expect(gripCount(both, 1)).toBe(2);
    expect(only(both).row).toBeLessThan(only(onePlayer).row);
  });

  it("lets go on NO_GRIP, and the next beat is a whole tile again", () => {
    const w = world(one("slick"));
    play(w, 6, [grip(TPB, 1, 1)]);
    expect(gripsCreature(w, 1, 1)).toBe(true);
    play(w, 1, [grip(TPB * 6, 1, NO_GRIP)]);
    expect(gripsCreature(w, 1, 1)).toBe(false);

    const from = only(w).row;
    play(w, 1);
    expect(only(w).row - from).toBe(fallTilesPerBeat("slick"));
  });

  it("is one hand per player: a second grab replaces the first", () => {
    const w = world([
      { beat: 0, col: 1, kind: "slick", color: "red" },
      { beat: 0, col: 5, kind: "bulb", color: "cyan" },
    ]);
    play(w, 2, [grip(TPB, 1, 1)]);
    play(w, 1, [grip(TPB * 2, 1, 2)]);
    expect(gripsCreature(w, 1, 1)).toBe(false);
    expect(gripsCreature(w, 1, 2)).toBe(true);
  });

  it("reports the grab once, where the creature stands", () => {
    const w = world(one("slick"));
    for (let t = 0; t < TPB * 2; t++) {
      step(w, t === TPB ? [grip(t, 2, 1)] : []);
      const grabs = w.events.filter((e) => e.type === "grip");
      if (t === TPB) {
        expect(grabs).toHaveLength(1);
        expect(grabs[0]).toMatchObject({ type: "grip", player: 2, col: 3 });
      } else {
        expect(grabs).toHaveLength(0);
      }
    }
  });
});

describe("a grip that has nothing to hold", () => {
  it("is refused for a creature that is not on the field", () => {
    const w = world(one("slick"));
    play(w, 2, [grip(TPB, 1, 999)]);
    expect(gripsCreature(w, 1, 999)).toBe(false);
  });

  it("is refused for the queen, who does not fall", () => {
    const w = createWorld({ ...CFG }, 0, []);
    startWave(w, 0, [], [], { kind: "queen", col: 5, petals: 6 });
    const queen = only(w);
    play(w, 2, [grip(TPB, 1, queen.id)]);
    expect(gripsCreature(w, 1, queen.id)).toBe(false);
  });

  it("is let go the moment the creature leaves the field", () => {
    // Straight into the hull: it is removed there, and the hand with it.
    const w = world(one("meteorFastest"));
    play(w, 2, [grip(TPB, 1, 1)]);
    expect(gripsCreature(w, 1, 1)).toBe(true);
    play(w, 30);
    expect(w.creatures).toHaveLength(0);
    expect(w.gripP1).toBe(NO_GRIP);
  });

  it("does not survive a wave starting over", () => {
    const w = world(one("slick"));
    play(w, 2, [grip(TPB, 1, 1)]);
    startWave(w, 1, one("slick"));
    expect(w.gripP1).toBe(NO_GRIP);
    expect(w.gripP2).toBe(NO_GRIP);
  });
});

describe("two devices", () => {
  it("cannot disagree about a hand: the grip is in the fingerprint", () => {
    const a = world(one("slick"));
    const b = world(one("slick"));
    play(a, 2, [grip(TPB, 1, 1)]);
    play(b, 2);
    expect(hashWorld(a)).not.toBe(hashWorld(b));

    // And the same commands give the same world, which is the actual promise.
    const c = world(one("slick"));
    play(c, 2, [grip(TPB, 1, 1)]);
    expect(hashWorld(c)).toBe(hashWorld(a));
  });

  it("carries the remainder rather than rounding it away", () => {
    // A slick falls one tile a beat. Rounded, a grip could only ever leave it
    // at one tile or none; the thousandths are what make 55% mean anything.
    const w = world(one("slick"), { ...CFG, gripSlowPermille: 500 });
    play(w, 10, [grip(TPB, 1, 1)]);
    // It spawns on the first beat and moves on the nine after it, every one of
    // them held. Half a tile each is four tiles — not nine, and not none,
    // which is what a rounded half would have given.
    expect(only(w).row).toBe(4);
  });
});
