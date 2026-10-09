import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  midCol,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { type LampreyState, type LampreyStep, lampreyAsks, lampreyBoss } from "../src/lamprey.js";
import { lampreyTailWay } from "../src/lamprey-leap.js";
import { lampreyTowAlong, lampreyTowAt, lampreyTowEnd } from "../src/lamprey-tow.js";
import { slowing } from "../src/slow.js";

/**
 * THE LAMPREY's tow (`sim/lamprey-tow.ts`, the owner, 9 October 2026): the
 * eel comes down the middle of the field at the hull, and the pair pull it
 * back off — the tail out along the body, the head back along a curve whose
 * knob stays where it is let go. Two thirds of the way it lunges, once: the
 * head is thrown back to a third and the thumb off it.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

const SCRIPT: readonly LampreyStep[] = [
  { ask: "tow", holder: 1, teeth: 0, jump: 2, beats: 16, color: "either" },
  { ask: "pull", holder: 2, teeth: 0, jump: 2, beats: 12, color: "either" },
  { ask: "tow", holder: 2, teeth: 0, jump: 3, beats: 16, color: "either" },
];

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], {
    kind: "lamprey",
    meal: [{ kind: "meteor", col: 2, row: 4 }],
    steps: SCRIPT,
  });
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

function drag(world: World, player: 1 | 2, target: string, on: boolean, x = 0, y = 0): string[] {
  const command = { kind: "drag", target, on, fromMilli: x, fromYMilli: y } as const;
  return tick(world, [{ tick: world.tick, player, command } as TimedCommand]);
}

/** The worker's thumb carried from where it takes hold to `milli` along the curve. */
function towTo(world: World, milli: number): string[] {
  const s = eel(world);
  const from = lampreyTowAt(world.cfg, s, s.towFrom < 0 ? s.towMilli : s.towFrom);
  const to = lampreyTowAt(world.cfg, s, milli);
  return drag(world, 2, "lampreyHead", true, to.x - from.x, to.y - from.y);
}

/** The holder's tail pulled all the way out along the body. */
function tailOut(world: World): string[] {
  const way = lampreyTailWay(eel(world));
  return drag(world, 1, "lampreyTail", true, way.x * 2, way.y * 2);
}

/** Every place the head has been on the way to the tow, and the events on the way. */
function toTow(world: World): { path: { col: number; row: number }[]; seen: Set<string> } {
  const path: { col: number; row: number }[] = [];
  const seen = new Set<string>();
  const end = world.tick + TPB * 80;
  while (eel(world).phase !== "bite") {
    if (world.tick >= end) throw new Error("the lamprey never came down");
    for (const t of tick(world)) seen.add(t);
    const s = eel(world);
    const last = path.at(-1);
    if (last === undefined || last.col !== s.col || last.row !== s.row)
      path.push({ col: s.col, row: s.row });
  }
  return { path, seen };
}

describe("THE LAMPREY's tow", () => {
  it("comes down the middle of the field at the hull and stops short of it under THE SLOW", () => {
    const world = install();
    const { path } = toTow(world);
    const s = eel(world);
    expect(lampreyAsks(s)).toBe("tow");
    expect({ col: s.col, row: s.row }).toEqual({ col: midCol(CFG), row: CFG.lampreyTowRow });
    expect(slowing(world)).toBe(true);
    // From the middle of the field it comes straight down, a row a beat.
    const middle = path.findIndex((p) => p.col === midCol(CFG) && p.row === CFG.lampreyTowFromRow);
    expect(middle).toBeGreaterThanOrEqual(0);
    const down = path.slice(middle);
    expect(down.every((p) => p.col === midCol(CFG))).toBe(true);
    expect(down.map((p) => p.row)).toEqual(
      Array.from({ length: down.length }, (_, i) => CFG.lampreyTowFromRow + i),
    );
    // The tail lies up the field, away from the side the curve bends to.
    expect(s.tailY).toBeLessThan(0);
    expect(Math.sign(s.tailX)).toBe(-s.towSide);
  });

  it("bends the curve an eighth of a turn to its side, and reads a point back to where it lies", () => {
    const world = install();
    toTow(world);
    const s = eel(world);
    const full = CFG.lampreyTowMilli;
    expect(lampreyTowAt(CFG, s, 0)).toEqual({ x: 0, y: 0 });
    const end = lampreyTowAt(CFG, s, full);
    expect(Math.sign(end.x)).toBe(s.towSide);
    expect(end.y).toBeLessThan(-Math.abs(end.x) * 2);
    for (let m = 0; m <= full; m += 250) {
      const p = lampreyTowAt(CFG, s, m);
      expect(Math.abs(lampreyTowAlong(CFG, s, p.x, p.y) - m)).toBeLessThanOrEqual(10);
    }
    // Far past the end, the end; far below the start, the start.
    expect(lampreyTowAlong(CFG, s, end.x * 3, end.y * 3)).toBe(full);
    expect(lampreyTowAlong(CFG, s, 0, 5000)).toBe(0);
  });

  it("leaves the knob where it is let go, and takes it again from there", () => {
    const world = install();
    toTow(world);
    towTo(world, 1000);
    expect(Math.abs(eel(world).towMilli - 1000)).toBeLessThanOrEqual(10);
    drag(world, 2, "lampreyHead", false);
    const left = eel(world).towMilli;
    expect(left).toBeGreaterThan(900);
    drag(world, 2, "lampreyHead", true);
    expect(eel(world).towMilli).toBe(left);
    expect(eel(world).towFrom).toBe(left);
  });

  it("lunges two thirds of the way, once: the head back to a third and the thumb off it", () => {
    const world = install();
    toTow(world);
    tailOut(world);
    const said = towTo(world, CFG.lampreyTowMilli);
    expect(said.filter((t) => t === "lampreyAnger")).toHaveLength(1);
    expect(said).not.toContain("lampreyLoose");
    const s = eel(world);
    expect(s.towMilli).toBe(CFG.lampreyTowBackMilli);
    expect(s.angered).toBe(true);
    // The thumb still down is not heard until it lifts.
    drag(world, 2, "lampreyHead", true, 0, -9000);
    expect(eel(world).towMilli).toBe(CFG.lampreyTowBackMilli);
    drag(world, 2, "lampreyHead", false);
    // Taken again where it waits, and all the way: no second lunge.
    const again = towTo(world, CFG.lampreyTowMilli);
    expect(again).not.toContain("lampreyAnger");
    expect(again).toContain("lampreyLoose");
  });

  it("comes off only with the tail out too, whichever gets there last, and leaps on from the curve's end", () => {
    const world = install();
    toTow(world);
    towTo(world, CFG.lampreyTowMilli);
    drag(world, 2, "lampreyHead", false);
    const end = lampreyTowEnd(world, eel(world));
    expect(towTo(world, CFG.lampreyTowMilli)).not.toContain("lampreyLoose");
    expect(eel(world).towMilli).toBe(CFG.lampreyTowMilli);
    expect(eel(world).phase).toBe("bite");
    expect(tailOut(world)).toContain("lampreyLoose");
    const s = eel(world);
    expect(s.phase).toBe("leap");
    expect(slowing(world)).toBe(false);
    expect({ col: s.fromCol, row: s.fromRow }).toEqual(end);
  });

  it("hears only the worker on the head", () => {
    const world = install();
    toTow(world);
    drag(world, 1, "lampreyHead", true, 0, -3000);
    expect(eel(world).towMilli).toBe(0);
  });

  it("goes through to the hull in the middle column when the window runs out", () => {
    const world = install();
    toTow(world);
    let breach: number | null = null;
    for (let t = 0; t < TPB * 17 && breach === null; t++) {
      tick(world);
      const e = world.events.find((k) => k.type === "breach");
      if (e !== undefined && "col" in e) breach = e.col;
    }
    expect(breach).toBe(midCol(CFG));
  });

  it("is the same twice from one seed", () => {
    const a = install(7);
    const b = install(7);
    for (const w of [a, b]) {
      toTow(w);
      tailOut(w);
      towTo(w, CFG.lampreyTowMilli);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
    expect(eel(a).towSide).toBe(eel(b).towSide);
  });
});
