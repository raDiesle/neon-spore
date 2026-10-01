import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type BurgeeAsk,
  type BurgeePhase,
  burgeeAims,
  burgeeBoss,
  burgeeFreezeAsks,
  burgeeSpindleAsks,
  createWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import {
  BURGEE_DRAW_MARK,
  BURGEE_FREEZE_MARK,
  BURGEE_SPINDLE_MARK,
  BurgeeVerdicts,
} from "../src/burgee-verdicts.js";
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
 * **THE BURGEE's marks answer a touch the way every mark does**
 * (`burgee-verdicts.ts`, `.claude/skills/new-boss` §5): on a catch the freeze
 * ring wears the halo on the freezer's screen and the draw's track on the
 * other's, each with the partner's ring and clock on the other's, and the
 * ring stops asking once the flag is still; the lit spindle on a fire step is
 * either seat's, and halos on both screens with nobody's clock; each of the
 * flag's words lands on the mark it names; and the verdict reaches the
 * field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
/** The partner's waiting clock's face, as `drawMarkWait` strokes it. */
const CLOCK = rgba(PALETTE.text, 0.85);

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("burgee");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The flag in `phase` since a beat ago, `ask` the step under the cursor, the pilot's to freeze. */
function at(
  world: World,
  phase: BurgeePhase,
  ask: BurgeeAsk = "catch",
  frozen = false,
  spindleLit = false,
): void {
  const s = burgeeBoss(world);
  if (s === null) throw new Error("the burgee wave hung no flag");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.frozenBeats = frozen ? 2 : 0;
  s.frozenBy = frozen ? 0 : null;
  s.spindleLit = spindleLit;
  s.steps[0] = { ask, freezer: 1, offset: 1, sweepMilli: 200, color: "either", beats: 4 };
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

describe("THE BURGEE's marks asking", () => {
  const as =
    (phase: BurgeePhase, ask: BurgeeAsk = "catch", frozen = false, lit = false) =>
    (w: World) =>
      at(w, phase, ask, frozen, lit);
  const rest = (w: World) => at(w, "rest");

  it("asks a catch's freeze of its freezer and its draw of the other, until the flag is still", () => {
    const world = hung();
    const s = burgeeBoss(world);
    if (s === null) throw new Error("no flag");
    const asks = () => [
      [burgeeFreezeAsks(s, 0), burgeeFreezeAsks(s, 1)],
      [burgeeAims(s, 0), burgeeAims(s, 1)],
    ];
    at(world, "lit", "catch");
    expect(asks()).toEqual([
      [true, false],
      [false, true],
    ]);
    at(world, "lit", "catch", true);
    expect(asks()).toEqual([
      [false, false],
      [false, true],
    ]);
    at(world, "lit", "fire", false, true);
    expect([...asks(), burgeeSpindleAsks(s)]).toEqual([[false, false], [false, false], true]);
  });

  it("waits on the partner's mark on both screens, on a catch", () => {
    expect(clocks("p1", as("lit"))).toBeGreaterThan(clocks("p1", rest));
    expect(clocks("p2", as("lit"))).toBeGreaterThan(clocks("p2", rest));
    expect(halos("test", as("lit"))).toBeGreaterThan(halos("p1", as("lit")));
    expect(clocks("test", as("lit"))).toBe(clocks("test", rest));
  });

  it("stops asking the freeze once the flag is still", () => {
    expect(halos("test", as("lit", "catch", true))).toBeLessThan(halos("test", as("lit")));
  });

  it.each(ROLES)("haloes the spindle on %s once it is lit, and waits on nobody", (role) => {
    const lit = as("lit", "fire", false, true);
    expect(halos(role, lit)).toBeGreaterThan(halos(role, as("lit", "fire")));
    expect(clocks(role, lit)).toBe(clocks(role, rest));
  });
});

describe("THE BURGEE's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const v = new BurgeeVerdicts();
    v.ingest(said);
    const at = (k: number) => v.verdicts.at(k)?.good ?? null;
    return [at(BURGEE_FREEZE_MARK), at(BURGEE_DRAW_MARK), at(BURGEE_SPINDLE_MARK)];
  };
  const col = 5;
  const n = null;

  it("lands each of the flag's words on the mark it names", () => {
    expect(on([{ type: "burgeeFreeze", side: 0, col }])).toEqual([true, n, n]);
    expect(on([{ type: "burgeeFlap", side: 0, col }])).toEqual([false, n, n]);
    expect(on([{ type: "burgeeLapse", col }])).toEqual([n, false, n]);
    expect(on([{ type: "burgeeFlutter", side: 1, col }])).toEqual([n, false, n]);
    expect(on([{ type: "burgeeCatch", side: 1, catches: 1, col }])).toEqual([true, true, n]);
    expect(on([{ type: "burgeeRecatch", side: 1, col }])).toEqual([true, true, n]);
    expect(on([{ type: "burgeeSway", col }])).toEqual([false, false, n]);
    expect(on([{ type: "burgeeDim", col }])).toEqual([false, false, n]);
    expect(on([{ type: "burgeeHit", hits: 1, col }])).toEqual([n, n, true]);
    expect(on([{ type: "burgeeMiss", col }])).toEqual([n, n, false]);
    expect(on([{ type: "burgeeLight", ask: "catch", offset: 1, col }])).toEqual([n, n, n]);
  });

  it("stands the ring where the last lit catch put it, and forgets on reset", () => {
    const v = new BurgeeVerdicts();
    v.ingest([{ type: "burgeeLight", ask: "catch", offset: -1, col }]);
    v.ingest([{ type: "burgeeLight", ask: "fire", offset: 0, col }]);
    expect(v.offset).toBe(-1);
    v.ingest([{ type: "burgeeMiss", col }]);
    v.clear();
    expect(v.verdicts.at(BURGEE_SPINDLE_MARK)).toBeNull();
    expect(v.offset).toBeNull();
  });

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const rest = (w: World) => at(w, "rest");
    const missed: SimEvent[] = [{ type: "burgeeMiss", col }];
    expect(count(frame(role, rest, missed), PALETTE.red)).toBeGreaterThan(
      count(frame(role, rest), PALETTE.red),
    );
  });
});
