import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  VALVE_PINS,
  type ValvePhase,
  valveBoss,
  valveMark,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { ValveFx } from "../src/valve-fx.js";
import { valveCentre, valveHoleCentre, valveSparkPoint } from "../src/valve-shape.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE VALVE leaves behind a frame (`valve-fx.ts`): the clamp round the
 * frozen wheel, the flare in a pulled pin's slot, the kick off a mark, the
 * hull's shudder, and where its receipts are thrown. `valve-frame.test.ts`
 * has the poses read off the world; this file has what the events add to
 * them, on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);
const BEAT = 0.5;
const at = <T extends SimEvent["type"]>(type: T) => ({ type, col: MID }) as SimEvent;
const pull = (pins: number): SimEvent => ({ type: "valvePull", pins, col: MID });

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: ValveFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

function settle(fx: ValveFx): void {
  for (let i = 0; i < 120; i++) fx.update(1 / 60);
}

describe("THE VALVE's transients", () => {
  it("clamps the wheel as the tap freezes it, and that is a step landed", () => {
    const fx = new ValveFx();
    said(fx, [at("valveFreeze")]);
    expect(fx.clamp).toBe(1);
    expect(fx.hurt.value).toBe(1);
    settle(fx);
    expect(fx.clamp).toBe(0);
    expect(fx.hurt.value).toBe(0);
  });

  it("flares the slot the pin just left, where it is, and deals the blow", () => {
    const fx = new ValveFx();
    const [first] = said(fx, [pull(VALVE_PINS - 1)]);
    const c = valveCentre(L, CFG);
    const hole = valveHoleCentre(L, 0, VALVE_PINS);
    expect(first).toMatchObject({ x: c.x + hole.x, y: c.y + hole.y });
    expect(fx.slot).toEqual({ i: 0, now: 1 });
    expect(fx.hurt.value).toBe(1);
    said(fx, [pull(0)]);
    expect(fx.slot.i).toBe(VALVE_PINS - 1);
    settle(fx);
    expect(fx.slot.now).toBe(0);
  });

  it.each(["valveSlip", "valveLapse", "valveThaw"] as const)(
    "kicks the drum on %s, lets go of the clamp, and deals nothing",
    (type) => {
      const fx = new ValveFx();
      said(fx, [at("valveFreeze")]);
      settle(fx);
      said(fx, [at("valveFreeze"), at(type)]);
      expect(fx.kick).toBeGreaterThan(0);
      expect(fx.clamp).toBe(0);
      settle(fx);
      expect(fx.kick).toBe(0);
    },
  );

  it("shudders the hull as the spark lands, in red over its column", () => {
    const fx = new ValveFx();
    const [thrown] = said(fx, [at("valveSparkHit")]);
    expect(thrown?.hex).toBe(PALETTE.red);
    expect(fx.shock.now).toBeGreaterThan(0);
    expect(fx.hurt.value).toBe(0);
    settle(fx);
    expect(fx.shock.now).toBe(0);
  });

  it("shoots the spark out where it had fallen to, not where it leaked", () => {
    const fx = new ValveFx();
    said(fx, [at("valveSpark")]);
    for (let i = 0; i < 30; i++) fx.update(1 / 60);
    const [out] = said(fx, [at("valveSparkOut")]);
    const leak = valveSparkPoint(L, valveCentre(L, CFG), MID, 0);
    expect(out?.y ?? 0).toBeGreaterThan(leak.y);
  });

  it("shudders the hull harder as the face falls open than as the spark lands", () => {
    const fx = new ValveFx();
    said(fx, [at("valveSparkHit")]);
    const landed = fx.shock.now;
    said(fx, [at("valveOpen")]);
    expect(fx.shock.now).toBeGreaterThan(landed);
  });

  it("deals nothing for the drum settling, a mark lighting, the wheel holding or the wave ending", () => {
    const fx = new ValveFx();
    said(fx, [
      at("valveEnter"),
      { type: "valveLight", movement: 1, col: MID },
      at("valveHold"),
      at("valveSpark"),
      at("valveSparkOut"),
      at("valveOut"),
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.clamp).toBe(0);
    expect(fx.kick).toBe(0);
    expect(fx.shock.now).toBe(0);
  });

  it("leaves the story's twelve to its phase", () => {
    const fx = new ValveFx();
    const story = ["valveJet", "valveBrace", "valveFilm", "valveSeal", "valveRough"] as const;
    expect(said(fx, story.map(at))).toEqual([]);
    expect(fx).toEqual(new ValveFx());
  });

  it("forgets everything on a clear", () => {
    const fx = new ValveFx();
    said(fx, [at("valveFreeze"), pull(2), at("valveSpark"), at("valveThaw"), at("valveOpen")]);
    fx.update(1 / 60);
    fx.clear();
    expect(fx).toEqual(new ValveFx());
  });
});

const TPB = ticksPerBeat(CFG);

/** The drum hung, a few beats along, in `phase` with the wheel on its mark. */
function hung(phase: ValvePhase, out = 0): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("valve");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = valveBoss(world);
  if (s === null) throw new Error("the valve wave hung no drum");
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.pins = VALVE_PINS - out;
  s.wheelMilli = valveMark(s);
  return world;
}

/** Three frames of a pose, joined, with `thrown` pushed onto the first tick's events. */
function frame(role: ViewRole, phase: ValvePhase, out: number, thrown?: SimEvent): string {
  const world = hung(phase, out);
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      if (tick === 0 && thrown) w.events.push(thrown);
    },
  });
  return log.join("|");
}

describe("THE VALVE's transients, drawn", () => {
  it.each(ROLES)("a freeze draws its clamp and its blow on the %s screen", (role) => {
    expect(frame(role, "frozen", 0, at("valveFreeze"))).not.toBe(frame(role, "frozen", 0));
  });

  it.each(ROLES)("a pull draws its slot on the %s screen", (role) => {
    expect(frame(role, "list", 1, pull(2))).not.toBe(frame(role, "list", 1));
  });

  it.each(ROLES)("a lapse draws its kick on the %s screen", (role) => {
    expect(frame(role, "turn", 0, at("valveLapse"))).not.toBe(frame(role, "turn", 0));
  });
});
