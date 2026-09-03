import { describe, expect, it } from "bun:test";
import { createWorld, DEFAULT_CONFIG, hashWorld, startWave, step } from "@neon-spore/sim";
import { MECHANIC_IDS, mechanic, mechanicOn, mechanicsInWave } from "../src/mechanics.js";
import { buildBoss, buildPods, buildQueue } from "../src/queue.js";
import { WAVES } from "../src/waves.js";
import {
  DEMONSTRATIONS,
  demonstrationConfig,
  demonstrationIndex,
  demonstrationWave,
} from "../src/waves-demo.js";

/**
 * The promise `waves-demo.ts` makes, checked rather than asserted in prose:
 * every mechanic has a wave a person can open and watch it in, and the wave
 * really does contain it.
 *
 * `bun run orphans` already refuses a mechanic no wave reaches. This is the
 * stricter question — reached is not the same as *shown to somebody*, and a
 * row pointing at a wave that used to contain something is exactly the kind of
 * rot a registry grows when nothing reads it back.
 */
describe("demonstrations", () => {
  it("names a wave that is in the catalogue, for every mechanic", () => {
    for (const id of MECHANIC_IDS) {
      expect(
        demonstrationIndex(id),
        `${id} names a wave that is not in WAVES`,
      ).toBeGreaterThanOrEqual(0);
    }
  });

  it("names a wave that actually puts the mechanic on the field", () => {
    for (const id of MECHANIC_IDS) {
      if (mechanic(id).reach !== "spawn") continue;
      expect(
        mechanicsInWave(demonstrationWave(id)),
        `${DEMONSTRATIONS[id].waveId} has no ${id}`,
      ).toContain(id);
    }
  });

  it("turns the mechanic on in its own config, and never in DEFAULT_CONFIG's", () => {
    for (const id of MECHANIC_IDS) {
      const sw = mechanic(id).switch;
      if (sw === undefined) continue;
      expect(mechanicOn(demonstrationConfig(id), id), `${id} is off in its own config`).toBe(true);
      // The patch has to be doing the work. If the default already had it on,
      // the row would be a decoration and would stop being maintained.
      expect(DEFAULT_CONFIG[sw.field], `${id} is on in DEFAULT_CONFIG`).toBe(sw.off);
    }
  });

  it("asks for no configuration at all where the wave is enough", () => {
    for (const id of MECHANIC_IDS) {
      if (mechanic(id).switch !== undefined) continue;
      expect(
        DEMONSTRATIONS[id].config,
        `${id} needs no switch but carries a config`,
      ).toBeUndefined();
      expect(mechanicOn(DEFAULT_CONFIG, id)).toBe(true);
    }
  });

  it("leaves DEFAULT_CONFIG alone", () => {
    const before = { ...DEFAULT_CONFIG };
    for (const id of MECHANIC_IDS) demonstrationConfig(id);
    expect(DEFAULT_CONFIG).toEqual(before);
  });

  it("still finds its wave after the director renames it", () => {
    // The whole reason a demonstration binds by `id` and not by `name`: the
    // director edits a wave's name from its own screen (`rail.ts`), and a
    // reference against the name would land `main` red the next save. Rename
    // every wave in place — exactly what the director's input handler does —
    // and each demonstration must resolve to the same wave it did before.
    const before = MECHANIC_IDS.map((id) => demonstrationWave(id));
    const restore = WAVES.map((w) => w.name);
    try {
      for (const w of WAVES) w.name = `${w.name} (RENAMED)`;
      for (const [i, id] of MECHANIC_IDS.entries()) {
        expect(demonstrationWave(id), `${id} lost its wave to a rename`).toBe(before[i]!);
      }
    } finally {
      for (const [i, w] of WAVES.entries()) w.name = restore[i]!;
    }
  });
});

/** A wave played out headlessly with nobody touching it. */
function play(waveIndex: number, beats: number): number {
  const cfg = DEFAULT_CONFIG;
  const world = createWorld({ ...cfg }, waveIndex);
  startWave(
    world,
    waveIndex,
    buildQueue(waveIndex, cfg.cols),
    buildPods(waveIndex, cfg.cols),
    buildBoss(waveIndex, cfg.cols),
  );
  const ticks = Math.round((beats * cfg.tickHz * 60) / cfg.bpm);
  for (let t = 0; t < ticks; t++) step(world, []);
  return hashWorld(world);
}

describe("the three waves added for the demonstrations", () => {
  const index = (name: string): number => WAVES.findIndex((w) => w.name === name);

  it("hangs a purge pod in THE PURGE and a ward pod in THE WARD", () => {
    for (const [name, kind] of [
      ["THE PURGE", "purge"],
      ["THE WARD", "ward"],
    ] as const) {
      const pods = buildPods(index(name), DEFAULT_CONFIG.cols);
      expect(
        pods.map((p) => p.kind),
        `${name} pod cargo`,
      ).toEqual([kind]);
    }
  });

  it("puts three of one colour in one column for THE LANCE", () => {
    const queue = buildQueue(index("THE LANCE"), DEFAULT_CONFIG.cols);
    expect(queue).toHaveLength(3);
    expect(new Set(queue.map((q) => q.col)).size).toBe(1);
    expect(new Set(queue.map((q) => q.color)).size).toBe(1);
  });

  it("plays each of them to the same fingerprint twice", () => {
    // Two runs compared, never a number pinned — docs/decisions.md 19. What is
    // being proved is that the wave is deterministic, not what it hashes to.
    for (const name of ["THE LANCE", "THE PURGE", "THE WARD"]) {
      const i = index(name);
      expect(play(i, 24), `${name} is not deterministic`).toBe(play(i, 24));
    }
  });

  it("lets THE WARD's rocks through to the hull when nobody answers them", () => {
    // The wave only means something if the rocks would land: five arrive, and
    // with no shield and no pod taken the hull is what stops them.
    const cfg = DEFAULT_CONFIG;
    const i = index("THE WARD");
    const world = createWorld({ ...cfg }, i);
    startWave(world, i, buildQueue(i, cfg.cols), buildPods(i, cfg.cols), null);
    const ticks = Math.round((24 * cfg.tickHz * 60) / cfg.bpm);
    for (let t = 0; t < ticks; t++) step(world, []);
    expect(world.guard.deflected).toBe(0);
    expect(world.scars.length).toBeGreaterThan(0);
  });
});
