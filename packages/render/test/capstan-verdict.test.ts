import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CapstanAsk,
  type CapstanPhase,
  capstanBoss,
  capstanCoreAsks,
  capstanRubAsks,
  capstanSteerAsks,
  createWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import {
  CAPSTAN_CORE_MARK,
  CAPSTAN_RUB_MARK,
  CAPSTAN_STEER_MARK,
  CapstanVerdicts,
} from "../src/capstan-verdicts.js";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE CAPSTAN's marks answer a touch the way every mark does**
 * (`capstan-verdicts.ts`, `.claude/skills/new-boss` §5): on a left or a right
 * the middle wears the halo on the steerer's screen and the end on the
 * wearer's, each with the partner's ring and clock on the other's; on a hold
 * the middle asks both seats until one pulls past the mark, and then the
 * middle asks only that seat and the end only the other; the bared core on a
 * fire step is either seat's, and halos on both screens with nobody's clock;
 * each of the drum's words lands on the mark it names; and the verdict
 * reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);
/** A pull past the mark, toward the left face. */
const PULL = -(CFG.capstanPullMilli + 1_000);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("capstan");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The drum in `phase` since a beat ago, `ask` the step under the cursor, `pulling` the seat past the mark. */
function at(
  world: World,
  phase: CapstanPhase,
  ask: CapstanAsk = "left",
  pulling: 0 | 1 | null = null,
  bared = false,
): void {
  const s = capstanBoss(world);
  if (s === null) throw new Error("the capstan wave hung no drum");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.bared = bared;
  s.pullMilli = [pulling === 0 ? PULL : 0, pulling === 1 ? PULL : 0];
  s.steps[0] = { ask, color: "either", beats: 4 };
}

function frame(role: ViewRole, arrange: (world: World) => void, said: SimEvent[] = []): string {
  const world = hung();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      w.events.length = 0;
      if (tick === 2) w.events.push(...said);
    },
  });
  return log.join("|");
}

const count = (text: string, what: string) => text.split(what).length - 1;
const halos = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), HALO);
const clocks = (role: ViewRole, arrange: (w: World) => void) => count(frame(role, arrange), CLOCK);

describe("THE CAPSTAN's marks asking", () => {
  const as =
    (phase: CapstanPhase, ask: CapstanAsk, pulling: 0 | 1 | null = null, bared = false) =>
    (w: World) =>
      at(w, phase, ask, pulling, bared);
  const rest = (w: World) => at(w, "rest");

  it("asks a band's steer of its own seat and its rub of the other", () => {
    const world = hung();
    const s = capstanBoss(world);
    if (s === null) throw new Error("no drum");
    const asks = () => [
      [capstanSteerAsks(world, s, 0), capstanSteerAsks(world, s, 1)],
      [capstanRubAsks(world, s, 0), capstanRubAsks(world, s, 1)],
    ];
    at(world, "lit", "left");
    expect(asks()).toEqual([
      [true, false],
      [false, true],
    ]);
    at(world, "lit", "right");
    expect(asks()).toEqual([
      [false, true],
      [true, false],
    ]);
    at(world, "lit", "fire", null, true);
    expect([...asks(), capstanCoreAsks(s)]).toEqual([[false, false], [false, false], true]);
  });

  it.each(["left", "right"] as const)(
    "waits on the partner's mark on both screens, on %s",
    (ask) => {
      expect(clocks("p1", as("lit", ask))).toBeGreaterThan(clocks("p1", rest));
      expect(clocks("p2", as("lit", ask))).toBeGreaterThan(clocks("p2", rest));
      expect(halos("test", as("lit", ask))).toBeGreaterThan(halos("p1", as("lit", ask)));
      expect(clocks("test", as("lit", ask))).toBe(clocks("test", rest));
    },
  );

  it("asks the steer of both seats on a hold, until one pulls past the mark", () => {
    const free = as("lit", "hold");
    expect(clocks("p1", free)).toBe(clocks("p1", rest));
    expect(halos("p1", free)).toBeGreaterThan(halos("p1", rest));
    const world = hung();
    at(world, "lit", "hold", 1);
    const s = capstanBoss(world);
    if (s === null) throw new Error("no drum");
    expect([capstanSteerAsks(world, s, 0), capstanSteerAsks(world, s, 1)]).toEqual([false, true]);
    expect([capstanRubAsks(world, s, 0), capstanRubAsks(world, s, 1)]).toEqual([true, false]);
    expect(clocks("p1", as("lit", "hold", 1))).toBeGreaterThan(clocks("p1", free));
    expect(clocks("p2", as("lit", "hold", 1))).toBeGreaterThan(clocks("p2", free));
  });

  it.each(ROLES)("haloes the core on %s once it is bare, and waits on nobody", (role) => {
    const bare = as("lit", "fire", null, true);
    expect(halos(role, bare)).toBeGreaterThan(halos(role, as("lit", "fire")));
    expect(clocks(role, bare)).toBe(clocks(role, rest));
  });
});

describe("THE CAPSTAN's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new CapstanVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [at(CAPSTAN_STEER_MARK), at(CAPSTAN_RUB_MARK), at(CAPSTAN_CORE_MARK)];
  };
  const col = 5;
  const n = null;

  it("lands each of the drum's words on the mark it names", () => {
    expect(on([{ type: "capstanBright", side: 0, col }])).toEqual([true, true, n]);
    expect(on([{ type: "capstanKept", col }])).toEqual([true, true, n]);
    expect(on([{ type: "capstanHit", hits: 1, col }])).toEqual([n, n, true]);
    expect(on([{ type: "capstanStall", col }])).toEqual([false, false, n]);
    expect(on([{ type: "capstanCover", col }])).toEqual([false, false, n]);
    expect(on([{ type: "capstanMiss", col }])).toEqual([n, n, false]);
    expect(on([{ type: "capstanWear", side: 1, wear: 2, col }])).toEqual([n, n, n]);
    expect(on([{ type: "capstanDrift", col }])).toEqual([n, n, n]);
  });

  it("forgets on reset", () => {
    const v = new CapstanVerdicts();
    v.ingest([{ type: "capstanMiss", col }]);
    v.clear();
    expect(v.verdicts.at(CAPSTAN_CORE_MARK)).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [{ type: "capstanStall", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
