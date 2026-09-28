import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CairnState,
  type Creature,
  createWorld,
  type SimEvent,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { pileRing } from "../src/cairn-hand.js";
import { CairnMarks, drawCairnVerdict } from "../src/cairn-marks.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE CAIRN's pile answers a touch the way THE INSTAR's marks do**
 * (`cairn-marks.ts`, `.claude/skills/new-boss` §5): a unit hauled out and a
 * beat held off the clock both wash the pile's ring green, the green is drawn
 * only while a hand is on the pile — the ring it stands on is only drawn then
 * — and it reaches the field's frame on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");

function cairnWorld(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("cairn");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

const boss = (world: World): CairnState => {
  if (world.boss?.kind !== "cairn") throw new Error("the cairn wave installed no cairn");
  return world.boss;
};

const pile = (world: World): Creature => {
  const body = world.creatures.find((c) => c.kind === "cairn");
  if (!body) throw new Error("no pile");
  return body;
};

/** The pile with `player`'s thumb on it, a tick in. */
function gripped(player: 1 | 2): World {
  const world = cairnWorld();
  step(world, [{ tick: 0, player, command: { kind: "grip", id: pile(world).id } }]);
  step(world, []);
  return world;
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;

function verdict(world: World, v: GripVerdicts): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const c = ctx as unknown as CanvasRenderingContext2D;
  drawCairnVerdict(c, L, world, pile(world), boss(world).units, 1, 1, v);
  return log.join("|");
}

const pulled: SimEvent = { type: "cairnPulled", player: 1, col: 3, row: 4 };
const held: SimEvent = { type: "cairnHeld", col: 3, row: 4 };

describe("THE CAIRN's verdict on a touch", () => {
  it("greens the pile on a pull and on a held beat, and forgets on reset", () => {
    const marks = new CairnMarks();
    marks.ingest([pulled]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.update(1);
    expect(marks.verdicts.at(0)).toBeNull();
    marks.ingest([held]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.ingest([{ type: "cairnShed", col: 3, row: 4 } as SimEvent]);
    expect(marks.verdicts.at(0)?.good).toBe(true);
    marks.clear();
    expect(marks.verdicts.at(0)).toBeNull();
  });

  it("stands on the ring of whichever seat's hand is on the pile", () => {
    const v = new GripVerdicts();
    v.mark(0, true);
    for (const player of [1, 2] as const) {
      expect(count(verdict(gripped(player), v), PALETTE.good), `P${player}`).toBeGreaterThan(0);
    }
    const world = gripped(1);
    expect(pileRing(L, pile(world), boss(world).units, 1, 1)).not.toBeNull();
  });

  it("draws nothing with no hand on the pile, and nothing with no verdict", () => {
    const v = new GripVerdicts();
    v.mark(0, true);
    expect(verdict(cairnWorld(), v)).toBe("");
    expect(verdict(gripped(1), new GripVerdicts())).toBe("");
  });

  /** Nine ticks of the wave with the pilot's thumb on the pile, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const world = cairnWorld();
    const id = pile(world).id;
    const log: string[] = [];
    runFrames(world, role, 9, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, tick === 0 ? [{ tick, player: 1, command: { kind: "grip", id } }] : []);
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    expect(count(frames(role, [held]), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
