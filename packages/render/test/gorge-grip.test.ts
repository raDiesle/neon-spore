import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet, GORGE_LEVELS } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GorgeState,
  gorgeBoss,
  gorgeBottom,
  gorgeOffers,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { drawGorgeGrip, gorgeGripCircle, gorgeGripUnder } from "../src/gorge-grip.js";
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
 * THE GORGE's one thumb as a control (`gorge-grip.ts`): which bubble rings,
 * for whose seat, that the ring answers the pilot's tap with the bubble's
 * index on it, that its dial runs out as the taps come, and that it reaches
 * the canvas on the pilot's screen and no other. The rule is the
 * simulation's (`sim/test/gorge-hand.test.ts`); this file proves the picture
 * hands it a thumb.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

/** The first ring of the authored levels, up on a fresh world. */
function opened(): World {
  const world = createWorld(CFG, 5);
  startWave(world, waveWith("gorge"), [], [], { kind: "gorge", levels: GORGE_LEVELS.slice(2) });
  return world;
}

/** The ring, with the bottom bubble's taps and the sack's fields as asked. */
function staged(overrides: Partial<GorgeState> = {}, taps = 0): GorgeState {
  const g = gorgeBoss(opened());
  if (g === null) throw new Error("the gorge wave installed no sack");
  const k = g.intakes[gorgeBottom(g)];
  if (k === undefined) throw new Error("the ring has no bottom");
  k.taps = taps;
  Object.assign(g, overrides);
  return g;
}

/** The wave's own first level: a row, with nothing to tap. */
function rowed(): GorgeState {
  const world = createWorld(CFG, 5);
  const index = waveWith("gorge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const g = gorgeBoss(world);
  if (g === null) throw new Error("the gorge wave installed no sack");
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

describe("which bubble rings", () => {
  it("the ring's bottom one while it is shut, for the pilot alone", () => {
    const g = staged();
    expect(gorgeOffers(g, CFG, 1)).toEqual([gorgeBottom(g)]);
    expect(gorgeOffers(g, CFG, 2)).toEqual([]);
  });

  it("none once it is open, on a row, or once the sack is out", () => {
    expect(gorgeOffers(staged({}, CFG.gorgeOpenTaps), CFG, 1)).toEqual([]);
    expect(gorgeOffers(rowed(), CFG, 1)).toEqual([]);
    expect(gorgeOffers(staged({ outBeat: 9 }), CFG, 1)).toEqual([]);
  });
});

describe("the thumb", () => {
  it("is answered for player 1 on the bottom bubble, with its index on the hold", () => {
    const l = layout("p1");
    const g = staged();
    const i = gorgeBottom(g);
    const at = gorgeGripCircle(l, CFG, g, i, 6, 0.5);
    const touch = gorgeGripUnder(l, at.x, at.y, fieldWith(1, g));
    expect(touch?.player).toBe(1);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "gorgeLobe",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
      id: i,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "gorgeLobe", player: 1, id: i });
  });

  it("is refused from player 2's seat, off the ring, on another bubble, and with no sack up", () => {
    const l = layout("p1");
    const g = staged();
    const i = gorgeBottom(g);
    const at = gorgeGripCircle(l, CFG, g, i, 6, 0.5);
    expect(gorgeGripUnder(l, at.x, at.y, fieldWith(2, g))).toBeNull();
    expect(gorgeGripUnder(l, at.x, at.y + l.tile * 3, fieldWith(1, g))).toBeNull();
    const other = gorgeGripCircle(l, CFG, g, (i + 2) % g.intakes.length, 6, 0.5);
    expect(gorgeGripUnder(l, other.x, other.y, fieldWith(1, g))).toBeNull();
    expect(gorgeGripUnder(l, at.x, at.y, fieldWith(1, null))).toBeNull();
  });

  it("is reached through touchDown, over the field", () => {
    const l = layout("p1");
    const g = staged();
    const i = gorgeBottom(g);
    const at = gorgeGripCircle(l, CFG, g, i, 6, 0.5);
    expect(touchDown(l, at.x, at.y, fieldWith(1, g))?.command).toMatchObject({
      target: "gorgeLobe",
      id: i,
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

describe("the ring", () => {
  it("is the pilot's, and not the navigator's", () => {
    const g = staged();
    expect(strokes("p1", g)).toBeGreaterThan(0);
    expect(strokes("p2", g)).toBe(0);
    expect(strokes("test", g)).toBe(strokes("p1", g));
  });

  it("is nobody's once the bubble is open or the sack is out", () => {
    for (const role of ROLES) {
      expect(strokes(role, staged({}, CFG.gorgeOpenTaps))).toBe(0);
      expect(strokes(role, staged({ outBeat: 9 }))).toBe(0);
    }
  });

  it("carries its dial up to the last tap wanted", () => {
    const shut = strokes("p1", staged({}, 0));
    expect(strokes("p1", staged({}, CFG.gorgeOpenTaps - 1))).toBe(shut);
  });
});

describe("on the field", () => {
  for (const role of ROLES) {
    it(`draws the ring and its taps for ${role}`, () => {
      const world = opened();
      const tpb = ticksPerBeat(CFG);
      const { ctx } = runFrames(world, role, tpb * 12, {
        onTick: (tick, w) => {
          step(w, []);
          if (tick === tpb * 2 && w.boss?.kind === "gorge") {
            const k = w.boss.intakes[gorgeBottom(w.boss)];
            if (k) k.taps = 1;
          }
        },
      });
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
