import { describe, expect, it } from "bun:test";
import { bossFillsWave, bossHoldsWave } from "../src/boss-kinds.js";
import {
  type HiveState,
  hiveBoss,
  hiveLeft,
  hiveNext,
  hiveNextBeat,
  hiveOpenAt,
  hiveOpenCount,
  hiveSiteCols,
  hiveSwelling,
  hiveTwins,
} from "../src/hive.js";
import { hiveHeard } from "../src/hive-hand.js";
import { hiveClenched } from "../src/hive-lobe.js";
import { hiveStruck } from "../src/hive-shot.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  slowing,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { livingKindForColor, otherColor } from "../src/kinds.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE HIVE: close the source, not the spill.
 *
 * What these pin is the clock and the judgment. That the body comes in
 * with every site shut, its sites on distinct inner columns in an order
 * the seed decided, and nothing on the field; that it hangs for
 * `hiveLookBeats` and then opens a site every `hiveOpenBeats`, swelling
 * the next `hiveSwellBeats` before; that an open breach spills a living
 * body of its own colour down its column every `hiveSpillBeats` and a
 * sealed one spills nothing; that a bolt out of the top in an open breach's column and
 * colour seals it for good, the other colour brings every spill forward
 * by `hiveProvokeBeats`, and any other column is skin; that openings come
 * in pairs from `hiveTwinFrom`; that the beam seals like a bolt; and that
 * the last seal opens THE SLOW and the body is gone `hiveOutBeats` later.
 * The mass's own two states and the two thumbs that answer them are next
 * door in `hive-states.test.ts`.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "hive" });
  return world;
}

function body(world: World): HiveState {
  const s = hiveBoss(world);
  if (s === null) throw new Error("no hive installed");
  return s;
}

/** Run `n` beats, feeding any timed inputs on their tick, and say which of the boss's events went by. */
function beats(world: World, n: number, inputs: TimedCommand[] = []): Set<string> {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, byTick.get(world.tick) ?? []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** A shot that has just left through the top of `col`, the way `bullets.ts` hands one over. */
function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** Run until `n` sites have opened, warding every spill by hand so nothing reaches the hull and holds the wave. */
function untilOpened(world: World, n: number): void {
  for (let i = 0; i < 200 && body(world).opened < n; i++) {
    beats(world, 1);
    world.creatures.length = 0;
  }
  if (body(world).opened < n) throw new Error("never opened");
}

/** The first open site's column and colour. */
function firstOpen(world: World): { i: number; col: number; color: Color } {
  const s = body(world);
  for (let i = 0; i < s.opened; i++)
    if (!s.sealed[i]) return { i, col: s.cols[i] ?? 0, color: s.colors[i] ?? "red" };
  throw new Error("nothing open");
}

describe("the body coming in", () => {
  it("comes in with every site shut, on distinct inner columns, and nothing on the field", () => {
    const world = open();
    const s = body(world);
    expect(s.cols).toHaveLength(CFG.hiveSites);
    expect(new Set(s.cols).size).toBe(CFG.hiveSites);
    for (const col of s.cols) expect(col > 0 && col < CFG.cols - 1).toBe(true);
    expect(s.opened).toBe(0);
    expect(hiveLeft(s)).toBe(CFG.hiveSites);
    expect(world.creatures).toHaveLength(0);
    expect(world.events.some((e) => e.type === "hiveEnter")).toBe(true);
  });

  it("orders its sites by the seed rather than left to right", () => {
    const a = body(open(1)).cols;
    const b = body(open(2)).cols;
    expect(a).not.toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(hiveSiteCols(CFG, CFG.hiveSites));
  });

  it("is a fixture that holds its wave and fills it", () => {
    expect(bossHoldsWave("hive")).toBe(true);
    expect(bossFillsWave("hive")).toBe(true);
  });

  it("never puts more sites than inner columns", () => {
    const cols = hiveSiteCols(CFG, CFG.cols * 2);
    expect(cols).toHaveLength(CFG.cols - 2);
    expect(new Set(cols).size).toBe(CFG.cols - 2);
  });
});

describe("the clock", () => {
  it("looks for hiveLookBeats, swells hiveSwellBeats before, then opens a site every hiveOpenBeats", () => {
    const world = open();
    const s = body(world);
    const first = s.cols[0];
    let seen = beats(world, CFG.hiveLookBeats - CFG.hiveSwellBeats - 1);
    expect(seen.has("hiveSwell")).toBe(false);
    expect(hiveSwelling(s, CFG, world.beat)).toBe(false);
    seen = beats(world, 1);
    expect(seen.has("hiveSwell")).toBe(true);
    expect(hiveSwelling(s, CFG, world.beat)).toBe(true);
    expect(s.opened).toBe(0);
    seen = beats(world, CFG.hiveSwellBeats);
    expect(seen.has("hiveOpen")).toBe(true);
    expect(s.opened).toBe(1);
    expect(hiveOpenAt(s, first ?? -1)).toBe(0);
    expect(hiveNextBeat(s, CFG)).toBe(world.beat + CFG.hiveOpenBeats);
    beats(world, CFG.hiveOpenBeats - 1);
    expect(s.opened).toBe(1);
    beats(world, 1);
    expect(s.opened).toBe(2);
  });

  it("spills the breach's own colour, living, down every open column every hiveSpillBeats, and nothing from a sealed one", () => {
    const world = open();
    untilOpened(world, 2);
    const s = body(world);
    const a = firstOpen(world);
    hiveStruck(world, shot(world, a.col, a.color));
    world.creatures.length = 0;
    const seen = beats(world, CFG.hiveSpillBeats);
    expect(seen.has("hiveSpill")).toBe(true);
    const color = s.colors[1] ?? "red";
    const spilled = world.creatures.filter((c) => c.kind === livingKindForColor(color));
    expect(spilled).toHaveLength(1);
    expect(spilled[0]?.col).toBe(s.cols[1]);
    expect(spilled[0]?.color).toBe(color);
    expect(world.creatures.some((c) => c.col === a.col)).toBe(false);
  });

  it("opens two at once from hiveTwinFrom", () => {
    const world = open();
    untilOpened(world, CFG.hiveTwinFrom);
    const s = body(world);
    expect(hiveTwins(s, CFG)).toBe(true);
    expect(s.opened).toBe(CFG.hiveTwinFrom);
    beats(world, CFG.hiveOpenBeats);
    expect(s.opened).toBe(CFG.hiveTwinFrom + 2);
  });
});

describe("the seal", () => {
  it("seals an open breach for a bolt in its column and colour, for good", () => {
    const world = open();
    untilOpened(world, 1);
    const s = body(world);
    const a = firstOpen(world);
    hiveStruck(world, shot(world, a.col, a.color));
    expect(s.sealed[a.i]).toBe(true);
    expect(hiveOpenCount(s)).toBe(0);
    expect(hiveLeft(s)).toBe(CFG.hiveSites - 1);
    expect(world.events.some((e) => e.type === "hiveSeal" && e.left === CFG.hiveSites - 1)).toBe(
      true,
    );
    world.events.length = 0;
    hiveStruck(world, shot(world, a.col, a.color));
    expect(world.events.some((e) => e.type === "hiveSkin")).toBe(true);
  });

  it("is provoked by the other colour: every open breach spills hiveProvokeBeats sooner", () => {
    const world = open();
    untilOpened(world, 1);
    const s = body(world);
    const a = firstOpen(world);
    const was = s.spillBeat;
    hiveStruck(world, shot(world, a.col, otherColor(a.color)));
    expect(s.sealed[a.i]).toBe(false);
    expect(s.spillBeat).toBe(was - CFG.hiveProvokeBeats);
    expect(world.events.some((e) => e.type === "hiveWrong")).toBe(true);
  });

  it("says skin for a column with no open breach over it", () => {
    const world = open();
    untilOpened(world, 1);
    const s = body(world);
    const shut = s.cols[s.cols.length - 1] ?? 0;
    hiveStruck(world, shot(world, shut, "red"));
    hiveStruck(world, shot(world, 0, "red"));
    expect(world.events.filter((e) => e.type === "hiveSkin")).toHaveLength(2);
    expect(hiveLeft(s)).toBe(CFG.hiveSites);
  });

  it("lets the beam seal like a bolt", () => {
    const world = open();
    untilOpened(world, 1);
    const a = firstOpen(world);
    hiveStruck(world, shot(world, a.col, a.color, true));
    expect(body(world).sealed[a.i]).toBe(true);
  });

  it("is won by two real shots inside one hiveSpillBeats cadence: one clears the spilled body, one seals the breach", () => {
    const world = open();
    untilOpened(world, 1);
    const a = firstOpen(world);
    // Run real ticks — not the by-hand `hiveStruck` the rest of this file
    // uses — until the clock's own cadence spills the breach's living body,
    // the way `bullets.ts` and `hive-step.ts` actually hand a game one.
    let spilled = false;
    for (let i = 0; i < 50 * TPB && !spilled; i++) {
      step(world, []);
      spilled = world.events.some((e) => e.type === "hiveSpill" && e.col === a.col);
    }
    expect(spilled).toBe(true);
    expect(
      world.creatures.some((c) => c.col === a.col && c.kind === livingKindForColor(a.color)),
    ).toBe(true);
    // One shot to kill the body blocking the column, a beat later a second to
    // travel the now-clear column and reach the top: both land inside the
    // one cadence before the next body falls (`hive-shot.ts`).
    const at = world.tick;
    const seen = beats(world, 3, [
      { tick: at, player: 1, command: { kind: "cannonCol", col: a.col } },
      { tick: at + 2, player: 2, command: { kind: "fire", color: a.color } },
      { tick: at + TPB, player: 2, command: { kind: "fire", color: a.color } },
    ]);
    expect(seen.has("hiveSeal")).toBe(true);
    expect(body(world).sealed[a.i]).toBe(true);
    expect(world.creatures.some((c) => c.col === a.col)).toBe(false);
  });
});

/** The pilot's thumb, hauling a clenched underside back within reach in one carry. */
function haulDown(world: World): void {
  hiveHeard(world, 1, {
    kind: "drag",
    target: "hiveLobe",
    on: true,
    fromMilli: 0,
    fromYMilli: CFG.hiveHaulMilli,
  });
}

describe("the end", () => {
  it("goes down under THE SLOW on the last seal, and is gone hiveOutBeats later", () => {
    const world = open();
    untilOpened(world, CFG.hiveSites);
    const s = body(world);
    expect(hiveNext(s)).toBe(-1);
    for (let i = 0; i < s.cols.length; i++) {
      if (i === s.cols.length - 1) expect(s.downBeat).toBe(-1);
      hiveStruck(world, shot(world, s.cols[i] ?? 0, s.colors[i] ?? "red"));
      // Every `hiveClenchEvery` scars the underside draws up out of reach and
      // the next bolt would be skin, so the pilot hauls it back down before
      // the run of seals goes on (`hive-hand.ts`, `hive-states.test.ts`).
      if (hiveClenched(s)) haulDown(world);
    }
    expect(hiveLeft(s)).toBe(0);
    expect(s.downBeat).toBe(world.beat);
    expect(slowing(world)).toBe(true);
    expect(world.events.some((e) => e.type === "hiveDown")).toBe(true);
    world.creatures.length = 0;
    const seen = beats(world, CFG.hiveOutBeats + 1);
    expect(seen.has("hiveOut")).toBe(true);
    expect(seen.has("hiveSpill")).toBe(false);
    expect(world.boss).toBeNull();
  });
});

describe("determinism", () => {
  it("fingerprints the same for the same seed", () => {
    const a = open(11);
    const b = open(11);
    for (let i = 0; i < (CFG.hiveLookBeats + CFG.hiveOpenBeats + 1) * TPB; i++) {
      step(a, []);
      step(b, []);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
    expect(body(a).opened).toBeGreaterThan(1);
    expect(a.creatures.length).toBeGreaterThan(0);
  });
});
