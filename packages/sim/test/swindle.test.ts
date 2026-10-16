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
import { NO_DUE } from "../src/pod-types.js";
import {
  type SwindleState,
  type SwindleStep,
  swindleBoss,
  swindleRealAll,
} from "../src/swindle.js";
import { MILLI } from "../src/world.js";

/**
 * THE SWINDLE's receipts, one rule a test (`sim/swindle.ts`): she hangs a
 * hand of real pods and fakes on no clock; two of them glide across and stop
 * exactly on each other's columns; she lets each go on its beat and says so
 * without saying what it is; a real pod swallowed and a fake refused clear
 * the hand; a fake swallowed or a real one missed loses the wave; and her
 * last hand cleared beats her.
 */

/** No sideways drift: a pod falls straight, so the catch is not the rng's. */
const CFG: SimConfig = { ...DEFAULT_CONFIG, podDriftTilesPerBeat: 0 };
const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);

/** One of each, traded once, then let go five beats apart; and a lone real pod. */
const HANDS: readonly SwindleStep[] = [
  {
    pods: [
      { offset: -2, kind: "pod" },
      { offset: 2, kind: "husk" },
    ],
    swaps: [{ at: 2, a: 0, b: 1 }],
    drops: [
      { at: 6, pod: 0 },
      { at: 11, pod: 1 },
    ],
  },
  { pods: [{ offset: 0, kind: "pod" }], swaps: [], drops: [{ at: 1, pod: 0 }] },
];

function install(steps: readonly SwindleStep[] = HANDS): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "swindle", steps });
  return world;
}

function swindle(world: World): SwindleState {
  const s = swindleBoss(world);
  if (s === null) throw new Error("the wave installed no swindle");
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
    if (world.tick >= end) throw new Error("the swindle never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/**
 * A pair playing her hands: the pilot under whatever of hers is falling,
 * opening the maw for a real pod (`swallow` says which) and never for a fake.
 * Until `until`; every event seen.
 */
function playUntil(
  world: World,
  until: (w: World) => boolean,
  swallow: (kind: "pod" | "husk") => boolean = (k) => k === "pod",
  beats = 80,
): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the pair never got there");
    const pod = world.pods.find((p) => p.loose);
    const cmds: Omit<TimedCommand, "tick">[] = [];
    if (pod !== undefined) {
      cmds.push({
        player: 1,
        command: { kind: "cannonCol", col: Math.round(pod.colMilli / MILLI) },
      });
      if (swallow(pod.kind) && world.tick % 10 === 0)
        cmds.push({ player: 1, command: { kind: "intake" } });
    }
    for (const t of tick(world, cmds)) seen.add(t);
  }
  return seen;
}

const hung = (w: World) => swindle(w).phase === "hang";

describe("THE SWINDLE", () => {
  it("hangs a hand of real pods and fakes in a row, on no clock", () => {
    const world = install();
    expect(swindle(world).phase).toBe("enter");
    expect(swindleRealAll(swindle(world))).toBe(2);
    const seen = idleUntil(world, hung);
    expect(seen.has("swindleHang")).toBe(true);
    const pods = swindle(world).hung.map((id) => world.pods.find((p) => p.id === id));
    expect(pods.map((p) => p?.colMilli)).toEqual([(MID - 2) * MILLI, (MID + 2) * MILLI]);
    expect(pods.map((p) => p?.kind)).toEqual(["pod", "husk"]);
    for (const p of pods) {
      expect(p?.loose).toBe(false);
      expect(p?.dueTicks).toBe(NO_DUE);
      expect(p?.rowMilli).toBe(CFG.swindlePodRow * MILLI);
    }
  });

  it("glides two pods across, and stops each exactly on the other's column", () => {
    const world = install();
    idleUntil(world, hung);
    const from = world.beat;
    const [a, b] = swindle(world).hung;
    const col = (id: number | undefined) => world.pods.find((p) => p.id === id)?.colMilli ?? -1;
    const seen = idleUntil(world, (w) => w.beat === from + 3);
    expect(seen.has("swindleSwap")).toBe(true);
    // Halfway through the glide: both between where they were.
    expect(col(a)).toBeGreaterThan((MID - 2) * MILLI);
    expect(col(a)).toBeLessThan((MID + 2) * MILLI);
    idleUntil(world, (w) => w.beat === from + 2 + CFG.swindleSwapBeats);
    expect(col(a)).toBe((MID + 2) * MILLI);
    expect(col(b)).toBe((MID - 2) * MILLI);
    idleUntil(world, (w) => w.beat === from + 5);
    expect(col(a)).toBe((MID + 2) * MILLI);
    expect(world.pods.every((p) => p.crossMilli === 0)).toBe(true);
  });

  it("lets each pod go on its beat, and the drop never says which it was", () => {
    const world = install();
    idleUntil(world, hung);
    const from = world.beat;
    const drops: { beat: number; piece: number; keys: string[] }[] = [];
    playUntil(world, () => {
      for (const e of world.events) {
        if (e.type === "swindleDrop")
          drops.push({ beat: world.beat - from, piece: e.piece, keys: Object.keys(e).sort() });
      }
      return drops.length === 2;
    });
    expect(drops.map((d) => [d.beat, d.piece])).toEqual([
      [6, 0],
      [11, 1],
    ]);
    for (const d of drops) expect(d.keys).toEqual(["col", "piece", "type"]);
  });

  it("clears a hand once its real pod is swallowed and its fake refused", () => {
    const world = install();
    idleUntil(world, hung);
    const seen = playUntil(world, (w) => swindle(w).phase === "rear");
    expect(seen.has("swindleTaken")).toBe(true);
    expect(seen.has("swindleRefused")).toBe(true);
    expect(seen.has("swindleCleared")).toBe(true);
    expect(swindle(world).taken).toBe(1);
    expect(swindle(world).cursor).toBe(1);
    expect(world.retries).toBe(0);
  });

  it("loses the wave on a fake swallowed", () => {
    const world = install();
    idleUntil(world, hung);
    const seen = playUntil(
      world,
      (w) => w.events.some((e) => e.type === "huskSwallowed"),
      () => true,
    );
    expect(seen.has("swindleRefused")).toBe(false);
  });

  it("loses the wave on a real pod let fall", () => {
    const world = install();
    idleUntil(world, hung);
    const seen = idleUntil(world, (w) => w.events.some((e) => e.type === "podLost"));
    expect(seen.has("swindleTaken")).toBe(false);
  });

  it("is beaten by her last hand cleared, and goes before the wave may end", () => {
    const world = install();
    const seen = playUntil(world, (w) => swindleBoss(w)?.phase === "spent", undefined, 120);
    expect(seen.has("swindleSpent")).toBe(true);
    expect(swindle(world).taken).toBe(2);
    const out = idleUntil(world, (w) => w.boss === null, CFG.swindleSpentBeats + 2);
    expect(out.has("swindleOut")).toBe(true);
    expect(world.retries).toBe(0);
  });

  it("hashes the same for the same play, and differently once a pod is taken", () => {
    const a = install();
    const b = install();
    idleUntil(a, hung);
    idleUntil(b, hung);
    expect(hashWorld(a)).toBe(hashWorld(b));
    const before = hashWorld(a);
    swindle(a).taken = 1;
    expect(hashWorld(a)).not.toBe(before);
  });
});
