import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimConfig, ticksPerBeat } from "../src/config.js";
import { gumSwiped } from "../src/gum.js";
import { step } from "../src/step.js";
import {
  type ThroatPhase,
  type ThroatState,
  throatBoss,
  throatMouthCol,
  throatMouthRow,
} from "../src/throat.js";
import { throatEvery } from "../src/throat-clock.js";
import type { Creature, CreatureKind } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * **THE THROAT's own clock, said out loud** — the four moments the gullet was
 * built around and shipped silent through: the breath, the choke, the swallow
 * and the eversion (`docs/spec/bosses.md` §11.19).
 *
 * The hands next door (`throat-hands.test.ts`) are things the pair *does*, and
 * a sound for them is a receipt. These four are things the boss does, and the
 * argument for a sound is the opposite one: the pair is looking at the other
 * half of its own screen the whole fight, because the whole fight is one of
 * them saying a column and the other saying a count. What is checked here is
 * that each of the four lands on the beat it is a fact about, in the column
 * the mouth is standing in, and that the choke and the swallow are two names
 * and never one.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HOME = midCol(CFG);
const ROW = throatMouthRow(CFG);
const WAVE = 9;

function tube(world: World): ThroatState {
  const boss = throatBoss(world);
  if (boss === null) throw new Error("no gullet installed");
  return boss;
}

/** The fight put straight into the state a test wants, as next door. */
function open(phase: ThroatPhase, slack: number): World {
  const world = createWorld(CFG, 3);
  startWave(world, WAVE, [], [], { kind: "throat" });
  const b = tube(world);
  b.slack = slack;
  b.phase = phase;
  b.phaseBeat = world.beat;
  return world;
}

function put(world: World, kind: CreatureKind, col: number, row: number): Creature {
  const c: Creature = {
    id: world.nextId++,
    kind,
    col,
    row,
    fromRow: row,
    fromCol: col,
    color: kind === "gum" || kind === "meteor" ? null : "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: 0,
  };
  world.creatures.push(c);
  return c;
}

/** Every throat event of these beats, with its column. `step` clears
 * `world.events` at the top of every tick, so they are collected as they go. */
function said(world: World, n: number): { type: string; col: number }[] {
  const seen: { type: string; col: number }[] = [];
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) {
      if (e.type.startsWith("throat")) seen.push({ type: e.type, col: (e as { col: number }).col });
    }
  }
  return seen;
}

const types = (world: World, n: number): string[] => said(world, n).map((e) => e.type);

describe("the breath", () => {
  it("is said on the gullet's own grid and on no beat between", () => {
    const world = open("still", 0);
    const every = throatEvery(CFG, tube(world));
    expect(every).toBe(CFG.throatInhaleBeats);
    // The count player 2 says out loud, heard: one breath per `throatEvery`
    // beats and nothing in the gaps she is counting down through.
    const heard = types(world, 3 * every);
    expect(heard).toEqual(["throatInhale", "throatInhale", "throatInhale"]);
  });

  it("is every beat once the tube is open, which is what that phase means", () => {
    const world = open("open", CFG.throatRings - 1);
    expect(types(world, 4)).toEqual([
      "throatInhale",
      "throatInhale",
      "throatInhale",
      "throatInhale",
    ]);
  });

  it("carries the column the mouth is standing in, and follows it across", () => {
    const world = open("slide", 1);
    const b = tube(world);
    const heard = said(world, 2 * CFG.throatInhaleBeats);
    expect(heard.length).toBeGreaterThan(1);
    for (const e of heard) expect(e.type).toBe("throatInhale");
    // The pan is the whole of what a fixture can say about *where*, so the
    // column has to be the one the mouth was in on that beat rather than the
    // one the phase started in (`throatMouthCol`).
    expect(new Set(heard.map((e) => e.col)).size).toBeGreaterThan(1);
    expect(heard.at(-1)?.col).toBe(throatMouthCol(CFG, b, world.beat));
  });

  it("is not said on a beat the gullet does not take", () => {
    const world = open("everts", CFG.throatRings);
    // Nothing is eaten during the eversion, so nothing is drawn breath for.
    expect(types(world, 2)).not.toContain("throatInhale");
  });
});

describe("the choke and the swallow, which are one event turned around", () => {
  it("says the choke on the beat a flung gum reaches the mouth, and says it once", () => {
    const world = open("still", 0);
    const b = tube(world);
    const gum = put(world, "gum", 0, ROW);
    gumSwiped(world, gum, 1);
    const heard: string[] = [];
    for (let i = 0; i < 8 && !heard.includes("throatChoke"); i++) {
      heard.push(...types(world, 1));
    }
    expect(heard.filter((t) => t === "throatChoke")).toHaveLength(1);
    expect(b.slack).toBe(1);
  });

  it("says the swallow when the mouth takes a body, and never the choke", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    put(world, "slick", HOME, ROW);
    const heard = types(world, 1);
    expect(heard).toContain("throatSwallow");
    expect(heard).not.toContain("throatChoke");
    // A ring back on the boss's side of the ledger — the sentence this sound
    // exists to say, and the one the pair is punished for not hearing.
    expect(b.slack).toBe(CFG.throatRings - 2);
  });

  it("says the swallow once for a mouthful of several, because the fact is one", () => {
    const world = open("open", CFG.throatRings - 1);
    put(world, "slick", HOME, ROW);
    put(world, "slick", HOME, ROW);
    const heard = types(world, 1);
    expect(heard.filter((t) => t === "throatSwallow")).toHaveLength(1);
    expect(world.creatures).toHaveLength(0);
  });

  it("says nothing on a beat the mouth is empty", () => {
    const world = open("open", CFG.throatRings - 1);
    expect(types(world, 2)).toEqual(["throatInhale", "throatInhale"]);
  });

  it("puts the breath first and its cost after it, on the beat that does both", () => {
    const world = open("open", CFG.throatRings - 1);
    put(world, "slick", HOME, ROW);
    // Player 2 was counting down to the breath; the ring coming back is what
    // that breath cost. A swallow heard first would be a bill before a price.
    expect(types(world, 1)).toEqual(["throatInhale", "throatSwallow"]);
  });
});

describe("the eversion", () => {
  it("is said on the beat the last ring goes slack, and only once", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    const gum = put(world, "gum", 0, ROW);
    gumSwiped(world, gum, 1);
    const heard: string[] = [];
    for (let i = 0; i < 10; i++) heard.push(...types(world, 1));
    expect(heard.filter((t) => t === "throatEvert")).toHaveLength(1);
    // The choke that earned it is still said: the best shot in the fight is
    // the one shot that must not be silent.
    expect(heard).toContain("throatChoke");
    expect(b.slack).toBe(CFG.throatRings);
    expect(b.phase).toBe("everts");
  });

  it("carries the column the tube is standing in when it turns", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    b.slack = CFG.throatRings;
    const heard = said(world, 1);
    const evert = heard.find((e) => e.type === "throatEvert");
    expect(evert).toBeDefined();
    expect(evert?.col).toBe(b.mouthFrom);
  });

  it("is the gullet's last word: nothing is said while the tube turns", () => {
    const world = open("open", CFG.throatRings - 1);
    tube(world).slack = CFG.throatRings;
    expect(types(world, 1)).toEqual(["throatEvert"]);
    expect(types(world, CFG.throatEvertBeats)).toEqual([]);
  });
});
