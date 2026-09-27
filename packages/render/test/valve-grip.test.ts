import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  NO_BEARING,
  startWave,
  step,
  type ValvePhase,
  type ValveState,
  valveBoss,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchMove } from "../src/touch.js";
import { valveLivePinCircle, valveSocketCircle, valveWheelCircle } from "../src/valve-grip.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE VALVE**, and what the simulation cannot be asked:
 * whether the wheel and the pin the picture draws are where a press is
 * taken, which seat each takes, what the press says in each phase, and
 * whether a draw down off the live pin, sent on, is the one that pulls it.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The drum hung, in `phase`, every pin in unless `pins` says otherwise. */
function hung(phase: ValvePhase, pins = 3): { world: World; s: ValveState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("valve");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = valveBoss(world);
  if (s === null) throw new Error("the valve wave hung no drum");
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.pins = pins;
  return { world, s };
}

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: BEAT_PHASE,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function press(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

const wheel = (w: World, s: ValveState, role: ViewRole) =>
  valveWheelCircle(layout(role), CFG, s, w.beat, BEAT_PHASE);
const socket = (w: World, s: ValveState, role: ViewRole) =>
  valveSocketCircle(layout(role), CFG, s, w.beat, BEAT_PHASE);

describe("a thumb on THE VALVE's wheel", () => {
  it.each(ROLES)(
    "takes the pilot's press while it turns or holds, a bearing about its hub, on %s",
    (role) => {
      for (const phase of ["turn", "hold"] as const) {
        const { world, s } = hung(phase);
        const touch = press(world, role, 1, wheel(world, s, role));
        expect(touch?.command).toEqual({
          kind: "drag",
          target: "valveWheel",
          on: true,
          fromMilli: NO_BEARING,
        });
        expect(touch?.hold).toMatchObject({ kind: "drag", turns: true });
      }
    },
  );

  it("leaves the navigator's press on it to whatever is behind", () => {
    const { world, s } = hung("turn");
    expect(target(press(world, "p2", 2, wheel(world, s, "p2")))).not.toBe("valveWheel");
  });

  it("takes no hand frozen, in the story, or before a mark is lit", () => {
    for (const phase of ["still", "frozen", "jet", "brace", "wipe", "seal", "list"] as const) {
      const { world, s } = hung(phase, phase === "still" || phase === "frozen" ? 3 : 2);
      expect(target(press(world, "p1", 1, wheel(world, s, "p1")))).not.toBe("valveWheel");
    }
  });

  it("turns the wheel as a thumb goes round the hub", () => {
    const { world, s } = hung("turn");
    const l = layout("test");
    const c = wheel(world, s, "test");
    const down = press(world, "test", 1, c);
    if (down?.hold == null) throw new Error("the wheel took no hold");
    const top = touchMove(l, down.hold, c.x, c.y - c.r * 0.6);
    const right = touchMove(l, down.hold, c.x + c.r * 0.6, c.y);
    if (top?.command == null || right?.command == null) throw new Error("a move said nothing");
    step(world, [{ tick: world.tick, player: 1, command: top.command }]);
    step(world, [{ tick: world.tick, player: 1, command: right.command }]);
    expect(s.travelMilli).toBe(250);
  });
});

describe("a thumb on THE VALVE's pin", () => {
  it.each(ROLES)("takes either seat's tap on the socket while the wheel holds, on %s", (role) => {
    const { world, s } = hung("hold");
    for (const seat of [1, 2] as const) {
      const touch = press(world, role, seat, socket(world, s, role));
      expect(touch?.player).toBe(seat);
      expect(touch?.command).toEqual({
        kind: "drag",
        target: "valvePin",
        on: true,
        fromMilli: 0,
        fromYMilli: 0,
      });
    }
  });

  it("freezes the wheel on the navigator's tap, and on the pilot's does nothing", () => {
    const { world, s } = hung("hold");
    const pilot = press(world, "test", 1, socket(world, s, "test"));
    if (pilot?.command == null) throw new Error("the pilot's tap fell through");
    step(world, [{ tick: world.tick, player: 1, command: pilot.command }]);
    expect(s.phase).toBe("hold");
    const nav = press(world, "test", 2, socket(world, s, "test"));
    if (nav?.command == null) throw new Error("the navigator's tap fell through");
    step(world, [{ tick: world.tick, player: 2, command: nav.command }]);
    expect(s.phase).toBe("frozen");
  });

  it("pulls the live pin on a draw down past valvePullMilli, and not on a shorter one", () => {
    const { world, s } = hung("frozen");
    const l = layout("test");
    const pin = valveLivePinCircle(l, CFG, s, world.beat, BEAT_PHASE);
    if (pin === null) throw new Error("no live pin while frozen");
    const down = press(world, "test", 1, pin);
    if (down?.hold == null || down.command == null) throw new Error("the pin took no hold");
    step(world, [{ tick: world.tick, player: 1, command: down.command }]);
    const short = touchMove(l, down.hold, pin.x, pin.y + (CFG.valvePullMilli / 2000) * l.tile);
    if (short?.command == null) throw new Error("a move said nothing");
    step(world, [{ tick: world.tick, player: 1, command: short.command }]);
    expect(s.pins).toBe(3);
    const far = touchMove(l, down.hold, pin.x, pin.y + (CFG.valvePullMilli / 900) * l.tile);
    if (far?.command == null) throw new Error("a move said nothing");
    step(world, [{ tick: world.tick, player: 1, command: far.command }]);
    expect(s.pins).toBe(2);
  });

  it("offers the live pin only while frozen", () => {
    const l = layout("test");
    for (const phase of ["hold", "turn", "jet"] as const) {
      const { world, s } = hung(phase);
      expect(valveLivePinCircle(l, CFG, s, world.beat, BEAT_PHASE)).toBeNull();
    }
  });

  it("is a rubbing thumb in the wipe, saying nothing until it turns", () => {
    const { world, s } = hung("wipe", 1);
    const touch = press(world, "p2", 2, socket(world, s, "p2"));
    expect(touch?.command).toBeNull();
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "valvePin", rub: true });
  });

  it("takes no hand while the wheel turns, before the drum is hung, or once it is open", () => {
    for (const phase of ["still", "turn", "list", "open"] as const) {
      const { world, s } = hung(phase, phase === "open" ? 0 : 3);
      for (const seat of [1, 2] as const) {
        expect(target(press(world, "p1", seat, socket(world, s, "p1")))).not.toBe("valvePin");
      }
    }
  });
});
