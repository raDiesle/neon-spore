import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type UndertowState,
  undertowBoss,
  undertowUnseated,
  type World,
} from "@neon-spore/sim";
import { deskDown } from "../src/desk-grab.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import type { Field } from "../src/touch.js";
import { undertowFreeCircle } from "../src/undertow-grip-place.js";
import { drawUndertowAsked, drawUndertowVerdicts, UndertowMarks } from "../src/undertow-marks.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE UNDERTOW's pin and free answer a touch the way THE INSTAR's marks do**
 * (`undertow-marks.ts`, `.claude/skills/new-boss` §5): each ring that asks her
 * wears the halo on her screen; the free wears his clock on the pilot's while
 * he waits on it, and the pins none; a pin and a free wash green and his
 * refused press red; a desk press is signed with her seat; and the verdict
 * reaches the field's frame.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const layout = (role: ViewRole): Layout => computeLayout(VIEWPORT, CFG, role);

function opened(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("undertow");
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("the undertow's wave installed no floor");
  return u;
}

function untilLobe(world: World): number {
  for (let i = 0; i < 40 * TPB; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing");
    if (b) return b.col;
    step(world, []);
  }
  throw new Error("no lobe ever stood");
}

function untilUnseated(world: World): void {
  for (let i = 0; i < 400 * TPB && floor(world).phase !== "seat"; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing" && !x.tall);
    if (b === undefined) step(world, []);
    else {
      step(world, [
        { tick: world.tick, player: 1, command: { kind: "cannonCol", col: b.col } },
        { tick: world.tick, player: 1, command: { kind: "intake" } },
      ]);
    }
  }
  for (let i = 0; i < 40 * TPB; i++) {
    if (undertowUnseated(floor(world), world.beat)) return;
    step(world, []);
  }
  throw new Error("the floor never unseated anyone");
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

function asked(world: World, role: ViewRole): string {
  const u = floor(world);
  return drawn(role, (ctx, l) =>
    drawUndertowAsked(ctx, l, CFG, u, world.beat, world.cannonCol, 1.2),
  );
}

describe("THE UNDERTOW's rings asking", () => {
  it("a standing lobe halos on her screen alone, until her thumb is on it", () => {
    const world = opened();
    const col = untilLobe(world);
    expect(count(asked(world, "p2"), HALO)).toBe(1);
    expect(count(asked(world, "p1"), HALO)).toBe(0);
    floor(world).pinCol = col;
    expect(count(asked(world, "p2"), HALO)).toBe(0);
  });

  it("the free halos on hers and wears his clock on his, until her thumb is on it", () => {
    const world = opened();
    untilUnseated(world);
    floor(world).pinCol = -1;
    const lobes = floor(world).breaches.filter((b) => b.stage === "standing").length;
    expect(count(asked(world, "p2"), HALO)).toBe(1 + lobes);
    const his = asked(world, "p1");
    expect(count(his, HALO)).toBe(0);
    expect(his.length).toBeGreaterThan(0);
    floor(world).freeHeld = true;
    expect(asked(world, "p1")).toBe("");
  });
});

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.4,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("a desk press on the free", () => {
  it("is signed with the navigator, whichever seat the pointer prefers", () => {
    const world = opened();
    untilUnseated(world);
    const l = layout("test");
    const at = undertowFreeCircle(l, CFG, world.cannonCol);
    const touch = deskDown(l, at.x, at.y, [1, 2], (seat) => field(world, seat));
    expect(touch?.player).toBe(2);
    expect(touch?.command).toMatchObject({ target: "undertowFree" });
  });
});

describe("THE UNDERTOW's verdict on a touch", () => {
  it("keeps each ring's verdict under its key, fades it and forgets it on reset", () => {
    const marks = new UndertowMarks();
    marks.ingest([{ type: "undertowPinned", col: 3, on: true }]);
    expect(marks.verdicts.at(3)?.good).toBe(true);
    marks.ingest([{ type: "undertowPinned", col: 5, on: false }]);
    expect(marks.verdicts.at(5)).toBeNull();
    marks.ingest([{ type: "undertowRefuse", col: 4 }]);
    expect(marks.verdicts.at(-1)?.good).toBe(false);
    marks.ingest([{ type: "undertowFreed", col: 4 }]);
    expect(marks.verdicts.at(-1)?.good).toBe(true);
    marks.update(1);
    expect(marks.verdicts.at(-1)).toBeNull();
    marks.ingest([{ type: "undertowFreed", col: 4 }]);
    marks.clear();
    expect(marks.verdicts.at(-1)).toBeNull();
  });

  it("rings each on every screen", () => {
    for (const role of ROLES) {
      for (const key of [2, -1]) {
        for (const good of [true, false]) {
          const v = new GripVerdicts();
          v.mark(key, good);
          const log = drawn(role, (ctx, l) => drawUndertowVerdicts(ctx, l, CFG, 4, v));
          expect(count(log, good ? PALETTE.good : PALETTE.red), role).toBeGreaterThan(0);
        }
      }
    }
  });

  /** Two beats of the floor, `said` on tick 2. */
  function frames(role: ViewRole, said: SimEvent[]): string {
    const log: string[] = [];
    runFrames(opened(), role, TPB * 2, {
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

  it.each(ROLES)("reaches the field's frame, on %s", (role) => {
    const refused: SimEvent[] = [{ type: "undertowRefuse", col: 4 }];
    expect(count(frames(role, refused), PALETTE.red)).toBeGreaterThan(
      count(frames(role, []), PALETTE.red),
    );
  });
});
