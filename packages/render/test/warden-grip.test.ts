import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  NO_TETHER,
  startWave,
  step,
  ticksPerBeat,
  WARDEN_PHASES,
  type WardenState,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { type Field, type Hold, touchDown, touchUp } from "../src/touch.js";
import { drawWardenGrip, wardenGripCircle, wardenGripUnder } from "../src/warden-grip.js";
import { WardenGripFx } from "../src/warden-grip-fx.js";
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
 * THE WARDEN's eye as a control (`warden-grip.ts`): which seat's thumb the
 * one circle answers under which phase, that the swipe's lift carries how far
 * the thumb went, and that the ring, the dial and the thrown rings reach the
 * canvas on the screen they belong to and no other. The rule is the
 * simulation's (`sim/test/warden-hand.test.ts`); this file proves the picture
 * hands it a thumb.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);
/** The plates each phase starts on: the bound the phase before is still over. */
const NARROW = WARDEN_PHASES[0]!.above;
const GLARE = WARDEN_PHASES[1]!.above;

/** The wave, stepped until a rope has come down, so a thumb has a fight to land in. */
function opened(plates: number): { world: World; b: WardenState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("warden");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "warden") throw new Error("the warden's wave installed no warden");
  b.plates = plates;
  let guard = 0;
  while (b.tetherId === NO_TETHER && guard++ < 60 * ticksPerBeat(CFG)) step(world, []);
  return { world, b };
}

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

const body = (world: World, b: WardenState) => {
  const c = world.creatures.find((c) => c.id === b.creatureId);
  if (c === undefined) throw new Error("the warden has no body");
  return c;
};

describe("a thumb on the eye", () => {
  it("is player 2's under NARROW, a hold on the shut eye", () => {
    const { world, b } = opened(NARROW);
    const l = layout("p2");
    const at = wardenGripCircle(l, body(world, b), b);
    const touch = wardenGripUnder(l, at.x, at.y, fieldOf(world, 2));
    expect(touch?.player).toBe(2);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "wardenEye",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "wardenEye", player: 2 });
    expect(wardenGripUnder(layout("p1"), at.x, at.y, fieldOf(world, 1))).toBeNull();
  });

  it("is player 1's under GLARE, on the hatch", () => {
    const { world, b } = opened(GLARE);
    const l = layout("p1");
    const at = wardenGripCircle(l, body(world, b), b);
    const touch = wardenGripUnder(l, at.x, at.y, fieldOf(world, 1));
    expect(touch?.command).toMatchObject({ target: "wardenHatch", on: true });
    expect(wardenGripUnder(layout("p2"), at.x, at.y, fieldOf(world, 2))).toBeNull();
  });

  it("is nobody's under WATCH, off the eye, and with no boss", () => {
    const { world, b } = opened(NARROW + 1);
    const l = layout("p2");
    const at = wardenGripCircle(l, body(world, b), b);
    expect(wardenGripUnder(l, at.x, at.y, fieldOf(world, 2))).toBeNull();
    expect(wardenGripUnder(l, at.x, at.y, fieldOf(world, 1))).toBeNull();
    b.plates = NARROW;
    expect(wardenGripUnder(l, at.x, at.y + at.r * 3, fieldOf(world, 2))).toBeNull();
    expect(wardenGripUnder(l, at.x, at.y, { ...fieldOf(world, 2), boss: null })).toBeNull();
  });

  it("is reached through touchDown, over the field", () => {
    const { world, b } = opened(NARROW);
    const l = layout("p2");
    const at = wardenGripCircle(l, body(world, b), b);
    expect(touchDown(l, at.x, at.y, fieldOf(world, 2))?.command).toMatchObject({
      target: "wardenEye",
    });
  });
});

describe("the swipe's lift", () => {
  it("carries how far the thumb went, in thousandths of a tile", () => {
    const { world, b } = opened(GLARE);
    const l = layout("p1");
    const field = fieldOf(world, 1);
    const at = wardenGripCircle(l, body(world, b), b);
    const down = () => touchDown(l, at.x, at.y, field)?.hold as Hold;
    const swipe = (DEFAULT_CONFIG.wardenThrowMilli / 1000) * l.tile;
    const thrown = touchUp(l, down(), field, { x: at.x + swipe, y: at.y });
    expect(thrown?.command).toMatchObject({
      target: "wardenHatch",
      on: false,
      fromMilli: DEFAULT_CONFIG.wardenThrowMilli,
    });
    // And the thumb's lift under NARROW says only that it let go.
    b.plates = NARROW;
    const p2 = fieldOf(world, 2);
    const held = touchDown(layout("p2"), at.x, at.y, p2)?.hold as Hold;
    const lifted = touchUp(layout("p2"), held, p2, { x: at.x + swipe, y: at.y });
    expect(lifted?.command).toMatchObject({ target: "wardenEye", on: false, fromMilli: 0 });
  });
});

/** Strokes the grip makes on a role's screen, for one state. */
function strokes(role: ViewRole, world: World, b: WardenState): number {
  const { ctx } = stubCanvas();
  const spy = ctx as unknown as CanvasRenderingContext2D;
  drawWardenGrip(spy, layout(role), CFG, world, body(world, b), b, role, 0.5, 1.2);
  return ctx.calls;
}

describe("the ring", () => {
  it("is nobody's under WATCH", () => {
    const { world, b } = opened(NARROW + 1);
    for (const role of ROLES) expect(strokes(role, world, b), role).toBe(0);
  });

  it("is the navigator's under NARROW, and fills under her thumb", () => {
    const { world, b } = opened(NARROW);
    expect(strokes("p1", world, b)).toBe(0);
    const asked = strokes("p2", world, b);
    expect(asked).toBeGreaterThan(0);
    expect(strokes("test", world, b)).toBe(asked);
    b.eyeHeld = true;
    expect(strokes("p2", world, b)).toBeGreaterThan(asked);
  });

  it("is the pilot's under GLARE until the throw, then a dial on both", () => {
    const { world, b } = opened(GLARE);
    expect(strokes("p2", world, b)).toBe(0);
    const asked = strokes("p1", world, b);
    expect(asked).toBeGreaterThan(0);
    b.throwBeat = world.beat;
    for (const role of ROLES) expect(strokes(role, world, b), role).toBeGreaterThan(0);
    // The window shut: the dial is gone and the ring is back.
    world.beat += CFG.wardenThrowBeats;
    expect(strokes("p1", world, b)).toBe(asked);
    expect(strokes("p2", world, b)).toBe(0);
  });
});

describe("the thumb, the throw and the slam", () => {
  it("each throw a ring off the eye, then fade", () => {
    const fx = new WardenGripFx();
    const eye = { x: 100, y: 100, r: 20 };
    const draw = () => {
      const log: string[] = [];
      const { ctx } = stubCanvas();
      ctx.log = log;
      fx.draw(ctx as unknown as CanvasRenderingContext2D, eye);
      return { calls: ctx.calls, log: log.join("|") };
    };
    expect(draw().calls).toBe(0);
    fx.ingest([{ type: "wardenHold", col: 4 }]);
    expect(draw().log).toContain(PALETTE.text);
    fx.update(1);
    expect(draw().calls).toBe(0);
    fx.ingest([{ type: "wardenSlam", col: 4 }]);
    expect(draw().log).toContain(PALETTE.rockDark);
    fx.ingest([{ type: "wardenThrow", col: 4 }]);
    fx.clear();
    expect(draw().calls).toBe(0);
  });
});

describe("on the field", () => {
  for (const role of ROLES) {
    it(`draws the thumb's ring, the swipe's, the dial and the slam for ${role}`, () => {
      const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
      const index = waveWith("warden");
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      const tpb = ticksPerBeat(CFG);
      const set = (w: World, f: (b: WardenState) => void) => {
        if (w.boss?.kind === "warden") f(w.boss);
      };
      const { ctx } = runFrames(world, role, tpb * 20, {
        onTick: (tick, w) => {
          step(w, []);
          // Straight to NARROW; a rope comes down on the cycle's beat, and
          // the thumb lands two beats on — set rather than waited for.
          if (tick === 0) set(w, (b) => (b.plates = NARROW));
          if (tick === tpb * 3) {
            step(w, [
              {
                tick,
                player: 2,
                command: { kind: "drag", target: "wardenEye", on: true, fromMilli: 0 },
              },
            ]);
          }
          // Then GLARE, and the swipe: the throw, the dial and the slam.
          if (tick === tpb * 8) set(w, (b) => (b.plates = GLARE));
          if (tick === tpb * 10) {
            const swipe = { kind: "drag", target: "wardenHatch", fromMilli: 0 } as const;
            step(w, [{ tick, player: 1, command: { ...swipe, on: true } }]);
            step(w, [
              {
                tick: tick + 1,
                player: 1,
                command: { ...swipe, on: false, fromMilli: CFG.wardenThrowMilli },
              },
            ]);
          }
        },
      });
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
