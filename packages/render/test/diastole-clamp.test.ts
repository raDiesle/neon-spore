import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type DiastolePhase,
  type DiastoleState,
  diastoleChamberCol,
  diastoleContracts,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { diastoleClampRest, diastoleClampUnder, drawDiastoleClamp } from "../src/diastole-clamp.js";
import { diastoleY, drawDiastole } from "../src/diastole-draw.js";
import { computeLayout, tileCX, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import type { Field } from "../src/touch.js";
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
 * THE DIASTOLE's clamp as a control (`diastole-clamp.ts`): which phase rings
 * the chamber, whose thumb the ring answers, and that the held chamber and
 * the spasm reach the canvas on **every** screen while the ring reaches only
 * the pilot's. The rule itself is the simulation's
 * (`sim/test/diastole-clamp.test.ts`); this file proves the picture hands it
 * a thumb, and hands it to the seat that cannot see the beat.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

function opened(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("diastole");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

/** The boss put into a phase by hand, the left chamber gone where the phase says so. */
function inPhase(phase: DiastolePhase, overrides: Partial<DiastoleState> = {}): DiastoleState {
  const world = opened();
  if (world.boss?.kind !== "diastole") throw new Error("the diastole wave installed no diastole");
  const b = world.boss;
  b.phase = phase;
  if (phase === "alone" || phase === "spasm" || phase === "burst") b.leftHits = 0;
  if (phase === "burst") b.rightHits = 0;
  Object.assign(b, overrides);
  return b;
}

/** A beat of `alone` the right chamber is **not** contracting on, so a squeeze is the clamp's. */
function restingBeat(b: DiastoleState): number {
  for (let beat = b.phaseBeat; beat < b.phaseBeat + 12; beat++) {
    if (!diastoleContracts(b, beat, 1)) return beat;
  }
  throw new Error("the alone chamber contracts on every beat");
}

function fieldWith(seat: 1 | 2, boss: DiastoleState | null): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

function ringStrokes(role: ViewRole, b: DiastoleState, beat = b.phaseBeat): number {
  const { ctx } = stubCanvas();
  const spy = ctx as unknown as CanvasRenderingContext2D;
  drawDiastoleClamp(spy, layout(role), CFG, b, role, beat, 0.5, 1.2);
  return ctx.calls;
}

/** Everything the chambers put on the canvas on one beat, as one string. */
function chambers(role: ViewRole, b: DiastoleState, beat: number): string {
  const log: string[] = [];
  const { ctx } = stubCanvas();
  ctx.log = log;
  drawDiastole(ctx as unknown as CanvasRenderingContext2D, layout(role), CFG, b, beat, 0, 0);
  return log.join("|");
}

describe("the ring", () => {
  it("is the pilot's alone, and only while the chamber beats alone", () => {
    const alone = inPhase("alone");
    expect(ringStrokes("p1", alone)).toBeGreaterThan(0);
    expect(ringStrokes("test", alone)).toBeGreaterThan(0);
    expect(ringStrokes("p2", alone)).toBe(0);
    for (const phase of ["one", "two", "spasm", "burst"] as const) {
      for (const role of ROLES) expect(ringStrokes(role, inPhase(phase)), phase).toBe(0);
    }
  });

  it("is drawn heavier under the thumb, with the dial running out", () => {
    const asked = inPhase("alone");
    const beat = asked.phaseBeat;
    const held = inPhase("alone", { clampBeat: beat, clampUntil: beat + CFG.diastoleClampBeats });
    expect(ringStrokes("p1", held, beat)).toBeGreaterThan(ringStrokes("p1", asked, beat));
  });

  it("rests on the right chamber, where the pilot sees it grey", () => {
    const rest = diastoleClampRest(layout("p1"), CFG);
    expect(rest.x).toBe(tileCX(layout("p1"), diastoleChamberCol(CFG, 1)));
    expect(rest.y).toBe(diastoleY(layout("p1")));
  });
});

describe("the thumb", () => {
  it("is answered for player 1 on the chamber, as a hold that says nothing yet", () => {
    const l = layout("p1");
    const at = diastoleClampRest(l, CFG);
    const touch = diastoleClampUnder(l, at.x, at.y, fieldWith(1, inPhase("alone")));
    expect(touch?.player).toBe(1);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "diastoleChamber",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.hold?.kind).toBe("drag");
  });

  it("is refused from player 2, in every other phase, off the chamber and with no boss", () => {
    const l = layout("p1");
    const at = diastoleClampRest(l, CFG);
    expect(diastoleClampUnder(layout("p2"), at.x, at.y, fieldWith(2, inPhase("alone")))).toBeNull();
    for (const phase of ["one", "two", "spasm", "burst"] as const) {
      expect(diastoleClampUnder(l, at.x, at.y, fieldWith(1, inPhase(phase))), phase).toBeNull();
    }
    // The left chamber is a husk by now and was never the clamp's.
    const left = tileCX(l, diastoleChamberCol(CFG, -1));
    expect(diastoleClampUnder(l, left, at.y, fieldWith(1, inPhase("alone")))).toBeNull();
    expect(diastoleClampUnder(l, at.x, at.y, fieldWith(1, null))).toBeNull();
  });
});

describe("the chamber under it", () => {
  it("is squeezed shut on every screen while the clamp holds, and on none after", () => {
    const free = inPhase("alone");
    const beat = restingBeat(free);
    const held = inPhase("alone", { clampBeat: beat, clampUntil: beat + CFG.diastoleClampBeats });
    // The pilot sees the chamber grey, so the squeeze's rim is the handle's
    // white; the navigator and the test screen own it, so it is the cyan.
    expect(chambers("p1", free, beat)).not.toContain(PALETTE.text);
    expect(chambers("p1", held, beat)).toContain(PALETTE.text);
    for (const role of ["p2", "test"] as const) {
      expect(chambers(role, free, beat), role).not.toContain(PALETTE.cyanRim);
      expect(chambers(role, held, beat), role).toContain(PALETTE.cyanRim);
    }
    // A beat past the window the clamp is still on, and the chamber is not.
    const after = beat + CFG.diastoleClampBeats;
    expect(chambers("p1", held, after)).not.toContain(PALETTE.text);
  });

  it("wears no rim of its own in a spasm, on any screen", () => {
    const spasm = inPhase("spasm");
    for (const role of ROLES) {
      const drawn = chambers(role, spasm, spasm.phaseBeat);
      expect(drawn, role).not.toContain(PALETTE.cyanRim);
      expect(drawn, role).not.toContain(PALETTE.text);
    }
  });
});

describe("on the field", () => {
  for (const role of ROLES) {
    it(`draws the ring, the clamp catching and the spasm for ${role}`, () => {
      const world = opened();
      const tpb = ticksPerBeat(CFG);
      const set = (w: World, f: (b: DiastoleState) => void) => {
        if (w.boss?.kind === "diastole") f(w.boss);
      };
      const { ctx } = runFrames(world, role, tpb * 14, {
        onTick: (tick, w) => {
          step(w, []);
          if (tick === 0) {
            set(w, (b) => {
              b.phase = "alone";
              b.phaseBeat = w.beat;
              b.leftHits = 0;
            });
          }
          // The clamp caught on a beat, and let go two beats on.
          if (tick === tpb * 3) {
            set(w, (b) => {
              b.clampBeat = w.beat;
              b.clampUntil = w.beat + CFG.diastoleClampBeats;
            });
          }
          if (tick === tpb * 5) set(w, (b) => (b.clampBeat = b.clampUntil = -1));
          // And one on the wrong beat: eight beats of shudder.
          if (tick === tpb * 7) {
            set(w, (b) => {
              b.phase = "spasm";
              b.phaseBeat = w.beat;
            });
          }
        },
      });
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
