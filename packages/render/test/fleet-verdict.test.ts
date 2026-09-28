import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FleetState,
  type SimEvent,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { drawFleetGrip } from "../src/fleet-grip-draw.js";
import { drawFleetVerdict, FleetGripMarks } from "../src/fleet-grip-marks.js";
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
 * **THE FLEET's wound answers a touch the way THE INSTAR's marks do**
 * (`fleet-grip-marks.ts`, `.claude/skills/new-boss` §5): this seat's ring
 * wears the halo while the wound is open and its thumb is not down, and the
 * thumb landing washes that ring green — on this seat's screen only, since
 * neither screen draws the other seat's ring.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The fleet's own wave, its first ship holed at its head, in the state this case is about. */
function wounded(
  phase: FleetState["phase"],
  overrides: Partial<FleetState> = {},
): { world: World; b: FleetState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("fleet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const b = world.boss;
  if (b === null || b.kind !== "fleet") throw new Error("the fleet's wave installed no fleet");
  const ship = b.ships[0];
  if (ship === undefined) throw new Error("the fleet stood up with no ships");
  Object.assign(b, {
    phase,
    phaseBeat: world.beat,
    holed: 0,
    holeCol: ship.col,
    holeRow: ship.row,
    ...overrides,
  });
  return { world, b };
}

function drawn(role: ViewRole, paint: (ctx: CanvasRenderingContext2D, role: ViewRole) => void) {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  paint(ctx as unknown as CanvasRenderingContext2D, role);
  return log.join("|");
}

const count = (text: string, needle: string): number => text.split(needle).length - 1;
const HALO = "createRadialGradient";

function grip(role: ViewRole, phase: FleetState["phase"], o: Partial<FleetState> = {}): string {
  const { world, b } = wounded(phase, o);
  return drawn(role, (ctx) => drawFleetGrip(ctx, layout(role), world, b, 0.25, 1.2));
}

describe("THE FLEET's wound asking", () => {
  it("asks nothing in the hunt", () => {
    for (const role of ROLES) expect(count(grip(role, "hunt"), HALO)).toBe(0);
  });

  it("haloes this seat's ring in the flood and the wreck, until its thumb is down", () => {
    for (const phase of ["flood", "wreck"] as const) {
      for (const role of ROLES) expect(count(grip(role, phase), HALO)).toBe(1);
      expect(count(grip("p1", phase, { rakeOn: true }), HALO)).toBe(0);
    }
    expect(count(grip("p2", "flood", { breachHeld: true }), HALO)).toBe(0);
    expect(count(grip("p2", "wreck", { wreckPullMilli: 200 }), HALO)).toBe(0);
  });
});

const plume = (on: boolean): SimEvent => ({ type: "fleetBreach", col: 1, row: 1, on });
const hold = (part: "rake" | "wreck"): SimEvent => ({ type: "fleetHold", col: 1, row: 1, part });

describe("THE FLEET's verdict on a touch", () => {
  it("keeps each seat's green under its key, fades it and forgets it on reset", () => {
    const marks = new FleetGripMarks();
    marks.ingest([plume(false)]);
    expect(marks.verdicts.at(2)).toBeNull();
    marks.ingest([hold("rake")]);
    expect(marks.verdicts.at(1)?.good).toBe(true);
    expect(marks.verdicts.at(2)).toBeNull();
    marks.ingest([plume(true)]);
    expect(marks.verdicts.at(2)?.good).toBe(true);
    marks.update(1);
    expect(marks.verdicts.at(1)).toBeNull();
    marks.ingest([hold("wreck")]);
    expect(marks.verdicts.at(2)?.good).toBe(true);
    marks.clear();
    expect(marks.verdicts.at(2)).toBeNull();
  });

  function verdict(role: ViewRole, key: number, phase: FleetState["phase"] = "flood"): string {
    const v = new GripVerdicts();
    v.mark(key, true);
    const { world, b } = wounded(phase);
    return drawn(role, (ctx) => drawFleetVerdict(ctx, layout(role), world, b, v));
  }

  it("draws a seat's green only on that seat's screen, and none in the hunt", () => {
    expect(count(verdict("p1", 1), PALETTE.good)).toBeGreaterThan(0);
    expect(verdict("p2", 1)).toBe("");
    expect(count(verdict("p2", 2), PALETTE.good)).toBeGreaterThan(0);
    expect(verdict("p1", 2)).toBe("");
    expect(verdict("p1", 1, "hunt")).toBe("");
  });

  /** Nine ticks of the flood, `said` thrown on the first. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const { world } = wounded("flood");
    const log: string[] = [];
    runFrames(world, role, 9, {
      every: 3,
      onCanvas: (c) => {
        c.log = log;
      },
      onTick: (tick, w) => {
        if (tick === 0) w.events.push(...said);
      },
    });
    return log.join("|");
  }

  it.each(ROLES)("reaches the screen through the frame, on %s", (role) => {
    const said = role === "p2" ? [plume(true)] : [hold("rake")];
    expect(count(frames(role, said), PALETTE.good)).toBeGreaterThan(
      count(frames(role, []), PALETTE.good),
    );
  });
});
