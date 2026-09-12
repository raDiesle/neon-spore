import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  lanceReady,
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
 * THE LANCE: marking re-grounded on the raster (docs/spec/couplings.md 2), and
 * re-grounded a second time on the trigger when the owner took its button off
 * the panel.
 *
 * Two halves that are no use apart, so the tests come in two halves too. One is
 * player 2's: the colour is *held* rather than tapped, the lobe fills, and at
 * the top of the fill the shot goes by itself. The other is player 1's: the
 * fill only runs while the cannon stands still, so a pair that wants one has
 * to have agreed on the column out loud.
 *
 * The third group is the one thing this must never do — eat an ordinary shot.
 * A lift always fires, whatever the cannon did underneath it.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** Ticks the default config asks the thumb to stay down. */
const FILL = CFG.lancePrimeBeats * TPB;
/** The column everything below is fired up. Never the cannon's starting one. */
const COL = 3;

const prime = (tick: number, on: boolean, color: "red" | "cyan" = "red"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "prime", on, color },
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

/** Both halves: the pilot puts the cannon on `COL`, the navigator holds red
 * from tick 1 and never lets go. The lance goes on tick `FILL + 1`. */
const hold = (color: "red" | "cyan" = "red"): TimedCommand[] => [
  aim(0, COL),
  prime(1, true, color),
];

/** The tick a hold started on tick 1 fires its lance on. */
const GOES = FILL + 1;
/** Ticks the beam stands in the column afterwards. */
const BEAM = CFG.lanceBeamBeats * TPB;

/**
 * The same hold, started `beats` in — for a column that has to be *standing*
 * before it is burnt. A body on the beat it arrives is still stepping in from
 * above the top row and is not on the field yet, exactly as it is not for an
 * ordinary shot (`firstAlong`), so a stack tested the instant it is dealt out
 * would be a stack the beam is right to miss the top of.
 */
const holdAfter = (beats: number): TimedCommand[] => [aim(0, COL), prime(beats * TPB, true, "red")];
const goesAfter = (beats: number): number => beats * TPB + FILL + 1;

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
    // And on the very next tick it is full and gone: nothing has to press it.
    const seen = play(w, GOES);
    expect(seen.filter((e) => e.type === "fire")[0]).toMatchObject({ lance: true });
  });

  it("says so once, in the column it was filled in", () => {
    const w = world();
    const full = play(w, GOES + TPB, hold()).filter((e) => e.type === "lanceFull");
    expect(full).toHaveLength(1);
    expect(full[0]).toMatchObject({ type: "lanceFull", col: COL });
  });

  it("reads out as a share of the way there", () => {
    const w = world();
    play(w, 1 + TPB, hold());
    expect(primeChargeMilli(w)).toBeGreaterThan(300);
    expect(primeChargeMilli(w)).toBeLessThan(360);
  });

  it("is nothing at all until a thumb is down", () => {
    const w = world();
    play(w, TPB * 5);
    expect(w.prime).toBeNull();
    expect(primeChargeMilli(w)).toBe(0);
    expect(lanceReady(w)).toBe(false);
  });

  it("leaves in the colour that was held, not the other one", () => {
    const w = world();
    const seen = play(w, GOES, hold("cyan"));
    expect(seen.filter((e) => e.type === "fire")[0]).toMatchObject({
      lance: true,
      color: "cyan",
    });
  });

  it("fires once and then nothing, however long the thumb stays", () => {
    const w = world();
    const seen = play(w, GOES + FILL * 2, hold());
    expect(seen.filter((e) => e.type === "fire")).toHaveLength(1);
    expect(priming(w)).toBe(false);
    expect(primeChargeMilli(w)).toBe(0);
  });
});

describe("what empties the lobe", () => {
  it("the thumb lifting, which is the ordinary shot", () => {
    const w = world();
    const seen = play(w, FILL, [...hold(), prime(TPB, false)]);
    expect(priming(w)).toBe(false);
    expect(seen.filter((e) => e.type === "fire")[0]).toMatchObject({ lance: false });
    expect(seen.filter((e) => e.type === "lanceSpilled")).toHaveLength(1);
  });

  it("the cannon moving — the mark is on a column", () => {
    const w = world();
    play(w, GOES, [...hold(), aim(TPB, COL + 1)]);
    // Still held, and still filling: what the slide took was the fill, not the
    // thumb, so nothing has fired by the tick it otherwise would have.
    expect(priming(w)).toBe(true);
    expect(lanceReady(w)).toBe(false);
  });

  it("and says so, so the pair can hear what it cost", () => {
    const w = world();
    const seen = play(w, GOES, [...hold(), aim(TPB, COL + 1)]);
    expect(seen.filter((e) => e.type === "lanceSpilled")).toHaveLength(1);
  });

  it("but never the shot the thumb was owed", () => {
    const w = world();
    // Slid out from under a filling lobe, and then let go. Player 1 moves the
    // cannon on every wave in the game, and a trigger whose shots vanished
    // when he did would be a broken trigger.
    const seen = play(w, GOES, [...hold(), aim(TPB, COL + 1), prime(TPB * 2, false)]);
    expect(seen.filter((e) => e.type === "fire")[0]).toMatchObject({ lance: false });
  });

  it("but not a cannon command that lands where the cannon already is", () => {
    const w = world();
    const seen = play(w, GOES, [...hold(), aim(TPB, COL)]);
    expect(seen.filter((e) => e.type === "fire")[0]).toMatchObject({ lance: true });
  });

  it("the maw, which is the same lobe turned inside out", () => {
    const w = world();
    play(w, GOES, [...hold(), maw(TPB)]);
    expect(lanceReady(w)).toBe(false);
  });

  it("a wave starting over", () => {
    const w = world();
    play(w, FILL, hold());
    startWave(w, 1, []);
    expect(w.prime).toBeNull();
  });

  it("but never the shield trigger — that is the other hand", () => {
    const w = world();
    const seen = play(w, GOES, [...hold(), { tick: TPB, player: 1, command: { kind: "guard" } }]);
    expect(seen.filter((e) => e.type === "fire")[0]).toMatchObject({ lance: true });
  });
});

describe("the shot the hold sends", () => {
  it("is a beam standing in the column, and nothing leaves the ship", () => {
    const w = world();
    const fired = play(w, GOES, hold()).filter((e) => e.type === "fire");
    expect(fired[0]).toMatchObject({ type: "fire", col: COL, lance: true });
    // The whole of the difference from the shot this used to be: there is no
    // bullet anywhere, because the beam *is* the weapon (`lance.ts`).
    expect(w.bullets).toHaveLength(0);
    expect(w.beam).toMatchObject({ col: COL, color: "red" });
    expect(priming(w)).toBe(false);
  });

  it("stands for lanceBeamBeats and then goes out", () => {
    const w = world();
    play(w, GOES + BEAM, hold());
    expect(w.beam).not.toBeNull();
    play(w, GOES + BEAM + 2);
    expect(w.beam).toBeNull();
  });

  it("is an ordinary shot when the thumb comes up early", () => {
    const w = world();
    const seen = play(w, TPB + 6, [...hold(), prime(TPB, false)]);
    expect(seen.filter((e) => e.type === "fire")[0]).toMatchObject({ lance: false });
    expect(w.bullets[0]?.lance).toBe(false);
  });

  it("and a tap is exactly that: down and up inside a beat", () => {
    const w = world();
    const seen = play(w, TPB * 4, [aim(0, COL), prime(1, true), prime(5, false)]);
    expect(seen.filter((e) => e.type === "fire")).toHaveLength(1);
    expect(seen.filter((e) => e.type === "fire")[0]).toMatchObject({ lance: false });
  });

  it("reaches the top of an empty column on the tick it lights", () => {
    // An ordinary shot takes a beat and a bit to cross the field. This one has
    // no travel at all — `topMilli` 0 is the top of the grid, on the same tick
    // the lobe came full.
    const w = world();
    play(w, GOES, hold());
    expect(w.beam?.topMilli).toBe(0);
  });
});

describe("what a lance does to a column", () => {
  it("takes every body of its own colour in the column, however many", () => {
    // The owner took the three-body limit off on 7 September 2026 when the
    // beam became the weapon: what a hold buys is the column. Five, which is
    // two more than the limit that used to be there.
    const w = world(stack(5));
    const seen = play(w, goesAfter(5) + 2, holdAfter(5));
    expect(destroys(seen)).toHaveLength(5);
    expect(w.creatures).toHaveLength(0);
  });

  it("and takes them on the tick it lights, not over the beats it would fly", () => {
    const w = world(stack(4));
    const seen = play(w, goesAfter(5), holdAfter(5));
    expect(destroys(seen)).toHaveLength(4);
  });

  it("where an ordinary shot takes exactly one", () => {
    // The same column, the same stack and the same moment — everything but
    // the thumb that was held.
    const w = world(stack(4));
    const seen = play(w, GOES + TPB * 12, [aim(0, COL), shoot(GOES)]);
    expect(destroys(seen)).toHaveLength(1);
  });

  it("stops at a rock, and the rock still only takes a crater", () => {
    const w = world([
      { beat: 0, col: COL, kind: "meteor", color: null },
      ...stack(2).map((e) => ({ ...e, beat: e.beat + 2 })),
    ]);
    const seen = play(w, GOES + 2, hold());
    expect(destroys(seen)).toHaveLength(0);
    expect(seen.filter((e) => e.type === "hole")).toHaveLength(1);
    expect(w.creatures.find((c) => c.kind === "meteor")?.holes).toBe(1);
  });

  it("stops at the wrong colour, exactly as an ordinary shot does", () => {
    const w = world([
      { beat: 0, col: COL, kind: "bulb", color: "cyan" },
      ...stack(2).map((e) => ({ ...e, beat: e.beat + 2 })),
    ]);
    const seen = play(w, GOES + 2, hold());
    expect(destroys(seen)).toHaveLength(0);
    expect(seen.filter((e) => e.type === "reject")).toHaveLength(1);
    expect(w.balance.colorMisses).toBe(1);
  });

  it("counts every body it takes as its own joint moment", () => {
    const w = world(stack(3));
    play(w, goesAfter(4) + 2, holdAfter(4));
    expect(w.balance.colorHits).toBe(3);
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

  it("cannot disagree about which colour is in it either", () => {
    const a = world();
    play(a, TPB * 2, hold("red"));
    const b = world();
    play(b, TPB * 2, hold("cyan"));
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });

  it("cannot disagree about a column that is burning either", () => {
    const a = world();
    play(a, GOES, hold());
    const b = world();
    play(b, GOES, [aim(0, COL), shoot(GOES - 1)]);
    expect(a.beam).not.toBeNull();
    expect(b.beam).toBeNull();
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
