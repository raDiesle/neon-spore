import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  NO_SHELL,
  type QueenState,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { queenMarkCenter } from "../src/queen-figure.js";
import { drawQueenGrip, queenAsks, queenMarkUnder } from "../src/queen-grip.js";
import type { Field } from "../src/touch.js";
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
 * THE BULB QUEEN's marks as a control (`queen-grip.ts`): which phases ring
 * them, whose thumb the ring answers, and that the three states — asked,
 * pried, held — reach the canvas on the screen they belong to, and only
 * there. The rule itself is the simulation's (`sim/test/queen-gestures.test.ts`);
 * this file proves the picture hands it a thumb.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function queenAt(color: Creature["color"] = null, petals = 6): Creature {
  return {
    id: 3,
    kind: "queen",
    col: 5,
    row: 2,
    fromRow: 2,
    color,
    holes: 0,
    petals,
    dragMilli: 0,
    shell: NO_SHELL,
  };
}

/** BROOD, a window announced and nothing pried yet. */
function brood(overrides: Partial<QueenState> = {}): QueenState {
  return {
    kind: "queen",
    creatureId: 3,
    phase: 1,
    phaseBeat: 0,
    tellCol: 5,
    tellColor: "red",
    weakSide: 1,
    pickBeat: 0,
    spentSide: 0,
    openBeat: 6,
    closeBeat: 8,
    pryBeat: -1,
    holdSide: 0,
    startPetals: 9,
    dropSide: 1,
    releaseBeat: -1,
    releaseSide: 0,
    scratch: [1, 1],
    ...overrides,
  };
}

function fieldWith(seat: 1 | 2, boss: QueenState | null, queen = queenAt()): Field {
  return {
    creatures: [queen],
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

describe("what her picture asks", () => {
  it("is nothing in CROWN, a pry in BROOD's window, a hold in SCREAM's", () => {
    expect(queenAsks(brood({ phase: 0 }), queenAt())).toBeNull();
    expect(queenAsks(brood(), queenAt())).toBe("pry");
    expect(queenAsks(brood({ phase: 2 }), queenAt(null, 3))).toBe("hold");
    expect(queenAsks(brood({ phase: 2 }), queenAt("red", 3))).toBe("hold");
  });

  it("is nothing between windows, and nothing once the mark is pried", () => {
    expect(queenAsks(brood({ openBeat: -1, closeBeat: -1 }), queenAt())).toBeNull();
    expect(queenAsks(brood({ pryBeat: 6 }), queenAt("red"))).toBeNull();
  });
});

describe("a thumb on a mark", () => {
  it("is player 1's, and names the mark it landed on", () => {
    const l = layout("p1");
    for (const side of [-1, 1] as const) {
      const at = queenMarkCenter(l, queenAt(), side);
      const touch = queenMarkUnder(l, at.x, at.y, fieldWith(1, brood()));
      expect(touch?.command).toEqual({
        kind: "drag",
        target: "queenMark",
        on: true,
        fromMilli: 0,
        fromYMilli: 0,
        id: side === -1 ? 0 : 1,
      });
      expect(touch?.hold).toMatchObject({ kind: "drag", target: "queenMark", player: 1 });
    }
  });

  it("is refused from player 2, in CROWN, between windows and with no queen up", () => {
    const l = layout("p2");
    const at = queenMarkCenter(l, queenAt(), 1);
    expect(queenMarkUnder(l, at.x, at.y, fieldWith(2, brood()))).toBeNull();
    const p1 = layout("p1");
    const on = queenMarkCenter(p1, queenAt(), 1);
    expect(queenMarkUnder(p1, on.x, on.y, fieldWith(1, brood({ phase: 0 })))).toBeNull();
    expect(queenMarkUnder(p1, on.x, on.y, fieldWith(1, brood({ openBeat: -1 })))).toBeNull();
    expect(queenMarkUnder(p1, on.x, on.y, fieldWith(1, null))).toBeNull();
  });

  it("misses her own column, where nothing stands between the marks", () => {
    const l = layout("p1");
    const left = queenMarkCenter(l, queenAt(), -1);
    const right = queenMarkCenter(l, queenAt(), 1);
    expect(queenMarkUnder(l, (left.x + right.x) / 2, left.y, fieldWith(1, brood()))).toBeNull();
  });
});

/** Strokes the grip makes on a role's screen, for one state. */
function strokes(role: ViewRole, boss: QueenState, queen: Creature, beat = 6): number {
  const { ctx } = stubCanvas();
  const spy = ctx as unknown as CanvasRenderingContext2D;
  drawQueenGrip(spy, layout(role), DEFAULT_CONFIG, queen, boss, beat, 0.5, 1.2, 0, 0);
  return ctx.calls;
}

describe("the rings", () => {
  it("are player 1's alone while she asks, and nobody's between windows", () => {
    expect(strokes("p1", brood(), queenAt())).toBeGreaterThan(0);
    expect(strokes("test", brood(), queenAt())).toBeGreaterThan(0);
    expect(strokes("p2", brood(), queenAt())).toBe(0);
    for (const role of ROLES) expect(strokes(role, brood({ openBeat: -1 }), queenAt())).toBe(0);
  });

  it("show the pry landing on every screen, for the beat after", () => {
    const pried = brood({ pryBeat: 6 });
    for (const role of ROLES) expect(strokes(role, pried, queenAt("red"), 6)).toBeGreaterThan(0);
    expect(strokes("p2", pried, queenAt("red"), 8)).toBe(0);
  });

  it("draw the held mark heavier than the asked one, with the dial on it", () => {
    const asked = strokes("p1", brood({ phase: 2 }), queenAt("red", 3));
    const held = strokes("p1", brood({ phase: 2, holdSide: 1 }), queenAt("red", 3));
    expect(held).toBeGreaterThan(asked);
  });
});

describe("on the field", () => {
  for (const role of ROLES) {
    it(`draws BROOD's window, the pry and SCREAM's hold for ${role}`, () => {
      const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
      const index = waveWith("queen");
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      const tpb = ticksPerBeat(CFG);
      const set = (w: World, f: (boss: QueenState, queen: Creature) => void) => {
        const boss = w.boss;
        const queen = w.creatures.find((c) => c.kind === "queen");
        if (boss?.kind === "queen" && queen) f(boss, queen);
      };
      const { ctx } = runFrames(world, role, tpb * 12, {
        onTick: (tick, w) => {
          step(w, []);
          // BROOD: the petals put her there (`PHASES` in `sim/queen-mark.ts`,
          // above 4 and not above 7), the window is set by hand rather than
          // waited for, and the pry lands a beat in.
          if (tick === 0) set(w, (_, q) => (q.petals = 6));
          if (tick === tpb * 2) {
            set(w, (b) => {
              b.openBeat = w.beat + 1;
              b.closeBeat = w.beat + 3;
            });
          }
          if (tick === tpb * 3 + 2) {
            set(w, (b, q) => {
              q.color = b.tellColor;
              b.pryBeat = w.beat;
            });
          }
          // SCREAM, held on the real mark.
          if (tick === tpb * 7) set(w, (_, q) => (q.petals = 3));
          if (tick === tpb * 9) {
            set(w, (b, q) => {
              b.openBeat = w.beat;
              b.closeBeat = w.beat + 1;
              q.color = b.tellColor;
              b.holdSide = b.weakSide;
            });
          }
        },
      });
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
