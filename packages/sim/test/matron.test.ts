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
import { type MatronState, type MatronStep, matronBoss, matronLobesAll } from "../src/matron.js";
import { MILLI } from "../src/world.js";

/**
 * THE MATRON's receipts, one rule a test (`sim/matron.ts`): she comes in with
 * every pod of the script on her; a clutch is hung off her lobes on the
 * level's ring; she throws what the level says on its beat, down its column;
 * a pod of hers swallowed takes a lobe, and the level waits until every pod
 * in it is; a ring run out loses the wave the way any pod does; and the last
 * pod beats her.
 */

/** No sideways drift: a pod falls straight, so the catch is not the rng's. */
const CFG: SimConfig = { ...DEFAULT_CONFIG, podDriftTilesPerBeat: 0 };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

/** Two clutches and nothing thrown: the catch alone. */
const QUIET: readonly MatronStep[] = [
  { beats: 24, pods: [-3, 3], throws: [] },
  { beats: 24, pods: [0], throws: [] },
];

function install(steps: readonly MatronStep[] = QUIET, cfg: SimConfig = CFG): World {
  const world = createWorld({ ...cfg }, 0);
  startWave(world, 0, [], [], { kind: "matron", steps });
  return world;
}

function matron(world: World): MatronState {
  const s = matronBoss(world);
  if (s === null) throw new Error("the wave installed no matron");
  return s;
}

/** One tick with `cmds` stamped for it; the event types it raised. */
function tick(world: World, cmds: Omit<TimedCommand, "tick">[] = []): string[] {
  step(
    world,
    cmds.map((c) => ({ ...c, tick: world.tick })),
  );
  return world.events.map((e) => e.type);
}

/** Tick on, nobody touching anything, until `until` holds. */
function idleUntil(world: World, until: (w: World) => boolean, beats = 40): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the matron never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/**
 * A pair taking her pods one at a time: the pilot under the first of hers
 * still on the field, the navigator shooting it loose while it hangs, the
 * pilot holding the maw open while it falls. Until `until`; every event seen.
 */
function playUntil(world: World, until: (w: World) => boolean, beats = 80): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the pair never got there");
    const s = matronBoss(world);
    const pod = world.pods.find((p) => s?.hung.includes(p.id));
    const cmds: Omit<TimedCommand, "tick">[] = [];
    if (pod !== undefined) {
      const col = Math.round(pod.colMilli / MILLI);
      cmds.push({ player: 1, command: { kind: "cannonCol", col } });
      if (!pod.loose && world.tick % TPB === 4) {
        cmds.push({ player: 2, command: { kind: "fire", color: "red" } });
      }
      if (pod.loose && world.tick % 10 === 0) cmds.push({ player: 1, command: { kind: "intake" } });
    }
    for (const t of tick(world, cmds)) seen.add(t);
  }
  return seen;
}

describe("THE MATRON", () => {
  it("comes in with every pod of the script on her, and hangs the first clutch after", () => {
    const world = install();
    const s = matron(world);
    expect(s.phase).toBe("enter");
    expect(matronLobesAll(s)).toBe(3);
    const seen = idleUntil(world, (w) => matron(w).phase === "hang");
    expect(seen.has("matronHang")).toBe(true);
    const hung = world.pods.filter((p) => s.hung.includes(p.id));
    expect(hung.map((p) => p.colMilli / MILLI)).toEqual([MID - 3, MID + 3]);
    for (const p of hung) {
      expect(p.kind).toBe("pod");
      expect(p.loose).toBe(false);
      expect(p.rowMilli).toBe(CFG.matronPodRow * MILLI);
      expect(p.dueTicks).toBeLessThanOrEqual(24 * TPB);
      expect(p.dueTicks).toBeGreaterThan(22 * TPB);
    }
  });

  it("throws what the level says on its beat, down its column", () => {
    const world = install([
      {
        beats: 24,
        pods: [4],
        throws: [
          { at: 3, offset: -2, what: "rock" },
          { at: 1, offset: 1, what: "cyan" },
        ],
      },
    ]);
    idleUntil(world, (w) => matron(w).phase === "hang");
    const hungAt = world.beat;
    const throws: { beat: number; col: number; what: string }[] = [];
    idleUntil(
      world,
      (w) => {
        for (const e of w.events) {
          if (e.type === "matronThrow")
            throws.push({ beat: w.beat - hungAt, col: e.col, what: e.what });
        }
        return throws.length === 2;
      },
      8,
    );
    // In the order of their beats, whatever order they were written in.
    expect(throws).toEqual([
      { beat: 1, col: MID + 1, what: "cyan" },
      { beat: 3, col: MID - 2, what: "rock" },
    ]);
    expect(world.creatures.some((c) => c.kind === "meteor" && c.col === MID - 2)).toBe(true);
  });

  it("takes a lobe for each of her pods swallowed, and waits for the whole clutch", () => {
    const world = install();
    idleUntil(world, (w) => matron(w).phase === "hang");
    const seen = playUntil(world, (w) => matron(w).taken === 1);
    expect(seen.has("matronLobe")).toBe(true);
    expect(seen.has("podTaken")).toBe(true);
    // One pod of two: the level is still hung, its other pod still on her.
    expect(matron(world).phase).toBe("hang");
    expect(matron(world).cursor).toBe(0);
    const cleared = playUntil(world, (w) => matron(w).taken === 2);
    expect(cleared.has("matronCleared")).toBe(true);
    expect(matron(world).phase).toBe("rear");
    expect(matron(world).cursor).toBe(1);
    expect(world.retries).toBe(0);
  });

  it("does not count a pod the wave hung, only her own", () => {
    const world = createWorld({ ...CFG }, 0, [], [{ beat: 0, col: 1, row: 4, kind: "pod" }]);
    startWave(world, 0, [], [{ beat: 0, col: 1, row: 4, kind: "pod" }], {
      kind: "matron",
      steps: QUIET,
    });
    idleUntil(world, (w) => matron(w).phase === "hang");
    expect(world.pods.filter((p) => !matron(world).hung.includes(p.id)).length).toBeGreaterThan(0);
    expect(matron(world).taken).toBe(0);
  });

  it("loses the wave when a ring runs out with her pod still on the field", () => {
    const world = install();
    idleUntil(world, (w) => matron(w).phase === "hang");
    const seen = idleUntil(
      world,
      (w) => w.retries > 0 || w.events.some((e) => e.type === "podLost"),
    );
    expect(seen.has("matronLobe")).toBe(false);
    expect(world.events.some((e) => e.type === "podLost") || world.retries > 0).toBe(true);
  });

  it("is beaten by her last pod, and sinks away before the wave may end", () => {
    const world = install();
    idleUntil(world, (w) => matron(w).phase === "hang");
    const seen = playUntil(world, (w) => matronBoss(w)?.phase === "spent", 120);
    expect(seen.has("matronSpent")).toBe(true);
    expect(matron(world).taken).toBe(3);
    const out = idleUntil(world, (w) => w.boss === null, CFG.matronSpentBeats + 2);
    expect(out.has("matronOut")).toBe(true);
    expect(world.retries).toBe(0);
  });

  it("hashes the same for the same play, and differently once a lobe is gone", () => {
    const a = install();
    const b = install();
    idleUntil(a, (w) => matron(w).phase === "hang");
    idleUntil(b, (w) => matron(w).phase === "hang");
    expect(hashWorld(a)).toBe(hashWorld(b));
    const before = hashWorld(a);
    matron(a).takenMask = 1;
    expect(hashWorld(a)).not.toBe(before);
  });
});
