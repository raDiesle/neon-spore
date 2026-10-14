import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LeadState,
  leadBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { drawLeadGrip } from "../src/lead-grip.js";
import { LEAD_STALK, LeadMarks } from "../src/lead-marks.js";
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
import { spyHolds } from "./soak-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LEAD's ring answers a touch the way THE GAUGE's do**
 * (`lead-marks.ts`, `.claude/skills/new-boss` §5): it stands on the
 * navigator's screen alone, so the ring offered wears the halo there and the
 * pilot is shown nothing — no partner's clock and no refusal; her thumb
 * landing washes it green; and the verdict reaches the field's frame.
 *
 * The still is **set**, `boss-cue-lead.test.ts`' arrangement.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

/** The body stopped dead with the stalk on offer, the way the fourth hit leaves it. */
function still(): { world: World; s: LeadState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("lead");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const s = leadBoss(world);
  if (s === null) throw new Error("the lead wave stood no body");
  s.segments = 1;
  s.stillBeat = world.beat;
  s.lean = 0;
  return { world, s };
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";

function ring(world: World, s: LeadState, role: ViewRole, v = new GripVerdicts()): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const c = ctx as unknown as CanvasRenderingContext2D;
  // The drop lights itself with gradients of its own: only the mark's are counted.
  const { holds } = spyHolds(() => drawLeadGrip(c, layout(role), CFG, s, world.beat, 0.4, 1.2, v));
  return [...log, ...holds.map((h) => `drop ${h.o.held === true ? "held" : "calling"}`)].join("|");
}

describe("THE LEAD's ring asking", () => {
  it("halos the stalk on her screen alone, until her thumb is on it", () => {
    const { world, s } = still();
    expect(count(ring(world, s, "p2"), HALO)).toBe(1);
    expect(count(ring(world, s, "test"), HALO)).toBe(1);
    expect(ring(world, s, "p1")).toBe("");
    s.heldBeat = world.beat;
    expect(count(ring(world, s, "p2"), HALO)).toBe(0);
    expect(ring(world, s, "p2")).toContain("drop held");
  });

  it("asks nothing of a still already spent, or of a body walking", () => {
    const { world, s } = still();
    s.freeBeat = world.beat;
    expect(ring(world, s, "p2")).toBe("");
    s.freeBeat = -1;
    s.stillBeat = -1;
    expect(ring(world, s, "p2")).toBe("");
  });

  it("is the HOLD LAB's drop, filling over the hold as the beam does", () => {
    const { world, s } = still();
    const drop = () =>
      spyHolds(() =>
        drawLeadGrip(
          stubCanvas().ctx as unknown as CanvasRenderingContext2D,
          layout("p2"),
          CFG,
          s,
          world.beat,
          0,
          1.2,
          new GripVerdicts(),
        ),
      ).holds[0]?.o;
    expect(drop()).toMatchObject({ held: false, fill: 0 });
    // Taken now, and drawn half the fuse later.
    s.heldBeat = world.beat;
    world.beat += Math.floor(CFG.leadHoldBeats / 2);
    const half = drop();
    expect(half?.held).toBe(true);
    expect(half?.fill).toBeCloseTo(Math.floor(CFG.leadHoldBeats / 2) / CFG.leadHoldBeats, 6);
  });
});

describe("THE LEAD's verdict on a touch", () => {
  it("washes the ring green on the thumb landing, judges nothing else, and forgets on reset", () => {
    const marks = new LeadMarks();
    marks.ingest([
      { type: "leadRelease", col: 3 },
      { type: "leadTear", col: 3 },
    ]);
    expect(marks.verdicts.at(LEAD_STALK)).toBeNull();
    marks.ingest([{ type: "leadGrip", col: 3 }]);
    expect(marks.verdicts.at(LEAD_STALK)?.good).toBe(true);
    marks.clear();
    expect(marks.verdicts.at(LEAD_STALK)).toBeNull();
  });

  it("rings the stalk on her screen and not on his", () => {
    const { world, s } = still();
    s.heldBeat = world.beat;
    const v = new GripVerdicts();
    v.mark(LEAD_STALK, true);
    const bare = count(ring(world, s, "p2"), PALETTE.good);
    expect(count(ring(world, s, "p2", v), PALETTE.good)).toBeGreaterThan(bare);
    expect(ring(world, s, "p1", v)).toBe("");
  });

  /** Two beats of the still under her thumb, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const { world, s } = still();
    s.heldBeat = world.beat;
    const log: string[] = [];
    runFrames(world, role, TPB * 2, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        step(w, []);
        if (tick === 2) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(["p2", "test"] as const)("reaches the field's frame, on %s", (role) => {
    const gripped: SimEvent[] = [{ type: "leadGrip", col: 3 }];
    expect(count(frames(role, gripped), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
