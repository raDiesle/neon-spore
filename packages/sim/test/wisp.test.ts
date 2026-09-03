import { describe, expect, it } from "bun:test";
import {
  type Creature,
  createRng,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  hullRow,
  nextInt,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  wispHops,
  wispOnField,
  wispRows,
} from "../src/index.js";
import { wispHopTo, wispTileAt, wispTiles } from "../src/wisp.js";

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
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

const wisp = (col: number, beat = 0): SpawnEntry => ({ beat, col, kind: "wisp", color: null });
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

describe("wispHops", () => {
  it("is true on every dwell boundary of the shared beat and nowhere else", () => {
    expect(wispHops(CFG, 0)).toBe(true);
    for (let beat = 1; beat < CFG.wispDwellBeats; beat++) {
      expect(wispHops(CFG, beat)).toBe(false);
    }
    expect(wispHops(CFG, CFG.wispDwellBeats)).toBe(true);
    expect(wispHops(CFG, CFG.wispDwellBeats + 1)).toBe(false);
    expect(wispHops(CFG, CFG.wispDwellBeats * 2)).toBe(true);
  });
});

describe("wispHopTo", () => {
  /** A world with a wisp actually standing on the field: `createWorld` reads
   * the queue, and `onBeat` is what puts a body on a tile. */
  function standing(seed: number): { world: ReturnType<typeof createWorld>; c: Creature } {
    const world = createWorld({ ...CFG }, seed, [wisp(3)]);
    for (let t = 0; t <= TPB; t++) step(world, []);
    const c = world.creatures[0];
    if (!c) throw new Error("no wisp on the field");
    return { world, c };
  }

  /**
   * The property the whole creature rests on. A hop that could land on the
   * tile it left is a hop the pair watches happen and then has nothing new to
   * say about.
   */
  it("never lands on the tile it left, over the whole field", () => {
    const { world, c } = standing(11);
    for (let i = 0; i < 4000; i++) {
      const to = wispHopTo(world, c);
      expect(to.col === c.col && to.row === c.row).toBe(false);
      c.col = to.col;
      c.row = to.row;
    }
  });

  /**
   * And the reason it is written the way it is. The obvious spelling — roll a
   * tile, roll again if it is the one you are on — takes an unbounded number
   * of draws off the stream, and two devices that consume different amounts of
   * it disagree about every random thing that happens afterwards. One draw,
   * whatever the column, is the invariant `dartPickDir` states in prose and
   * this is the check on it.
   */
  it("takes exactly one draw off the stream, wherever it is standing", () => {
    const { world, c } = standing(5);
    for (const [col, row] of [
      [0, 0],
      [CFG.cols - 1, wispRows(CFG) - 1],
      [4, 6],
    ]) {
      c.col = col!;
      c.row = row!;
      const before = world.rng.state;
      wispHopTo(world, c);
      const probe = createRng(0);
      probe.state = before;
      nextInt(probe, wispTiles(CFG) - 1);
      expect(world.rng.state).toBe(probe.state);
    }
  });

  it("stays on the field, and never on the hull row", () => {
    const { world, c } = standing(3);
    for (let i = 0; i < 4000; i++) {
      const to = wispHopTo(world, c);
      expect(to.col).toBeGreaterThanOrEqual(0);
      expect(to.col).toBeLessThan(CFG.cols);
      expect(to.row).toBeGreaterThanOrEqual(0);
      expect(to.row).toBeLessThan(HULL);
      c.col = to.col;
      c.row = to.row;
    }
  });

  it("can reach every tile of the field it is allowed", () => {
    const { world, c } = standing(77);
    const seen = new Set<number>();
    for (let i = 0; i < 40_000; i++) {
      const to = wispHopTo(world, c);
      c.col = to.col;
      c.row = to.row;
      seen.add(to.row * CFG.cols + to.col);
    }
    expect(seen.size).toBe(wispTiles(CFG));
  });
});

describe("the tile it is going to next", () => {
  /**
   * The whole reason `wispNext` exists. The square has to be on the
   * navigator's screen from the moment the body lands, not from the moment it
   * leaves — one dwell to say two characters across the room, rather than one
   * beat, which is the length of the sentence and not of an exchange.
   */
  it("is already rolled by the time the body has finished arriving", () => {
    const { world } = run([wisp(3)], TPB + 1);
    const c = world.creatures[0];
    expect(c).toBeDefined();
    expect(c!.wispNext).toBeDefined();
  });

  it("is where the body actually goes on the next hop, every time", () => {
    const world = createWorld(CFG, 11, [wisp(3)]);
    for (let t = 0; t <= TPB; t++) step(world, []);
    for (let hop = 0; hop < 8; hop++) {
      const c = world.creatures[0];
      expect(c).toBeDefined();
      const promised = wispTileAt(CFG, c!.wispNext!);
      for (let t = 0; t < TPB * CFG.wispDwellBeats; t++) step(world, []);
      const after = world.creatures[0];
      expect(after).toBeDefined();
      expect({ col: after!.col, row: after!.row }).toEqual(promised);
    }
  });

  it("never promises the tile the body is already standing on", () => {
    const world = createWorld(CFG, 5, [wisp(3)]);
    for (let t = 0; t < TPB * CFG.wispDwellBeats * 12; t++) {
      step(world, []);
      const c = world.creatures[0];
      if (c?.wispNext === undefined) continue;
      expect(c.wispNext).not.toBe(c.row * CFG.cols + c.col);
    }
  });

  it("only ever names a tile a wisp may stand on", () => {
    const world = createWorld(CFG, 9, [wisp(3)]);
    for (let t = 0; t < TPB * CFG.wispDwellBeats * 12; t++) {
      step(world, []);
      const next = world.creatures[0]?.wispNext;
      if (next === undefined) continue;
      const { col, row } = wispTileAt(CFG, next);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(CFG.cols);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(wispRows(CFG));
    }
  });

  /**
   * Rule 4 in CLAUDE.md, spelled for this field: a tile the two devices could
   * disagree about is a tile the navigator names truly and the pilot stands on
   * falsely. `hash-coverage.test.ts` catches a field left out of the
   * fingerprint; this catches one that is in it but folded from the wrong
   * place.
   */
  it("moves the fingerprint", () => {
    const world = createWorld(CFG, 3, [wisp(3)]);
    for (let t = 0; t <= TPB; t++) step(world, []);
    const before = hashWorld(world);
    const c = world.creatures[0]!;
    c.wispNext = (c.wispNext! + 1) % wispTiles(CFG);
    expect(hashWorld(world)).not.toBe(before);
  });
});

describe("the wisp", () => {
  it("does not fall — it holds its row through the beats between hops", () => {
    const { world } = run([wisp(3)], TPB + 1);
    const c = world.creatures[0];
    expect(c).toBeDefined();
    // Beat 1 is not a dwell boundary at any dwell above one, so nothing moved.
    expect(world.beat).toBe(1);
    expect(c!.row).toBe(0);
    expect(c!.col).toBe(3);
  });

  it("is somewhere else on the dwell boundary, and says so once for the field", () => {
    const { world, events } = run([wisp(3), wisp(5)], TPB * CFG.wispDwellBeats + 1);
    expect(world.beat).toBe(CFG.wispDwellBeats);
    const moved = world.creatures.filter((c) => c.row !== 0 || (c.col !== 3 && c.col !== 5));
    expect(moved.length).toBeGreaterThan(0);
    // One pip for the whole field, not one per body: `wispHop` is read off the
    // shared beat and both of these took it on the same one.
    expect(events.filter((e) => e.type === "wispHop")).toHaveLength(1);
  });

  it("carries no column or row on the hop, so the pip cannot be panned to the tile", () => {
    const { events } = run([wisp(3)], TPB * CFG.wispDwellBeats + 1);
    const hop = events.find((e) => e.type === "wispHop");
    expect(hop).toEqual({ type: "wispHop" });
  });

  it("never reaches the hull, however long it is left alone", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [wisp(3)]);
    for (let t = 0; t < TPB * (HULL + 20); t++) step(world, []);
    expect(hullPercent(world)).toBe(100);
    expect(world.creatures).toHaveLength(1);
  });

  it("holds the wave open for as long as it is alive", () => {
    const { world } = run([wisp(3)], TPB * (HULL + 20));
    expect(world.restBeat).toBe(0);
    expect(wispOnField(world)).toBe(true);
  });

  it("dies to either colour, and pays scoreWispKill", () => {
    for (const color of ["red", "cyan"] as const) {
      const world = createWorld({ ...CFG }, 4, [wisp(3)]);
      // Two beats in, so the first hop has happened and the cannon has to be
      // put where the body actually is rather than where it was authored.
      for (let t = 0; t < TPB * 2 + 1; t++) step(world, []);
      const c = world.creatures[0];
      expect(c).toBeDefined();
      const at = c!.col;
      const events: SimEvent[] = [];
      for (let t = 0; t < TPB * 4; t++) {
        const inputs: TimedCommand[] =
          t === 0
            ? [aim(world.tick, at), fire(world.tick, color)]
            : t === 1
              ? [fire(world.tick, color)]
              : [];
        step(world, inputs);
        events.push(...world.events);
        if (world.creatures.length === 0) break;
      }
      expect(events.some((e) => e.type === "destroy")).toBe(true);
      expect(world.score).toBeGreaterThanOrEqual(CFG.scoreWispKill);
    }
  });

  it("charges no colour miss either way — the ammunition was never the question", () => {
    const world = createWorld({ ...CFG }, 4, [wisp(3)]);
    for (let t = 0; t < TPB * 2 + 1; t++) step(world, []);
    const at = world.creatures[0]?.col ?? 0;
    for (let t = 0; t < TPB * 4; t++) {
      step(world, t === 0 ? [aim(world.tick, at), fire(world.tick, "red")] : []);
      if (world.creatures.length === 0) break;
    }
    expect(world.balance.colorMisses).toBe(0);
    expect(world.balance.colorHits).toBe(0);
  });

  it("replays deterministically: two runs of one script agree tick for tick", () => {
    const replay = record({
      name: "a wisp hunted across three hops",
      seed: 9,
      queue: [wisp(3)],
      ticks: TPB * 8,
      inputs: [
        aim(TPB * 2, 4),
        fire(TPB * 2 + 3, "cyan"),
        aim(TPB * 5, 1),
        fire(TPB * 5 + 3, "red"),
      ],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });
});
