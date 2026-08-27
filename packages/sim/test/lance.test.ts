import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  lanceReady,
  NO_PRIME,
  primeChargeMilli,
  priming,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE LANCE: marking re-grounded on the raster (docs/spec/couplings.md 2).
 *
 * Two halves that are no use apart, so the tests come in two halves too. One
 * is player 1's: a lobe fills only while the thumb is down *and* the cannon
 * stands still, and four different things empty it. The other is player 2's:
 * whatever is in the lobe leaves with the next shot, which is why not firing
 * is a thing one player does for the other.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** Ticks the default config asks the thumb to stay down. */
const FILL = CFG.lancePrimeBeats * TPB;
/** The column everything below is fired up. Never the cannon's starting one. */
const COL = 3;

const prime = (tick: number, on: boolean): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "prime", on },
});
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const shoot = (tick: number, color: "red" | "cyan" = "red"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
const maw = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "intake" } });

function world(queue: SpawnEntry[] = [], cfg: SimConfig = CFG) {
  return createWorld({ ...cfg }, 0, queue);
}

/**
 * Run until `untilTick`, sending each command on the tick it is listed for,
 * and hand back everything the world reported on the way — a lance is mostly
 * legible through its events, and they are cleared every tick.
 */
function play(
  w: ReturnType<typeof world>,
  untilTick: number,
  inputs: TimedCommand[] = [],
): SimEvent[] {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const seen: SimEvent[] = [];
  while (w.tick < untilTick) {
    step(w, byTick.get(w.tick) ?? []);
    seen.push(...w.events);
  }
  return seen;
}

/** The pilot's whole half: aim at `COL`, then hold, from tick 0. */
const hold = (): TimedCommand[] => [aim(0, COL), prime(1, true)];

/** A column of `n` bodies of one colour, one beat apart, so they stack. */
const stack = (n: number, kind: "slick" | "bulb" = "slick"): SpawnEntry[] =>
  Array.from({ length: n }, (_, i) => ({
    beat: i,
    col: COL,
    kind,
    color: kind === "slick" ? ("red" as const) : ("cyan" as const),
  }));

const destroys = (events: SimEvent[]) => events.filter((e) => e.type === "destroy");

describe("filling the lobe", () => {
  it("comes full after lancePrimeBeats of the thumb staying down", () => {
    const w = world();
    play(w, FILL, hold());
    expect(priming(w)).toBe(true);
    expect(lanceReady(w)).toBe(false);
    play(w, FILL + 2);
    expect(lanceReady(w)).toBe(true);
  });

  it("says so once, in the column it was filled in", () => {
    const w = world();
    const full = play(w, FILL + TPB, hold()).filter((e) => e.type === "lanceFull");
    expect(full).toHaveLength(1);
    expect(full[0]).toMatchObject({ type: "lanceFull", col: COL });
  });

  it("reads out as a share of the way there, and never past it", () => {
    const w = world();
    play(w, 1 + TPB, hold());
    expect(primeChargeMilli(w)).toBeGreaterThan(300);
    expect(primeChargeMilli(w)).toBeLessThan(360);
    play(w, 1 + FILL * 2);
    expect(primeChargeMilli(w)).toBe(1000);
  });

  it("is nothing at all until a thumb is down", () => {
    const w = world();
    play(w, TPB * 5);
    expect(w.primeTick).toBe(NO_PRIME);
    expect(primeChargeMilli(w)).toBe(0);
    expect(lanceReady(w)).toBe(false);
  });
});

describe("what empties the lobe", () => {
  it("the thumb lifting", () => {
    const w = world();
    play(w, FILL, [...hold(), prime(TPB, false)]);
    expect(priming(w)).toBe(false);
  });

  it("the cannon moving — the mark is on a column", () => {
    const w = world();
    play(w, FILL + 2, [...hold(), aim(TPB, COL + 1)]);
    expect(priming(w)).toBe(false);
    expect(lanceReady(w)).toBe(false);
  });

  it("but not a cannon command that lands where the cannon already is", () => {
    const w = world();
    play(w, FILL + 2, [...hold(), aim(TPB, COL)]);
    expect(lanceReady(w)).toBe(true);
  });

  it("the maw, which is the same lobe turned inside out", () => {
    const w = world();
    play(w, FILL + 2, [...hold(), maw(TPB)]);
    expect(priming(w)).toBe(false);
  });

  it("a wave starting over", () => {
    const w = world();
    play(w, FILL + 2, hold());
    expect(lanceReady(w)).toBe(true);
    startWave(w, 1, []);
    expect(w.primeTick).toBe(NO_PRIME);
  });

  it("but never the shield trigger — that is the other hand", () => {
    const w = world();
    play(w, FILL + 2, [...hold(), { tick: TPB, player: 1, command: { kind: "guard" } }]);
    expect(lanceReady(w)).toBe(true);
  });
});

describe("the shot player 2 fires through it", () => {
  it("is a lance when the lobe is full", () => {
    const w = world();
    const fired = play(w, FILL + TPB, [...hold(), shoot(FILL + 2)]).filter(
      (e) => e.type === "fire",
    );
    expect(fired[0]).toMatchObject({ type: "fire", col: COL, lance: true });
    expect(w.bullets[0]?.lance).toBe(true);
    // Spent: the next shot out of the same lobe is an ordinary one again.
    expect(priming(w)).toBe(false);
  });

  it("is ordinary if it goes early, and takes the fill with it", () => {
    const w = world();
    const seen = play(w, FILL, [...hold(), shoot(TPB)]);
    expect(seen.filter((e) => e.type === "fire")[0]).toMatchObject({ lance: false });
    expect(seen.filter((e) => e.type === "lanceSpilled")).toHaveLength(1);
    expect(priming(w)).toBe(false);
    // And holding on from there is holding an empty lobe: the fill is not
    // resumed where it stopped, it is started again.
    expect(lanceReady(w)).toBe(false);
  });

  it("does not spill a lobe when the reload gap refuses the shot", () => {
    const w = world();
    // Two shots inside `fireEveryBeats`. The first goes out through a lobe
    // that is not filling yet; the second never leaves at all, so it has
    // nothing to take with it.
    const seen = play(w, FILL + TPB, [...hold(), shoot(0), shoot(20)]);
    expect(seen.filter((e) => e.type === "fire")).toHaveLength(1);
    expect(seen.filter((e) => e.type === "lanceSpilled")).toHaveLength(0);
    expect(lanceReady(w)).toBe(true);
  });

  it("travels slower than an ordinary shot, which is what it is traded for", () => {
    const at = (w: ReturnType<typeof world>) => {
      const b = w.bullets[0];
      if (!b) throw new Error("the shot is gone");
      return b.row - b.subMilli / 1000;
    };
    // Half a beat only: an ordinary shot crosses the whole field in one, and
    // a shot that has left the top of it has no position left to compare.
    const plain = world();
    play(plain, TPB / 2, [shoot(0)]);
    const lance = world();
    play(lance, FILL + 2 + TPB / 2, [...hold(), shoot(FILL + 2)]);
    // Same start row, so more of the field left means it has come less far.
    expect(at(lance)).toBeGreaterThan(at(plain));
  });
});

describe("what a lance does to a column", () => {
  it("goes through lancePierce bodies of its own colour and no more", () => {
    const w = world(stack(CFG.lancePierce + 1));
    const seen = play(w, FILL + TPB * 12, [...hold(), shoot(FILL + 2)]);
    expect(destroys(seen)).toHaveLength(CFG.lancePierce);
    expect(w.creatures).toHaveLength(1);
  });

  it("where an ordinary shot takes exactly one", () => {
    // The same column, the same stack and the same moment — everything but
    // the thumb that was held.
    const w = world(stack(CFG.lancePierce + 1));
    const seen = play(w, FILL + TPB * 12, [aim(0, COL), shoot(FILL + 2)]);
    expect(destroys(seen)).toHaveLength(1);
  });

  it("stops at a rock, and the rock still only takes a crater", () => {
    const w = world([
      { beat: 0, col: COL, kind: "meteor", color: null },
      ...stack(2).map((e) => ({ ...e, beat: e.beat + 2 })),
    ]);
    const seen = play(w, FILL + TPB * 8, [...hold(), shoot(FILL + 2)]);
    expect(destroys(seen)).toHaveLength(0);
    expect(seen.filter((e) => e.type === "hole")).toHaveLength(1);
    expect(w.creatures.find((c) => c.kind === "meteor")?.holes).toBe(1);
  });

  it("stops at the wrong colour, exactly as an ordinary shot does", () => {
    const w = world([
      { beat: 0, col: COL, kind: "bulb", color: "cyan" },
      ...stack(2).map((e) => ({ ...e, beat: e.beat + 2 })),
    ]);
    const seen = play(w, FILL + TPB * 8, [...hold(), shoot(FILL + 2)]);
    expect(destroys(seen)).toHaveLength(0);
    expect(seen.filter((e) => e.type === "reject")).toHaveLength(1);
    expect(w.balance.colorMisses).toBe(1);
  });

  it("counts every body it takes as its own joint moment", () => {
    const w = world(stack(CFG.lancePierce));
    play(w, FILL + TPB * 12, [...hold(), shoot(FILL + 2)]);
    expect(w.balance.colorHits).toBe(CFG.lancePierce);
    expect(w.score).toBeGreaterThanOrEqual(CFG.scoreDestroy * CFG.lancePierce);
  });
});

describe("two devices", () => {
  it("cannot disagree about a lobe: the fill is in the fingerprint", () => {
    const a = world();
    play(a, TPB * 2, hold());
    const b = world();
    play(b, TPB * 2, [aim(0, COL)]);
    expect(hashWorld(a)).not.toBe(hashWorld(b));

    const c = world();
    play(c, TPB * 2, hold());
    expect(hashWorld(c)).toBe(hashWorld(a));
  });

  it("cannot disagree about a shot being a lance either", () => {
    const a = world();
    play(a, FILL + TPB, [...hold(), shoot(FILL + 2)]);
    const b = world();
    play(b, FILL + TPB, [aim(0, COL), shoot(FILL + 2)]);
    expect(a.bullets[0]?.lance).toBe(true);
    expect(b.bullets[0]?.lance).toBe(false);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
