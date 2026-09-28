import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_CATCH,
  type RatchetState,
  ratchetBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  drawRatchetHalos,
  drawRatchetVerdicts,
  RATCHET_CATCH_MARK,
  RATCHET_PAWL_MARK,
  RatchetMarks,
} from "../src/ratchet-marks.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE RATCHET's catch and pawl answer a touch the way THE HASP's do**
 * (`ratchet-marks.ts`, `.claude/skills/new-boss` §5): her unset catch wears
 * the halo on her screen and his lifted pawl in a lit window on his, neither
 * on the other's — no partner's clock and no refusal; `SET` and a clean tooth
 * green their own mark, a burn is red on both; and the verdict reaches the
 * field's frame.
 *
 * The states are **set**, `ratchet-frame.test.ts`' arrangement.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const HALO = "createRadialGradient";
const count = (text: string, needle: string): number => text.split(needle).length - 1;

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("ratchet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  return world;
}

/** The pawl lit and a tooth waiting, her hand off and his lifted. */
function working(world: World): RatchetState {
  const s = ratchetBoss(world);
  if (s === null) throw new Error("the ratchet wave hung no rack");
  s.phase = "work";
  s.phaseBeat = world.beat - 1;
  s.catchMilli = NO_CATCH;
  s.catchSpent = false;
  s.pawlDown = false;
  s.boltCol = -1;
  return s;
}

function halos(s: RatchetState, role: ViewRole): number {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawRatchetHalos(c, computeLayout(VIEWPORT, CFG, role), CFG, s, 1.2);
  return count(log.join("|"), HALO);
}

function verdicts(s: RatchetState, role: ViewRole, v: GripVerdicts): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawRatchetVerdicts(c, computeLayout(VIEWPORT, CFG, role), CFG, s, v);
  return log.join("|");
}

describe("THE RATCHET's marks asking", () => {
  it("halos his pawl on his screen and her catch on hers, each alone", () => {
    const s = working(hung());
    expect(halos(s, "p1")).toBe(1);
    expect(halos(s, "p2")).toBe(1);
    expect(halos(s, "test")).toBe(2);
  });

  it("asks nothing of a set catch or a pawl already down", () => {
    const s = working(hung());
    s.catchMilli = CFG.ratchetReachMilli;
    s.pawlDown = true;
    expect(halos(s, "test")).toBe(0);
  });

  it("asks only the pawl in the kick, and neither once the rack is open", () => {
    const s = working(hung());
    s.phase = "kick";
    expect(halos(s, "p1")).toBe(1);
    expect(halos(s, "p2")).toBe(0);
    s.phase = "open";
    expect(halos(s, "test")).toBe(0);
  });

  it("asks nothing of the pawl between windows", () => {
    const s = working(hung());
    s.phase = "climb";
    expect(halos(s, "p1")).toBe(0);
    expect(halos(s, "p2")).toBe(1);
  });
});

describe("THE RATCHET's verdict on a touch", () => {
  const on = (said: SimEvent[]) => {
    const marks = new RatchetMarks();
    marks.ingest(said);
    const at = (key: number) => marks.verdicts.at(key)?.good ?? null;
    return [at(RATCHET_CATCH_MARK), at(RATCHET_PAWL_MARK)];
  };

  it("lands each of the rack's words on the hand it names", () => {
    expect(on([{ type: "ratchetSet", col: 5 }])).toEqual([true, null]);
    expect(on([{ type: "ratchetClick", col: 5, teeth: 6, clean: 1 }])).toEqual([null, true]);
    expect(on([{ type: "ratchetBurn", col: 5, teeth: 6, late: false }])).toEqual([false, false]);
    expect(on([{ type: "ratchetLet", col: 5 }])).toEqual([null, null]);
    expect(on([{ type: "ratchetBite", col: 5 }])).toEqual([true, null]);
    expect(on([{ type: "ratchetFly", col: 5 }])).toEqual([null, false]);
    expect(on([{ type: "ratchetMesh", col: 5 }])).toEqual([true, true]);
    expect(on([{ type: "ratchetUnwind", col: 5 }])).toEqual([false, null]);
  });

  it("forgets on reset", () => {
    const marks = new RatchetMarks();
    marks.ingest([{ type: "ratchetSet", col: 5 }]);
    marks.clear();
    expect(marks.verdicts.at(RATCHET_CATCH_MARK)).toBeNull();
  });

  it("rings each mark only on its own seat's screen", () => {
    const s = working(hung());
    const caught = new GripVerdicts();
    caught.mark(RATCHET_CATCH_MARK, true);
    expect(count(verdicts(s, "p2", caught), PALETTE.good)).toBeGreaterThan(0);
    expect(verdicts(s, "p1", caught)).toBe("");
    const pressed = new GripVerdicts();
    pressed.mark(RATCHET_PAWL_MARK, true);
    expect(count(verdicts(s, "p1", pressed), PALETTE.good)).toBeGreaterThan(0);
    expect(verdicts(s, "p2", pressed)).toBe("");
  });

  /** A beat of a tooth waiting, `said` on tick 2 and the world held still. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const world = hung();
    working(world);
    const log: string[] = [];
    runFrames(world, role, TPB, {
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

  it.each(["p1", "p2"] as const)("reaches the field's frame, on %s", (role) => {
    const burn: SimEvent[] = [{ type: "ratchetBurn", col: 5, teeth: 6, late: false }];
    expect(count(frames(role, burn), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
