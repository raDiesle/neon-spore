import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  guardArmed,
  type SimConfig,
  shieldRow,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  type LampreyMorsel,
  type LampreyState,
  type LampreyStep,
  lampreyBoss,
  lampreyHolder,
  lampreyWorker,
} from "../src/lamprey.js";
import { lampreyTailWay } from "../src/lamprey-leap.js";
import { slowing } from "../src/slow.js";

/**
 * THE LAMPREY as a worm on the field (the owner, 6 October 2026,
 * `sim/lamprey-roam.ts`): it crawls in and eats a meal that falls for it, each
 * morsel caught on its own row, on its own beat and at its own speed
 * (`sim/lamprey-meal.ts`, the owner, 9 October 2026), crawls straight on to its first stay, and
 * before a step that says `crawl` crawls the field from side to side, eating
 * what the step drops and letting go of dung the shield must turn; a tooth
 * takes the step's taps; and no leap lands where the mouth or the tail would
 * leave the screen.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

const PULL: LampreyStep = { ask: "pull", holder: 1, teeth: 0, jump: 1, beats: 12, color: "either" };
const SECOND: LampreyStep = { ...PULL, holder: 2, jump: 2, crawl: true, food: "bulb", dung: true };

const MEAL: readonly LampreyMorsel[] = [
  { kind: "meteor", col: 3, row: 4, beat: 0, tiles: 1 },
  { kind: "slick", col: 8, row: 8, beat: 2, tiles: 2 },
  { kind: "bulb", col: 2, row: 3, beat: 7, tiles: 3 },
  { kind: "meteor", col: 6, row: 6, beat: 9, tiles: 2 },
];

function install(steps: readonly LampreyStep[] = [PULL, SECOND], seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "lamprey", steps, meal: MEAL });
  return world;
}

function eel(world: World): LampreyState {
  const s = lampreyBoss(world);
  if (s === null) throw new Error("the wave installed no lamprey");
  return s;
}

/** A tick, with the shield carried under any dung and raised as it comes onto the dome's row. */
function tick(world: World, cmds: TimedCommand[] = [], shield = false): string[] {
  const out = [...cmds];
  const dung = world.creatures.find((c) => eel(world).dung.includes(c.id));
  if (shield && dung !== undefined) {
    const at = { tick: world.tick, player: 2 as const };
    if (world.shieldCol !== dung.col)
      out.push({ ...at, command: { kind: "shieldCol", col: dung.col } });
    else if (dung.row >= shieldRow(world.cfg) - 1 && !guardArmed(world)) {
      out.push({ ...at, player: 1, command: { kind: "guard" } });
    }
  }
  step(world, out);
  return world.events.map((e) => e.type);
}

function runUntil(world: World, until: (w: World) => boolean, shield = false): string[] {
  const seen: string[] = [];
  const end = world.tick + TPB * 120;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the lamprey never got there");
    seen.push(...tick(world, [], shield));
  }
  return seen;
}

function drag(world: World, player: 1 | 2, target: string, extra: object): string[] {
  const command = { kind: "drag", target, fromMilli: 0, fromYMilli: 0, ...extra };
  return tick(world, [{ tick: world.tick, player, command } as TimedCommand]);
}

function tap(world: World, player: 1 | 2, tooth: number): string[] {
  return [
    ...drag(world, player, "lampreyTooth", { on: true, id: tooth }),
    ...drag(world, player, "lampreyTooth", { on: false, id: tooth }),
  ];
}

/** The pull on answered: the tail held and the head pulled all the way up. The events of both ticks. */
function pull(world: World): string[] {
  return [
    ...drag(world, lampreyHolder(eel(world)) ?? 1, "lampreyTail", { on: true }),
    ...drag(world, lampreyWorker(eel(world)) ?? 2, "lampreyHead", { on: true, fromYMilli: -2000 }),
  ];
}

const count = (seen: string[], type: string) => seen.filter((t) => t === type).length;
const biting = (w: World) => eel(w).phase === "bite";

describe("THE LAMPREY arrives hungry", () => {
  it("eats its meal on rows and beats of its own and crawls straight on to its first stay", () => {
    const world = install();
    const first = { col: eel(world).nextCol, row: eel(world).nextRow };
    const heads: { col: number; row: number; phase: string }[] = [];
    const ate: number[] = [];
    const seen = runUntil(world, (w) => {
      const s = eel(w);
      heads.push({ col: s.col, row: s.row, phase: s.phase });
      for (const e of w.events) if (e.type === "lampreyEat") ate.push(w.beat);
      return biting(w);
    });
    expect([count(seen, "lampreyFeed"), count(seen, "lampreyEat")]).toEqual([4, 4]);
    expect(seen.indexOf("lampreyRoam")).toBeGreaterThan(seen.lastIndexOf("lampreyEat"));
    // Up and down the field as well as across it, and never out of it once in.
    const fed = heads.filter((h) => h.phase !== "entering");
    expect(new Set(fed.map((h) => h.row)).size).toBeGreaterThan(3);
    for (const h of fed) expect(h.col >= 0 && h.col <= CFG.cols - 1).toBe(true);
    // Not one gap between bites the same as the next.
    const gaps = ate.slice(1).map((b, i) => b - (ate[i] ?? b));
    expect(new Set(gaps).size).toBe(gaps.length);
    // Faster than one tile a beat somewhere in the meal.
    const steps = fed.slice(1).map((h, i) => Math.abs(h.col - (fed[i]?.col ?? h.col)));
    expect(Math.max(...steps)).toBeGreaterThan(1);
    expect({ col: eel(world).col, row: eel(world).row }).toEqual(first);
    expect(world.creatures).toHaveLength(0);
    expect(seen).not.toContain("breach");
    expect(slowing(world)).toBe(true);
  });
});

describe("between levels", () => {
  /** The first stay answered: the world, and what was said as the crawl set off. */
  function firstStayDone(): { world: World; off: string[] } {
    const world = install();
    runUntil(world, biting);
    const off = pull(world);
    expect(eel(world).phase).toBe("roam");
    return { world, off };
  }

  it("crawls the field to both sides, eats the step's food and drops dung the shield turns", () => {
    const { world, off } = firstStayDone();
    const cols: number[] = [];
    const to = { col: eel(world).nextCol, row: eel(world).nextRow };
    const seen = [...off];
    seen.push(
      ...runUntil(
        world,
        (w) => {
          cols.push(eel(w).col);
          return biting(w);
        },
        true,
      ),
    );
    expect([Math.min(...cols), Math.max(...cols)]).toEqual([0, CFG.cols - 1]);
    expect(count(seen, "lampreyFeed")).toBe(1);
    expect(count(seen, "lampreyEat")).toBe(1);
    expect(count(seen, "lampreyDung")).toBe(1);
    expect(seen).not.toContain("breach");
    expect({ col: eel(world).col, row: eel(world).row }).toEqual(to);
  });

  it("its dung let through is the hull", () => {
    const { world } = firstStayDone();
    const seen = runUntil(world, (w) => w.events.some((e) => e.type === "breach"));
    expect(seen).toContain("lampreyDung");
  });
});

describe("the teeth", () => {
  it("a tooth takes the step's taps, and a wrong one starts them again", () => {
    const world = install([{ ...PULL, ask: "teeth", teeth: 2, taps: 3 }]);
    runUntil(world, biting);
    drag(world, 1, "lampreyTail", { on: true });
    const lit = eel(world).litTooth;
    expect(tap(world, 2, lit)).toContain("lampreyTap");
    expect(tap(world, 2, lit)).not.toContain("lampreyCrack");
    expect(tap(world, 2, (lit + 1) % 9)).toContain("lampreySnap");
    expect(eel(world).toothTaps).toBe(0);
    for (let k = 0; k < 2; k++) tap(world, 2, lit);
    expect(tap(world, 2, lit)).toContain("lampreyCrack");
    expect(eel(world).toothTaps).toBe(0);
    expect(slowing(world)).toBe(true);
  });
});

describe("the controls on the screen", () => {
  it("never lands at the field's edge, and always lays its whole tail, pulled out, on the field", () => {
    const steps = [1, 2, 3, 4, 5, 6, 7, 8].map(
      (jump): LampreyStep => ({ ...PULL, jump, ask: jump % 2 === 0 ? "apart" : "pull" }),
    );
    for (let seed = 0; seed < 30; seed++) {
      const world = install(steps, seed);
      for (const step of steps) {
        runUntil(world, biting);
        const s = eel(world);
        expect(s.col).toBeGreaterThanOrEqual(CFG.lampreyEdgeCols);
        expect(s.col).toBeLessThanOrEqual(CFG.cols - 1 - CFG.lampreyEdgeCols);
        const pulled = step.ask === "apart" ? CFG.lampreyTailPullMilli / 1000 : 0;
        const tip = tailTip(s, CFG.lampreyTailTiles + pulled);
        expect(tip.col).toBeGreaterThanOrEqual(0);
        expect(tip.col).toBeLessThanOrEqual(CFG.cols - 1);
        expect(tip.row).toBeGreaterThanOrEqual(1);
        expect(tip.row).toBeLessThanOrEqual(CFG.rows - 3);
        if (step.ask === "pull") pull(world);
        else apart(world);
      }
    }
  });
});

/** The apart on answered: the tail pulled out along the body and the head up, at once. */
function apart(world: World): void {
  const way = lampreyTailWay(eel(world));
  const out = { on: true, fromMilli: way.x * 2, fromYMilli: way.y * 2 };
  drag(world, lampreyHolder(eel(world)) ?? 1, "lampreyTail", out);
  drag(world, lampreyWorker(eel(world)) ?? 2, "lampreyHead", { on: true, fromYMilli: -2000 });
}

/** Where the tail's tip lies, in tiles: `tiles` from the head along the way it lies. */
function tailTip(s: LampreyState, tiles: number): { col: number; row: number } {
  const way = lampreyTailWay(s);
  return { col: s.col + (way.x * tiles) / 1000, row: s.row + (way.y * tiles) / 1000 };
}
