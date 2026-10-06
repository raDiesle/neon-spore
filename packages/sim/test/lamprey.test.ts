import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  type LampreyState,
  type LampreyStep,
  lampreyAsks,
  lampreyBoss,
  lampreyHolder,
  lampreyWorker,
} from "../src/lamprey.js";
import { lampreyTailWay } from "../src/lamprey-leap.js";
import { lampreyStruck } from "../src/lamprey-shot.js";
import { slowing } from "../src/slow.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE LAMPREY's rules: an eel that leaps from tile to tile, a tile further
 * each leap, and a pair who free it from each bite before its fuse runs out
 * (`docs/spec/bosses.md` §11.59). What a phone cannot show: that every leap
 * lands the distance its step says, on a tile not bitten before and inside
 * the rows it may land on; that only the holder's thumb on the tail lets the
 * head come off, and a head pulled with the tail loose slips; that an `apart`
 * wants both pulls out in one instant; that a run-out window is the hull.
 * AUTO playing it through: `tools/director/test/autopilot-lamprey.test.ts`.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
const SCRIPT: readonly LampreyStep[] = [
  { ask: "pull", holder: 1, teeth: 0, jump: 1, beats: 12, color: "either" },
  { ask: "teeth", holder: 2, teeth: 2, jump: 2, beats: 16, color: "either" },
  { ask: "apart", holder: 1, teeth: 0, jump: 3, beats: 14, color: "either" },
  { ask: "gullet", holder: 1, teeth: 0, jump: 4, beats: 12, color: "red" },
  { ask: "pull", holder: 2, teeth: 0, jump: 5, beats: 12, color: "either" },
  { ask: "teeth", holder: 1, teeth: 2, jump: 6, beats: 16, color: "either" },
  { ask: "gullet", holder: 1, teeth: 0, jump: 7, beats: 12, color: "either" },
];

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "lamprey", steps: SCRIPT });
  return world;
}

function eel(world: World): LampreyState {
  const s = lampreyBoss(world);
  if (s === null) throw new Error("the wave installed no lamprey");
  return s;
}

function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(world, cmds);
  return world.events.map((e) => e.type);
}

type Drag = { on: boolean; id?: number; x?: number; y?: number };

function drag(world: World, player: 1 | 2, target: string, d: Drag): string[] {
  const command = {
    kind: "drag",
    target,
    on: d.on,
    fromMilli: d.x ?? 0,
    fromYMilli: d.y ?? 0,
    ...(d.id === undefined ? {} : { id: d.id }),
  } as TimedCommand["command"];
  return tick(world, [{ tick: world.tick, player, command }]);
}

/** A press on `tooth` from `player`, down and lifted; the event types of both ticks. */
function tap(world: World, player: 1 | 2, tooth: number): string[] {
  return [
    ...drag(world, player, "lampreyTooth", { on: true, id: tooth }),
    ...drag(world, player, "lampreyTooth", { on: false, id: tooth }),
  ];
}

const holder = (w: World): 1 | 2 => lampreyHolder(eel(w)) ?? 1;
const worker = (w: World): 1 | 2 => lampreyWorker(eel(w)) ?? 2;
const holdTail = (w: World) => drag(w, holder(w), "lampreyTail", { on: true });
const pullHead = (w: World) => drag(w, worker(w), "lampreyHead", { on: true, y: -2000 });

function runUntil(world: World, until: (w: World) => boolean, beats = 80): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the lamprey never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

const toStay = (world: World) =>
  runUntil(world, (w) => eel(w).phase === "bite" || eel(w).phase === "rearing");

/** The stay on answered the right way, whatever it asks. */
function answer(world: World): void {
  const ask = lampreyAsks(eel(world));
  if (ask === "gullet") {
    const s = eel(world);
    const color = s.steps[s.cursor]?.color ?? "red";
    lampreyStruck(world, shot(color === "either" ? "cyan" : color, s.col));
    return;
  }
  if (ask === "apart") {
    const way = lampreyTailWay(eel(world));
    drag(world, holder(world), "lampreyTail", { on: true, x: way.x * 2, y: way.y * 2 });
    pullHead(world);
    return;
  }
  holdTail(world);
  if (ask === "pull") pullHead(world);
  while (lampreyAsks(eel(world)) === "teeth") tap(world, worker(world), eel(world).litTooth);
}

function shot(color: Color, col: number): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

describe("THE LAMPREY leaps", () => {
  it("swims in and bites a tile under THE SLOW, the pilot on the tail", () => {
    const world = install();
    expect(eel(world).phase).toBe("entering");
    const seen = toStay(world);
    expect(seen.has("lampreyBite")).toBe(true);
    expect([holder(world), worker(world)]).toEqual([1, 2]);
    expect(slowing(world)).toBe(true);
    expect(eel(world).bitten).toHaveLength(1);
  });

  it("lands every leap its step's distance away, on a fresh tile inside the rows it may land on", () => {
    const world = install(7);
    const tiles: { col: number; row: number }[] = [];
    for (let k = 0; k < SCRIPT.length; k++) {
      toStay(world);
      const s = eel(world);
      tiles.push({ col: s.col, row: s.row });
      expect(s.row).toBeGreaterThanOrEqual(CFG.lampreyRowTop);
      expect(s.row).toBeLessThanOrEqual(CFG.lampreyRowBottom);
      expect(s.col).toBeGreaterThanOrEqual(0);
      expect(s.col).toBeLessThan(CFG.cols);
      if (k < SCRIPT.length - 1) expect(s.nextCol).toBeGreaterThanOrEqual(0);
      answer(world);
    }
    // A gullet rears on its tile and never bites it, so only the bites must be fresh.
    const bites = tiles.filter((_, k) => SCRIPT[k]?.ask !== "gullet");
    const keys = bites.map((t) => t.row * CFG.cols + t.col);
    expect(new Set(keys).size).toBe(keys.length);
    for (let k = 1; k < tiles.length; k++) {
      const [a, b] = [tiles[k - 1], tiles[k]];
      if (a === undefined || b === undefined) continue;
      const d = Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
      expect(d).toBeLessThanOrEqual(SCRIPT[k]?.jump ?? 0);
      expect(d).toBeGreaterThanOrEqual(1);
    }
  });

  it("leaps further every stay, on average over many seeds, where the field has room", () => {
    const sum = SCRIPT.map(() => 0);
    for (let seed = 0; seed < 20; seed++) {
      const world = install(seed);
      let last: { col: number; row: number } | null = null;
      for (let k = 0; k < SCRIPT.length; k++) {
        toStay(world);
        const s = eel(world);
        if (last !== null) {
          sum[k] = (sum[k] ?? 0) + Math.max(Math.abs(s.col - last.col), Math.abs(s.row - last.row));
        }
        last = { col: s.col, row: s.row };
        answer(world);
      }
    }
    for (let k = 2; k < SCRIPT.length; k++) expect(sum[k] ?? 0).toBeGreaterThan(sum[k - 1] ?? 0);
  });

  it("lays its tail away from where it leaps next", () => {
    const world = install();
    toStay(world);
    const s = eel(world);
    const way = lampreyTailWay(s);
    expect(Math.sign(way.x)).toBe(Math.sign(s.col - s.nextCol));
    expect(Math.sign(way.y)).toBe(Math.sign(s.row - s.nextRow));
  });

  it("bites through to the hull when a stay's window runs out", () => {
    const world = install();
    toStay(world);
    const seen = runUntil(world, (w) => w.events.some((e) => e.type === "lampreyFull"), 30);
    expect(seen.has("lampreyLoose")).toBe(false);
    expect(world.events.some((e) => e.type === "breach")).toBe(true);
  });
});

describe("a pull", () => {
  it("comes off with the tail held, leaving the lit tooth in the tile, and THE SLOW shut", () => {
    const world = install();
    toStay(world);
    const lit = eel(world).litTooth;
    expect(holdTail(world)).toContain("lampreyGrip");
    expect(pullHead(world)).toContain("lampreyLoose");
    const s = eel(world);
    expect([s.phase, s.cursor, s.teethOut]).toEqual(["leap", 1, 1 << lit]);
    expect(slowing(world)).toBe(false);
  });

  it("slips with the tail loose, said once a press, and comes off the instant the tail is taken", () => {
    const world = install();
    toStay(world);
    expect(pullHead(world)).toContain("lampreySlip");
    expect(pullHead(world)).not.toContain("lampreySlip");
    expect(eel(world).phase).toBe("bite");
    expect(drag(world, 2, "lampreyTail", { on: true })).not.toContain("lampreyLoose");
    expect(holdTail(world)).toContain("lampreyLoose");
  });
});

describe("the teeth", () => {
  function teethStay(): World {
    const world = install();
    toStay(world);
    answer(world);
    toStay(world);
    expect(lampreyAsks(eel(world))).toBe("teeth");
    return world;
  }

  it("crack only the lit one from the worker with the tail held, the next lit two places on", () => {
    const world = teethStay();
    const lit = eel(world).litTooth;
    expect(tap(world, 1, lit)).toContain("lampreySnap");
    holdTail(world);
    expect(tap(world, 2, lit)).not.toContain("lampreyCrack");
    expect(tap(world, 1, lit)).toContain("lampreyCrack");
    expect(eel(world).litTooth).not.toBe(lit);
  });

  it("snap the last one back on a dark tooth, and count a thumb left down once", () => {
    const world = teethStay();
    holdTail(world);
    tap(world, 1, eel(world).litTooth);
    const lit = eel(world).litTooth;
    expect(tap(world, 1, (lit + 1) % 9)).toContain("lampreySnap");
    expect(eel(world).pulled).toEqual([]);
    drag(world, 1, "lampreyTooth", { on: true, id: lit });
    expect(drag(world, 1, "lampreyTooth", { on: true, id: lit })).not.toContain("lampreyCrack");
    expect(eel(world).pulled).toHaveLength(1);
  });
});

describe("an apart", () => {
  it("wants the tail pulled along the body and the head up, both out at once", () => {
    const world = install();
    for (let k = 0; k < 2; k++) {
      toStay(world);
      answer(world);
    }
    toStay(world);
    expect(lampreyAsks(eel(world))).toBe("apart");
    const way = lampreyTailWay(eel(world));
    expect(pullHead(world)).not.toContain("lampreyLoose");
    const back = { on: true, x: -way.x * 2, y: -way.y * 2 };
    expect(drag(world, 1, "lampreyTail", back)).not.toContain("lampreyLoose");
    const out = { on: true, x: way.x * 2, y: way.y * 2 };
    expect(drag(world, 1, "lampreyTail", out)).toContain("lampreyLoose");
  });
});

describe("the gullet", () => {
  it("rears on its tile in its colour, and wants that colour up that column", () => {
    const world = install();
    for (let k = 0; k < 3; k++) {
      toStay(world);
      answer(world);
    }
    toStay(world);
    const s = eel(world);
    expect(s.phase).toBe("rearing");
    expect(lampreyStruck(world, shot("cyan", s.col))).toBe(true);
    expect(lampreyStruck(world, shot("red", (s.col + 1) % CFG.cols))).toBe(false);
    expect(eel(world).hits).toBe(0);
    expect(lampreyStruck(world, shot("red", s.col))).toBe(true);
    expect([eel(world).hits, eel(world).phase]).toEqual([1, "recoil"]);
  });

  it("ends spent and out with every tooth gone, the same twice from one seed", () => {
    const play = () => {
      const world = install(3);
      for (let k = 0; k < SCRIPT.length; k++) {
        toStay(world);
        answer(world);
      }
      // Three pulls, an apart and two teeth twice: seven of the ring.
      expect(eel(world).teethOut.toString(2).replaceAll("0", "")).toHaveLength(7);
      runUntil(world, (w) => w.boss === null);
      return hashWorld(world);
    };
    expect(play()).toBe(play());
  });
});
