import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  hullRow,
  record,
  rindLayersLeft,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
  wornKind,
} from "../src/index.js";
import { rindStruck } from "../src/rind.js";
import type { Bullet, Creature } from "../src/types.js";

/**
 * THE RIND: one body, three sizes, and a landed shot that does not close the
 * column. What is worth pinning here is the half a reader of `rind.ts` cannot
 * check by eye — that it really does take exactly `rindLayers + 1` matching
 * shots and never one fewer, that the layers are what a lance is stopped by,
 * that an arrival nobody shoots costs the hull what any other body costs, and
 * that a second device walking the same beats arrives at the same fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
// A creature entered at beat 0 stands on row (beat - 1) — see rules.test.ts.
const IMPACT_TICK = TPB * (HULL + 1);
const COL = 3;

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

/** A rind of the authored colour, which is also which body it is drawn as. */
const rind = (col: number, color: "red" | "cyan" = "red"): SpawnEntry => ({
  beat: 0,
  col,
  kind: "rind",
  color,
});
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

/** One aimed shot, at a tick: the cannon slides immediately and the shot
 * leaves on the same tick, so a column and a colour is the whole attempt. */
function shot(tick: number, col: number, color: "red" | "cyan"): TimedCommand[] {
  return [aim(tick, col), fire(tick, color)];
}

/** `n` shots up one column, a beat apart, starting on beat 2 — far enough
 * down that a bullet has a body to meet and clear of `fireEveryBeats`. */
function shots(n: number, col: number, color: "red" | "cyan"): TimedCommand[] {
  return Array.from({ length: n }, (_, i) => shot(TPB * (i + 2), col, color)).flat();
}

const only = (world: Run["world"]): Creature => world.creatures[0]!;
const sheds = (events: SimEvent[]): Extract<SimEvent, { type: "rindShed" }>[] =>
  events.filter((e): e is Extract<SimEvent, { type: "rindShed" }> => e.type === "rindShed");

describe("the layers it arrives in", () => {
  it("wears rindLayers of them, and nothing else wears any", () => {
    const { world } = run([rind(COL)], TPB + 1);
    expect(rindLayersLeft(only(world))).toBe(CFG.rindLayers);
    // A body that was never armoured in its own skin reads as no layers rather
    // than as undefined — absent and zero are one state (`rind.ts`).
    expect(rindLayersLeft({ kind: "slick" } as Creature)).toBe(0);
  });

  it("is the slick or the bulb its authored colour names, at every size", () => {
    expect(wornKind(only(run([rind(COL, "red")], TPB + 1).world))).toBe("slick");
    expect(wornKind(only(run([rind(COL, "cyan")], TPB + 1).world))).toBe("bulb");
    // And after a layer has gone: the shed changes the size and nothing about
    // which body the pair is looking at.
    const { world } = run([rind(COL, "cyan")], TPB * 4, shots(1, COL, "cyan"));
    expect(rindLayersLeft(only(world))).toBe(CFG.rindLayers - 1);
    expect(wornKind(only(world))).toBe("bulb");
  });
});

describe("what a shot does", () => {
  it("takes a layer off instead of the body, and says so", () => {
    const { world, events } = run([rind(COL)], TPB * 4, shots(1, COL, "red"));
    expect(world.creatures).toHaveLength(1);
    expect(rindLayersLeft(only(world))).toBe(CFG.rindLayers - 1);
    const shed = sheds(events);
    expect(shed).toHaveLength(1);
    expect(shed[0]!.left).toBe(CFG.rindLayers - 1);
    expect(shed[0]!.color).toBe("red");
    // Not a kill, and the event that means one was never pushed — the eye and
    // the ear both have to be able to tell "still coming" from "gone".
    expect(events.filter((e) => e.type === "destroy")).toHaveLength(0);
  });

  /** The whole creature, as a number: one more shot than the pair expects. */
  it("needs exactly rindLayers + 1 of them, and is still there one short", () => {
    const short = run([rind(COL)], TPB * 8, shots(CFG.rindLayers, COL, "red"));
    expect(short.world.creatures).toHaveLength(1);
    expect(rindLayersLeft(only(short.world))).toBe(0);

    const enough = run([rind(COL)], TPB * 8, shots(CFG.rindLayers + 1, COL, "red"));
    expect(enough.world.creatures).toHaveLength(0);
    expect(sheds(enough.events)).toHaveLength(CFG.rindLayers);
    expect(enough.events.filter((e) => e.type === "destroy")).toHaveLength(1);
  });

  it("pays for each layer, and for the body what a slick pays", () => {
    // While a body is still standing the wave is not cleared, so this is the
    // sheds and nothing else.
    const shed = run([rind(COL)], TPB * 8, shots(CFG.rindLayers, COL, "red"));
    expect(shed.world.score).toBe(CFG.scoreRindShed * CFG.rindLayers);

    // And the whole arrival against an ordinary one taken in one shot, which
    // is the comparison that matters: everything else about the two runs — the
    // kill, the wave cleared behind it — is the same, so the difference is
    // exactly what the layers were worth.
    const killed = run([rind(COL)], TPB * 10, shots(CFG.rindLayers + 1, COL, "red"));
    const plain: SpawnEntry = { beat: 0, col: COL, kind: "slick", color: "red" };
    const slick = run([plain], TPB * 10, shots(1, COL, "red"));
    expect(killed.world.score - slick.world.score).toBe(CFG.scoreRindShed * CFG.rindLayers);
  });

  it("counts a wrong colour as an ordinary colour miss and keeps every layer", () => {
    const { world } = run([rind(COL, "red")], TPB * 4, shots(1, COL, "cyan"));
    expect(world.balance.colorMisses).toBe(1);
    expect(world.creatures).toHaveLength(1);
    expect(rindLayersLeft(only(world))).toBe(CFG.rindLayers);
  });

  /**
   * A lance is a line up a column, and a rind is the one body that would turn
   * that into a whole arrival for one press. The layer stops it; only the kill
   * at the end passes it on, exactly as an ordinary body's does.
   */
  it("stops a lance on a shed and passes it on only at the kill", () => {
    const world = createWorld({ ...CFG }, 0, [rind(COL)]);
    for (let t = 0; t < TPB + 1; t++) step(world, []);
    const body = only(world);
    const lance = (): Bullet => ({
      id: 1,
      col: COL,
      row: 0,
      subMilli: 0,
      color: "red",
      lance: true,
      pierced: 0,
    });
    for (let i = 0; i < CFG.rindLayers; i++) {
      expect(rindStruck(world, lance(), body)).toBe(false);
    }
    expect(rindStruck(world, lance(), body)).toBe(true);
    expect(world.creatures).toHaveLength(0);
  });
});

describe("the rind as an ordinary arrival", () => {
  it("costs the hull exactly what any other missed creature does", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [rind(COL)]);
    for (let t = 0; t < IMPACT_TICK + 1; t++) step(world, []);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature);
  });

  it("holds its lane and falls a tile a beat like anything else", () => {
    const { world } = run([rind(COL)], TPB * 5);
    expect(only(world).col).toBe(COL);
    expect(only(world).row).toBe(4);
  });
});

describe("two devices", () => {
  it("replays deterministically: two layers, then the body", () => {
    const replay = record({
      name: "rind shed twice and killed",
      seed: 0,
      queue: [rind(COL, "cyan")],
      ticks: TPB * 8,
      inputs: shots(CFG.rindLayers + 1, COL, "cyan"),
    });
    const world = runReplay(replay);
    expect(world.creatures).toHaveLength(0);
    // Not a pinned constant — two runs of the same replay in one process is
    // the property lockstep actually needs (docs/decisions.md #19).
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("puts the layers into the fingerprint, so two devices cannot differ", () => {
    const whole = run([rind(COL)], TPB * 4);
    const shed = run([rind(COL)], TPB * 4, shots(1, COL, "red"));
    expect(hashWorld(shed.world)).not.toBe(hashWorld(whole.world));
  });
});
