import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type MirrorState,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { drawMirrorGrip, mirrorLobeCircle, mirrorLobeUnder } from "../src/mirror-grip.js";
import { MirrorGripFx } from "../src/mirror-grip-fx.js";
import { type Field, type Hold, touchDown, touchUp } from "../src/touch.js";
import { shipHand } from "../src/touch-hand.js";
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
 * THE MIRROR's lobes as a control (`mirror-grip.ts`): which seat's thumb each
 * answers under which gesture, that a lift carries how far the thumb went so
 * the sim can read a carry off it, and that the rings, the pin and the count
 * reach the canvas on the screen they belong to and no other. The rule is the
 * simulation's (`sim/test/mirror-gestures.test.ts`); this file proves the
 * picture hands it a thumb.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The last round, listening: `reflect`. */
function mirror(overrides: Partial<MirrorState> = {}): MirrorState {
  return {
    kind: "mirror",
    rounds: [["guard"], ["cannonLeft", "guard", "fireRed"]],
    round: 1,
    phase: "listen",
    phaseBeat: 4,
    matched: 0,
    shown: 3,
    // Its cannon two columns off the pair's, so its two lobes stand apart
    // and a press on one is not inside the other's circle as well.
    cannonCol: 2,
    hullMilli: 100_000,
    scars: [],
    verdict: 0,
    verdictCol: -1,
    holdThumbs: 0,
    holdBeat: -1,
    ...overrides,
  };
}

const hold = (overrides: Partial<MirrorState> = {}) => mirror({ phase: "hold", ...overrides });

function fieldWith(seat: 1 | 2, boss: MirrorState | null): Field {
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

const lobe = (l: ReturnType<typeof layout>, id: 0 | 1) =>
  mirrorLobeCircle(l, DEFAULT_CONFIG, id, id === 0 ? 2 : 4);

describe("a thumb on a lobe", () => {
  it("under reflect: player 1 has both, player 2 its cannon", () => {
    const l = layout("p1");
    for (const id of [0, 1] as const) {
      const at = lobe(l, id);
      const touch = mirrorLobeUnder(l, at.x, at.y, fieldWith(1, mirror()));
      expect(touch?.command).toEqual({
        kind: "drag",
        target: "mirrorLobe",
        on: true,
        fromMilli: 0,
        fromYMilli: 0,
        id,
      });
      expect(touch?.hold).toMatchObject({
        kind: "drag",
        target: "mirrorLobe",
        player: 1,
        carryMilli: DEFAULT_CONFIG.mirrorCarryMilli,
      });
    }
    const p2 = layout("p2");
    const cannon = lobe(p2, 0);
    const shield = lobe(p2, 1);
    expect(mirrorLobeUnder(p2, cannon.x, cannon.y, fieldWith(2, mirror()))?.player).toBe(2);
    expect(mirrorLobeUnder(p2, shield.x, shield.y, fieldWith(2, mirror()))).toBeNull();
  });

  it("under hold: one lobe each, and the hold is a pin", () => {
    const l = layout("p1");
    const cannon = lobe(l, 0);
    const shield = lobe(l, 1);
    expect(mirrorLobeUnder(l, cannon.x, cannon.y, fieldWith(1, hold()))?.hold).toMatchObject({
      pin: true,
      id: 0,
    });
    expect(mirrorLobeUnder(l, shield.x, shield.y, fieldWith(1, hold()))).toBeNull();
    expect(mirrorLobeUnder(l, shield.x, shield.y, fieldWith(2, hold()))?.hold).toMatchObject({
      pin: true,
      id: 1,
    });
    expect(mirrorLobeUnder(l, cannon.x, cannon.y, fieldWith(2, hold()))).toBeNull();
  });

  it("is refused under an ordinary round, while it demonstrates, and with no mirror up", () => {
    const l = layout("p1");
    const at = lobe(l, 0);
    expect(mirrorLobeUnder(l, at.x, at.y, fieldWith(1, mirror({ round: 0 })))).toBeNull();
    expect(mirrorLobeUnder(l, at.x, at.y, fieldWith(1, mirror({ phase: "show" })))).toBeNull();
    expect(mirrorLobeUnder(l, at.x, at.y, fieldWith(1, null))).toBeNull();
  });

  it("is reached through touchDown, over the field", () => {
    const l = layout("p1");
    const at = lobe(l, 0);
    expect(touchDown(l, at.x, at.y, fieldWith(1, mirror()))?.command).toMatchObject({
      target: "mirrorLobe",
    });
  });
});

describe("the lift", () => {
  const l = layout("p1");
  const field = fieldWith(1, mirror());
  const at = lobe(l, 0);
  const down = () => touchDown(l, at.x, at.y, field)?.hold as Hold;

  it("carries how far the thumb went, in thousandths of a tile", () => {
    const carry = (DEFAULT_CONFIG.mirrorCarryMilli / 1000) * l.tile;
    const left = touchUp(l, down(), { x: at.x - carry, y: at.y });
    expect(left?.command).toMatchObject({ target: "mirrorLobe", on: false, fromMilli: -500 });
    const still = touchUp(l, down(), { x: at.x + 2, y: at.y })?.command;
    expect(still).toMatchObject({ target: "mirrorLobe", on: false });
    const fromMilli = still?.kind === "drag" ? still.fromMilli : Number.NaN;
    expect(Math.abs(fromMilli)).toBeLessThan(DEFAULT_CONFIG.mirrorCarryMilli);
  });

  it("lights the hand's readout at the sim's own threshold", () => {
    const carry = (DEFAULT_CONFIG.mirrorCarryMilli / 1000) * l.tile;
    const p1 = down();
    expect(shipHand(l, p1, at.x, at.y, true)).toMatchObject({
      on: "cannon",
      marks: ["slide", "suck"],
      mirror: true,
    });
    expect(shipHand(l, p1, at.x + carry, at.y, true)).toMatchObject({ marks: ["slide"] });
    const p2 = touchDown(layout("p2"), at.x, at.y, fieldWith(2, mirror()))?.hold as Hold;
    expect(shipHand(l, p2, at.x, at.y, true)).toMatchObject({ on: "muzzle", color: null });
    expect(shipHand(l, p2, at.x - carry, at.y, true)).toMatchObject({ color: "red" });
    expect(shipHand(l, p2, at.x + carry, at.y, true)).toMatchObject({ color: "cyan" });
    const pin = touchDown(l, at.x, at.y, fieldWith(1, hold()))?.hold as Hold;
    expect(shipHand(l, pin, at.x + carry, at.y, true)).toMatchObject({ marks: [], color: null });
  });
});

/** Strokes the grip makes on a role's screen, for one state. */
function strokes(role: ViewRole, m: MirrorState, beat = 6): number {
  const { ctx } = stubCanvas();
  const spy = ctx as unknown as CanvasRenderingContext2D;
  drawMirrorGrip(spy, layout(role), DEFAULT_CONFIG, m, 4, beat, 0.5, 1.2);
  return ctx.calls;
}

describe("the rings", () => {
  it("are nobody's under an ordinary round or while it demonstrates", () => {
    for (const role of ROLES) {
      expect(strokes(role, mirror({ round: 0 }))).toBe(0);
      expect(strokes(role, mirror({ phase: "show" }))).toBe(0);
    }
  });

  it("ring two lobes for player 1 and one for player 2 under reflect", () => {
    expect(strokes("p1", mirror())).toBeGreaterThan(strokes("p2", mirror()));
    expect(strokes("p2", mirror())).toBeGreaterThan(0);
    expect(strokes("test", mirror())).toBe(strokes("p1", mirror()));
  });

  it("fill this seat's own lobe under its own thumb, and never the other's", () => {
    const own = strokes("p1", hold({ holdThumbs: 1 }));
    const theirs = strokes("p1", hold({ holdThumbs: 2 }));
    expect(own).toBeGreaterThan(strokes("p1", hold()));
    expect(theirs).toBe(strokes("p1", hold()));
    expect(strokes("p2", hold({ holdThumbs: 2 }))).toBeGreaterThan(strokes("p2", hold()));
    expect(strokes("p2", hold({ holdThumbs: 1 }))).toBe(strokes("p2", hold()));
  });

  it("show the count on both screens once both thumbs are down", () => {
    for (const role of ROLES) {
      const counting = strokes(role, hold({ holdThumbs: 3, holdBeat: 5 }));
      expect(counting).toBeGreaterThan(strokes(role, hold({ holdThumbs: 3 })));
    }
  });
});

describe("the pin landing", () => {
  it("throws a ring off both lobes, then fades", () => {
    const fx = new MirrorGripFx();
    const draw = () => {
      const { ctx } = stubCanvas();
      fx.draw(ctx as unknown as CanvasRenderingContext2D, layout("p1"), DEFAULT_CONFIG, hold(), 4);
      return ctx.calls;
    };
    expect(draw()).toBe(0);
    fx.ingest([{ type: "mirrorGrip", col: 4, on: true }]);
    expect(draw()).toBeGreaterThan(0);
    fx.update(1);
    expect(draw()).toBe(0);
    fx.ingest([{ type: "mirrorGrip", col: 4, on: false }]);
    fx.clear();
    expect(draw()).toBe(0);
  });
});

describe("on the field", () => {
  for (const role of ROLES) {
    it(`draws the last round's rings, the pin and the count for ${role}`, () => {
      const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
      const index = waveWith("mirror");
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      const tpb = ticksPerBeat(CFG);
      const set = (w: World, f: (m: MirrorState) => void) => {
        if (w.boss?.kind === "mirror") f(w.boss);
      };
      const { ctx } = runFrames(world, role, tpb * 12, {
        onTick: (tick, w) => {
          step(w, []);
          // Straight to the last round, listening; then the pin, both thumbs
          // — set rather than waited for, as the queen's test does it.
          if (tick === tpb * 2) {
            set(w, (m) => {
              m.round = m.rounds.length - 1;
              m.phase = "listen";
              m.phaseBeat = w.beat;
            });
          }
          if (tick === tpb * 6) {
            set(w, (m) => {
              m.phase = "hold";
              m.phaseBeat = w.beat;
              m.hullMilli = 0;
            });
          }
          if (tick === tpb * 8) {
            step(w, [
              {
                tick,
                player: 1,
                command: { kind: "drag", target: "mirrorLobe", on: true, fromMilli: 0, id: 0 },
              },
              {
                tick,
                player: 2,
                command: { kind: "drag", target: "mirrorLobe", on: true, fromMilli: 0, id: 1 },
              },
            ]);
          }
        },
      });
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }
});
