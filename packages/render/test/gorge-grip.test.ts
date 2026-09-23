import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GorgeState,
  gorgeBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { drawGorgeGrip, gorgeGripCircle, gorgeGripsOf, gorgeGripUnder } from "../src/gorge-grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";
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
 * THE GORGE's two thumbs as controls (`gorge-grip.ts`): which intakes ring
 * for which seat, whose thumb each ring answers, that a held ring is drawn
 * heavier and the pry's dial runs out, and that the rings reach the canvas on
 * the screen they belong to and no other. The rule is the simulation's
 * (`sim/test/gorge-hand.test.ts`); this file proves the picture hands it a
 * thumb, with the intake's index on it.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gorge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

/** The sack with intake 2 full, intake 3 ruptured, and — when asked — a mouth at 5. */
function staged(overrides: Partial<GorgeState> = {}, mouth = false): GorgeState {
  const g = gorgeBoss(opened());
  if (g === null) throw new Error("the gorge wave installed no sack");
  const full = g.intakes[2];
  const torn = g.intakes[3];
  const last = g.intakes[5];
  if (!full || !torn || !last) throw new Error("the sack is short of intakes");
  full.beads = CFG.gorgeFullBeads;
  full.color = "red";
  full.fullBeat = 4;
  torn.ruptured = true;
  if (mouth) {
    last.beads = CFG.gorgeFullBeads;
    last.color = "cyan";
    g.mouth = 5;
    g.ruptures = CFG.gorgeMouthRuptures;
  }
  Object.assign(g, overrides);
  return g;
}

function fieldWith(seat: 1 | 2, boss: GorgeState | null): Field {
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
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("which intakes ring", () => {
  it("the full ones for the pinch, and never the mouth, the torn or the empty", () => {
    expect(gorgeGripsOf(staged(), CFG, 1)).toEqual([2]);
    expect(gorgeGripsOf(staged({}, true), CFG, 1)).toEqual([2]);
    expect(gorgeGripsOf(staged(), CFG, 2)).toEqual([]);
  });

  it("the mouth alone for the pry, once there is one", () => {
    expect(gorgeGripsOf(staged({}, true), CFG, 2)).toEqual([5]);
  });

  it("none once the sack is out", () => {
    const out = staged({ outBeat: 9 }, true);
    expect(gorgeGripsOf(out, CFG, 1)).toEqual([]);
    expect(gorgeGripsOf(out, CFG, 2)).toEqual([]);
  });
});

describe("the thumb", () => {
  it("is answered for player 1 on the full intake, with its index on the hold", () => {
    const l = layout("p1");
    const g = staged();
    const at = gorgeGripCircle(l, CFG, g, 2);
    const touch = gorgeGripUnder(l, at.x, at.y, fieldWith(1, g));
    expect(touch?.player).toBe(1);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "gorgeLobe",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: 2,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "gorgeLobe", player: 1, id: 2 });
  });

  it("is answered for player 2 on the mouth, and refused from the other seat each", () => {
    const g = staged({}, true);
    const p2 = layout("p2");
    const mouth = gorgeGripCircle(p2, CFG, g, 5);
    expect(gorgeGripUnder(p2, mouth.x, mouth.y, fieldWith(2, g))?.command).toMatchObject({ id: 5 });
    expect(gorgeGripUnder(p2, mouth.x, mouth.y, fieldWith(1, g))).toBeNull();
    const full = gorgeGripCircle(p2, CFG, g, 2);
    expect(gorgeGripUnder(p2, full.x, full.y, fieldWith(2, g))).toBeNull();
  });

  it("is refused off the rings, on a filling intake, and with no sack up", () => {
    const l = layout("p1");
    const g = staged();
    const filling = gorgeGripCircle(l, CFG, g, 0);
    expect(gorgeGripUnder(l, filling.x, filling.y, fieldWith(1, g))).toBeNull();
    const at = gorgeGripCircle(l, CFG, g, 2);
    expect(gorgeGripUnder(l, at.x, at.y + l.tile * 3, fieldWith(1, g))).toBeNull();
    expect(gorgeGripUnder(l, at.x, at.y, fieldWith(1, null))).toBeNull();
  });

  it("is reached through touchDown, over the field", () => {
    const l = layout("p1");
    const g = staged();
    const at = gorgeGripCircle(l, CFG, g, 2);
    expect(touchDown(l, at.x, at.y, fieldWith(1, g))?.command).toMatchObject({
      target: "gorgeLobe",
      id: 2,
    });
  });
});

/** Strokes the rings make on a role's screen, for one state. */
function strokes(role: ViewRole, g: GorgeState, beat = 6): number {
  const { ctx } = stubCanvas();
  drawGorgeGrip(
    ctx as unknown as CanvasRenderingContext2D,
    layout(role),
    CFG,
    g,
    role,
    beat,
    0.5,
    1.2,
  );
  return ctx.calls;
}

describe("the rings", () => {
  it("are the pilot's over the full intake and the navigator's over the mouth", () => {
    const spitting = staged();
    expect(strokes("p1", spitting)).toBeGreaterThan(0);
    expect(strokes("p2", spitting)).toBe(0);
    const gorged = staged({}, true);
    expect(strokes("p2", gorged)).toBeGreaterThan(0);
    expect(strokes("test", gorged)).toBeGreaterThan(strokes("p1", gorged));
    expect(strokes("test", gorged)).toBeGreaterThan(strokes("p2", gorged));
  });

  it("are nobody's once the sack is out", () => {
    for (const role of ROLES) expect(strokes(role, staged({ outBeat: 9 }, true))).toBe(0);
  });

  it("are drawn heavier under the thumb, and the pry's dial runs out", () => {
    expect(strokes("p1", staged({ pinch: 2 }))).toBeGreaterThan(strokes("p1", staged()));
    const pried = staged({ pry: 5, pryBeat: 6 }, true);
    expect(strokes("p2", pried, 6)).toBeGreaterThan(strokes("p2", staged({}, true), 6));
    // Past the window the dial is empty, and only the filled ring is left.
    expect(strokes("p2", pried, 6 + CFG.gorgePryBeats)).toBeLessThan(strokes("p2", pried, 6));
  });
});

describe("on the field", () => {
  for (const role of ROLES) {
    it(`draws the rings, the pinch and the pry for ${role}`, () => {
      const world = opened();
      const tpb = ticksPerBeat(CFG);
      const set = (w: World, f: (g: GorgeState) => void) => {
        if (w.boss?.kind === "gorge") f(w.boss);
      };
      const { ctx } = runFrames(world, role, tpb * 12, {
        onTick: (tick, w) => {
          step(w, []);
          if (tick === tpb * 2) {
            set(w, (g) => {
              const k = g.intakes[2];
              if (k)
                Object.assign(k, { beads: CFG.gorgeFullBeads, color: "red", fullBeat: w.beat });
              g.pinch = 2;
            });
          }
          if (tick === tpb * 6) {
            set(w, (g) => {
              const k = g.intakes[5];
              if (k) Object.assign(k, { beads: CFG.gorgeFullBeads, color: "cyan" });
              g.mouth = 5;
              g.ruptures = CFG.gorgeMouthRuptures;
              g.pry = 5;
              g.pryBeat = w.beat;
            });
          }
        },
      });
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
