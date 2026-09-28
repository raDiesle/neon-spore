import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LedgerState,
  ledgerBoss,
  ledgerPhase,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import {
  BEAD,
  drawLedgerPilotAsked,
  drawLedgerPilotVerdict,
  drawLedgerRootAsked,
  drawLedgerRootVerdict,
  LedgerMarks,
  ROOT,
} from "../src/ledger-marks.js";
import { PALETTE } from "../src/palette.js";
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
 * **THE LEDGER's three rings answer a touch the way THE GAUGE's do**
 * (`ledger-marks.ts`, `.claude/skills/new-boss` §5): each stands on one
 * screen only, so the ring offered wears the halo on that screen and the
 * other screen is shown nothing — no partner's clock and no refusal; a step
 * of the foot, a thumb in the socket and a pull wash theirs green; and the
 * verdict reaches the field's frame.
 *
 * The movements are **set**, `ledger-grip.test.ts`' arrangement.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function open(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("ledger");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function cord(world: World): LedgerState {
  const t = ledgerBoss(world);
  if (t === null) throw new Error("the ledger wave paid out no cord");
  return t;
}

/** The cord in and paying, her plug offered. */
function paying(world: World): LedgerState {
  const t = cord(world);
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  expect(ledgerPhase(t, CFG, world.beat)).toBe("paying");
  return t;
}

/** The cord whipping, with one return four beats down it. */
function whipping(world: World): LedgerState {
  const t = paying(world);
  t.seam = CFG.ledgerWhipSeam;
  t.beads = [{ beat: world.beat + 4, span: 5, last: false, pulled: false }];
  expect(ledgerPhase(t, CFG, world.beat)).toBe("whipping");
  return t;
}

/** The cord taut, with the one return nobody is meant to answer on it. */
function taut(world: World): LedgerState {
  const t = paying(world);
  t.seam = CFG.ledgerSeamHits;
  t.beads = [{ beat: world.beat + 3, span: 5, last: true, pulled: false }];
  expect(ledgerPhase(t, CFG, world.beat)).toBe("taut");
  return t;
}

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, l: Layout) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, layout(role));
  return log.join("|");
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";

function asked(world: World, t: LedgerState, role: ViewRole): number {
  const log = drawn(role, (ctx, l) => {
    drawLedgerRootAsked(ctx, l, world, t, 1.2);
    drawLedgerPilotAsked(ctx, l, world, t, 0.4, 1.2);
  });
  return count(log, HALO);
}

describe("THE LEDGER's rings asking", () => {
  it("halo the foot on her screen alone, until her thumb is on it", () => {
    const world = open();
    const t = cord(world);
    expect(ledgerPhase(t, CFG, world.beat)).toBe("rooting");
    expect(asked(world, t, "p2")).toBe(1);
    expect(asked(world, t, "p1")).toBe(0);
    t.foot = t.socket;
    expect(asked(world, t, "p2")).toBe(0);
  });

  it("halo the socket on her screen alone, until she has plugged it", () => {
    const world = open();
    const t = paying(world);
    expect(asked(world, t, "p2")).toBe(1);
    expect(asked(world, t, "p1")).toBe(0);
    t.plug = true;
    expect(asked(world, t, "p2")).toBe(0);
  });

  it("halo the soonest return on his screen alone, until it is pulled", () => {
    const world = open();
    const t = whipping(world);
    t.plug = true;
    expect(asked(world, t, "p1")).toBe(1);
    expect(asked(world, t, "p2")).toBe(0);
    const b = t.beads[0];
    if (b !== undefined) b.pulled = true;
    expect(asked(world, t, "p1")).toBe(0);
  });

  it("halo the taut cord on his screen alone, until there is a carry in it", () => {
    const world = open();
    const t = taut(world);
    expect(asked(world, t, "p1")).toBe(1);
    expect(asked(world, t, "p2")).toBe(0);
    t.haulMilli = 1;
    expect(asked(world, t, "p1")).toBe(0);
  });
});

describe("THE LEDGER's verdict on a touch", () => {
  it("keeps the root's and the bead's apart, fades them and forgets them on reset", () => {
    const marks = new LedgerMarks();
    marks.ingest([{ type: "ledgerFoot", col: 3 }]);
    expect(marks.verdicts.at(ROOT)?.good).toBe(true);
    expect(marks.verdicts.at(BEAD)).toBeNull();
    marks.ingest([{ type: "ledgerPull", col: 3, beats: 2 }]);
    expect(marks.verdicts.at(BEAD)?.good).toBe(true);
    marks.update(1);
    expect(marks.verdicts.at(ROOT)).toBeNull();
    marks.ingest([{ type: "ledgerPlug", col: 3, beats: 4 }]);
    expect(marks.verdicts.at(ROOT)?.good).toBe(true);
    marks.clear();
    expect(marks.verdicts.at(ROOT)).toBeNull();
  });

  it("rings the root on her screen and the pulled return on his, and neither on the other", () => {
    const world = open();
    const t = whipping(world);
    const b = t.beads[0];
    if (b !== undefined) b.pulled = true;
    const v = new GripVerdicts();
    v.mark(ROOT, true);
    v.mark(BEAD, true);
    const root = (role: ViewRole) =>
      count(
        drawn(role, (ctx, l) => drawLedgerRootVerdict(ctx, l, world, t, v)),
        PALETTE.good,
      );
    const bead = (role: ViewRole) =>
      count(
        drawn(role, (ctx, l) => drawLedgerPilotVerdict(ctx, l, world, t, 0.4, 1.2, v)),
        PALETTE.good,
      );
    expect(root("p2")).toBeGreaterThan(0);
    expect(root("p1")).toBe(0);
    expect(bead("p1")).toBeGreaterThan(0);
    expect(bead("p2")).toBe(0);
  });

  /** Two beats of the cord in, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const log: string[] = [];
    runFrames(open(), role, TPB * 2, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 0) paying(w);
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(["p2", "test"] as const)("reaches the field's frame, on %s", (role) => {
    const plugged: SimEvent[] = [{ type: "ledgerPlug", col: 4, beats: 4 }];
    expect(count(frames(role, plugged), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
